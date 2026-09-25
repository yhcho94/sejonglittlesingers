"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUp } from "@/app/actions/auth";
import { FormMessage, SubmitButton } from "@/components/form";
import { StaffRoleFields } from "@/components/StaffRoleFields";
import { PASSWORD_HINT, PASSWORD_MIN } from "@/lib/password";

export type SignupKind = "parent" | "staff";

const KINDS: { key: SignupKind; label: string; desc: string }[] = [
  { key: "parent", label: "보호자(학부모)", desc: "자녀(단원)의 입단 신청·초상권 동의" },
  { key: "staff", label: "합창단 운영진", desc: "단장·선생님·사무국·홈페이지 관리자 등 (승인 후 맡은 메뉴 사용)" },
];

export function SignupForm({ initialKind = "parent" }: { initialKind?: SignupKind }) {
  const [state, action] = useActionState(signUp, undefined);
  const [kind, setKind] = useState<SignupKind>(initialKind);
  const parent = kind === "parent";

  if (state?.success) return <FormMessage state={state} />;

  return (
    <form action={action} className="space-y-4">
      <div role="radiogroup" aria-labelledby="member-type-label">
        <p id="member-type-label" className="label">가입 구분 *</p>
        <div className="grid gap-2">
          {KINDS.map((t) => (
            <label
              key={t.key}
              className="flex cursor-pointer items-start gap-2 rounded-sm border border-line bg-white px-3 py-2.5 text-sm has-[:checked]:border-navy has-[:checked]:bg-cream"
            >
              <input
                type="radio"
                name="member_type"
                value={t.key}
                checked={kind === t.key}
                onChange={() => setKind(t.key)}
                className="mt-1"
              />
              <span>
                <span className="font-medium">{t.label}</span>
                <span className="block text-xs text-ink-soft">{t.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="guardian_name" className="label">{parent ? "보호자 이름" : "이름"} *</label>
        <input id="guardian_name" name="guardian_name" required maxLength={50} autoComplete="name" className="input" />
      </div>
      <div>
        <label htmlFor="phone" className="label">{parent ? "보호자 연락처" : "연락처"} *</label>
        <input id="phone" name="phone" type="tel" required placeholder="010-0000-0000" pattern="[0-9\-]{9,20}" autoComplete="tel" className="input" />
      </div>
      {!parent && (
        <>
          <StaffRoleFields />
          <div>
            <label htmlFor="request_note" className="label">신청 사유 (선택)</label>
            <textarea
              id="request_note"
              name="request_note"
              rows={2}
              maxLength={300}
              placeholder="예: 단원 명부와 출석 관리를 맡을 예정입니다"
              className="input"
            />
            <p className="mt-1 text-xs text-ink-soft">
              가입 후 최상위 관리자가 확인하고 맡을 메뉴를 정해 승인합니다. 승인 전에는 일반 회원과 같습니다.
            </p>
          </div>
        </>
      )}
      <div>
        <label htmlFor="email" className="label">이메일 (로그인 아이디) *</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">비밀번호 *</label>
        <input id="password" name="password" type="password" required minLength={PASSWORD_MIN} autoComplete="new-password" aria-describedby="password-hint" className="input" />
        <p id="password-hint" className="mt-1 text-xs text-ink-soft">{PASSWORD_HINT}</p>
      </div>
      <div>
        <label htmlFor="password_confirm" className="label">비밀번호 확인 *</label>
        <input id="password_confirm" name="password_confirm" type="password" required minLength={PASSWORD_MIN} autoComplete="new-password" className="input" />
      </div>

      <div className="space-y-3 rounded-sm bg-cream p-4 text-sm">
        <p className="font-medium">개인정보 수집·이용 동의 (필수)</p>
        <ul className="list-disc space-y-1 pl-5 text-ink-soft">
          <li>
            수집 항목: {parent ? "보호자 이름, 연락처, 이메일" : "이름, 연락처, 이메일, 운영진 역할, 세부 담당·신청 사유(선택)"}
          </li>
          <li>이용 목적: {parent ? "회원 식별, 입단 신청 및 합창단 운영 안내" : "회원 식별, 관리자 권한 승인 및 합창단 운영"}</li>
          <li>보유 기간: 회원 탈퇴 시까지 (관계 법령에 따라 보관이 필요한 경우 해당 기간)</li>
        </ul>
        <p className="text-ink-soft">
          동의를 거부할 수 있으나, 거부 시 회원가입이 제한됩니다. 자세한 내용은{" "}
          <Link href="/privacy" target="_blank" className="underline">개인정보처리방침</Link>을 확인해 주세요.
        </p>
        <label className="flex items-start gap-2">
          <input type="checkbox" name="agree_privacy" required className="mt-1" />
          <span>개인정보 수집·이용에 동의합니다.</span>
        </label>
        {parent ? (
          <label className="flex items-start gap-2">
            <input type="checkbox" name="agree_guardian" required className="mt-1" />
            <span>본인은 만 14세 이상이며, 단원(자녀)의 법정대리인(보호자)입니다.</span>
          </label>
        ) : (
          <label className="flex items-start gap-2">
            <input type="checkbox" name="agree_adult" required className="mt-1" />
            <span>본인은 만 14세 이상이며, 합창단 운영진 본인입니다.</span>
          </label>
        )}
      </div>

      <FormMessage state={state} />
      <SubmitButton pendingText="가입 처리 중...">회원가입</SubmitButton>
    </form>
  );
}
