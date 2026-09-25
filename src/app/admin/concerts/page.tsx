import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatConcertDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Concert } from "@/lib/types";

export default async function AdminConcertsPage() {
  await requireAdmin("concerts");
  const supabase = await createClient();
  const { data: concerts } = await supabase
    .from("concerts")
    .select("*")
    .order("starts_at", { ascending: false })
    .returns<Concert[]>();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">공연 일정 관리</h1>
        <Link href="/admin/concerts/new" className="btn-primary">새 공연 등록</Link>
      </div>
      <div className="card">
        {!concerts?.length ? (
          <p className="py-8 text-center text-ink-soft">등록된 공연이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-line">
            {concerts.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <Link href={`/admin/concerts/${c.id}`} className="min-w-0 truncate hover:text-navy">
                  {!c.is_published && <span className="mr-2 text-xs text-ink-soft">[비공개]</span>}
                  {c.title}
                </Link>
                <span className="text-sm text-ink-soft">
                  {formatConcertDate(c.starts_at, c.time_tbd)}
                  {c.venue && ` · ${c.venue}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
