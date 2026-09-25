import { notFound } from "next/navigation";
import { deletePress } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Press } from "@/lib/types";
import { PressForm } from "../PressForm";

export default async function EditPressPage({ params }: PageProps<"/admin/press/[id]">) {
  await requireAdmin("press");
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id)) notFound();

  const supabase = await createClient();
  const { data: item } = await supabase
    .from("press")
    .select("id, title, media, url, published_on, is_published")
    .eq("id", id)
    .maybeSingle<Press>();
  if (!item) notFound();

  return (
    <>
      <div className="mb-6 flex max-w-3xl items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">기사 수정</h1>
        <form action={deletePress}>
          <input type="hidden" name="id" value={item.id} />
          <ConfirmButton message="이 기사를 목록에서 삭제할까요?" className="btn-danger">삭제</ConfirmButton>
        </form>
      </div>
      <div className="card max-w-3xl">
        <PressForm item={item} />
      </div>
    </>
  );
}
