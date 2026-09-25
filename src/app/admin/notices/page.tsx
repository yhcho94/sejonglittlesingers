import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Notice } from "@/lib/types";

export default async function AdminNoticesPage() {
  await requireAdmin("notices");
  const supabase = await createClient();
  const { data: notices } = await supabase
    .from("notices")
    .select("id, title, is_pinned, is_published, created_at")
    .order("created_at", { ascending: false })
    .returns<Pick<Notice, "id" | "title" | "is_pinned" | "is_published" | "created_at">[]>();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">공지사항 관리</h1>
        <Link href="/admin/notices/new" className="btn-primary">새 공지 작성</Link>
      </div>
      <div className="card">
        {!notices?.length ? (
          <p className="py-8 text-center text-ink-soft">공지사항이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-line">
            {notices.map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-4 py-3">
                <Link href={`/admin/notices/${n.id}`} className="min-w-0 truncate hover:text-navy">
                  {n.is_pinned && <span className="mr-2 text-xs text-gold-deep">[고정]</span>}
                  {!n.is_published && <span className="mr-2 text-xs text-ink-soft">[비공개]</span>}
                  {n.title}
                </Link>
                <span className="shrink-0 text-sm text-ink-soft">{formatDate(n.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
