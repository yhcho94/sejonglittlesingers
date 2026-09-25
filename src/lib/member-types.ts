import type { MemberType } from "@/lib/types";

// 회원 구분 (DB 0021 과 같아야 합니다). 선생님은 지도 역할의 운영진입니다.
export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  parent: "학부모",
  teacher: "선생님",
  staff: "운영진",
};

// 합창단 운영진 역할 (DB 0022 staff_kind() 의 선생님 목록과 같아야 합니다)
export const STAFF_ROLES = [
  { name: "단장", teacher: false },
  { name: "지휘자", teacher: true },
  { name: "부지휘자", teacher: true },
  { name: "반주자", teacher: true },
  { name: "보컬트레이너", teacher: true },
  { name: "이론선생님", teacher: true },
  { name: "사무국장", teacher: false },
  { name: "운영위원", teacher: false },
  { name: "홈페이지 관리자", teacher: false },
] as const;

// 담당 반을 고르는 역할 (DB 0023 is_class_role() 과 같아야 합니다)
export const CLASS_ROLES: readonly string[] = ["부지휘자", "반주자", "보컬트레이너", "이론선생님"];
export const isClassRole = (role: string | null | undefined) => !!role && CLASS_ROLES.includes(role);

export const STAFF_ROLE_OTHER = "기타";
export const STAFF_ROLE_MAX = 30;

export function memberTypeLabel(type: string | null | undefined) {
  return MEMBER_TYPE_LABELS[type as MemberType] ?? "학부모";
}

// 회원 목록에 보일 이름: 운영진은 역할, 학부모는 '학부모'
export function memberRoleLabel(p: { member_type?: string | null; staff_role?: string | null; staff_class?: string | null }) {
  if (p.member_type && p.member_type !== "parent" && p.staff_role) {
    return p.staff_class ? `${p.staff_class} ${p.staff_role}` : p.staff_role;
  }
  return memberTypeLabel(p.member_type);
}

// 폼 값 → 저장할 역할 (목록에서 고르거나 '기타' 직접 입력)
export function staffRoleFromForm(selected: string, custom: string) {
  const value = selected === STAFF_ROLE_OTHER ? custom.trim() : selected;
  if (!value || value.length > STAFF_ROLE_MAX) return null;
  if (selected !== STAFF_ROLE_OTHER && !STAFF_ROLES.some((r) => r.name === value)) return null;
  return value;
}

// 폼 값 → 저장할 담당 반 (반 역할일 때만, 반 목록에 있는 값만)
export function staffClassFromForm(role: string | null, value: string, classNames: readonly string[]) {
  if (!isClassRole(role)) return { ok: true as const, value: null };
  return classNames.includes(value) ? { ok: true as const, value } : { ok: false as const, value: null };
}
