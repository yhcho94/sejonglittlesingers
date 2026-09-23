import { notFound } from "next/navigation";
import { deleteFaq } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Faq } from "@/lib/types";
import { FaqForm } from "../FaqForm";

export default async function EditFaqPage({ params }: PageProps<"/admin/faqs/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id)) notFound();

  const supabase = await createClient();
  const { data: faq } = await supabase
    .from("faqs")
    .select("id, question, answer, sort_order, is_published")
    .eq("id", id)
    .maybeSingle<Faq>();
  if (!faq) notFound();

  return (
    <>
      <div className="mb-6 flex max-w-3xl items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">질문 수정</h1>
        <form action={deleteFaq}>
          <input type="hidden" name="id" value={faq.id} />
          <ConfirmButton message="이 질문을 삭제할까요?" className="btn-danger">삭제</ConfirmButton>
        </form>
      </div>
      <div className="card max-w-3xl">
        <FaqForm faq={faq} />
      </div>
    </>
  );
}
