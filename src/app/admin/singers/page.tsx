import Link from "next/link";
import { StatusPill } from "./StatusPill";
import { MigrationNotice, SingerTabs } from "./SingerTabs";
import { RosterFilters } from "./RosterFilters";
import { requireAdmin } from "@/lib/auth";
import {
  applyFilter,
  filterToQuery,
  gradeCode,
  gradeLabel,
  groupSingers,
  manAge,
  parseFilter,
  VIEWS,
} from "@/lib/singers";
import { guardianMap, listSingers } from "@/lib/singers-data";

export default async function AdminSingersPage({ searchParams }: PageProps<"/admin/singers">) {
  await requireAdmin();
  const filter = parseFilter(await searchParams);
  const { singers, error } = await listSingers();
  const filtered = applyFilter(singers, filter);
  const groups = groupSingers(filtered, filter.view);
  const guardians = await guardianMap(filtered.map((s) => s.guardian_id));
  const query = filterToQuery(filter);

  return (
    <>
      <SingerTabs active="list" />
      {error ? (
        <MigrationNotice />
      ) : (
        <>
          <RosterFilters filter={filter} basePath="/admin/singers" />

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-soft">
              {VIEWS[filter.view]} · <strong className="text-ink">{filtered.length}명</strong>
              {filtered.length !== singers.length && ` (전체 ${singers.length}명 중)`}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/singers/photos${query}`} className="btn-outline text-xs">
                이 조건으로 사진 명부
              </Link>
              {/* 파일 다운로드는 새로고침 없이 받도록 일반 링크 사용 */}
              <a href={`/admin/singers/export${query}`} className="btn-outline text-xs" download>
                엑셀 다운로드
              </a>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="card text-center text-sm text-ink-soft">
              {singers.length === 0 ? "등록된 단원이 없습니다. ‘+ 단원 등록’ 또는 ‘엑셀 일괄 등록’으로 추가하세요." : "조건에 맞는 단원이 없습니다."}
            </p>
          ) : (
            <div className="space-y-8">
              {groups.map((g) => (
                <section key={g.key}>
                  {filter.view !== "all" && (
                    <h2 className="mb-2 flex items-baseline gap-2 font-bold text-navy">
                      {g.label} <span className="text-sm font-normal text-ink-soft">{g.singers.length}명</span>
                    </h2>
                  )}
                  <div className="card overflow-x-auto p-0">
                    <table className="w-full min-w-[820px] text-left text-sm">
                      <thead className="border-b border-line bg-cream text-ink-soft">
                        <tr>
                          <th className="w-12 px-3 py-3 text-center font-medium">No</th>
                          <th className="px-3 py-3 font-medium">이름</th>
                          <th className="px-3 py-3 font-medium">반</th>
                          <th className="px-3 py-3 font-medium">학년</th>
                          <th className="px-3 py-3 font-medium">만 나이</th>
                          <th className="px-3 py-3 font-medium">생년월일</th>
                          <th className="px-3 py-3 font-medium">학교</th>
                          <th className="px-3 py-3 font-medium">보호자 / 연락처</th>
                          <th className="px-3 py-3 font-medium">상태</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {g.singers.map((s, i) => {
                          const guardian = s.guardian_id ? guardians.get(s.guardian_id) : undefined;
                          return (
                            <tr key={s.id} className="hover:bg-ivory">
                              <td className="px-3 py-2.5 text-center text-ink-soft">{i + 1}</td>
                              <td className="px-3 py-2.5">
                                <Link href={`/admin/singers/${s.id}`} className="font-medium text-navy hover:underline">
                                  {s.name}
                                </Link>
                                {s.photo_path && (
                                  <span className="ml-1.5 text-xs text-gold-deep" title="사진 있음">
                                    ●
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5">{s.class_name ?? "-"}</td>
                              <td className="px-3 py-2.5">{gradeLabel(gradeCode(s.birthdate, s.grade_override))}</td>
                              <td className="px-3 py-2.5">{manAge(s.birthdate)}세</td>
                              <td className="px-3 py-2.5 tabular-nums">{s.birthdate}</td>
                              <td className="px-3 py-2.5">{s.school ?? "-"}</td>
                              <td className="px-3 py-2.5">
                                {guardian?.guardian_name ?? s.guardian_name ?? "-"}
                                <span className="block text-xs text-ink-soft">
                                  {guardian?.phone ?? s.guardian_phone ?? ""}
                                </span>
                              </td>
                              <td className="px-3 py-2.5">
                                <StatusPill status={s.status} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
          )}
          <p className="mt-6 text-xs text-ink-soft">
            학년은 출생연도 기준 자동 계산(3월 학년도 시작)이며, 조기·유예 입학 단원은 수정 화면에서 직접 지정할 수 있습니다.
            내려받은 엑셀 파일에는 아동·보호자 개인정보가 들어 있으니 공유·보관에 주의하고 사용 후 삭제해 주세요.
          </p>
        </>
      )}
    </>
  );
}
