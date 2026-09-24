// 엑셀 일괄 등록: 양식 열과 한 줄씩 검사하는 로직 (화면·서버 공통, 테스트 가능하도록 순수 함수)
import { normalizeJoinSource } from "./join-source";
import { CLASS_NAMES, STATUS_LABEL, type SingerStatus } from "./singers";

export const IMPORT_COLUMNS = [
  "이름*",
  "생년월일",
  "성별",
  "반*",
  "학교",
  "학년(예외만)",
  "파트",
  "기수",
  "입단일",
  "상태",
  "보호자 이름",
  "보호자 연락처",
  "보호자 가입 이메일",
  "가입경로",
  "초상권① 공식채널",
  "초상권② 언론홍보",
  "초상권③ 이름표시",
  "비고",
] as const;

// 읽을 때는 머리글 끝의 '*' 를 뗀 이름으로 찾습니다.
const col = (c: string) => c.replace(/\*$/, "");

export const IMPORT_EXAMPLE: Record<string, string> = {
  "이름*": "(예시) 홍길동",
  생년월일: "2016-05-20",
  성별: "여",
  "반*": "화음반",
  학교: "세종소담초등학교",
  "학년(예외만)": "",
  파트: "소프라노",
  기수: "4",
  입단일: "2026-03-07",
  상태: "활동",
  "보호자 이름": "홍부모",
  "보호자 연락처": "010-0000-0000",
  "보호자 가입 이메일": "",
  가입경로: "지인 소개",
  "초상권① 공식채널": "O",
  "초상권② 언론홍보": "X",
  "초상권③ 이름표시": "X",
  비고: "이 예시 줄은 지우고 입력하세요",
};

export const IMPORT_NOTES = [
  "세종리틀싱어즈 단원 일괄 등록 양식 작성 안내",
  "",
  "· 첫 번째 시트(단원 입력)의 2번째 줄부터 한 줄에 한 명씩 입력합니다. 머리글(1번째 줄)은 바꾸지 마세요.",
  "· 이름*, 반* 만 필수입니다. 나머지 칸은 비워도 되고, 형식이 틀린 칸은 비운 채 등록한 뒤 결과 화면에 알려 드립니다.",
  "· 생년월일·입단일은 2016-05-20 처럼 입력합니다. 등록 후 단원 관리 화면에서 언제든 고칠 수 있습니다.",
  "· 생일을 모르면 생년월일 칸에 출생연도만 2021 또는 21년생 처럼 입력하세요. (명부에 '2021년생'으로 표시)",
  "· 가입경로: 지인 소개 / 인터넷 검색 / SNS / 네이버 카페·블로그 / 유튜브 / 공연 관람 / 유치원·학교 안내 / 기타 (비워도 됨)",
  "· 성별: 여 / 남,  반: 울림반 / 화음반 / 선율반,  상태: 활동 / 휴단 / 퇴단 (비우면 활동)",
  "· 학년(예외만): 비우면 출생연도로 자동 계산합니다. 조기·유예 입학 등 예외일 때만 미취학, 초1~초6, 중1~중3, 고1~고3 으로 입력하세요.",
  "· 보호자 가입 이메일: 보호자가 홈페이지에 가입했다면 가입 이메일을 넣으면 회원과 연결됩니다.",
  "· 초상권①②③: 보호자에게 동의를 받은 항목만 O 로 입력합니다. (비우면 미동의) ① 공식 채널 게시 ② 언론·외부 홍보물 ③ 게시물·영상 자막 이름 표시 (단원 소개 화면에는 활동 단원 이름이 기본으로 게시됨)",
  "· 이름이나 반이 없거나 틀린 줄, 이미 등록된 단원(같은 반에 같은 이름)은 건너뛰고 나머지를 등록합니다.",
  "· 이 파일에는 아동 개인정보가 들어가므로 등록 후 PC 에서 삭제해 주세요.",
];

export type ImportedSinger = {
  name: string;
  birthdate: string | null;
  birth_year_only: boolean;
  join_source: string | null;
  gender: "여" | "남" | null;
  class_name: string | null;
  school: string | null;
  grade_override: number | null;
  part: string | null;
  cohort: number | null;
  joined_on: string | null;
  status: SingerStatus;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  name_public: boolean;
  consent_media_channels: boolean;
  consent_media_press: boolean;
  notes: string | null;
};

export function parseGrade(v: string): number | null | undefined {
  const s = v.replace(/\s|학년/g, "");
  if (!s) return null;
  if (s === "미취학" || s === "유치") return 0;
  const m = /^(초|중|고)([1-6])$/.exec(s);
  if (!m) return undefined;
  const n = Number(m[2]);
  if (m[1] === "초") return n;
  if (n > 3) return undefined;
  return m[1] === "중" ? 6 + n : 9 + n;
}

function validDate(v: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

// 2016.5.20 / 2016/05/20 / 20160520, 엑셀 날짜 일련번호(예: 42510)도 받아 줍니다.
export function normalizeDate(v: string) {
  const s = v.trim();
  if (/^\d{5}$/.test(s)) {
    return new Date(Date.UTC(1899, 11, 30) + Number(s) * 86400000).toISOString().slice(0, 10);
  }
  const m = /^(\d{4})[.\-/ ]\s*(\d{1,2})[.\-/ ]\s*(\d{1,2})\.?$/.exec(s) ?? /^(\d{4})(\d{2})(\d{2})$/.exec(s);
  if (!m) return s;
  return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
}

const STATUS_BY_LABEL = Object.fromEntries(Object.entries(STATUS_LABEL).map(([k, l]) => [l, k])) as Record<string, SingerStatus>;

// 이름·반만 필수. 나머지 칸이 틀리면 비워 두고 등록하며, 무엇을 비웠는지 warnings 로 알려 줍니다.
export function parseImportRow(values: Record<string, string>): {
  singer?: ImportedSinger;
  errors: string[];
  warnings: string[];
} {
  const get = (c: (typeof IMPORT_COLUMNS)[number]) => (values[col(c)] ?? "").trim();
  const opt = (c: (typeof IMPORT_COLUMNS)[number], max: number) => get(c).slice(0, max) || null;
  const errors: string[] = [];
  const warnings: string[] = [];

  const name = get("이름*").replace(/\s+/g, " ");
  if (!name) errors.push("이름이 없습니다");
  else if (name.length > 50) errors.push("이름이 너무 깁니다");

  const className = get("반*").replace(/\s/g, "");
  if (!className) errors.push("반이 없습니다");
  else if (!(CLASS_NAMES as readonly string[]).includes(className)) errors.push(`반 이름 오류(${className})`);

  // 생년월일: 2016-05-20 / 출생연도만 2021 · 21년생 · 2021년생 / 틀리면 비움
  const birthRaw = get("생년월일").replace(/\s/g, "");
  const yearOnly = /^(?:(\d{4})|(\d{2})년생|(\d{4})년생)$/.exec(birthRaw);
  let birthYear = yearOnly ? Number(yearOnly[1] ?? yearOnly[3] ?? `20${yearOnly[2]}`) : null;
  let birthdate: string | null = birthYear ? `${birthYear}-01-01` : birthRaw ? normalizeDate(get("생년월일")) : null;
  if (birthYear !== null && (birthYear < 1990 || birthYear > 2100)) {
    warnings.push(`출생연도(${birthRaw}) 비움`);
    birthYear = null;
    birthdate = null;
  } else if (birthdate && !validDate(birthdate)) {
    warnings.push(`생년월일(${birthRaw}) 비움`);
    birthdate = null;
  }

  const genderRaw = get("성별");
  const gender = genderRaw === "여" || genderRaw === "남" ? genderRaw : null;
  if (genderRaw && !gender) warnings.push(`성별(${genderRaw}) 비움`);

  let grade = parseGrade(get("학년(예외만)"));
  if (grade === undefined) {
    warnings.push(`학년(${get("학년(예외만)")}) 비움`);
    grade = null;
  }

  const cohortRaw = get("기수").replace(/기$/, "");
  let cohort = cohortRaw ? Number(cohortRaw) : null;
  if (cohort !== null && (!Number.isInteger(cohort) || cohort < 1 || cohort > 99)) {
    warnings.push(`기수(${cohortRaw}) 비움`);
    cohort = null;
  }

  let joined = get("입단일") ? normalizeDate(get("입단일")) : "";
  if (joined && !validDate(joined)) {
    warnings.push(`입단일(${get("입단일")}) 비움`);
    joined = "";
  }

  const statusRaw = get("상태");
  let status = statusRaw ? STATUS_BY_LABEL[statusRaw] : "active";
  if (!status) {
    warnings.push(`상태(${statusRaw}) → 활동`);
    status = "active";
  }

  let email = get("보호자 가입 이메일").toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    warnings.push("보호자 이메일 비움");
    email = "";
  }

  // O/X 칸 (예전 양식의 '이름 공개 동의' 머리글도 ③ 으로 인정). 알아볼 수 없으면 미동의
  const yesNo = (raw: string, label: string) => {
    const v = raw.trim().toUpperCase();
    if (v && !["O", "X", "Y", "N", "동의", "비동의"].includes(v)) warnings.push(`${label}(${raw}) → 미동의`);
    return ["O", "Y", "동의"].includes(v);
  };
  const mediaChannels = yesNo(get("초상권① 공식채널"), "초상권①");
  const mediaPress = yesNo(get("초상권② 언론홍보"), "초상권②");
  const mediaName = yesNo(get("초상권③ 이름표시") || (values["이름 공개 동의"] ?? ""), "초상권③");

  if (errors.length) return { errors, warnings };
  return {
    errors,
    warnings,
    singer: {
      name,
      birthdate,
      birth_year_only: birthYear !== null,
      join_source: normalizeJoinSource(get("가입경로")),
      gender,
      class_name: className,
      school: opt("학교", 100),
      grade_override: grade,
      part: opt("파트", 20),
      cohort,
      joined_on: joined || null,
      status,
      guardian_name: opt("보호자 이름", 50),
      guardian_phone: opt("보호자 연락처", 20),
      guardian_email: email || null,
      name_public: mediaName,
      consent_media_channels: mediaChannels,
      consent_media_press: mediaPress,
      notes: opt("비고", 2000),
    },
  };
}
