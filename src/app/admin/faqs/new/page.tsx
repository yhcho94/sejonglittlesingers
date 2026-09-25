import { requireAdmin } from "@/lib/auth";
import { FaqForm } from "../FaqForm";

export default async function NewFaqPage() {
  await requireAdmin("recruitment");
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-navy">새 질문 추가</h1>
      <div className="card max-w-3xl">
        <FaqForm />
      </div>
    </>
  );
}
