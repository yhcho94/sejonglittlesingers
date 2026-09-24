// 가입경로 (입단 신청서 선택지 · 단원 명부 · 통계 공통). '기타'는 직접 입력한 내용을 따로 저장합니다.
export const JOIN_SOURCES = ["지인소개", "SNS", "인터넷 검색", "세종리틀싱어즈 공연관람", "기타"] as const;

export const JOIN_SOURCE_OTHER = "기타";

// 화면·엑셀 표시용: '기타 (직접 입력한 내용)'
export function joinSourceLabel(source: string | null | undefined, detail?: string | null) {
  if (!source) return "";
  return detail ? `${source} (${detail})` : source;
}

// 기존 명단·예전 선택지의 표기를 새 선택지로 맞춤 (예: '지인 소개' → '지인소개', '유튜브' → 'SNS')
// 선택지에 딱 맞지 않으면 '기타'로 두고 원래 적힌 내용을 detail 에 남깁니다.
export function normalizeJoinSource(raw: string): { source: string; detail: string | null } | null {
  const text = raw.trim();
  const v = text.replace(/\s/g, "");
  if (!v) return null;
  const keep = (source: string) => ({ source, detail: null });
  if (v.includes("지인")) return keep("지인소개");
  if (v.includes("공연")) return keep("세종리틀싱어즈 공연관람");
  if (/sns|인스타|페이스북|instagram|facebook|카페|블로그|유튜브|youtube|카카오/i.test(v)) return keep("SNS");
  if (v.includes("인터넷") || v.includes("검색")) return keep("인터넷 검색");
  const detail = text.replace(/^기타\s*[:(]?\s*/, "").replace(/\)$/, "").trim();
  return { source: JOIN_SOURCE_OTHER, detail: detail ? detail.slice(0, 100) : null };
}
