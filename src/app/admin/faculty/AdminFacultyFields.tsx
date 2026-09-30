import { CLASS_OPTIONS } from "@/lib/application-fields";
import { FacultyRoleField } from "./FacultyRoleField";

// 최상위 관리자만: 이름·역할·담당 반·순서
export function AdminFacultyFields({
  row,
}: {
  row?: { name: string; role: string; class_name: string | null; sort_order: number };
}) {
  return (
    <div className="grid gap-4 border-b border-line pb-5 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className="label">이름</label>
        <input id="name" name="name" required maxLength={50} defaultValue={row?.name ?? ""} className="input" />
      </div>
      <FacultyRoleField role={row?.role} />
      <div>
        <label htmlFor="class_name" className="label">담당 반</label>
        <select id="class_name" name="class_name" defaultValue={row?.class_name ?? ""} className="input">
          <option value="">없음</option>
          {CLASS_OPTIONS.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="sort_order" className="label">
          순서 <span className="font-normal text-ink-soft">(같은 역할·반 안에서 작은 숫자 먼저)</span>
        </label>
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          step={1}
          defaultValue={row?.sort_order ?? 0}
          className="input"
        />
      </div>
    </div>
  );
}
