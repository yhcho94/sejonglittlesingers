import { requireAdmin } from "@/lib/auth";
import { getRecruitment } from "@/lib/content";
import { RecruitmentForm } from "./RecruitmentForm";

export default async function AdminRecruitmentPage() {
  await requireAdmin();
  const data = await getRecruitment();
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-navy">입단 안내 관리</h1>
      <div className="card max-w-3xl">
        <RecruitmentForm data={data} />
      </div>
    </>
  );
}
