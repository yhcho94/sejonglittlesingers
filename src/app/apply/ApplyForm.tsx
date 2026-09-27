"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { submitApplication } from "@/app/actions/applications";
import { FormMessage, SubmitButton } from "@/components/form";
import { MediaConsentFields } from "@/components/MediaConsentFields";
import { AUDITION_EMAIL, AUDITION_GUIDE, CLASS_OPTIONS, GENDERS, GUARDIAN_RELATIONS } from "@/lib/application-fields";
import { JOIN_SOURCES } from "@/lib/join-source";

export function ApplyForm() {
  const [joinSource, setJoinSource] = useState("");
  const [relation, setRelation] = useState("");
  const [state, action] = useActionState(submitApplication, undefined);

  return (
    <form action={action} className="space-y-7">
      {/* 자동 입력(스팸) 방지용: 사람에게는 보이지 않는 칸 */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">웹사이트</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-lg font-bold text-navy">보호자 정보</legend>
        <p className="-mt-2 text-xs text-ink-soft">심사 결과는 이 연락처로 전화·문자·카카오톡으로 안내합니다.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="guardian_name" className="label">보호자 이름 *</label>
            <input id="guardian_name" name="guardian_name" required maxLength={50} autoComplete="name" className="input" />
          </div>
          <div>
            <label htmlFor="guardian_phone" className="label">보호자 연락처 *</label>
            <input
              id="guardian_phone"
              name="guardian_phone"
              type="tel"
              required
              pattern="[0-9\-]{9,20}"
              placeholder="010-0000-0000"
              autoComplete="tel"
              className="input"
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="guardian_relation" className="label">단원과의 관계 *</label>
            <select
              id="guardian_relation"
              name="guardian_relation"
              required
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="input"
            >
              <option value="">선택해 주세요</option>
              {GUARDIAN_RELATIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          {relation === "기타" && (
            <div>
              <label htmlFor="guardian_relation_detail" className="label">관계 직접 입력 *</label>
              <input id="guardian_relation_detail" name="guardian_relation_detail" required maxLength={20} placeholder="예: 이모" className="input" />
            </div>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-lg font-bold text-navy">단원(자녀) 정보</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="child_name" className="label">이름 *</label>
            <input id="child_name" name="child_name" required maxLength={50} className="input" />
          </div>
          <div>
            <label htmlFor="child_birthdate" className="label">생년월일 *</label>
            <input
              id="child_birthdate"
              name="child_birthdate"
              type="date"
              required
              className="input"
            />
          </div>
        </div>

        <div role="radiogroup" aria-labelledby="gender-label">
          <p id="gender-label" className="label">성별 *</p>
          <div className="flex gap-3">
            {GENDERS.map((g) => (
              <label key={g} className="flex flex-1 cursor-pointer items-center gap-2 rounded-sm border border-line bg-white px-3 py-2.5 text-sm has-[:checked]:border-navy has-[:checked]:bg-cream">
                <input type="radio" name="gender" value={g} required />
                {g}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="school" className="label">소속 기관 *</label>
            <input id="school" name="school" required maxLength={100} placeholder="예: ○○초등학교, ○○유치원" className="input" />
          </div>
          <div>
            <label htmlFor="neighborhood" className="label">사는 동 *</label>
            <input id="neighborhood" name="neighborhood" required maxLength={50} placeholder="예: 소담동" className="input" />
          </div>
        </div>

        <div role="radiogroup" aria-labelledby="class-label">
          <p id="class-label" className="label">원하는 반 *</p>
          <p className="mb-2 text-xs text-ink-soft">반별 남은 자리만큼 선착순으로 배정합니다.</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {CLASS_OPTIONS.map((c) => (
              <label key={c.name} className="flex cursor-pointer items-center gap-2 rounded-sm border border-line bg-white px-3 py-2.5 text-sm has-[:checked]:border-navy has-[:checked]:bg-cream">
                <input type="radio" name="desired_class" value={c.name} required />
                {c.name} <span className="text-ink-soft">({c.day})</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="join_source" className="label">가입경로 *</label>
            <select
              id="join_source"
              name="join_source"
              required
              value={joinSource}
              onChange={(e) => setJoinSource(e.target.value)}
              className="input"
            >
              <option value="">어떻게 알게 되셨나요?</option>
              {JOIN_SOURCES.map((j) => (
                <option key={j}>{j}</option>
              ))}
            </select>
          </div>
          {joinSource === "기타" && (
            <div>
              <label htmlFor="join_source_detail" className="label">기타 가입경로</label>
              <input
                id="join_source_detail"
                name="join_source_detail"
                maxLength={100}
                placeholder="어떻게 알게 되셨는지 적어 주세요"
                className="input"
              />
            </div>
          )}
        </div>
        <div>
          <label htmlFor="referrer" className="label">소개해 준 단원·보호자 (선택)</label>
          <input
            id="referrer"
            name="referrer"
            maxLength={100}
            placeholder="예: 홍길동(화음반) 어머니 — 지인 우선권 확인용"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="notes" className="label">특이사항 (선택)</label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            maxLength={2000}
            placeholder="합창·음악 경력, 성격, 선생님이 알아 두면 좋은 점"
            className="input"
          />
          <p className="mt-1 text-xs text-ink-soft">
            알레르기 등 건강에 관한 내용은 이곳에 적지 말고, 입단 후 담당 선생님께 직접 알려 주세요.
          </p>
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-sm bg-cream p-4 text-sm">
        <legend className="sr-only">동의</legend>
        <p className="font-medium">개인정보 수집·이용 동의</p>
        <ul className="list-disc space-y-1 pl-5 text-ink-soft">
          <li>
            수집 항목: 보호자 이름·연락처·단원과의 관계, 단원 이름, 생년월일, 성별, 소속 기관, 원하는 반, 사는 동, 가입경로
            (필수) / 소개해 준 사람, 특이사항 (선택) / 오디션 동영상 (이메일로 제출)
          </li>
          <li>이용 목적: 입단 신청 접수·오디션 심사 및 결과 안내(전화·문자·카카오톡), 합창단 운영</li>
          <li>보유 기간: 개인정보처리방침에 따름 (오디션 동영상은 심사 결과를 정한 날부터 30일 이내 삭제)</li>
        </ul>
        <p className="text-ink-soft">
          동의를 거부할 수 있으나, 필수 항목 동의를 거부하면 신청할 수 없습니다.{" "}
          <Link href="/privacy" target="_blank" className="underline">개인정보처리방침</Link>
        </p>
        <label className="flex items-start gap-2">
          <input type="checkbox" name="consent_privacy" required className="mt-1" />
          <span>(필수) 위 개인정보 수집·이용에 동의합니다.</span>
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" name="consent_guardian" required className="mt-1" />
          <span>(필수) 본인은 신청 아동의 법정대리인으로서, 아동의 개인정보 처리에 동의합니다.</span>
        </label>
      </fieldset>

      <fieldset className="space-y-2 rounded-sm border border-line p-4 text-sm">
        <legend className="px-1 font-medium">단원 소개 이름 게시 동의 (선택)</legend>
        <p className="text-ink-soft">
          입단이 승인되면 홈페이지 &lsquo;단원 소개&rsquo;에 단원의 이름과 반을 게시합니다. 동의하지 않아도 입단에는 영향이
          없으며, 동의한 뒤에도 합창단에 요청하면 언제든 게시를 중단합니다.
        </p>
        <label className="flex items-start gap-2">
          <input type="checkbox" name="consent_name_listing" className="mt-1" />
          <span>(선택) 단원 소개에 단원의 이름과 반을 게시하는 데 동의합니다.</span>
        </label>
      </fieldset>

      <fieldset className="space-y-3 rounded-sm border border-line p-4">
        <legend className="px-1 text-sm font-medium">초상권(사진·영상) 이용 동의 (선택 · 동의일부터 5년)</legend>
        <MediaConsentFields />
      </fieldset>

      <section className="rounded-sm border border-gold/60 bg-gold-soft/50 p-4 text-sm">
        <h2 className="font-semibold text-navy">오디션 동영상 제출 안내</h2>
        <p className="mt-1">
          신청서를 제출한 뒤 오디션 동영상을 <strong>{AUDITION_EMAIL}</strong> 로 보내 주세요. 영상까지 받아야 심사가 시작됩니다.
        </p>
        <p className="mt-1">
          지정곡과 반주는{" "}
          <Link href="/join#audition-songs" target="_blank" className="font-medium text-navy underline">
            입단 안내 → 오디션 지정곡
          </Link>
          에서 듣고 내려받을 수 있습니다.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">
          {AUDITION_GUIDE.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <FormMessage state={state} />
      <SubmitButton pendingText="신청서 제출 중...">입단 신청서 제출</SubmitButton>
    </form>
  );
}
