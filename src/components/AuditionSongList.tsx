import { auditionSongFileUrl, type AuditionSong } from "@/lib/audition-songs";

// 입단 오디션 지정곡: 곡명 + 반주 듣기(음원 재생·내려받기, 반주 링크)
export function AuditionSongList({ songs }: { songs: AuditionSong[] }) {
  return (
    <ol className="divide-y divide-line">
      {songs.map((s, i) => (
        <li key={s.slot} className="grid gap-2 py-4 md:grid-cols-[1fr_auto] md:items-center md:gap-6">
          <div className="min-w-0">
            <p className="font-medium">
              <span className="mr-2 font-[family-name:var(--font-display)] text-gold-deep">{i + 1}.</span>
              {s.title}
            </p>
            {s.note && <p className="mt-0.5 text-sm text-ink-soft">{s.note}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm md:justify-end">
            {s.file_path && (
              <>
                <audio
                  controls
                  preload="none"
                  src={auditionSongFileUrl(s.file_path)}
                  className="h-9 w-full md:w-72"
                  aria-label={`${s.title} 반주 듣기`}
                />
                <a href={auditionSongFileUrl(s.file_path)} download className="text-navy underline underline-offset-4">
                  반주 내려받기
                </a>
              </>
            )}
            {s.accompaniment_url && (
              <a
                href={s.accompaniment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy underline underline-offset-4"
              >
                반주 링크 ↗
              </a>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
