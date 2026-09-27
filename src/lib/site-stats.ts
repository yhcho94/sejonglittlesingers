// 홈·합창단 소개 수치 (최상위 관리자가 관리자 → 소개 수치에서 입력, DB 0026)
// 비어 있는 항목은 자동값(명부 집계·조직도 인원) 또는 기본값으로 표시합니다.
export const SITE_STAT_FIELDS = [
  { key: "founded", label: "창단", unit: "", hint: "예: 2023" },
  { key: "singers", label: "활동 단원", unit: "명", hint: "비우면 단원 명부의 활동 단원 수" },
  { key: "staff", label: "강사진·운영진", unit: "명", hint: "비우면 조직도 인원(학부모 대표 포함)" },
  { key: "concerts", label: "연간 공연 (내외)", unit: "회", hint: "예: 20" },
  { key: "hosted", label: "연간 주최 음악회", unit: "회", hint: "예: 4" },
] as const;

export type SiteStatKey = (typeof SITE_STAT_FIELDS)[number]["key"];
export type SiteStats = Partial<Record<SiteStatKey, string>>;

export const SITE_STATS_DEFAULTS: Record<SiteStatKey, string> = {
  founded: "2023",
  singers: "150",
  staff: "16",
  concerts: "20",
  hosted: "4",
};

export const SITE_STAT_MAX = 12;

// 저장된 JSON → 값 정리 (허용된 항목, 12자 이내 글자만)
export function parseSiteStats(raw: string | null | undefined): SiteStats {
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    const out: SiteStats = {};
    for (const f of SITE_STAT_FIELDS) {
      const v = obj[f.key];
      if (typeof v === "string" && v.trim()) out[f.key] = v.trim().slice(0, SITE_STAT_MAX);
    }
    return out;
  } catch {
    return {};
  }
}

// 입력값 → 표시값: 입력값 > 자동값 > 기본값
export function statValue(key: SiteStatKey, stats: SiteStats, auto?: number | null) {
  return stats[key] ?? (auto ? String(auto) : SITE_STATS_DEFAULTS[key]);
}

export const isCountable = (value: string) => /^\d{1,7}$/.test(value);
