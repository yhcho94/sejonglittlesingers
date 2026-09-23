// 가입경로 (입단 신청서 선택지 · 통계 공통)
export const JOIN_SOURCES = [
  "지인 소개",
  "인터넷 검색",
  "SNS (인스타그램 등)",
  "네이버 카페·블로그",
  "유튜브",
  "공연 관람",
  "유치원·학교 안내",
  "기타",
] as const;

// 기존 명단의 표기를 선택지로 맞춤 (예: '지인소개' → '지인 소개')
export function normalizeJoinSource(raw: string): string | null {
  const v = raw.replace(/\s/g, "");
  if (!v) return null;
  if (v.includes("지인")) return "지인 소개";
  if (v.includes("인터넷") || v.includes("검색")) return "인터넷 검색";
  if (/sns|인스타|페이스북|instagram/i.test(v)) return "SNS (인스타그램 등)";
  if (v.includes("카페") || v.includes("블로그")) return "네이버 카페·블로그";
  if (v.includes("유튜브") || /youtube/i.test(v)) return "유튜브";
  if (v.includes("공연")) return "공연 관람";
  if (v.includes("유치원") || v.includes("학교")) return "유치원·학교 안내";
  return "기타";
}
