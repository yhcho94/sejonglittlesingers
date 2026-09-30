import Link from "next/link";
import { adminSaveFaculty } from "@/app/actions/faculty";
import { FacultyBioForm } from "@/components/FacultyBioForm";
import { requireAdmin } from "@/lib/auth";
import { AdminFacultyFields } from "../AdminFacultyFields";

export default async function AdminFacultyNewPage() {
  await requireAdmin("members");
  return (
    <>
      <p className="mb-2 text-sm">
        <Link href="/admin/faculty" className="text-ink-soft underline">
          ← 강사진 소개 목록
        </Link>
      </p>
      <h1 className="mb-6 text-2xl font-bold text-navy">강사 추가</h1>
      <section className="card max-w-3xl">
        <FacultyBioForm bio={{ sections: {}, website: null }} action={adminSaveFaculty} submitLabel="추가">
          <AdminFacultyFields />
        </FacultyBioForm>
      </section>
    </>
  );
}
