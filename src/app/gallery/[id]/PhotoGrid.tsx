"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Photo = { id: number; src: string; thumb: string; width: number; height: number; caption: string | null };

// 사진 모음(벽돌 쌓기 배치) + 크게 보기(키보드 ←/→/Esc, 휴대폰 좌우 밀기)
export function PhotoGrid({ photos, title }: { photos: Photo[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);
  const move = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeBtn.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, move]);

  const current = open === null ? null : photos[open];

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

      {current &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${title} 사진 크게 보기`}
            className="fixed inset-0 z-50 flex flex-col bg-navy-dark/95 text-white"
            onClick={(e) => e.target === e.currentTarget && close()}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 text-sm text-white/70">
              <span className="tabular-nums">
                {open! + 1} / {photos.length}
              </span>
              <button ref={closeBtn} type="button" onClick={close} className="p-2 text-white hover:text-gold" aria-label="닫기">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-16" onClick={(e) => e.target === e.currentTarget && close()}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 원본(최대 2000px) 공개 사진 */}
              <img key={current.id} src={current.src} alt={current.caption ?? ""} className="animate-rise max-h-full max-w-full object-contain" />
              {photos.length > 1 && (
                <>
                  <button type="button" onClick={() => move(-1)} aria-label="이전 사진" className="absolute left-1 hidden p-3 text-white/70 hover:text-white md:block">
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => move(1)} aria-label="다음 사진" className="absolute right-1 hidden p-3 text-white/70 hover:text-white md:block">
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            <p className="min-h-12 px-4 py-3 text-center text-sm text-white/80">{current.caption ?? ""}</p>
          </div>,
          document.body,
        )}
    </>
  );
}
