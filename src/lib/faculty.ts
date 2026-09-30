import { ORG_TOP_SECTION, conductor as legacyConductor, organization, staffGroups as legacyGroups, type StaffMember } from "./staff";
import { bioSections, facultyPhotoUrl, normalizeBio } from "./staff-bio";

// 강사진 소개 = DB(0028 faculty_bios). 아직 SQL 을 실행하지 않았거나 읽지 못하면 예전(고정) 약력
export type FacultyRow = {
  id: number;
  name: string;
  role: string;
  class_name: string | null;
  sort_order: number;
  sections: unknown;
  website: string | null;
  photo_path?: string | null; // 0029
};

// 역할 → 묶음 제목
export function facultyGroupOf(role: string) {
  if (role.startsWith("단장")) return "단장";
  if (role === "사무국장") return "사무국";
  return role;
}
const GROUP_ORDER = ["단장", "지휘자", "부지휘자", "반주자", "보컬트레이너", "이론선생님", "사무국"];
const groupRank = (title: string) => {
  const i = GROUP_ORDER.indexOf(title);
  return i < 0 ? GROUP_ORDER.length : i;
};
const classRank = (name?: string | null) => {
  const i = organization.classes.findIndex((c) => c.name === name);
  return i < 0 ? 99 : i;
};

export function sortFaculty<T extends Pick<FacultyRow, "role" | "class_name" | "sort_order">>(rows: T[]) {
  return [...rows].sort(
    (a, b) =>
      groupRank(facultyGroupOf(a.role)) - groupRank(facultyGroupOf(b.role)) ||
      classRank(a.class_name) - classRank(b.class_name) ||
      a.sort_order - b.sort_order,
  );
}

function toMember(row: FacultyRow): StaffMember {
  const bio = normalizeBio(row);
  return {
    name: row.name,
    role: row.role,
    className: row.class_name ?? undefined,
    website: bio.website ?? undefined,
    photo: facultyPhotoUrl(row.photo_path) ?? undefined,
    sections: bioSections(bio),
  };
}

export function buildFaculty(rows: FacultyRow[] | null): { conductor: StaffMember | null; groups: { title: string; members: StaffMember[] }[] } {
  if (!rows?.length) return { conductor: legacyConductor, groups: legacyGroups };
  const sorted = sortFaculty(rows);
  const headRow = sorted.find((r) => facultyGroupOf(r.role) === "단장");
  const groups = new Map<string, StaffMember[]>();
  for (const row of sorted) {
    if (row === headRow) continue;
    const title = facultyGroupOf(row.role);
    groups.set(title, [...(groups.get(title) ?? []), toMember(row)]);
  }
  return {
    conductor: headRow ? toMember(headRow) : null,
    groups: [...groups.entries()].map(([title, members]) => ({ title, members })),
  };
}

// ── 조직도·첫 화면도 같은 강사진 소개 DB 로 ─────────────────────────
export type OrgEntry = { section: string; role: string; name: string };

// 조직도 칸 이름: '단장 · 상임지휘자' 같은 직함은 '단장' 칸
export const orgRoleOf = (role: string) => (role.startsWith("단장") ? "단장" : role);

// 조직도 순서: 전체 칸(단장 → 사무국장 → 그 밖) · 반 칸(부지휘자 → 학부모대표 → 부대표 → 반주자 → 이론선생님 → 그 밖)
function roleRank(section: string, role: string) {
  const order: readonly string[] = section === ORG_TOP_SECTION ? organization.top : organization.classRoles;
  const i = order.indexOf(role);
  return i < 0 ? order.length : i;
}
export function sortOrgEntries(entries: OrgEntry[]) {
  const sectionRank = (s: string) => (s === ORG_TOP_SECTION ? -1 : classRank(s));
  return entries
    .map((e, i) => ({ e, i }))
    .sort((a, b) => sectionRank(a.e.section) - sectionRank(b.e.section) || roleRank(a.e.section, a.e.role) - roleRank(b.e.section, b.e.role) || a.i - b.i)
    .map(({ e }) => e);
}

// 강사진 소개 DB → 조직도 칸 (담당 반이 없으면 '전체')
export function facultyOrgEntries(rows: FacultyRow[]): OrgEntry[] {
  return sortFaculty(rows).map((r) => ({ section: r.class_name ?? ORG_TOP_SECTION, role: orgRoleOf(r.role), name: r.name }));
}

// 첫 화면 반 구성: 단장(직함·이름)과 반별 부지휘자
export function homeFaculty(rows: FacultyRow[] | null) {
  if (!rows?.length) {
    return {
      head: { role: legacyConductor.role, name: legacyConductor.name },
      assistant: (className: string) =>
        legacyGroups.flatMap((g) => g.members).filter((m) => m.className === className && m.role === "부지휘자").map((m) => m.name),
    };
  }
  const sorted = sortFaculty(rows);
  const headRow = sorted.find((r) => facultyGroupOf(r.role) === "단장");
  return {
    head: headRow ? { role: headRow.role, name: headRow.name } : null,
    assistant: (className: string) => sorted.filter((r) => r.class_name === className && r.role === "부지휘자").map((r) => r.name),
  };
}
