import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Faq } from "@/lib/types";

export default async function AdminFaqsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: faqs } = await supabase
    .from("faqs")
    .select("id, question, answer, sort_order, is_published")
    .order("sort_order")
    .order("id")
    .returns<Faq[]>();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">FAQ 관리</h1>
        <Link href="/admin/faqs/new" className="btn-primary">새 질문 추가</Link>
      </div>
      <div className="card">
        {!faqs?.length ? (
          <p className="py-8 text-center text-ink-soft">등록된 질문이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-line">
            {faqs.map((f) => (
              <li key={f.id} className="flex items-center gap-4 py-3">
                <span className="w-10 shrink-0 text-sm text-ink-soft">{f.sort_order}</span>
                <Link href={`/admin/faqs/${f.id}`} className="min-w-0 flex-1 truncate hover:text-navy">
                  {!f.is_published && <span className="mr-2 text-xs text-ink-soft">[비공개]</span>}
                  {f.question}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-soft">순서 숫자가 작을수록 위에 표시됩니다.</p>
    </>
  );
}
