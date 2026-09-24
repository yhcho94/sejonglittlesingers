import type { Metadata } from "next";
import { ConcertCard } from "@/components/ConcertCard";
import { PageHeader } from "@/components/PageHeader";
import { PerformanceHistory } from "@/components/PerformanceHistory";
import { listConcerts } from "@/lib/content";

export const metadata: Metadata = {
  title: "공연 일정",
  description: "세종리틀싱어즈의 다가오는 공연 일정과 지금까지의 공연 이력입니다.",
  alternates: { canonical: "/concerts" },
};

export default async function ConcertsPage() {
  const [upcoming, past] = await Promise.all([listConcerts("upcoming"), listConcerts("past")]);

  return (
    <>
      <PageHeader eyebrow="Concerts" title="공연" description="다가오는 공연과 지금까지 함께한 무대를 소개합니다." />
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <section>
          <h2 className="mb-5 text-xl font-semibold text-navy">다가오는 공연</h2>
          {upcoming.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {upcoming.map((c) => (
                <ConcertCard key={c.id} concert={c} />
              ))}
            </div>
          ) : (
            <p className="rounded-sm border border-line bg-white p-6 text-ink-soft">예정된 공연이 없습니다.</p>
          )}
        </section>

        {past.length > 0 && (
          <section>
            <h2 className="mb-5 text-xl font-semibold text-navy">지난 공연</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {past.map((c) => (
                <ConcertCard key={c.id} concert={c} />
              ))}
            </div>
          </section>
        )}

        <section id="history" className="scroll-mt-24">
          <h2 className="mb-5 text-xl font-semibold text-navy">공연 이력</h2>
          <PerformanceHistory />
        </section>
      </div>
    </>
  );
}
