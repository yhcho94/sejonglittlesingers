"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/profile";
import { FormMessage, SubmitButton } from "@/components/form";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <p className="label">이메일</p>
        <p className="text-ink-soft">{profile.email}</p>
      </div>
      <div>
        <label htmlFor="guardian_name" className="label">{profile.member_type && profile.member_type !== "parent" ? "이름" : "보호자 이름"}</label>
        <input id="guardian_name" name="guardian_name" defaultValue={profile.guardian_name} required maxLength={50} className="input" />
      </div>
      <div>
        <label htmlFor="phone" className="label">연락처</label>
        <input id="phone" name="phone" type="tel" defaultValue={profile.phone} required pattern="[0-9\-]{9,20}" className="input" />
      </div>
      {(profile.member_type === "teacher" || profile.member_type === "staff") && <StaffInfo profile={profile} />}
      <FormMessage state={state} />
      <SubmitButton className="btn-outline" pendingText="저장 중...">정보 저장</SubmitButton>
    </form>
  );
}

// 운영진 역할·반·담당: 보기만 (수정은 최상위 관리자만)
function StaffInfo({ profile }: { profile: Profile }) {
  const approved = profile.org_visible === true;
  return (
    <div className="rounded-sm bg-cream px-3 py-2.5 text-sm">
      <p className="label mb-1">운영진 정보</p>
      {profile.is_super && profile.role === "admin" && <p className="font-medium text-navy">최상위 관리자</p>}
      {profile.staff_role ? (
        <>
          <p>
            역할: <strong>{profile.staff_role}</strong>
            {profile.staff_class && (
              <>
                {" "}· 반: <strong>{profile.staff_class}</strong>
              </>
            )}
            {!approved && <span className="ml-1 text-xs text-amber-800">(승인 대기)</span>}
          </p>
          {profile.affiliation && <p className="text-ink-soft">세부 담당: {profile.affiliation}</p>}
        </>
      ) : (
        !profile.is_super && <p className="text-ink-soft">역할이 아직 지정되지 않았습니다.</p>
      )}
      <p className="mt-1 text-xs text-ink-soft">역할·반·담당은 최상위 관리자만 수정할 수 있습니다. 바꿀 내용은 최상위 관리자에게 요청해 주세요.</p>
    </div>
  );
}
