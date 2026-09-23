"use client";

import { useActionState } from "react";
import { saveConcert } from "@/app/actions/admin";
import { FormMessage, SubmitButton } from "@/components/form";
import { toKstInputValue } from "@/lib/format";
import type { Concert } from "@/lib/types";

export function ConcertForm({ concert }: { concert?: Concert }) {
  const [state, action] = useActionState(saveConcert, undefined);
  return (
    <form action={action} className="space-y-4">
      {concert && <input type="hidden" name="id" value={concert.id} />}
      <div>
        <label htmlFor="title" className="label">공연명 *</label>
        <input id="title" name="title" defaultValue={concert?.title} required maxLength={200} className="input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="starts_at" className="label">일시 (한국 시간) *</label>
          <input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={concert ? toKstInputValue(concert.starts_at) : undefined}
            className="input"
          />
          {/* 수정 중인 공연에 time_tbd 칸이 있으면(0009 실행 후) 체크 해제도 저장되도록 */}
          {concert && "time_tbd" in concert && <input type="hidden" name="has_time_tbd" value="1" />}
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" name="time_tbd" defaultChecked={concert?.time_tbd ?? false} />
            시간 미정 <span className="text-xs text-ink-soft">(날짜만 맞게 입력하면 &lsquo;시간 미정&rsquo;으로 표시)</span>
          </label>
        </div>
        <div>
          <label htmlFor="venue" className="label">장소</label>
          <input id="venue" name="venue" defaultValue={concert?.venue ?? ""} maxLength={200} className="input" />
        </div>
      </div>
      <div>
        <label htmlFor="description" className="label">공연 소개</label>
        <textarea id="description" name="description" rows={6} defaultValue={concert?.description ?? ""} maxLength={10000} className="input" />
      </div>
      <div>
        <label htmlFor="ticket_url" className="label">예매·신청 링크</label>
        <input id="ticket_url" name="ticket_url" type="url" placeholder="https://" defaultValue={concert?.ticket_url ?? ""} className="input" />
      </div>
      <div>
        <label htmlFor="video_url" className="label">YouTube 영상 링크</label>
        <input id="video_url" name="video_url" type="url" placeholder="https://www.youtube.com/watch?v=..." defaultValue={concert?.video_url ?? ""} className="input" />
        <p className="mt-1 text-xs text-ink-soft">
          공연 상세 화면에 영상이 표시됩니다. 영상 속 아동의 공개 동의 여부를 먼저 확인해 주세요.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_published" defaultChecked={concert?.is_published ?? true} />
        게시
      </label>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary" pendingText="저장 중...">저장</SubmitButton>
    </form>
  );
}
