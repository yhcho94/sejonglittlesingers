import type { BioSection, StaffMember } from "./staff";

// 강사 프로필 (0028): 가입한 선생님이 마이페이지 → 강사 프로필에서 직접 입력. 비워 둔 항목은 표시하지 않음
// 강사진 소개에 나오는 역할 (DB is_faculty_role() 과 같아야 합니다)
export const FACULTY_ROLES = ["단장", "지휘자", "부지휘자", "반주자", "보컬트레이너", "이론선생님", "사무국장"] as const;
export const isFacultyRole = (role: string | null | undefined) =>
  !!role && (FACULTY_ROLES as readonly string[]).includes(role);

// 항목 (강사진 소개에 이 순서로 표시). 한 줄에 하나씩 입력
export const BIO_FIELDS = [
  { key: "education", label: "학력", example: "○○대학교 음악대학 성악과 졸업" },
  { key: "career", label: "주요 경력", example: "○○시립합창단 단원 역임" },
  { key: "current", label: "현재 활동", example: "○○합창단 지휘자" },
  { key: "performances", label: "연주 · 공연", example: "○○ 독창회 개최" },
  { key: "activities", label: "주요 활동", example: "○○ 콘서트 코러스" },
  { key: "awards", label: "수상", example: "○○ 동요대회 지도자상" },
  { key: "certificates", label: "자격 · 수료", example: "음악심리상담사 1급" },
  { key: "works", label: "음반 · 저서", example: "○○ 동요 음반 녹음" },
] as const;
export type BioKey = (typeof BIO_FIELDS)[number]["key"];

export type StaffBio = {
  intro: string | null;
  sections: Partial<Record<BioKey, string[]>>;
  website: string | null;
};

export const BIO_INTRO_MAX = 300;
export const BIO_ITEM_MAX = 200;
export const BIO_ITEMS_MAX = 30;
const WEBSITE_RE = /^https?:\/\/[^\s<>"]{1,300}$/;

// 저장된 값(JSON) → 화면용 (알 수 없는 항목·빈 줄은 버림)
export function normalizeBio(raw: { intro?: unknown; sections?: unknown; website?: unknown }): StaffBio {
  const sections: StaffBio["sections"] = {};
  const src = raw.sections && typeof raw.sections === "object" ? (raw.sections as Record<string, unknown>) : {};
  for (const f of BIO_FIELDS) {
    const v = src[f.key];
    if (!Array.isArray(v)) continue;
    const items = v.filter((x): x is string => typeof x === "string" && x.trim() !== "").map((x) => x.trim());
    if (items.length) sections[f.key] = items;
  }
  const intro = typeof raw.intro === "string" && raw.intro.trim() ? raw.intro.trim() : null;
  const website = typeof raw.website === "string" && WEBSITE_RE.test(raw.website) ? raw.website : null;
  return { intro, sections, website };
}

// 강사진 소개 카드에 표시할 항목 (채운 것만)
export function bioSections(bio: StaffBio): BioSection[] {
  return BIO_FIELDS.flatMap((f) => {
    const items = bio.sections[f.key];
    return items?.length ? [{ title: f.label, items }] : [];
  });
}

// 예전(고정) 약력 → 입력 칸 (처음 입력할 때 기존 내용을 채워 둠)
const LEGACY_TITLE_KEY: Record<string, BioKey> = {
  학력: "education",
  "주요 경력 (전)": "career",
  "주요 경력": "career",
  "현재 활동 (현)": "current",
  활동: "current",
  연주: "performances",
  "주요 활동": "activities",
  수상: "awards",
  "자격 · 수료": "certificates",
  자격: "certificates",
};
export function legacyToBio(member: StaffMember | undefined): StaffBio {
  const sections: StaffBio["sections"] = {};
  for (const s of member?.sections ?? []) {
    const key = LEGACY_TITLE_KEY[s.title] ?? "activities";
    sections[key] = [...(sections[key] ?? []), ...s.items];
  }
  return { intro: null, sections, website: member?.website ?? null };
}

// 입력 칸 → 저장할 값. 줄마다 항목 하나, 앞의 '·', '-', '•' 는 떼어 냄
export function bioFromForm(formData: FormData): { ok: true; bio: StaffBio } | { ok: false; error: string } {
  const intro = String(formData.get("intro") ?? "").trim();
  if (intro.length > BIO_INTRO_MAX) return { ok: false, error: `소개 한마디는 ${BIO_INTRO_MAX}자 이내로 입력해 주세요.` };
  const sections: StaffBio["sections"] = {};
  for (const f of BIO_FIELDS) {
    const items = String(formData.get(f.key) ?? "")
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*[·•\-*]\s*/, "").trim())
      .filter(Boolean);
    if (items.length > BIO_ITEMS_MAX) return { ok: false, error: `${f.label}: ${BIO_ITEMS_MAX}줄 이내로 입력해 주세요.` };
    if (items.some((x) => x.length > BIO_ITEM_MAX)) {
      return { ok: false, error: `${f.label}: 한 줄은 ${BIO_ITEM_MAX}자 이내로 입력해 주세요.` };
    }
    if (items.length) sections[f.key] = items;
  }
  const website = String(formData.get("website") ?? "").trim();
  if (website && !WEBSITE_RE.test(website)) {
    return { ok: false, error: "개인 홈페이지는 https:// 로 시작하는 주소로 입력해 주세요." };
  }
  return { ok: true, bio: { intro: intro || null, sections, website: website || null } };
}
