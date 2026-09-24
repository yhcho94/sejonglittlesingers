"use client";

import { useCallback, useRef, useState } from "react";
import { Lightbox } from "@/components/Lightbox";

type Photo = { id: number; src: string; thumb: string; width: number; height: number; caption: string | null };

// 사진 모음(벽돌 쌓기 배치) + 크게 보기
export function PhotoGrid({ photos, title }: { photos: Photo[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const restoreFocus = useCallback(() => opener.current?.focus(), []);

  return (
    <>
      <ul className="columns-2 gap-3 md:columns-3 md:gap-4 xl:columns-4">
        {photos.map((p, i) => (
          <li key={p.id} className="mb-3 break-inside-avoid md:mb-4">
            <button
              type="button"
              onClick={(e) => {
                opener.current = e.currentTarget;
                setOpen(i);
              }}
              className="group block w-full overflow-hidden bg-cream"
              aria-label={`${title} 사진 ${i + 1}${p.caption ? ` — ${p.caption}` : ""} 크게 보기`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- 미리 줄여 둔 공개 사진 */}
              <img
                src={p.thumb}
                alt={p.caption ?? ""}
                width={p.width}
                height={p.height}
                loading={i < 8 ? "eager" : "lazy"}
                className="h-auto w-full transition duration-500 ease-out group-hover:scale-[1.03] group-hover:opacity-90"
              />
            </button>
          </li>
        ))}
      </ul>

      <Lightbox photos={photos} open={open} setOpen={setOpen} onClose={restoreFocus} title={title} />
    </>
  );
}
