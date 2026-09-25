import { requireAdmin } from "@/lib/auth";
import { ConcertForm } from "../ConcertForm";

export default async function NewConcertPage() {
  await requireAdmin("concerts");
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-navy">새 공연 등록</h1>
      <div className="card max-w-3xl">
        <ConcertForm />
      </div>
    </>
  );
}
