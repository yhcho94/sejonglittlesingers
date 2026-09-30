import { conductor as legacyConductor, organization, staffGroups as legacyGroups, type StaffMember } from "./staff";
import { bioSections, normalizeBio } from "./staff-bio";

// 강사진 소개 = DB(0028 faculty_bios). 아직 SQL 을 실행하지 않았거나 읽지 못하면 예전(고정) 약력
export type FacultyRow = {
  id: number;
  name: string;
  role: string;
  class_name: string | null;
  sort_order: number;
  sections: unknown;
  website: string | null;
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
