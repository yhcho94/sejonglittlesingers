import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { pressSource } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import type { Press } from "@/lib/types";

export default async function AdminPressPage() {
  await requireAdmin("press");
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("press")
    .select("id, title, media, url, published_on, is_published")
    .order("published_on", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .returns<Press[]>();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">보도자료 관리</h1>
        <Link href="/admin/press/new" className="btn-primary">새 기사 등록</Link>
      </div>
      <div className="card">
        {!items?.length ? (
          <p className="py-8 text-center text-ink-soft">등록된 보도자료가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <Link href={`/admin/press/${p.id}`} className="min-w-0 truncate hover:text-navy">
                  {!p.is_published && <span className="mr-2 text-xs text-ink-soft">[비공개]</span>}
                  {p.title}
                </Link>
                <span className="text-sm text-ink-soft">
                  {p.published_on ?? "날짜 없음"} · {pressSource(p)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
