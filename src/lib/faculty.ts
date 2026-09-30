import { organization, conductor, staffGroups, type StaffMember } from "./staff";
import { bioSections, normalizeBio } from "./staff-bio";

// 강사진 소개 = 예전(고정) 약력 + 선생님이 직접 입력한 강사 프로필(0028)
// - 같은 이름의 선생님이 프로필을 저장했으면 그 내용으로 바꿔 표시 (비운 항목은 표시 안 함)
// - 예전 목록에 없는 새 선생님은 역할별 묶음에 추가
export type FacultyBioRow = {
  name: string;
  role: string | null;
  class_name: string | null;
  intro: string | null;
  sections: unknown;
  website: string | null;
};

// 역할 → 묶음 제목 (예전 묶음에 없는 역할은 새 묶음)
const GROUP_OF_ROLE: Record<string, string> = {
  부지휘자: "부지휘자",
  반주자: "반주자",
  보컬트레이너: "보컬트레이너",
  이론선생님: "이론선생님",
  사무국장: "사무국",
  단장: "지휘자",
  지휘자: "지휘자",
};
const GROUP_ORDER = ["지휘자", "부지휘자", "반주자", "보컬트레이너", "이론선생님", "사무국"];
const classOrder = (name?: string) => {
  const i = organization.classes.findIndex((c) => c.name === name);
  return i < 0 ? 99 : i;
};

function fromRow(row: FacultyBioRow, base?: StaffMember): StaffMember {
  const bio = normalizeBio(row);
  return {
    name: row.name,
    role: base?.role ?? row.role ?? "",
    className: row.class_name ?? base?.className,
    website: bio.website ?? undefined,
    intro: bio.intro ?? undefined,
    sections: bioSections(bio),
  };
}

export function buildFaculty(rows: FacultyBioRow[]) {
  const byName = new Map(rows.map((r) => [r.name, r]));
  const used = new Set<string>();
  const merge = (m: StaffMember) => {
    const row = byName.get(m.name);
    if (!row) return m;
    used.add(m.name);
    return fromRow(row, m);
  };

  const head = merge(conductor);
  const groups = new Map<string, StaffMember[]>(staffGroups.map((g) => [g.title, g.members.map(merge)]));
  for (const row of rows) {
    if (used.has(row.name) || !row.role) continue;
    const title = GROUP_OF_ROLE[row.role] ?? row.role;
    groups.set(title, [...(groups.get(title) ?? []), fromRow(row)]);
  }
  const ordered = [...groups.entries()]
    .filter(([, members]) => members.length > 0)
    .sort(([a], [b]) => (GROUP_ORDER.indexOf(a) + 100) % 100 - ((GROUP_ORDER.indexOf(b) + 100) % 100))
    .map(([title, members]) => ({
      title,
      members: [...members].sort((a, b) => classOrder(a.className) - classOrder(b.className)),
    }));
  return { conductor: head, groups: ordered };
}
