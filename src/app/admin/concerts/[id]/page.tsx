import { notFound } from "next/navigation";
import { deleteConcert } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Concert } from "@/lib/types";
import { ConcertForm } from "../ConcertForm";

export default async function EditConcertPage({ params }: PageProps<"/admin/concerts/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id)) notFound();

  const supabase = await createClient();
  const { data: concert } = await supabase
    .from("concerts")
    .select("*")
    .eq("id", id)
    .maybeSingle<Concert>();
  if (!concert) notFound();

  return (
    <>
      <div className="mb-6 flex max-w-3xl items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">공연 수정</h1>
        <form action={deleteConcert}>
          <input type="hidden" name="id" value={concert.id} />
          <ConfirmButton message="이 공연을 삭제할까요?" className="btn-danger">삭제</ConfirmButton>
        </form>
      </div>
      <div className="card max-w-3xl">
        <ConcertForm concert={concert} />
      </div>
    </>
  );
}
