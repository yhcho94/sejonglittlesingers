import Link from "next/link";
import { concertDateParts, formatConcertDate } from "@/lib/format";
import type { Concert } from "@/lib/types";

export function ConcertCard({ concert }: { concert: Concert }) {
  const { year, month, day } = concertDateParts(concert.starts_at);
  return (
    <Link
      href={`/concerts/${concert.id}`}
      className="group flex border border-line bg-white transition hover:border-navy"
    >
      <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-navy py-4 text-white md:w-24">
        <span className="font-[family-name:var(--font-display)] text-xs tracking-widest text-gold">{year}</span>
        <span className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight md:text-4xl">
          {Number(month)}.{Number(day)}
        </span>
      </div>
      <div className="min-w-0 p-5">
        <p className="font-medium leading-snug group-hover:text-navy">{concert.title}</p>
        <p className="mt-2 text-sm text-ink-soft">{formatConcertDate(concert.starts_at, concert.time_tbd)}</p>
        {concert.venue && <p className="text-sm text-ink-soft">{concert.venue}</p>}
      </div>
    </Link>
  );
}
