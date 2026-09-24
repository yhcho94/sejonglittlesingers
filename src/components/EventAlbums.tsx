"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Lightbox } from "@/components/Lightbox";
import type { EventAlbum, EventPhoto } from "@/lib/event-albums";

// 사진 틀(3:2)과 비율 차이가 크면(세로·파노라마 사진) 자르지 않고 전체를 보여 줍니다.
function fitsFrame(p: EventPhoto) {
  const r = p.width / p.height;
  return r >= 1.3 && r <= 1.7;
}

function dateLabel(d: string) {
  return d.replaceAll("-", ". ");
}

// 공연·행사 사진첩: 행사마다 제목 + 단체사진 + 현장 사진 (누르면 크게 보기)
export function EventAlbums({ albums }: { albums: EventAlbum[] }) {
  const flat = useMemo(
    () =>
      albums.flatMap((a) =>
        a.photos.map((p, i) => ({ id: `${a.id}-${i}`, src: p.src, alt: p.alt, caption: `${a.title} · ${dateLabel(a.date)}` })),
      ),
    [albums],
  );
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const restoreFocus = useCallback(() => opener.current?.focus(), []);

  let index = 0;
  return (
    <>
      <ul className="divide-y divide-line border-y border-line">
        {albums.map((a) => (
          <li key={a.id} className="grid gap-3 py-5 lg:grid-cols-[15rem_1fr] lg:gap-6 lg:py-6">
            <div>
              <p className="eyebrow text-gold-deep">{dateLabel(a.date)}</p>
              <h3 className="mt-1.5 text-lg leading-snug font-bold text-navy">{a.title}</h3>
              {a.venue && <p className="mt-1 text-sm text-ink-soft">{a.venue}</p>}
              <a
                href={a.post}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-ink-soft underline-offset-4 hover:text-navy hover:underline"
              >
                블로그 글 보기 ↗
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {a.photos.map((p) => {
                const i = index++;
                const cover = fitsFrame(p);
                return (
                  <button
                    key={p.src}
                    type="button"
                    onClick={(e) => {
                      opener.current = e.currentTarget;
                      setOpen(i);
                    }}
                    className="group relative block aspect-[3/2] w-full overflow-hidden bg-navy-dark"
                    aria-label={`${p.alt} — 크게 보기`}
                  >
                    {!cover && (
                      // 틀에 맞지 않는 사진은 같은 사진을 흐리게 깔고 가운데에 전체를 보여 줍니다
                      // eslint-disable-next-line @next/next/no-img-element -- 미리 줄여 둔 공개 사진
                      <img src={p.src} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-lg" />
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element -- 미리 줄여 둔 공개 사진 */}
                    <img
                      src={p.src}
                      alt={p.alt}
                      width={p.width}
                      height={p.height}
                      loading={i < 4 ? "eager" : "lazy"}
                      style={cover ? { objectPosition: p.focus } : undefined}
                      className={`relative h-full w-full transition duration-500 ease-out group-hover:scale-[1.03] ${
                        cover ? "object-cover" : "object-contain"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
      <Lightbox photos={flat} open={open} setOpen={setOpen} onClose={restoreFocus} title="공연·행사 사진첩" />
    </>
  );
}
