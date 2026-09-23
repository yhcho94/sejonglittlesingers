import Link from "next/link";
import { concertDateParts, formatConcertDate } from "@/lib/format";
import type { Concert } from "@/lib/types";

export function ConcertCard({ concert }: { concert: Concert }) {
  const { year, month, day } = concertDateParts(concert.starts_at);
  return (
    <Link
      href={`/concerts/${concert.id}`}
      className="group flex gap-5 rounded-2xl border border-line bg-white p-5 transition hover:border-navy"
    >
      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-cream py-2 text-navy">
        <span className="text-xs text-ink-soft">{year}</span>
        <span className="text-2xl font-bold leading-tight">
          {Number(month)}.{Number(day)}
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-bold group-hover:text-navy">{concert.title}</p>
        <p className="mt-1 text-sm text-ink-soft">{formatConcertDate(concert.starts_at)}</p>
        {concert.venue && <p className="text-sm text-ink-soft">{concert.venue}</p>}
      </div>
    </Link>
  );
}
