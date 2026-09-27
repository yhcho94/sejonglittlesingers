"use client";

import { useActionState } from "react";
import { saveSiteStats } from "@/app/actions/admin-roles";
import { FormMessage, SubmitButton } from "@/components/form";
import { SITE_STAT_FIELDS, SITE_STAT_MAX, type SiteStatKey, type SiteStats } from "@/lib/site-stats";

// 입력한 값이 그대로 표시됨. 비우면 자동값(가운데 회색 글자) 사용
export function SiteStatsForm({ stats, fallback }: { stats: SiteStats; fallback: Record<SiteStatKey, string> }) {
  const [state, action] = useActionState(saveSiteStats, undefined);
  return (
    <form action={action} className="space-y-4">
      {SITE_STAT_FIELDS.map((f) => (
        <div key={f.key} className="grid items-center gap-2 sm:grid-cols-[10rem_1fr]">
          <label htmlFor={f.key} className="label mb-0">
            {f.label}
            {f.unit && <span className="ml-1 font-normal text-ink-soft">({f.unit})</span>}
          </label>
          <div>
            <input
              id={f.key}
              name={f.key}
              maxLength={SITE_STAT_MAX}
              defaultValue={stats[f.key] ?? ""}
              placeholder={`비우면 ${fallback[f.key]}`}
              className="input"
            />
            <p className="mt-1 text-xs text-ink-soft">{f.hint}</p>
          </div>
        </div>
      ))}
      <FormMessage state={state} />
      <SubmitButton className="btn-primary" pendingText="저장 중...">수치 저장</SubmitButton>
    </form>
  );
}
