"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addGalleryPhotos } from "@/app/actions/gallery";
import { GALLERY_BUCKET } from "@/lib/gallery-shared";
import { resizeImage } from "@/lib/image-resize";
import { createClient } from "@/lib/supabase/client";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

// 여러 장을 골라 한 번에 올리기: 큰 사진(가로·세로 최대 2000px) + 미리보기(640px)
export function PhotoUploader({ albumId }: { albumId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files).filter((f) => ACCEPT.includes(f.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name));
    if (!list.length) return setMessage({ ok: false, text: "사진 파일(JPG, PNG, WEBP)을 선택해 주세요." });
    setBusy(true);
    setMessage(null);
    setProgress({ done: 0, total: list.length });
    const storage = createClient().storage.from(GALLERY_BUCKET);
    const uploaded: { path: string; thumb_path: string; width: number; height: number }[] = [];
    let failed = 0;

    // 3장씩 동시에 처리
    const queue = [...list];
    async function worker() {
      for (let file = queue.shift(); file; file = queue.shift()) {
        try {
          const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
          const full = await resizeImage(bitmap, 2000, 0.85);
          const thumb = await resizeImage(bitmap, 640, 0.8);
          const id = crypto.randomUUID();
          const path = `albums/${albumId}/${id}.jpg`;
          const thumbPath = `albums/${albumId}/${id}_t.jpg`;
          const opts = { contentType: "image/jpeg", cacheControl: "31536000", upsert: false };
          const [a, b] = await Promise.all([storage.upload(path, full.blob, opts), storage.upload(thumbPath, thumb.blob, opts)]);
          if (a.error || b.error) throw a.error ?? b.error;
          uploaded.push({ path, thumb_path: thumbPath, width: full.width, height: full.height });
        } catch {
          failed += 1;
        }
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      }
    }
    await Promise.all([worker(), worker(), worker()]);

    if (uploaded.length) {
      const res = await addGalleryPhotos(albumId, uploaded);
      if (res?.error) failed += uploaded.length;
    }
    setBusy(false);
    setMessage(
      failed
        ? { ok: false, text: `${list.length - failed}장 완료, ${failed}장은 올리지 못했습니다. (HEIC 사진은 JPG 로 바꿔 올려 주세요)` }
        : { ok: true, text: `${list.length}장을 올렸습니다.` },
    );
    router.refresh();
  }

  return (
    <div className="rounded-sm border-2 border-dashed border-line bg-ivory p-6 text-center">
      <label className={`btn-primary cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
        {busy ? `올리는 중... ${progress.done}/${progress.total}` : "사진 선택 (여러 장 가능)"}
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            void upload(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      <p className="mt-3 text-xs text-ink-soft">
        사진은 자동으로 줄여서(최대 2000px) 올리며, 위치정보 등 사진 부가정보는 지워집니다.
      </p>
      {message && (
        <p role="status" className={`mt-3 text-sm ${message.ok ? "text-green-800" : "text-red-700"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
