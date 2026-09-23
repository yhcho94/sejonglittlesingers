import { organization } from "@/lib/staff";

export function OrgChart() {
  const { director, office, classes } = organization;
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-sm border-2 border-navy bg-white px-8 py-3 text-center">
        <p className="text-xs text-ink-soft">{director.role}</p>
        <p className="text-lg font-bold text-navy">{director.name}</p>
      </div>
      <div className="h-4 w-px bg-line" />
      <div className="rounded-sm border border-line bg-white px-5 py-2 text-center text-sm">
        <span className="text-ink-soft">{office.role}</span> <span className="font-medium">{office.name}</span>
      </div>
      <div className="h-6 w-px bg-line" />

      {/* 가로 연결선 (넓은 화면) */}
      <div className="hidden h-px w-2/3 bg-line md:block" />

      <div className="grid w-full gap-4 md:grid-cols-3">
        {classes.map((c) => (
          <div key={c.name} className="flex flex-col items-center">
            <div className="hidden h-6 w-px bg-line md:block" />
            <div className="w-full overflow-hidden rounded-sm border border-line bg-white">
              <p className="py-3 text-center text-lg font-bold text-white" style={{ backgroundColor: c.color }}>
                {c.name}
              </p>
              <dl className="divide-y divide-line">
                {c.members.map((m) => (
                  <div key={m.role} className="flex items-center justify-between px-5 py-2.5 text-sm">
                    <dt className="text-ink-soft">{m.role}</dt>
                    <dd className="font-medium">{m.name}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
