// 단원 명부 계산 로직 (학년·나이·묶음 보기). 화면·엑셀·통계에서 함께 씁니다.
import { consentSummary } from "./media-consent";

export const CLASS_NAMES = ["울림반", "화음반", "선율반"] as const;
export type ClassName = (typeof CLASS_NAMES)[number];

export const STATUS_LABEL = { active: "활동", paused: "휴단", left: "퇴단" } as const;
export type SingerStatus = keyof typeof STATUS_LABEL;

export type Singer = {
  id: number;
  name: string;
  birthdate: string; // YYYY-MM-DD
  gender: "여" | "남" | null;
  school: string | null;
  grade_override: number | null;
  class_name: ClassName | null;
  part: string | null;
  cohort: number | null;
  joined_on: string | null;
  left_on: string | null;
  status: SingerStatus;
  guardian_id: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  photo_path: string | null;
  name_public: boolean;
  consent_media_channels: boolean;
  consent_media_press: boolean;
  consent_updated_at: string | null;
  application_id: number | null;
  notes: string | null;
};

export const SINGER_COLUMNS =
  "id, name, birthdate, gender, school, grade_override, class_name, part, cohort, joined_on, left_on, status, guardian_id, guardian_name, guardian_phone, photo_path, name_public, consent_media_channels, consent_media_press, consent_updated_at, application_id, notes";

// 한국 시간 기준 오늘 (연·월·일)
export function todayKst(now = new Date()) {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return { year: kst.getUTCFullYear(), month: kst.getUTCMonth() + 1, day: kst.getUTCDate() };
}

/**
 * 학년 코드: 0 이하=미취학, 1~6=초1~6, 7~9=중1~3, 10~12=고1~3, 13 이상=졸업 이후
 * 한국은 1월~12월 출생이 같은 해에 입학하므로 (올해 - 출생연도 - 6) 으로 계산합니다.
 * 학년도는 3월에 시작하므로 1~2월에는 전년도 학년을 씁니다.
 */
export function gradeCode(birthdate: string, override: number | null, now = new Date()) {
  if (override !== null && override !== undefined) return override;
  const { year, month } = todayKst(now);
  const schoolYear = month >= 3 ? year : year - 1;
  return schoolYear - Number(birthdate.slice(0, 4)) - 6;
}

export function gradeLabel(code: number) {
  if (code <= 0) return "미취학";
  if (code <= 6) return `초${code}`;
  if (code <= 9) return `중${code - 6}`;
  if (code <= 12) return `고${code - 9}`;
  return "고교 졸업 이후";
}

// 만 나이
export function manAge(birthdate: string, now = new Date()) {
  const { year, month, day } = todayKst(now);
  const [by, bm, bd] = birthdate.split("-").map(Number);
  let age = year - by;
  if (month < bm || (month === bm && day < bd)) age -= 1;
  return age;
}

// ── 보기(조회 방법) ──────────────────────────────
export const VIEWS = {
  all: "전체 명단",
  class: "반별",
  grade: "학년별",
  age: "만 나이별",
  birthYear: "출생연도별",
  cohort: "기수별",
  status: "활동 상태별",
} as const;
export type View = keyof typeof VIEWS;

export type RosterFilter = {
  view: View;
  className: ClassName | "";
  status: SingerStatus | "" | "all";
  q: string;
};

export function parseFilter(params: Record<string, string | string[] | undefined>): RosterFilter {
  const get = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : "");
  const view = (Object.keys(VIEWS) as View[]).includes(get("view") as View) ? (get("view") as View) : "all";
  const className = (CLASS_NAMES as readonly string[]).includes(get("class")) ? (get("class") as ClassName) : "";
  const statusRaw = get("status");
  // 기본은 '활동' 단원만. 상태별 보기에서는 전체 상태를 보여줍니다.
  const status: RosterFilter["status"] =
    statusRaw === "all" || (view === "status" && !statusRaw)
      ? "all"
      : (Object.keys(STATUS_LABEL) as string[]).includes(statusRaw)
        ? (statusRaw as SingerStatus)
        : "active";
  return { view, className, status, q: get("q").trim().slice(0, 50) };
}

export function filterToQuery(f: RosterFilter, extra: Record<string, string> = {}) {
  const p = new URLSearchParams();
  if (f.view !== "all") p.set("view", f.view);
  if (f.className) p.set("class", f.className);
  if (f.status !== "active") p.set("status", f.status || "all");
  if (f.q) p.set("q", f.q);
  for (const [k, v] of Object.entries(extra)) p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function applyFilter(singers: Singer[], f: RosterFilter) {
  const q = f.q.toLowerCase();
  return singers.filter(
    (s) =>
      (!f.className || s.class_name === f.className) &&
      (f.status === "all" || !f.status || s.status === f.status) &&
      (!q ||
        s.name.toLowerCase().includes(q) ||
        (s.school ?? "").toLowerCase().includes(q) ||
        (s.guardian_name ?? "").toLowerCase().includes(q)),
  );
}

type Group = { key: string; label: string; singers: Singer[] };

const byName = (a: Singer, b: Singer) => a.name.localeCompare(b.name, "ko");

// 보기에 따라 묶음을 만듭니다. (묶음 순서도 정렬)
export function groupSingers(singers: Singer[], view: View, now = new Date()): Group[] {
  const sorted = [...singers].sort(byName);
  if (view === "all") return [{ key: "all", label: "전체", singers: sorted }];

  const keyOf = (s: Singer): { key: string; label: string; order: number } => {
    switch (view) {
      case "class": {
        const i = s.class_name ? CLASS_NAMES.indexOf(s.class_name) : 99;
        return { key: s.class_name ?? "none", label: s.class_name ?? "반 미지정", order: i };
      }
      case "grade": {
        const g = gradeCode(s.birthdate, s.grade_override, now);
        return { key: `g${g}`, label: gradeLabel(g), order: g };
      }
      case "age": {
        const a = manAge(s.birthdate, now);
        return { key: `a${a}`, label: `만 ${a}세`, order: a };
      }
      case "birthYear": {
        const y = Number(s.birthdate.slice(0, 4));
        return { key: `y${y}`, label: `${y}년생`, order: y };
      }
      case "cohort":
        return s.cohort
          ? { key: `c${s.cohort}`, label: `${s.cohort}기`, order: s.cohort }
          : { key: "c-none", label: "기수 미입력", order: 999 };
      case "status": {
        const order = ["active", "paused", "left"].indexOf(s.status);
        return { key: s.status, label: STATUS_LABEL[s.status], order };
      }
    }
  };

  const map = new Map<string, Group & { order: number }>();
  for (const s of sorted) {
    const k = keyOf(s);
    const g = map.get(k.key) ?? { key: k.key, label: k.label, order: k.order, singers: [] };
    g.singers.push(s);
    map.set(k.key, g);
  }
  return [...map.values()].sort((a, b) => a.order - b.order).map(({ key, label, singers }) => ({ key, label, singers }));
}

// 엑셀·표 공통 열
export function rosterRow(s: Singer, guardian?: { guardian_name: string; phone: string; email: string } | null, now = new Date()) {
  return {
    이름: s.name,
    반: s.class_name ?? "",
    학년: gradeLabel(gradeCode(s.birthdate, s.grade_override, now)),
    "만 나이": manAge(s.birthdate, now),
    생년월일: s.birthdate,
    성별: s.gender ?? "",
    학교: s.school ?? "",
    파트: s.part ?? "",
    기수: s.cohort ?? "",
    입단일: s.joined_on ?? "",
    상태: STATUS_LABEL[s.status],
    보호자: guardian?.guardian_name ?? s.guardian_name ?? "",
    "보호자 연락처": guardian?.phone ?? s.guardian_phone ?? "",
    "보호자 이메일": guardian?.email ?? "",
    "초상권 동의": consentSummary(s).detail || "미동의",
    비고: s.notes ?? "",
  };
}
