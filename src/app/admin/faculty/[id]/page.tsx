import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDeleteFaculty, adminSaveFaculty } from "@/app/actions/faculty";
import { ConfirmButton } from "@/components/ConfirmButton";
import { FacultyBioForm } from "@/components/FacultyBioForm";
import { requireAdmin } from "@/lib/auth";
import { normalizeBio } from "@/lib/staff-bio";
import { createClient } from "@/lib/supabase/server";
import { AdminFacultyFields } from "../AdminFacultyFields";

export default async function AdminFacultyEditPage({ params }: PageProps<"/admin/faculty/[id]">) {
  await requireAdmin("members");
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id)) notFound();
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("faculty_bios")
    .select("id, name, role, class_name, sort_order, sections, website, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (!row) notFound();

  return (
    <>
      <p className="mb-2 text-sm">
        <Link href="/admin/faculty" className="text-ink-soft underline">
          ← 강사진 소개 목록
        </Link>
      </p>
      <h1 className="mb-6 text-2xl font-bold text-navy">{row.name} 약력 수정</h1>
      <section className="card max-w-3xl">
        <FacultyBioForm key={row.updated_at} bio={normalizeBio(row)} action={adminSaveFaculty} id={row.id}>
          <AdminFacultyFields row={row} />
        </FacultyBioForm>
      </section>
      <form action={adminDeleteFaculty} className="mt-6">
        <input type="hidden" name="id" value={row.id} />
        <ConfirmButton
          message={`${row.name} 님을 강사진 소개에서 삭제할까요? 입력한 약력도 함께 지워집니다.`}
          className="text-sm text-red-700 underline"
        >
          강사진 소개에서 삭제
        </ConfirmButton>
      </form>
    </>
  );
}
