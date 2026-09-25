"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/profile";
import { FormMessage, SubmitButton } from "@/components/form";
import { StaffRoleFields } from "@/components/StaffRoleFields";
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
      {(profile.member_type === "teacher" || profile.member_type === "staff") && (
        <StaffRoleFields role={profile.staff_role} staffClass={profile.staff_class} affiliation={profile.affiliation} />
      )}
      <FormMessage state={state} />
      <SubmitButton className="btn-outline" pendingText="저장 중...">정보 저장</SubmitButton>
    </form>
  );
}
