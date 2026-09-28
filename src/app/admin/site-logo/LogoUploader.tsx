"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOGO_BUCKET, LOGO_DIR, LOGO_MAX_BYTES } from "@/lib/site-logo";
import { createClient } from "@/lib/supabase/client";

const TYPES: Record<string, { ext: string; type: string }> = {
  "image/png": { ext: "png", type: "image/png" },
  "image/webp": { ext: "webp", type: "image/webp" },
  "image/jpeg": { ext: "jpg", type: "image/jpeg" },
};
const MAX_SIDE = 800;

// 로고 파일 올리기: 가로·세로 최대 800px 로 줄여 다시 저장 (투명 배경 유지, 사진 부가정보 제거)
async function prepare(file: File) {
  const out = TYPES[file.type];
  if (!out) throw new Error("type");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("convert"))), out.type, 0.92),
  );
  return { blob, ...out };
}

export function LogoUploader() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!TYPES[file.type]) return setMessage({ ok: false, text: "PNG, JPG, WEBP 파일만 올릴 수 있습니다." });
    setBusy(true);
    setMessage(null);
    try {
      const { blob, ext, type } = await prepare(file);
      if (blob.size > LOGO_MAX_BYTES) throw new Error("size");
      const path = `${LOGO_DIR}/${crypto.randomUUID()}.${ext}`;
      const { error } = await createClient()
        .storage.from(LOGO_BUCKET)
        .upload(path, blob, { contentType: type, cacheControl: "31536000", upsert: false });
      if (error) throw error;
      setMessage({ ok: true, text: "올렸습니다. 위 목록에서 고른 뒤 '저장'을 눌러 주세요." });
      router.refresh();
    } catch (e) {
      setMessage({
        ok: false,
        text:
          e instanceof Error && e.message === "size"
            ? "파일이 너무 큽니다. 2MB 이하로 줄여 주세요."
            : "올리지 못했습니다. (0027 SQL 실행 여부와 파일 형식을 확인해 주세요)",
      });
    }
    setBusy(false);
  }

  return (
    <div className="rounded-sm border-2 border-dashed border-line bg-ivory p-5 text-center">
      <label className={`btn-primary cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
        {busy ? "올리는 중..." : "새 로고 파일 올리기"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            void upload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      <p className="mt-3 text-xs text-ink-soft">
        PNG(투명 배경 권장)·JPG·WEBP. 정사각형이나 원형 로고가 가장 잘 어울립니다. 가로·세로 최대 800px 로 줄여 저장합니다.
      </p>
      {message && (
        <p role="status" className={`mt-3 text-sm ${message.ok ? "text-green-800" : "text-red-700"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
