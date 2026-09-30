import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { saveOwnFacultyBio } from "@/app/actions/faculty";
import { FacultyBioForm } from "@/components/FacultyBioForm";
import { FacultyPhotoUploader } from "@/components/FacultyPhotoUploader";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/auth";
import { canEditOwnFaculty, findOwnFacultyRow } from "@/lib/faculty-own";
import { facultyPhotoUrl, isFacultyRole, normalizeBio } from "@/lib/staff-bio";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "강사 프로필 수정", robots: { index: false } };

// 선생님 본인의 강사진 소개 약력. 지금 강사진 소개에 있는 내용이 채워진 채로 열림
export default async function StaffBioPage() {
  const { profile } = await requireUser("/mypage/profile");
  if (!profile || (profile.member_type !== "teacher" && profile.member_type !== "staff") || !isFacultyRole(profile.staff_role)) {
    redirect("/mypage");
  }
  const approved = canEditOwnFaculty(profile);
  const row = approved ? await findOwnFacultyRow(await createClient(), profile) : null;
  const bio = normalizeBio(row ?? {});

  return (
    <>
      <PageHeader eyebrow="My Page" title="강사 프로필 수정" />
      <div className="mx-auto max-w-3xl px-4 py-7">
        <section className="card">
          <p className="text-sm">
            <span className="font-semibold text-navy">{profile.guardian_name}</span>
            <span className="ml-2 text-ink-soft">
              {row?.role ?? `${profile.staff_class ? `${profile.staff_class} ` : ""}${profile.staff_role}`}
            </span>
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-relaxed text-ink-soft">
            <li>저장하면 홈페이지 &lsquo;강사진 소개&rsquo;에 입력한 그대로 표시됩니다. 비워 둔 항목은 표시되지 않습니다.</li>
            <li>항목 안에서는 한 줄에 하나씩 적어 주세요. 줄마다 따로 표시됩니다.</li>
            {row ? (
              <li>지금 강사진 소개에 있는 내용입니다. 고칠 부분만 고쳐 저장하세요.</li>
            ) : (
              approved && <li>아직 강사진 소개에 없습니다. 저장하면 새로 추가됩니다.</li>
            )}
            <li>이름·역할·담당 반은 최상위 관리자만 바꿀 수 있습니다.</li>
          </ul>
        </section>

        {approved && (
          <section className="card mt-5">
            <h2 className="mb-3 text-sm font-semibold text-navy">사진</h2>
            {row ? (
              <FacultyPhotoUploader id={row.id} name={profile.guardian_name} photoUrl={facultyPhotoUrl(row.photo_path)} />
            ) : (
              <p className="text-sm text-ink-soft">아래 약력을 먼저 저장하면 사진을 올릴 수 있습니다.</p>
            )}
          </section>
        )}

        <section className="card mt-5">
          {approved ? (
            <FacultyBioForm key={row?.id ?? "new"} bio={bio} action={saveOwnFacultyBio} />
          ) : (
            <p className="text-sm text-ink-soft">
              최상위 관리자가 운영진 회원 화면에서 조직도 게시를 승인하면 이곳에서 강사진 소개 약력을 고칠 수 있습니다.
            </p>
          )}
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
