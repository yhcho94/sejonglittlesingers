import type { MemberType } from "@/lib/types";

// 회원가입 구분 (DB 0021 과 같아야 합니다)
export const MEMBER_TYPES: { key: MemberType; label: string; desc: string }[] = [
  { key: "parent", label: "학부모", desc: "단원(자녀)의 입단 신청·초상권 동의" },
  { key: "teacher", label: "선생님", desc: "지휘·반주·파트 지도 선생님 (승인 후 맡은 메뉴 사용)" },
  { key: "staff", label: "홈페이지 관리자", desc: "공지·공연·사진 등 홈페이지 운영 (승인 후 맡은 메뉴 사용)" },
];

export function memberTypeLabel(type: string | null | undefined) {
  return MEMBER_TYPES.find((t) => t.key === type)?.label ?? "학부모";
}

export function isMemberType(value: unknown): value is MemberType {
  return MEMBER_TYPES.some((t) => t.key === value);
}
