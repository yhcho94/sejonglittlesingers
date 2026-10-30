"use client";

import { useActionState, useState } from "react";
import { saveMusicSettings } from "@/app/actions/site-music";
import { FormMessage, SubmitButton } from "@/components/form";
import type { MusicSettings } from "@/lib/site-music";

export function MusicSettingsForm({ settings }: { settings: MusicSettings }) {
  const [state, action] = useActionState(saveMusicSettings, undefined);
  const [volume, setVolume] = useState(settings.volume);
  return (
    <form action={action} className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="enabled" defaultChecked={settings.enabled} />
        <span>
          <strong className="text-navy">배경음악 켜기</strong>
          <span className="text-ink-soft"> — 홈페이지 오른쪽 아래에 음악 버튼이 나타납니다</span>
        </span>
      </label>
      <div>
        <label htmlFor="volume" className="label">
          음량 {volume}
        </label>
        <input
          id="volume"
          name="volume"
          type="range"
          min={0}
          max={100}
          step={5}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full max-w-xs accent-navy"
        />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary px-4 py-2 text-sm" pendingText="저장 중...">
        설정 저장
      </SubmitButton>
    </form>
  );
}
