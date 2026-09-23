"use client";

import { useActionState } from "react";
import { updateMyMediaConsent } from "@/app/actions/account";
import { FormMessage, SubmitButton } from "@/components/form";
import { MediaConsentFields } from "@/components/MediaConsentFields";

export function MediaConsentForm({
  singer,
}: {
  singer: { id: number; consent_media_channels: boolean; consent_media_press: boolean; name_public: boolean };
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
      <FormMessage state={state} />
      <SubmitButton className="btn-outline text-sm" pendingText="저장 중...">
        동의 내용 저장
      </SubmitButton>
    </form>
  );
}
