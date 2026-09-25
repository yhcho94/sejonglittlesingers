// 관리자 메뉴 권한: DB 0020 의 메뉴 키와 같아야 합니다. (서버·브라우저 공통)
export const ADMIN_AREAS = [
  { key: "applications", label: "입단 신청" },
  { key: "singers", label: "단원 관리" },
  { key: "recruitment", label: "입단 안내·FAQ·지정곡" },
  { key: "concerts", label: "공연 일정" },
  { key: "gallery", label: "사진 갤러리" },
  { key: "notices", label: "공지사항" },
  { key: "press", label: "보도자료" },
] as const;

export type AdminArea = (typeof ADMIN_AREAS)[number]["key"];
// members: 회원 관리(관리자 승인·권한 부여)는 최상위 관리자만
export type AdminGate = AdminArea | "members";

export type AdminInfo = { role: string; is_super?: boolean | null; admin_perms?: string[] | null } | null | undefined;

export function isSuperAdmin(p: AdminInfo) {
  return p?.role === "admin" && p.is_super === true;
}

export function canAccess(p: AdminInfo, gate?: AdminGate) {
  if (p?.role !== "admin") return false;
  if (!gate) return true;
  if (p.is_super) return true;
  if (gate === "members") return false;
  return (p.admin_perms ?? []).includes(gate);
}

export function areaLabels(perms: readonly string[] | null | undefined) {
  return ADMIN_AREAS.filter((a) => perms?.includes(a.key)).map((a) => a.label);
}
