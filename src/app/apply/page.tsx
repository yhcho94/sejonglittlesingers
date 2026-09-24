import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { ApplyForm } from "./ApplyForm";

export const metadata: Metadata = { title: "입단 신청" };

export default async function ApplyPage({ searchParams }: PageProps<"/apply">) {
  const { user, profile } = await requireUser("/apply");
  const { from } = await searchParams;

  // 반려된 신청을 고쳐 다시 내는 경우: 남아 있는 이름·생년월일과 반려 안내를 불러옵니다.
  // (반려 시 나머지 항목과 사진은 개인정보처리방침에 따라 이미 삭제되어 다시 입력해야 합니다)
  const fromId = Number(from);
  let rejected: { child_name: string; child_birthdate: string; admin_note: string | null; reviewed_at: string | null } | null =
    null;
  if (Number.isSafeInteger(fromId) && fromId > 0) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("applications")
      .select("child_name, child_birthdate, admin_note, reviewed_at")
      .eq("id", fromId)
      .eq("guardian_id", user.id)
      .eq("status", "rejected")
      .maybeSingle();
    rejected = data;
  }

  return (
    <>
      <PageHeader
        eyebrow="Application"
        title={rejected ? "입단 다시 신청" : "입단 신청"}
        description="보호자 회원이 자녀(단원)의 입단을 신청합니다."
      />
      <div className="mx-auto max-w-2xl px-4 py-7">
        <p className="mb-4 text-sm text-ink-soft">
          신청 보호자: <strong className="text-ink">{profile?.guardian_name}</strong> ({profile?.phone})
        </p>
        {rejected && (
          <div className="mb-6 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed">
            <p className="font-medium text-red-800">
              반려된 신청을 고쳐 다시 제출합니다{rejected.reviewed_at ? ` (반려일 ${formatDate(rejected.reviewed_at)})` : ""}.
            </p>
            {rejected.admin_note && <p className="mt-1 whitespace-pre-line text-ink">안내: {rejected.admin_note}</p>}
            <p className="mt-2 text-ink-soft">
              이름과 생년월일은 이전 신청에서 가져왔습니다. 학교·주소·경력·지원 동기·사진 등은 반려 시 개인정보 보호를 위해
              삭제되었으므로 다시 입력해 주세요.
            </p>
          </div>
        )}
        <div className="card">
          <ApplyForm
            userId={user.id}
            defaults={rejected ? { childName: rejected.child_name, childBirthdate: rejected.child_birthdate } : undefined}
          />
        </div>
      </div>
    </>
  );
}
