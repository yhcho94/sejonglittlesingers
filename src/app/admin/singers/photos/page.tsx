import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { applyFilter, filterToQuery, gradeCode, gradeLabel, groupSingers, parseFilter, todayKst, VIEWS, type View } from "@/lib/singers";
import { listSingers, signedPhotoUrls } from "@/lib/singers-data";
import { PrintButton } from "../PrintButton";
import { RosterFilters } from "../RosterFilters";
import { MigrationNotice, SingerTabs } from "../SingerTabs";

const PHOTO_VIEWS: View[] = ["all", "class", "grade"];

export default async function SingerPhotoRoster({ searchParams }: PageProps<"/admin/singers/photos">) {
  await requireAdmin();
  const params = await searchParams;
  const parsed = parseFilter(params);
  const filter = { ...parsed, view: PHOTO_VIEWS.includes(parsed.view) ? parsed.view : "all" };
  const onlyWithPhoto = params.photo === "only";
  const extra: Record<string, string> = onlyWithPhoto ? { photo: "only" } : {};

  const { singers, error } = await listSingers();
  const filtered = applyFilter(singers, filter).filter((s) => !onlyWithPhoto || s.photo_path);
  const groups = groupSingers(filtered, filter.view);
  // 인쇄 준비 시간을 고려해 1시간 동안 유효한 링크
  const urls = await signedPhotoUrls(filtered.map((s) => s.photo_path), 3600);
  const withPhoto = filtered.filter((s) => s.photo_path).length;

  const title = `세종리틀싱어즈 단원 사진 명부${filter.className ? ` · ${filter.className}` : ""}`;
  const { year, month, day } = todayKst();

  return (
    <>
      <SingerTabs active="photos" />
      {error ? (
        <MigrationNotice />
      ) : (
        <>
          <RosterFilters filter={filter} basePath="/admin/singers/photos" views={PHOTO_VIEWS} extraQuery={extra}>
            <label className="flex items-center gap-2 pb-2.5 text-sm">
              <input type="checkbox" name="photo" value="only" defaultChecked={onlyWithPhoto} />
              사진 있는 단원만
            </label>
          </RosterFilters>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <p className="text-sm text-ink-soft">
              {VIEWS[filter.view]} · {filtered.length}명 (사진 {withPhoto}명)
            </p>
            <div className="flex gap-2">
              <Link href={`/admin/singers${filterToQuery(filter)}`} className="btn-outline">
                명부 표로 보기
              </Link>
              <PrintButton label="사진 명부 인쇄" />
            </div>
          </div>

          {/* 인쇄할 때만 보이는 제목 */}
          <div className="mb-4 hidden items-end justify-between border-b-2 border-navy pb-2 print:flex">
            <h1 className="text-lg font-bold text-navy">{title}</h1>
            <p className="text-xs text-ink-soft">
              {year}. {month}. {day}. 기준 · {filtered.length}명 · 개인정보 취급 주의
            </p>
          </div>

          {filtered.length === 0 ? (
            <p className="card text-center text-sm text-ink-soft">조건에 맞는 단원이 없습니다.</p>
          ) : (
            <div className="space-y-10 print:space-y-0">
              {groups.map((g, gi) => (
                <section key={g.key} className={gi > 0 ? "print:break-before-page print:pt-2" : ""}>
                  {filter.view !== "all" && (
                    <h2 className="mb-3 flex items-baseline gap-2 border-b border-line pb-2 font-bold text-navy">
                      {g.label} <span className="text-sm font-normal text-ink-soft">{g.singers.length}명</span>
                    </h2>
                  )}
                  <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 print:grid-cols-6 print:gap-2">
                    {g.singers.map((s) => {
                      const url = s.photo_path ? urls.get(s.photo_path) : undefined;
                      return (
                        <li key={s.id} className="break-inside-avoid">
                          <Link href={`/admin/singers/${s.id}`} className="group block">
                            <div className="flex aspect-[3/4] items-center justify-center overflow-hidden border border-line bg-cream text-xs text-ink-soft">
                              {url ? (
                                // eslint-disable-next-line @next/next/no-img-element -- 만료되는 서명 URL
                                <img src={url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                "사진 없음"
                              )}
                            </div>
                            <p className="mt-1.5 text-center text-sm font-medium group-hover:underline print:text-xs">
                              {s.name}
                            </p>
                            <p className="text-center text-xs text-ink-soft print:text-[10px]">
                              {[filter.view === "class" ? null : s.class_name, gradeLabel(gradeCode(s.birthdate, s.grade_override))]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
          <p className="mt-8 text-xs text-ink-soft print:hidden">
            사진 링크는 1시간 동안만 유효합니다. 오래 열어 둔 뒤 인쇄할 때는 새로고침 후 인쇄하세요. 인쇄물은 단원 관리 목적으로만
            쓰고, 사용 후 파기해 주세요.
          </p>
        </>
      )}
    </>
  );
}

