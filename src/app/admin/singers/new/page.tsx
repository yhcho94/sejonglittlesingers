import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { todayKst } from "@/lib/singers";
import { listGuardianOptions } from "@/lib/singers-data";
import { createClient } from "@/lib/supabase/server";
import type { Application } from "@/lib/types";
import { SingerForm } from "../SingerForm";

type AppPrefill = Pick<Application, "id" | "guardian_id" | "child_name" | "child_birthdate" | "school" | "status"> & {
  consent_media_channels?: boolean;
  consent_media_press?: boolean;
  consent_media_name?: boolean;
};

export default async function NewSingerPage({ searchParams }: PageProps<"/admin/singers/new">) {
  await requireAdmin();
  const appId = Number((await searchParams).application);
  const supabase = await createClient();

  // 승인된 입단 신청서에서 단원으로 등록하는 경우 기본값을 채웁니다.
  let app: AppPrefill | null = null;
  if (Number.isSafeInteger(appId) && appId > 0) {
    const { data: existing } = await supabase.from("singers").select("id").eq("application_id", appId).maybeSingle();
    if (existing) redirect(`/admin/singers/${existing.id}`);
    const { data } = await supabase
      .from("applications")
      .select("id, guardian_id, child_name, child_birthdate, school, status, consent_media_channels, consent_media_press, consent_media_name")
      .eq("id", appId)
      .maybeSingle<AppPrefill>();
    app = data?.status === "approved" ? data : null;
  }

  const guardians = await listGuardianOptions();
  const { year, month, day } = todayKst();
  const today = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <>
      <Link href="/admin/singers" className="text-sm text-ink-soft hover:underline">
        ← 단원 명부
      </Link>
      <h1 className="mt-4 mb-2 text-2xl font-bold text-navy">단원 등록</h1>
      {app && (
        <p className="mb-6 text-sm text-ink-soft">
          {app.child_name} 입단 신청서의 내용(초상권 동의 포함)을 불러왔습니다. 반·파트·기수를 정하고 사진을 올려 주세요.
        </p>
      )}
      <div className="card mt-4">
        <SingerForm
          initial={
            app
              ? {
                  name: app.child_name,
                  birthdate: app.child_birthdate,
                  school: app.school,
                  guardian_id: app.guardian_id,
                  application_id: app.id,
                  consent_media_channels: app.consent_media_channels ?? false,
                  consent_media_press: app.consent_media_press ?? false,
                  name_public: app.consent_media_name ?? false,
                  joined_on: today,
                  status: "active",
                }
              : { joined_on: today, status: "active" }
          }
          guardians={guardians}
          photoUrl={null}
        />
      </div>
    </>
  );
}
