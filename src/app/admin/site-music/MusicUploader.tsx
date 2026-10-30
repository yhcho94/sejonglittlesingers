"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addMusicTrack } from "@/app/actions/site-music";
import { MUSIC_BUCKET, MUSIC_CONTENT_TYPE, MUSIC_DIR, MUSIC_MAX_BYTES, musicExt } from "@/lib/site-music";
import { createClient } from "@/lib/supabase/client";

// 음원 파일 올리기 (여러 개 한 번에): 파일 이름이 곡명이 되고, 플레이리스트 맨 뒤에 붙습니다.
export function MusicUploader() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<{ ok: boolean; text: string }[]>([]);

  async function upload(files: File[]) {
    if (!files.length) return;
    setBusy(true);
    const out: { ok: boolean; text: string }[] = [];
    for (const f of files) {
      const ext = musicExt(f);
      if (!ext) {
        out.push({ ok: false, text: `${f.name}: mp3 · wav · m4a 파일만 올릴 수 있습니다.` });
        continue;
      }
      if (f.size > MUSIC_MAX_BYTES) {
        out.push({ ok: false, text: `${f.name}: 50MB 이하 파일만 올릴 수 있습니다. (wav 가 크면 mp3 로 바꿔 올려 주세요)` });
        continue;
      }
      const path = `${MUSIC_DIR}/${crypto.randomUUID()}.${ext}`;
      const { error } = await createClient()
        .storage.from(MUSIC_BUCKET)
        .upload(path, f, { contentType: MUSIC_CONTENT_TYPE[ext], cacheControl: "31536000", upsert: false });
      if (error) {
        out.push({ ok: false, text: `${f.name}: 올리지 못했습니다. (0033 SQL 실행 여부를 확인해 주세요)` });
        continue;
      }
      const res = await addMusicTrack(path, f.name.replace(/\.(mp3|m4a|wav)$/i, ""));
      out.push({ ok: Boolean(res?.success), text: res?.success ?? res?.error ?? "" });
    }
    setMessages(out);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="rounded-sm border-2 border-dashed border-line bg-ivory p-5 text-center">
      <label className={`btn-primary cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
        {busy ? "올리는 중..." : "음악 파일 올리기 (mp3·wav)"}
        <input
          type="file"
          multiple
          accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            void upload([...(e.target.files ?? [])]);
            e.target.value = "";
          }}
        />
      </label>
      <p className="mt-3 text-xs text-ink-soft">mp3 · wav · m4a, 한 곡당 50MB 이하 · wav 는 용량이 커서 방문자 데이터가 많이 들므로 mp3 를 권장합니다 · 여러 곡을 한 번에 고를 수 있습니다 · 파일 이름이 곡명이 됩니다(아래에서 수정)</p>
      {messages.length > 0 && (
        <ul className="mt-3 space-y-1 text-left text-xs">
          {messages.map((m, i) => (
            <li key={i} className={m.ok ? "text-green-700" : "text-red-700"}>
              {m.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
