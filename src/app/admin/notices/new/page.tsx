import { requireAdmin } from "@/lib/auth";
import { NoticeForm } from "../NoticeForm";

export default async function NewNoticePage() {
  await requireAdmin();
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-navy">새 공지 작성</h1>
      <div className="card">
        <NoticeForm />
      </div>
    </>
  );
}
