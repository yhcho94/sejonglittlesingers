"use client";

import { useActionState } from "react";
import { updateMyMediaConsent } from "@/app/actions/account";
import { FormMessage, SubmitButton } from "@/components/form";
import { MediaConsentFields } from "@/components/MediaConsentFields";

export function MediaConsentForm({
  singer,
}: {
  singer: { id: number; consent_media_channels: boolean; consent_media_press: boolean; name_public: boolean; name_hidden?: boolean };
}) {
  const [state, action] = useActionState(updateMyMediaConsent, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="singer_id" value={singer.id} />
      <MediaConsentFields
        showNotice={false}
        idPrefix={`media-${singer.id}`}
        defaults={{ channels: singer.consent_media_channels, press: singer.consent_media_press, name: singer.name_public }}
      />
      <label className="flex items-start gap-2 border-t border-line pt-3 text-sm">
        <input type="checkbox" name="name_hidden" defaultChecked={singer.name_hidden ?? false} className="mt-1" />
        <span>
          <strong className="font-medium">&lsquo;단원 소개&rsquo; 화면에 이름 게시 중단</strong>{" "}
          <span className="text-ink-soft">— 체크하면 홈페이지 단원 소개에서 이름이 빠집니다.</span>
        </span>
      </label>
      <FormMessage state={state} />
      <SubmitButton className="btn-outline text-sm" pendingText="저장 중...">
        동의 내용 저장
      </SubmitButton>
    </form>
  );
}
