"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// 첫 화면 대표 사진 슬라이드: 6초마다 천천히 바뀜 (점·일시정지 버튼, 휴대폰은 옆으로 밀기)
// '동작 줄이기'를 켠 사용자는 자동으로 넘어가지 않고 점을 눌러서만 봅니다.
export type HeroSlide = {
  alt: string;
  // 휴대폰·태블릿용 img 속성 (next/image getImageProps 결과)
  img: React.ImgHTMLAttributes<HTMLImageElement>;
  // PC(1024px 이상)에서 다른 사진을 쓸 때
  desktopSrcSet?: string;
  // 사진에서 보일 부분 (휴대폰 · PC)
  position?: string;
};

const INTERVAL = 6000;
const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // 서버에서는 '동작 줄이기'를 알 수 없으므로 켜진 것으로 보고(자동 넘김 없음) 브라우저에서 확인
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => true);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  useEffect(() => {
    if (paused || reduced || count < 2) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => window.clearTimeout(timer);
  }, [index, paused, reduced, count]);

  const go = (i: number) => setIndex((i + count) % count);

  return (
    <div
      className="absolute inset-0"
      aria-roledescription="carousel"
      aria-label="대표 사진"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      }}
    >
      {slides.map((s, i) => {
        const active = i === index;
        return (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${count}`}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out motion-reduce:transition-none ${active ? "opacity-100" : "opacity-0"}`}
          >
            <picture>
              {s.desktopSrcSet && <source media="(min-width: 1024px)" srcSet={s.desktopSrcSet} sizes="65vw" />}
              <img
                {...s.img}
                alt={s.alt}
                className={`${active ? "animate-hero-zoom" : ""} absolute inset-0 h-full w-full object-cover ${s.position ?? "object-center"}`}
              />
            </picture>
          </div>
        );
      })}

      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex [filter:drop-shadow(0_1px_2px_rgb(0_0_0/0.6))] -translate-x-1/2 items-center gap-1 lg:bottom-6 lg:left-auto lg:right-6 lg:translate-x-0">
          {slides.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`${i + 1}번째 사진 보기`}
              aria-current={i === index}
              className="flex h-6 w-6 items-center justify-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80"}`}
              />
            </button>
          ))}
          {!reduced && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "사진 넘김 다시 시작" : "사진 넘김 멈춤"}
              className="ml-1 flex h-6 w-6 items-center justify-center text-white/85 hover:text-white"
            >
              {paused ? (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                  <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
