import type { Metadata } from "next";
import Link from "next/link";
import { cancelApplication } from "@/app/actions/applications";
import { ConfirmButton } from "@/components/ConfirmButton";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Application } from "@/lib/types";
import { MEDIA_NOTICE } from "@/lib/media-consent";
import { MediaConsentForm } from "./MediaConsentForm";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "마이페이지" };

export default async function MyPage({ searchParams }: PageProps<"/mypage">) {
  const { user, profile } = await requireUser("/mypage");
  const { applied } = await searchParams;

  const supabase = await createClient();
  const { data: applications } = await supabase
    .from("applications")
    .select("id, child_name, child_birthdate, status, admin_note, created_at")
    .eq("guardian_id", user.id)
    .order("created_at", { ascending: false })
    .returns<Pick<Application, "id" | "child_name" | "child_birthdate" | "status" | "admin_note" | "created_at">[]>();

  // 보호자 계정과 연결된 자녀 단원 (0008 실행 전이면 빈 목록)
  const { data: mySingers } = await supabase.rpc("my_singers");
  const singers = (mySingers ?? []) as {
    id: number;
    name: string;
    class_name: string | null;
    status: string;
    consent_media_channels: boolean;
    consent_media_press: boolean;
    name_public: boolean;
    consent_updated_at: string | null;
  }[];

  return (
    <>
      <PageHeader eyebrow="My Page" title="마이페이지" />
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-3">
        <section className="card md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy">입단 신청 내역</h2>
            <Link href="/apply" className="btn-primary px-3 py-1.5 text-sm">새 신청</Link>
          </div>
          {applied && (
            <p className="mb-4 rounded-sm bg-green-50 px-3 py-2 text-sm text-green-800">
              입단 신청이 접수되었습니다. 심사 결과는 이 화면에서 확인할 수 있습니다.
            </p>
          )}
          {!applications?.length ? (
            <p className="py-8 text-center text-ink-soft">신청 내역이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-line">
              {applications.map((app) => (
                <li key={app.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <p className="font-medium">
                      {app.child_name} <span className="text-sm text-ink-soft">({app.child_birthdate})</span>
                    </p>
                    <p className="text-sm text-ink-soft">신청일 {formatDate(app.created_at)}</p>
                    {app.status !== "pending" && app.admin_note && (
                      <p className="mt-1 text-sm">안내: {app.admin_note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} />
                    {app.status === "pending" && (
                      <form action={cancelApplication}>
                        <input type="hidden" name="id" value={app.id} />
                        <ConfirmButton message="이 입단 신청을 취소할까요?" className="text-sm text-red-700 hover:underline">
                          신청 취소
                        </ConfirmButton>
                      </form>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="mb-4 text-lg font-bold text-navy">회원 정보</h2>
          {profile ? <ProfileForm profile={profile} /> : <p>회원 정보를 불러오지 못했습니다.</p>}
          <div className="mt-6 border-t border-line pt-4 text-xs text-ink-soft">
            <Link href="/mypage/withdraw" className="underline hover:text-red-700">
              회원 탈퇴
            </Link>
            <span className="ml-1">— 회원 정보와 입단 신청 내역·사진이 바로 삭제됩니다.</span>
          </div>
        </section>
        <section className="card md:col-span-3">
          <h2 className="text-lg font-bold text-navy">자녀 단원 초상권(사진·영상) 동의</h2>
          <p className="mt-1 text-sm text-ink-soft">항목별로 언제든 동의하거나 철회할 수 있습니다.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-relaxed text-ink-soft">
            {MEDIA_NOTICE.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {singers.length === 0 ? (
            <p className="mt-6 rounded-sm bg-cream px-4 py-3 text-sm text-ink-soft">
              이 계정과 연결된 단원이 없습니다. 자녀가 단원인데 보이지 않으면 합창단에 계정 연결을 요청해 주세요.
            </p>
          ) : (
            <div className="mt-6 space-y-6">
              {singers.map((s) => (
                <div key={s.id} className="border-t border-line pt-5">
                  <p className="mb-3 font-medium">
                    {s.name} <span className="text-sm text-ink-soft">{s.class_name ?? ""}</span>
                    {s.consent_updated_at && (
                      <span className="ml-2 text-xs text-ink-soft">최근 변경 {formatDate(s.consent_updated_at)}</span>
                    )}
                  </p>
                  <MediaConsentForm singer={s} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
