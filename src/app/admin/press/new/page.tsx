import { requireAdmin } from "@/lib/auth";
import { PressForm } from "../PressForm";

export default async function NewPressPage() {
  await requireAdmin();
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-navy">새 기사 등록</h1>
      <div className="card max-w-3xl">
        <PressForm />
      </div>
    </>
  );
}
