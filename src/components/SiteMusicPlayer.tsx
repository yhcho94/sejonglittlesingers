"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const OFF_KEY = "sls-music-off";

function readOff() {
  try {
    return localStorage.getItem(OFF_KEY) === "1";
  } catch {
    return false;
  }
}

function writeOff(off: boolean) {
  try {
    if (off) localStorage.setItem(OFF_KEY, "1");
    else localStorage.removeItem(OFF_KEY);
  } catch {}
}

// 홈페이지 배경음악: 플레이리스트를 차례로(마지막 다음엔 처음으로) 재생
// 브라우저는 소리 있는 자동 재생을 막으므로, 막히면 방문자가 화면을 처음 누르는 순간 시작합니다.
// 방문자가 끄면 이 기기에 기억해 두고 다시 켜기 전까지 자동으로 틀지 않습니다. (관리자 화면·인쇄에서는 숨김)
export function SiteMusicPlayer({ tracks, volume }: { tracks: { title: string; src: string }[]; volume: number }) {
  const pathname = usePathname();
  const audio = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const hidden = pathname.startsWith("/admin");

  const play = useCallback(() => {
    const el = audio.current;
    if (!el) return Promise.reject(new Error("no audio"));
    el.volume = volume / 100;
    return el.play();
  }, [volume]);

  // 첫 방문: 자동 재생 시도 → 막히면 첫 터치·클릭·키 입력 때 시작 (음악 버튼을 누른 경우는 버튼이 처리)
  useEffect(() => {
    if (hidden || readOff()) return;
    let done = false;
    const events = ["pointerdown", "touchend", "keydown", "click"] as const;
    const start = (e: Event) => {
      if (done || (e.target instanceof Element && e.target.closest("[data-music-control]"))) return;
      done = true;
      remove();
      if (!readOff()) play().catch(() => {});
    };
    const remove = () => events.forEach((t) => window.removeEventListener(t, start, true));
    play()
      .then(() => {
        done = true;
      })
      .catch(() => {
        if (!done) events.forEach((t) => window.addEventListener(t, start, true));
      });
    return () => {
      done = true;
      remove();
    };
  }, [hidden, play]);

  // 관리자 화면으로 가면 멈춤
  useEffect(() => {
    if (hidden) audio.current?.pause();
  }, [hidden]);

  function toggle() {
    const el = audio.current;
    if (!el) return;
    if (el.paused) {
      writeOff(false);
      play().catch(() => {});
    } else {
      el.pause();
      writeOff(true);
    }
  }

  function next() {
    setIndex((i) => (i + 1) % tracks.length);
  }

  // 곡이 바뀌면 이어서 재생
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!readOff()) play().catch(() => {});
  }, [index, play]);

  const track = tracks[index] ?? tracks[0];
  const button =
    "flex items-center justify-center rounded-full bg-white text-navy shadow-lg ring-1 ring-black/5 transition hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";

  return (
    <div
      data-print-hide
      data-music-control
      className={`fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-[max(0.75rem,env(safe-area-inset-left))] z-30 flex items-center gap-2 lg:bottom-28 lg:left-6 ${hidden ? "hidden" : ""}`}
    >
      <audio
        ref={audio}
        src={track.src}
        preload="none"
        loop={tracks.length === 1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={next}
      />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? `배경음악 끄기 (${track.title})` : "배경음악 켜기"}
        title={playing ? `♪ ${track.title} — 끄기` : "배경음악 켜기"}
        className={`${button} h-12 w-12`}
      >
        {playing ? (
          <span className="flex h-5 items-end gap-[3px]" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="music-bar w-[3px] rounded-full bg-navy" style={{ animationDelay: `${i * 0.18}s` }} />
            ))}
          </span>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
            <path d="M9 18V6l10-2v12" strokeLinejoin="round" />
            <circle cx="6.5" cy="18" r="2.5" />
            <circle cx="16.5" cy="16" r="2.5" />
            <path d="M3 3l18 18" strokeLinecap="round" />
          </svg>
        )}
      </button>
      {playing && tracks.length > 1 && (
        <button type="button" onClick={next} aria-label="다음 곡" title="다음 곡" className={`${button} h-9 w-9 text-sm`}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M5 5l9 7-9 7V5zM16 5h3v14h-3z" />
          </svg>
        </button>
      )}
    </div>
  );
}
