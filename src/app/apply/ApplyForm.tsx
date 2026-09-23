"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { submitApplication } from "@/app/actions/applications";
import { FormMessage, SubmitButton } from "@/components/form";
import { createClient } from "@/lib/supabase/client";
import type { FormState } from "@/lib/types";
import { MediaConsentFields } from "@/components/MediaConsentFields";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function ApplyForm({ userId }: { userId: string }) {
  const [hasPhoto, setHasPhoto] = useState(false);

  // 사진은 브라우저에서 비공개 저장소로 바로 올리고(본인 폴더만 허용), 경로만 서버로 보냅니다.
  const [state, action] = useActionState(async (prev: FormState, formData: FormData) => {
    const photo = formData.get("photo");
    formData.delete("photo");
    let uploadedPath: string | null = null;

    if (photo instanceof File && photo.size > 0) {
      const ext = PHOTO_TYPES[photo.type];
      if (!ext) return { error: "사진은 JPG, PNG, WEBP 형식만 올릴 수 있습니다." };
      if (photo.size > MAX_PHOTO_BYTES) return { error: "사진은 5MB 이하만 올릴 수 있습니다." };
      if (formData.get("consent_photo") !== "on") {
        return { error: "사진을 첨부하려면 사진 수집·이용에 동의해 주세요." };
      }

      const supabase = createClient();
      uploadedPath = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("application-photos")
        .upload(uploadedPath, photo, { contentType: photo.type });
      if (error) return { error: "사진 업로드에 실패했습니다. 다시 시도해 주세요." };
      formData.set("photo_path", uploadedPath);
    }

    const result = await submitApplication(prev, formData);
    // 저장에 실패하면 올린 사진을 지웁니다. (성공 시에는 서버에서 페이지를 이동시킵니다)
    if (result?.error && uploadedPath) {
      await createClient().storage.from("application-photos").remove([uploadedPath]);
    }
    return result;
  }, undefined);

  return (
    <form action={action} className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="mb-2 text-lg font-bold text-navy">단원(자녀) 정보</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="child_name" className="label">이름 *</label>
            <input id="child_name" name="child_name" required maxLength={50} className="input" />
          </div>
          <div>
            <label htmlFor="child_birthdate" className="label">생년월일 *</label>
            <input id="child_birthdate" name="child_birthdate" type="date" required className="input" />
          </div>
          <div>
            <label htmlFor="school" className="label">학교</label>
            <input id="school" name="school" maxLength={100} className="input" />
          </div>
          <div>
            <label htmlFor="grade" className="label">학년</label>
            <input id="grade" name="grade" maxLength={20} placeholder="예: 3학년" className="input" />
          </div>
        </div>
        <div>
          <label htmlFor="address" className="label">주소</label>
          <input id="address" name="address" maxLength={200} className="input" />
        </div>
        <div>
          <label htmlFor="experience" className="label">음악 경력</label>
          <textarea id="experience" name="experience" rows={3} maxLength={2000} className="input" />
        </div>
        <div>
          <label htmlFor="motivation" className="label">지원 동기</label>
          <textarea id="motivation" name="motivation" rows={4} maxLength={2000} className="input" />
        </div>
        <div>
          <label htmlFor="photo" className="label">사진 (선택, JPG·PNG·WEBP, 5MB 이하)</label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setHasPhoto(Boolean(e.target.files?.length))}
            className="block w-full text-sm file:mr-3 file:rounded-sm file:border-0 file:bg-cream file:px-3 file:py-2"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-sm bg-cream p-4 text-sm">
        <legend className="sr-only">동의</legend>
        <p className="font-medium">개인정보 수집·이용 동의</p>
        <ul className="list-disc space-y-1 pl-5 text-ink-soft">
          <li>수집 항목: 단원 이름, 생년월일 (필수) / 학교, 학년, 주소, 음악 경력, 지원 동기, 사진 (선택)</li>
          <li>이용 목적: 입단 신청 접수·심사 및 결과 안내, 합창단 운영</li>
          <li>보유 기간: 개인정보처리방침에 따름</li>
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
        <label className="flex items-start gap-2">
          <input type="checkbox" name="consent_photo" required={hasPhoto} className="mt-1" />
          <span>({hasPhoto ? "사진 첨부 시 필수" : "선택"}) 아동 사진의 수집·이용에 동의합니다. 사진은 입단 심사 목적으로만 사용하며 외부에 공개하지 않습니다.</span>
        </label>
      </fieldset>

      <fieldset className="space-y-3 rounded-sm border border-line p-4">
        <legend className="px-1 text-sm font-medium">초상권(사진·영상) 이용 동의 (선택)</legend>
        <MediaConsentFields />
      </fieldset>

      <FormMessage state={state} />
      <SubmitButton pendingText="신청서 제출 중...">입단 신청서 제출</SubmitButton>
    </form>
  );
}
