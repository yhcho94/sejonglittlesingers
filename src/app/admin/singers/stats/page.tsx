import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { CLASS_NAMES, todayKst, type ClassName } from "@/lib/singers";
import { listSingers } from "@/lib/singers-data";
import { singerStats } from "@/lib/singers-stats";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/lib/types";
import { MigrationNotice, SingerTabs } from "../SingerTabs";
import { BarList, ChartCard, HeatTable, StatTile } from "./charts";

// 입단 신청 연도별 (한국 시간 기준 연도)
async function applicationsByYear() {
  const supabase = await createClient();
  // join_source 칸(0011)이 없으면 기본 칸만 다시 조회
  type Row = { status: ApplicationStatus; created_at: string; join_source?: string | null };
  const first = await supabase.from("applications").select("status, created_at, join_source").returns<Row[]>();
  const data = first.error
    ? (await supabase.from("applications").select("status, created_at").returns<Row[]>()).data
    : first.data;
  const sources = new Map<string, number>();
  for (const a of data ?? []) {
    const k = a.join_source ?? "미입력";
    sources.set(k, (sources.get(k) ?? 0) + 1);
  }
  const bySource = [...sources.entries()]
    .map(([label, value]) => ({ key: label, label, value }))
    .sort((a, b) => (a.label === "미입력" ? 1 : b.label === "미입력" ? -1 : b.value - a.value));
  const map = new Map<number, { year: number; total: number; approved: number; pending: number }>();
  for (const a of data ?? []) {
    const y = todayKst(new Date(a.created_at)).year;
    const row = map.get(y) ?? { year: y, total: 0, approved: 0, pending: 0 };
    row.total += 1;
    if (a.status === "approved") row.approved += 1;
    if (a.status === "pending") row.pending += 1;
    map.set(y, row);
  }
  return { years: [...map.values()].sort((a, b) => a.year - b.year), bySource };
}

export default async function SingerStatsPage({ searchParams }: PageProps<"/admin/singers/stats">) {
  await requireAdmin();
  const cls = (await searchParams).class;
  const className = (CLASS_NAMES as readonly string[]).includes(String(cls)) ? (cls as ClassName) : "";
  const [{ singers, error }, { years: apps, bySource: appSources }] = await Promise.all([listSingers(), applicationsByYear()]);
  const scoped = className ? singers.filter((s) => s.class_name === className) : singers;
  const st = singerStats(scoped);
  const { year, month, day } = todayKst();
  const sm = st.summary;
  const tenure =
    sm.avgTenureMonths === null
      ? "-"
      : sm.avgTenureMonths >= 12
        ? `${Math.floor(sm.avgTenureMonths / 12)}년 ${sm.avgTenureMonths % 12}개월`
        : `${sm.avgTenureMonths}개월`;
  const yearlyMax = Math.max(1, ...st.yearly.map((y) => Math.max(y.joined, y.left, y.roster)));

  return (
    <>
      <SingerTabs active="stats" />
      {error ? (
        <MigrationNotice />
      ) : (
        <>
          {/* 필터: 모든 통계에 함께 적용 */}
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-ink-soft">범위</span>
            {["", ...CLASS_NAMES].map((c) => (
              <Link
                key={c || "all"}
                href={c ? `/admin/singers/stats?class=${encodeURIComponent(c)}` : "/admin/singers/stats"}
                aria-current={c === className ? "page" : undefined}
                className={
                  c === className
                    ? "rounded-sm bg-navy px-3 py-1.5 text-white"
                    : "rounded-sm border border-line bg-white px-3 py-1.5 hover:border-navy"
                }
              >
                {c || "합창단 전체"}
              </Link>
            ))}
            <span className="ml-auto text-xs text-ink-soft">
              {year}. {month}. {day}. 기준
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="활동 단원" value={`${sm.active}명`} />
            <StatTile label="휴단" value={`${sm.paused}명`} note={`퇴단 누적 ${sm.left}명`} />
            <StatTile label={`${year}년 입단`} value={`${sm.joinedThisYear}명`} note={`퇴단 ${sm.leftThisYear}명`} />
            <StatTile label="평균 활동 기간" value={tenure} note="활동 단원, 입단일 기준" />
            <StatTile label="사진 등록" value={`${sm.photoRate}%`} note="활동 단원 중" />
            <StatTile label="보호자 회원 연결" value={`${sm.guardianLinkedRate}%`} note={`이름 공개 동의 ${sm.namePublicRate}%`} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {!className && (
              <ChartCard title="반별 인원" note="활동 단원">
                <BarList items={st.byClass} total={sm.active} />
              </ChartCard>
            )}
            <ChartCard title="학년별 인원" note="활동 단원 · 출생연도 기준 (3월 학년도 시작, 직접 지정 반영)">
              <BarList items={st.byGrade} total={sm.active} />
            </ChartCard>
            <ChartCard title="출생연도별 인원" note="활동 단원">
              <BarList items={st.byBirthYear} total={sm.active} />
            </ChartCard>
            <ChartCard title="만 나이별 인원" note="활동 단원 · 오늘 기준 만 나이 (생일을 모르는 단원은 '생일 미입력')">
              <BarList items={st.byAge} total={sm.active} />
            </ChartCard>
            <ChartCard title="가입경로" note="활동 단원 · 홍보 효과 확인에 참고">
              <BarList items={st.byJoinSource} total={sm.active} />
            </ChartCard>
            <ChartCard title="성별" note="활동 단원">
              <BarList items={st.byGender} total={sm.active} />
            </ChartCard>
          </div>

          {!className && st.cross.rows.length > 0 && (
            <div className="mt-6">
              <ChartCard title="반 × 학년 교차표" note="활동 단원 · 칸이 진할수록 인원이 많습니다">
                <HeatTable columns={st.cross.grades} rows={st.cross.rows} />
              </ChartCard>
            </div>
          )}

          <div className="mt-6">
            <ChartCard
              title="연도별 입단 · 퇴단 · 재적"
              note={`입단일이 입력된 단원 기준${st.undatedCount ? ` (입단일 미입력 ${st.undatedCount}명 제외)` : ""} · 재적은 그해 12월 31일 기준, 올해는 현재 활동+휴단 인원`}
            >
              {st.yearly.length === 0 ? (
                <p className="text-sm text-ink-soft">자료가 없습니다.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm tabular-nums">
                    <thead className="text-xs text-ink-soft">
                      <tr className="border-b border-line">
                        <th className="w-20 py-2 text-left font-medium">연도</th>
                        <th className="py-2 text-left font-medium">입단</th>
                        <th className="py-2 text-left font-medium">퇴단</th>
                        <th className="py-2 text-left font-medium">재적</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {st.yearly.map((y) => (
                        <tr key={y.year}>
                          <th className="py-2 text-left font-medium">{y.year}</th>
                          {[y.joined, y.left, y.roster].map((v, i) => (
                            <td key={i} className="py-2 pr-4">
                              <span className="flex items-center gap-2">
                                <span
                                  className="h-3 rounded-r-[4px] bg-navy"
                                  style={{ width: `calc((100% - 3rem) * ${v / yearlyMax})`, minWidth: v ? 2 : 0 }}
                                />
                                <span>{v}</span>
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ChartCard>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartCard title="기수별 인원" note="등록된 모든 단원 (괄호: 현재 활동)">
              <BarList items={st.cohorts.map((c) => ({ ...c, label: `${c.label} (${c.active})` }))} />
            </ChartCard>
            <ChartCard title="학교별 인원 (상위 10)" note="활동 단원 · 홍보·연습 일정 조율에 참고">
              <BarList items={st.bySchool.slice(0, 10)} />
            </ChartCard>
          </div>

          {!className && (
            <div className="mt-6">
              <ChartCard
                title="연도별 입단 신청"
                note="홈페이지 신청서 기준 · 반려된 신청은 5일 후 자동 삭제되므로 전체 건수에 포함되지 않을 수 있습니다"
              >
                {apps.length === 0 ? (
                  <p className="text-sm text-ink-soft">신청 자료가 없습니다.</p>
                ) : (
                  <table className="w-full text-sm tabular-nums">
                    <thead className="text-xs text-ink-soft">
                      <tr className="border-b border-line">
                        <th className="py-2 text-left font-medium">연도</th>
                        <th className="py-2 text-right font-medium">신청(현재 보관)</th>
                        <th className="py-2 text-right font-medium">승인</th>
                        <th className="py-2 text-right font-medium">심사 대기</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {apps.map((a) => (
                        <tr key={a.year}>
                          <th className="py-2 text-left font-medium">{a.year}</th>
                          <td className="py-2 text-right">{a.total}</td>
                          <td className="py-2 text-right">{a.approved}</td>
                          <td className="py-2 text-right">{a.pending}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </ChartCard>
              <div className="mt-6">
                <ChartCard title="입단 신청 가입경로" note="홈페이지 신청서 기준 (가입경로 항목 추가 이전 신청은 '미입력')">
                  <BarList items={appSources} unit="건" />
                </ChartCard>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
