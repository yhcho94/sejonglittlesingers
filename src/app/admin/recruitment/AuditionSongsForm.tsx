"use client";

import { useActionState, useState } from "react";
import { saveAuditionSongs } from "@/app/actions/audition-songs";
import { FormMessage, SubmitButton } from "@/components/form";
import {
  AUDITION_SONG_BUCKET,
  AUDITION_SONG_MAX_BYTES,
  AUDITION_SONG_SLOTS,
  AUDITION_SONG_TYPES,
  auditionSongFileUrl,
  type AuditionSong,
} from "@/lib/audition-songs";
import { createClient } from "@/lib/supabase/client";

// 오디션 지정곡 5칸: 곡명 + 반주 링크(유튜브 등) 또는 반주 음원(mp3·m4a) 파일
export function AuditionSongsForm({ songs }: { songs: AuditionSong[] }) {
  const [state, action] = useActionState(saveAuditionSongs, undefined);
  return (
    <form action={action} className="space-y-4">
      {AUDITION_SONG_SLOTS.map((slot) => (
        <SongRow key={slot} slot={slot} song={songs.find((s) => s.slot === slot)} />
      ))}
      <p className="text-xs text-ink-soft">
        곡명을 비우고 저장하면 그 칸이 지워집니다. 반주 음원은 &lsquo;입단 안내&rsquo; 화면에서 누구나 듣고 내려받을 수 있으니 저작권
        문제가 없는 음원만 올려 주세요.
      </p>
      <FormMessage state={state} />
      <SubmitButton pendingText="저장 중...">지정곡 저장</SubmitButton>
    </form>
  );
}

function SongRow({ slot, song }: { slot: number; song?: AuditionSong }) {
  const [file, setFile] = useState(song?.file_path ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(f: File | undefined) {
    if (!f) return;
    const ext = AUDITION_SONG_TYPES[f.type] ?? (/\.mp3$/i.test(f.name) ? "mp3" : /\.m4a$/i.test(f.name) ? "m4a" : null);
    if (!ext) return setMessage("mp3 또는 m4a 파일만 올릴 수 있습니다.");
    if (f.size > AUDITION_SONG_MAX_BYTES) return setMessage("30MB 이하 파일만 올릴 수 있습니다.");
    setBusy(true);
    setMessage("");
    const path = `songs/${crypto.randomUUID()}.${ext}`;
    const { error } = await createClient()
      .storage.from(AUDITION_SONG_BUCKET)
      .upload(path, f, { contentType: ext === "mp3" ? "audio/mpeg" : "audio/mp4", cacheControl: "31536000", upsert: false });
    setBusy(false);
    if (error) return setMessage("올리지 못했습니다. 잠시 후 다시 시도해 주세요.");
    setFile(path);
    setMessage("올렸습니다. 아래 [지정곡 저장]을 눌러야 반영됩니다.");
  }

  return (
    <fieldset className="rounded-sm border border-line p-4">
      <legend className="px-1 text-sm font-bold text-navy">지정곡 {slot}</legend>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor={`title_${slot}`} className="label">곡명</label>
          <input id={`title_${slot}`} name={`title_${slot}`} maxLength={100} defaultValue={song?.title ?? ""} className="input" />
        </div>
        <div>
          <label htmlFor={`url_${slot}`} className="label">반주 링크 (선택)</label>
          <input
            id={`url_${slot}`}
            name={`url_${slot}`}
            type="url"
            maxLength={500}
            placeholder="https://www.youtube.com/..."
            defaultValue={song?.accompaniment_url ?? ""}
            className="input"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor={`note_${slot}`} className="label">안내 (선택)</label>
          <input
            id={`note_${slot}`}
            name={`note_${slot}`}
            maxLength={200}
            placeholder="예: 1절만, 울림반 지원자용"
            defaultValue={song?.note ?? ""}
            className="input"
          />
        </div>
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <input type="hidden" name={`file_${slot}`} value={file} />
        <p className="label mb-0">반주 음원 파일 (선택, mp3·m4a, 30MB 이하)</p>
        {file ? (
          <div className="flex flex-wrap items-center gap-3">
            <audio controls preload="none" src={auditionSongFileUrl(file)} className="h-9 max-w-full" />
            <button type="button" onClick={() => setFile("")} className="text-xs text-red-700 hover:underline">
              파일 빼기
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="audio/mpeg,audio/mp4,audio/x-m4a,.mp3,.m4a"
            disabled={busy}
            onChange={(e) => upload(e.target.files?.[0])}
            className="block w-full text-sm file:mr-3 file:rounded-sm file:border-0 file:bg-cream file:px-3 file:py-2"
          />
        )}
        {busy && <p className="text-xs text-ink-soft">올리는 중...</p>}
        {message && <p className="text-xs text-ink-soft">{message}</p>}
      </div>
    </fieldset>
  );
}
