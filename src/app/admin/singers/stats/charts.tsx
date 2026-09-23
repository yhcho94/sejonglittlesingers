// 통계 화면용 막대·표 (서버 컴포넌트, 한 가지 색만 사용: 이름표가 항목을 구분)

export function StatTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border border-line bg-white p-4">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
      {note && <p className="mt-0.5 text-xs text-ink-soft">{note}</p>}
    </div>
  );
}

export function ChartCard({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 md:p-6">
      <h2 className="font-bold text-navy">{title}</h2>
      {note && <p className="mt-1 text-xs text-ink-soft">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

// 가로 막대: 막대 두께 16px, 끝만 둥글게, 값은 막대 끝에 표시
export function BarList({
  items,
  unit = "명",
  total,
}: {
  items: { key: string; label: string; value: number }[];
  unit?: string;
  total?: number;
}) {
  if (!items.length) return <p className="text-sm text-ink-soft">자료가 없습니다.</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-1">
      {items.map((i) => {
        const share = total ? ` (${Math.round((i.value / total) * 100)}%)` : "";
        return (
          <li
            key={i.key}
            tabIndex={0}
            title={`${i.label}: ${i.value}${unit}${share}`}
            aria-label={`${i.label} ${i.value}${unit}${share}`}
            className="grid grid-cols-[5.5rem_1fr] items-center gap-3 rounded-sm px-1 py-1 text-sm outline-none hover:bg-cream focus-visible:bg-cream"
          >
            <span className="truncate text-ink-soft">{i.label}</span>
            <span className="flex items-center gap-2">
              <span
                className="h-4 rounded-r-[4px] bg-navy"
                style={{ width: `calc((100% - 5rem) * ${i.value / max})`, minWidth: i.value ? 2 : 0 }}
              />
              <span className="shrink-0 tabular-nums text-ink">
                {i.value}
                <span className="text-xs text-ink-soft">
                  {unit}
                  {share}
                </span>
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// 교차표: 칸 색의 진하기가 인원 수 (한 가지 색 농도)
export function HeatTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: { key: string; label: string; cells: number[] }[];
}) {
  const max = Math.max(1, ...rows.flatMap((r) => r.cells));
  const colTotals = columns.map((_, i) => rows.reduce((s, r) => s + r.cells[i], 0));
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-separate border-spacing-0.5 text-center text-sm tabular-nums">
        <thead>
          <tr className="text-xs text-ink-soft">
            <th className="px-2 py-1.5 text-left font-medium">반 \ 학년</th>
            {columns.map((c) => (
              <th key={c} className="px-2 py-1.5 font-medium">
                {c}
              </th>
            ))}
            <th className="px-2 py-1.5 font-medium">합계</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th className="px-2 py-2 text-left font-medium whitespace-nowrap">{r.label}</th>
              {r.cells.map((v, i) => {
                const alpha = v ? 0.08 + 0.82 * (v / max) : 0;
                return (
                  <td
                    key={columns[i]}
                    title={`${r.label} ${columns[i]}: ${v}명`}
                    className="rounded-[3px] px-2 py-2"
                    style={{
                      background: v ? `rgb(22 34 77 / ${alpha})` : "var(--color-cream)",
                      color: alpha > 0.5 ? "#fff" : "var(--color-ink)",
                    }}
                  >
                    {v || <span className="text-ink-soft/60">·</span>}
                  </td>
                );
              })}
              <td className="px-2 py-2 font-semibold">{r.cells.reduce((a, b) => a + b, 0)}</td>
            </tr>
          ))}
          <tr className="font-semibold">
            <th className="px-2 py-2 text-left">합계</th>
            {colTotals.map((v, i) => (
              <td key={columns[i]} className="px-2 py-2">
                {v}
              </td>
            ))}
            <td className="px-2 py-2">{colTotals.reduce((a, b) => a + b, 0)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
