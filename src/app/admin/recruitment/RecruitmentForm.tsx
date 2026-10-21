"use client";

import { useActionState } from "react";
import { saveRecruitment } from "@/app/actions/admin";
import { FormMessage, SubmitButton } from "@/components/form";
import { JOIN_STEPS_MAX, joinPageText } from "@/lib/join-page";
import type { Recruitment } from "@/lib/types";

const FIELDS: { name: keyof Recruitment; label: string; rows: number; hint?: string }[] = [
  { name: "period", label: "모집 기간", rows: 1, hint: "예: 2027년 2월 1일 ~ 2월 20일" },
  { name: "target", label: "모집 대상", rows: 2 },
  { name: "schedule", label: "연습 일정", rows: 2 },
  { name: "place", label: "연습 장소", rows: 2 },
  { name: "fee", label: "회비", rows: 2 },
  { name: "classes", label: "반 구성", rows: 4, hint: "반 이름과 대상 등을 한 줄에 하나씩" },
  { name: "audition", label: "오디션·심사 방법", rows: 4 },
  { name: "notes", label: "기타 안내", rows: 4 },
];

export function RecruitmentForm({ data }: { data: Recruitment | null }) {
  const [state, action] = useActionState(saveRecruitment, undefined);
  // 페이지 문구: 저장된 값(없으면 지금 홈페이지에 나오는 기본 문구)을 채워 둠
  const text = joinPageText(data);
  const stepRows = Array.from({ length: JOIN_STEPS_MAX }, (_, i) => text.steps[i] ?? { title: "", body: "" });
  return (
    <form action={action} className="space-y-5">
      <label className="flex items-center gap-2 rounded-sm bg-gold-soft p-3 text-sm font-medium">
        <input type="checkbox" name="is_open" defaultChecked={data?.is_open ?? false} />
        지금 단원 모집 중 (홈 화면에 모집 배너가 표시됩니다)
      </label>
      {FIELDS.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="label">{f.label}</label>
          {f.rows === 1 ? (
            <input id={f.name} name={f.name} defaultValue={(data?.[f.name] as string) ?? ""} className="input" />
          ) : (
            <textarea id={f.name} name={f.name} rows={f.rows} defaultValue={(data?.[f.name] as string) ?? ""} className="input" />
          )}
          {f.hint && <p className="mt-1 text-xs text-ink-soft">{f.hint}</p>}
        </div>
      ))}
      <p className="text-xs text-ink-soft">비워 둔 항목은 공개 화면에 표시되지 않습니다.</p>

      {/* 입단 안내 페이지 문구 (0030) */}
      <fieldset className="space-y-4 rounded-sm border border-line p-4">
        <legend className="px-1 text-sm font-bold text-navy">입단 안내 페이지 문구</legend>
        <div>
          <label htmlFor="page_intro" className="label">페이지 소개 (제목 아래 한 줄)</label>
          <input id="page_intro" name="page_intro" maxLength={200} defaultValue={text.page_intro} className="input" />
        </div>
        <div>
          <p className="label">지원 절차 (최대 {JOIN_STEPS_MAX}단계, 단계 이름을 비우면 빠짐)</p>
          <div className="space-y-3">
            {stepRows.map((s, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[10rem_1fr]">
                <input
                  name={`step_title_${i}`}
                  maxLength={40}
                  defaultValue={s.title}
                  placeholder={`${i + 1}단계 이름`}
                  aria-label={`${i + 1}단계 이름`}
                  className="input"
                />
                <textarea
                  name={`step_body_${i}`}
                  rows={2}
                  maxLength={300}
                  defaultValue={s.body}
                  placeholder="설명"
                  aria-label={`${i + 1}단계 설명`}
                  className="input"
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="songs_title" className="label">오디션 곡 칸 제목</label>
          <input id="songs_title" name="songs_title" maxLength={50} defaultValue={text.songs_title} className="input" />
        </div>
        <div>
          <label htmlFor="songs_intro" className="label">오디션 곡 칸 안내</label>
          <textarea id="songs_intro" name="songs_intro" rows={4} maxLength={1000} defaultValue={text.songs_intro} className="input" />
          <p className="mt-1 text-xs text-ink-soft">
            안내 문구는 아래 &lsquo;자유곡 참고 곡&rsquo;이 1곡 이상 있을 때 함께 표시됩니다. 문구 안의 이메일 주소는 자동으로 링크가 됩니다.
          </p>
        </div>
        <p className="text-xs text-ink-soft">칸을 비우고 저장하면 기본 문구로 돌아갑니다.</p>
      </fieldset>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary" pendingText="저장 중...">저장</SubmitButton>
    </form>
  );
}
