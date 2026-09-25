import { notFound } from "next/navigation";
import { deleteNotice } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Notice } from "@/lib/types";
import { NoticeForm } from "../NoticeForm";

export default async function EditNoticePage({ params }: PageProps<"/admin/notices/[id]">) {
  await requireAdmin("notices");
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id)) notFound();

  const supabase = await createClient();
  const { data: notice } = await supabase
    .from("notices")
    .select("id, title, body, is_pinned, is_published, created_at, updated_at")
    .eq("id", id)
    .maybeSingle<Notice>();
  if (!notice) notFound();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">공지 수정</h1>
        <form action={deleteNotice}>
          <input type="hidden" name="id" value={notice.id} />
          <ConfirmButton message="이 공지를 삭제할까요? 되돌릴 수 없습니다." className="btn-danger">
            삭제
          </ConfirmButton>
        </form>
      </div>
      <div className="card">
        <NoticeForm notice={notice} />
      </div>
    </>
  );
}
