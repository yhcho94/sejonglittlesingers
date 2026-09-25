import type { OrgEntry } from "@/lib/content";
import { ORG_TOP_SECTION, organization } from "@/lib/staff";

// 역할별 이름 (같은 역할이 여러 명이면 쉼표로). 지정이 없으면 공란
function namesOf(entries: OrgEntry[], section: string, role: string) {
  return entries
    .filter((e) => e.section === section && e.role === role)
    .map((e) => e.name)
    .join(", ");
}

// 기본 칸 외에 추가로 지정된 역할 (예: 전체-지휘자, 반-보컬트레이너)
function extraRoles(entries: OrgEntry[], section: string, fixed: readonly string[]) {
  return [...new Set(entries.filter((e) => e.section === section && !fixed.includes(e.role)).map((e) => e.role))];
}

// 이 칸에 있는 역할 (입력 순서대로)
function rolesIn(entries: OrgEntry[], section: string) {
  return [...new Set(entries.filter((e) => e.section === section).map((e) => e.role))];
}

// showBlanks: 기본 칸을 항상 보여 주고 지정이 없으면 공란 (회원 정보로 자동 표시할 때)
//             false 이면 이름이 있는 칸만 순서대로 (예전 고정 조직도)
export function OrgChart({ entries, showBlanks = true }: { entries: OrgEntry[]; showBlanks?: boolean }) {
  const { top, classRoles, classes } = organization;
  const [head, ...restTop] = top;
  const topRoles = showBlanks
    ? [...restTop, ...extraRoles(entries, ORG_TOP_SECTION, top)]
    : rolesIn(entries, ORG_TOP_SECTION).filter((r) => r !== head);
  return (
    <div className="flex flex-col items-center">
      <div className="min-w-40 rounded-sm border-2 border-navy bg-white px-8 py-3 text-center">
        <p className="text-xs text-ink-soft">{head}</p>
        <p className="min-h-7 text-lg font-bold text-navy">{namesOf(entries, ORG_TOP_SECTION, head)}</p>
      </div>
      <div className="h-4 w-px bg-line" />
      <div className="flex flex-wrap justify-center gap-2">
        {topRoles.map((role) => (
          <div key={role} className="min-w-32 rounded-sm border border-line bg-white px-5 py-2 text-center text-sm">
            <span className="text-ink-soft">{role}</span>{" "}
            <span className="font-medium">{namesOf(entries, ORG_TOP_SECTION, role)}</span>
          </div>
        ))}
      </div>
      <div className="h-6 w-px bg-line" />

      {/* 가로 연결선 (넓은 화면) */}
      <div className="hidden h-px w-2/3 bg-line md:block" />

      <div className="grid w-full gap-4 md:grid-cols-3">
        {classes.map((c) => {
          const roles = showBlanks ? [...classRoles, ...extraRoles(entries, c.name, classRoles)] : rolesIn(entries, c.name);
          return (
            <div key={c.name} className="flex flex-col items-center">
              <div className="hidden h-6 w-px bg-line md:block" />
              <div className="w-full overflow-hidden rounded-sm border border-line bg-white">
                <p className="py-3 text-center text-lg font-bold text-white" style={{ backgroundColor: c.color }}>
                  {c.name}
                </p>
                <dl className="divide-y divide-line">
                  {roles.map((role) => (
                    <div key={role} className="flex min-h-10 items-center justify-between gap-3 px-5 py-2.5 text-sm">
                      <dt className="text-ink-soft">{role}</dt>
                      <dd className="text-right font-medium">{namesOf(entries, c.name, role)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
