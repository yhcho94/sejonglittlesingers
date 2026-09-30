"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { removeFacultyPhoto, setFacultyPhoto } from "@/app/actions/faculty";
import { resizeImage } from "@/lib/image-resize";
import { FACULTY_PHOTO_BUCKET, facultyPhotoPath } from "@/lib/staff-bio";
import { createClient } from "@/lib/supabase/client";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

// 강사 사진 올리기·바꾸기·지우기 (최상위 관리자 · 선생님 본인 공용)
// 가로·세로 최대 1200px JPG 로 줄여 올림 (위치정보 등 사진 부가정보 제거)
export function FacultyPhotoUploader({ id, photoUrl, name }: { id: number; photoUrl: string | null; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!ACCEPT.includes(file.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
      return setMessage({ ok: false, text: "사진 파일(JPG, PNG, WEBP)을 골라 주세요." });
    }
    setBusy(true);
    setMessage(null);
    try {
      const { blob } = await resizeImage(file, 1200, 0.86);
      const path = facultyPhotoPath(id, crypto.randomUUID());
      const storage = createClient().storage.from(FACULTY_PHOTO_BUCKET);
      const { error } = await storage.upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
      if (error) throw error;
      const res = await setFacultyPhoto(id, path);
      if (res?.error) {
        await storage.remove([path]);
        setMessage({ ok: false, text: res.error });
      } else {
        setMessage({ ok: true, text: "사진을 저장했습니다. 강사진 소개에 바로 반영됩니다." });
        router.refresh();
      }
    } catch {
      setMessage({ ok: false, text: "사진을 올리지 못했습니다. (HEIC 사진은 JPG 로 바꿔 올려 주세요. 0029 SQL 실행 여부도 확인해 주세요)" });
    }
    setBusy(false);
  }

  async function remove() {
    if (!window.confirm("사진을 지울까요?")) return;
    setBusy(true);
    const res = await removeFacultyPhoto(id);
    setMessage(res?.error ? { ok: false, text: res.error } : { ok: true, text: "사진을 지웠습니다." });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-sm border border-line bg-cream">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={`${name} 사진`} className="h-full w-full object-cover object-top" />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-ink-soft">사진 없음</span>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap gap-2">
          <label className={`btn-primary cursor-pointer px-4 py-2 text-sm ${busy ? "pointer-events-none opacity-60" : ""}`}>
            {busy ? "처리 중..." : photoUrl ? "사진 바꾸기" : "사진 올리기"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                void upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {photoUrl && (
            <button type="button" onClick={remove} disabled={busy} className="text-sm text-red-700 underline">
              사진 지우기
            </button>
          )}
        </div>
        <p className="text-xs leading-relaxed text-ink-soft">
          얼굴이 잘 보이는 세로 사진(3:4)이 가장 잘 어울립니다. 강사진 소개에 공개되며, 올릴 때 크기를 줄이고 위치정보 등
          사진 부가정보를 지웁니다.
        </p>
        {message && (
          <p role="status" className={`text-sm ${message.ok ? "text-green-800" : "text-red-700"}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
