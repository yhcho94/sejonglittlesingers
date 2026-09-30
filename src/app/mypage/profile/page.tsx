import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/auth";
import { conductor, staffGroups } from "@/lib/staff";
import { isFacultyRole, legacyToBio, normalizeBio } from "@/lib/staff-bio";
import { createClient } from "@/lib/supabase/server";
import { StaffBioForm } from "./StaffBioForm";

export const metadata: Metadata = { title: "강사 프로필 수정", robots: { index: false } };

// 강사진(운영진 회원) 본인의 약력 입력. 처음이면 지금 강사진 소개에 있는 약력을 채워 둠
export default async function StaffBioPage() {
  const { user, profile } = await requireUser("/mypage/profile");
  if (!profile || (profile.member_type !== "teacher" && profile.member_type !== "staff") || !isFacultyRole(profile.staff_role)) {
    redirect("/mypage");
  }
  const supabase = await createClient();
  const { data: saved, error } = await supabase
    .from("staff_bios")
    .select("intro, sections, website, updated_at")
    .eq("id", user.id)
    .maybeSingle();
  const legacy = [conductor, ...staffGroups.flatMap((g) => g.members)].find((m) => m.name === profile.guardian_name);
  const bio = saved ? normalizeBio(saved) : legacyToBio(legacy);

  return (
    <>
      <PageHeader eyebrow="My Page" title="강사 프로필 수정" />
      <div className="mx-auto max-w-3xl px-4 py-7">
        <section className="card">
          <p className="text-sm">
            <span className="font-semibold text-navy">{profile.guardian_name}</span>
            <span className="ml-2 text-ink-soft">
              {profile.staff_class ? `${profile.staff_class} ` : ""}
              {profile.staff_role}
            </span>
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-relaxed text-ink-soft">
            <li>저장하면 홈페이지 &lsquo;강사진 소개&rsquo;에 입력한 그대로 표시됩니다. 비워 둔 항목은 표시되지 않습니다.</li>
            <li>항목 안에서는 한 줄에 하나씩 적어 주세요. 줄마다 따로 표시됩니다.</li>
            {!saved && legacy && <li>지금 강사진 소개에 있는 약력을 미리 채워 두었습니다. 고칠 부분만 고쳐 저장하세요.</li>}
            {!profile.org_visible && (
              <li className="font-medium text-gold-deep">
                아직 조직도 게시 승인 전입니다. 최상위 관리자가 승인하면 강사진 소개에 표시됩니다.
              </li>
            )}
            <li>이름·역할·담당 반은 최상위 관리자만 바꿀 수 있습니다.</li>
          </ul>
          {error && (
            <p className="mt-3 rounded-sm bg-red-50 p-3 text-sm text-red-800">
              저장된 프로필을 읽지 못했습니다. 잠시 뒤 다시 열어 주세요.
            </p>
          )}
        </section>

        <section className="card mt-5">
          <StaffBioForm key={saved?.updated_at ?? "new"} bio={bio} />
        </section>

        <p className="mt-5 text-sm">
          <Link href="/faculty" className="text-navy underline">
            강사진 소개 보기
          </Link>
          <span className="mx-2 text-line">|</span>
          <Link href="/mypage" className="text-ink-soft underline">
            마이페이지로
          </Link>
        </p>
      </div>
    </>
  );
}
