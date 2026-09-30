"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { removeFacultyPhoto, setFacultyPhoto } from "@/app/actions/faculty";
import { FACULTY_PHOTO_BUCKET, facultyPhotoPath } from "@/lib/staff-bio";
import { createClient } from "@/lib/supabase/client";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
// 저장 크기: 세로 3:4, 900 × 1200 (원본이 더 작으면 원본 크기 그대로)
const OUT_W = 900;
const RATIO = 4 / 3; // 높이 / 너비

type Box = { x: number; y: number; w: number }; // 원본 픽셀 기준 (높이 = w × 4/3)

// 브라우저 얼굴 인식 (크롬 일부 등 지원하는 곳만). 없으면 null
type Face = { boundingBox: DOMRectReadOnly };
async function detectFace(bitmap: ImageBitmap): Promise<DOMRectReadOnly | null> {
  const FD = (globalThis as unknown as { FaceDetector?: new (o: object) => { detect: (s: ImageBitmap) => Promise<Face[]> } })
    .FaceDetector;
  if (!FD) return null;
  try {
    const faces = await new FD({ fastMode: true, maxDetectedFaces: 5 }).detect(bitmap);
    if (!faces.length) return null;
    return faces.reduce((a, b) => (b.boundingBox.width > a.boundingBox.width ? b : a)).boundingBox;
  } catch {
    return null;
  }
}

function clampBox(b: Box, W: number, H: number): Box {
  const maxW = Math.min(W, H / RATIO);
  const w = Math.min(Math.max(b.w, maxW * 0.2), maxW);
  const h = w * RATIO;
  return { w, x: Math.min(Math.max(b.x, 0), W - w), y: Math.min(Math.max(b.y, 0), H - h) };
}

// 처음 자를 영역: 얼굴을 찾으면 얼굴이 위쪽 1/3 쯤 오도록, 못 찾으면 가운데·위쪽 기준으로 가장 크게
function initialBox(W: number, H: number, face: DOMRectReadOnly | null): Box {
  const maxW = Math.min(W, H / RATIO);
  if (face) {
    const w = Math.min(maxW, face.width * 2.6);
    const cx = face.x + face.width / 2;
    const cy = face.y + face.height / 2;
    return clampBox({ w, x: cx - w / 2, y: cy - w * RATIO * 0.36 }, W, H);
  }
  const w = maxW;
  // 가로 사진: 가운데 / 세로로 긴 사진: 머리가 잘리지 않게 위쪽 조금 아래부터
  return clampBox({ w, x: (W - w) / 2, y: (H - w * RATIO) * 0.15 }, W, H);
}

// 강사 사진 올리기·바꾸기·지우기 (최상위 관리자 · 선생님 본인 공용)
// 고른 사진에서 3:4 영역을 자동으로 잡고(얼굴 인식이 되는 브라우저는 얼굴 기준), 끌어서·크기로 조정한 뒤
// 900 × 1200 JPG 로 저장합니다. (다시 그려 저장하므로 위치정보 등 사진 부가정보는 지워짐)
export function FacultyPhotoUploader({ id, photoUrl, name }: { id: number; photoUrl: string | null; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [crop, setCrop] = useState<{ bitmap: ImageBitmap; src: string; box: Box; auto: boolean } | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ px: number; py: number; box: Box } | null>(null);

  useEffect(() => () => crop?.bitmap.close(), [crop?.bitmap]);
  useEffect(() => () => { if (crop?.src) URL.revokeObjectURL(crop.src); }, [crop?.src]);

  async function pick(file: File | undefined) {
    if (!file) return;
    if (!ACCEPT.includes(file.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
      return setMessage({ ok: false, text: "사진 파일(JPG, PNG, WEBP)을 골라 주세요." });
    }
    setMessage(null);
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      const face = await detectFace(bitmap);
      // 화면 표시용: 회전 정보가 반영된 그림 (캔버스로 다시 그려 원본과 방향을 맞춤)
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
      if (!blob) throw new Error("preview");
      setCrop({ bitmap, src: URL.createObjectURL(blob), box: initialBox(bitmap.width, bitmap.height, face), auto: !!face });
    } catch {
      setMessage({ ok: false, text: "사진을 열지 못했습니다. (HEIC 사진은 JPG 로 바꿔 올려 주세요)" });
    }
  }

  // 끌어서 위치 조정 (화면 좌표 → 원본 픽셀)
  function onPointerDown(e: React.PointerEvent) {
    if (!crop) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, box: crop.box };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!crop || !drag.current || !areaRef.current) return;
    const k = crop.bitmap.width / areaRef.current.clientWidth;
    const { px, py, box } = drag.current;
    const next = { ...box, x: box.x + (e.clientX - px) * k, y: box.y + (e.clientY - py) * k };
    setCrop({ ...crop, box: clampBox(next, crop.bitmap.width, crop.bitmap.height) });
  }
  function onZoom(percent: number) {
    if (!crop) return;
    const { width: W, height: H } = crop.bitmap;
    const w = (Math.min(W, H / RATIO) * percent) / 100;
    const { x, y, w: ow } = crop.box;
    const cx = x + ow / 2;
    const cy = y + (ow * RATIO) / 2;
    setCrop({ ...crop, box: clampBox({ w, x: cx - w / 2, y: cy - (w * RATIO) / 2 }, W, H) });
  }

  async function save() {
    if (!crop) return;
    setBusy(true);
    setMessage(null);
    try {
      const { bitmap, box } = crop;
      const outW = Math.round(Math.min(OUT_W, box.w));
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = Math.round(outW * RATIO);
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bitmap, box.x, box.y, box.w, box.w * RATIO, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88));
      if (!blob) throw new Error("convert");
      const path = facultyPhotoPath(id, crypto.randomUUID());
      const storage = createClient().storage.from(FACULTY_PHOTO_BUCKET);
      const { error } = await storage.upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
      if (error) throw error;
      const res = await setFacultyPhoto(id, path);
      if (res?.error) {
        await storage.remove([path]);
        setMessage({ ok: false, text: res.error });
      } else {
        setCrop(null);
        setMessage({ ok: true, text: "사진을 저장했습니다. 강사진 소개에 바로 반영됩니다." });
        router.refresh();
      }
    } catch {
      setMessage({ ok: false, text: "사진을 올리지 못했습니다. 잠시 뒤 다시 시도해 주세요." });
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

  const guide = (
    <p className="text-xs leading-relaxed text-ink-soft">
      권장: <strong className="font-medium text-ink">세로 3:4 비율, 가로 900 × 세로 1200 픽셀 이상</strong> (최소 600 × 800).
      비율이 달라도 올린 뒤 인물 위치에 맞춰 잘라 저장할 수 있습니다. 강사진 소개에는 정해진 크기(세로 3:4)로 표시되며,
      저장할 때 위치정보 등 사진 부가정보는 지워집니다.
    </p>
  );

  if (crop) {
    const { width: W, height: H } = crop.bitmap;
    const { x, y, w } = crop.box;
    const zoom = Math.round((w / Math.min(W, H / RATIO)) * 100);
    return (
      <div className="space-y-3">
        <p className="text-sm">
          {crop.auto ? "얼굴을 찾아 영역을 잡았습니다." : "가운데·위쪽 기준으로 영역을 잡았습니다."} 네모를 끌어 위치를 맞추고, 아래
          막대로 크기를 조정하세요.
        </p>
        <div ref={areaRef} className="relative w-full max-w-xs touch-none select-none overflow-hidden rounded-sm bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={crop.src} alt="" className="block h-auto w-full" draggable={false} />
          <div
            role="presentation"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
            style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, width: `${(w / W) * 100}%`, height: `${((w * RATIO) / H) * 100}%` }}
          >
            {/* 얼굴 위치 안내선 (위쪽 1/3) */}
            <div className="pointer-events-none absolute inset-x-0 top-1/3 border-t border-dashed border-white/60" />
          </div>
        </div>
        <label className="flex max-w-xs items-center gap-3 text-sm">
          <span className="shrink-0 text-ink-soft">크기</span>
          <input type="range" min={20} max={100} value={zoom} onChange={(e) => onZoom(Number(e.target.value))} className="w-full" />
        </label>
        <p className="text-xs text-ink-soft">
          저장 크기: {Math.round(Math.min(OUT_W, w))} × {Math.round(Math.min(OUT_W, w) * RATIO)} 픽셀
          {w < 600 && " — 원본이 작아 흐리게 보일 수 있습니다. 더 큰 사진을 권장합니다."}
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={save} disabled={busy} className="btn-primary px-4 py-2 text-sm">
            {busy ? "저장 중..." : "이대로 저장"}
          </button>
          <button type="button" onClick={() => setCrop(null)} disabled={busy} className="px-3 py-2 text-sm text-ink-soft underline">
            취소
          </button>
        </div>
        {message && (
          <p role="status" className={`text-sm ${message.ok ? "text-green-800" : "text-red-700"}`}>
            {message.text}
          </p>
        )}
      </div>
    );
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
                void pick(e.target.files?.[0]);
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
        {guide}
        {message && (
          <p role="status" className={`text-sm ${message.ok ? "text-green-800" : "text-red-700"}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
