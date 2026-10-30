import { supabaseUrl } from "./supabase/env";

// 홈페이지 배경음악 (0033): 최상위 관리자가 관리자 → 배경음악에서 곡을 올리고 순서를 정합니다. (서버·브라우저 공통)
export const MUSIC_BUCKET = "site-music";
export const MUSIC_DIR = "tracks";
export const MUSIC_MAX_BYTES = 50 * 1024 * 1024;
export type MusicExt = "mp3" | "m4a" | "wav";
export const MUSIC_TYPES: Record<string, MusicExt> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/wave": "wav",
};
export const MUSIC_CONTENT_TYPE: Record<MusicExt, string> = { mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav" };
export const MUSIC_FILE_RE = /^tracks\/[0-9a-f-]{36}\.(mp3|m4a|wav)$/;

// 브라우저가 형식을 알려 주지 않으면 확장자로 판단
export function musicExt(file: File): MusicExt | null {
  const m = /\.(mp3|m4a|wav)$/i.exec(file.name);
  return MUSIC_TYPES[file.type] ?? (m ? (m[1].toLowerCase() as MusicExt) : null);
}

export type MusicTrack = { id: number; title: string; file_path: string; sort_order: number; is_active: boolean };

// site_settings.site_music 값: {"enabled":true,"volume":40}
export type MusicSettings = { enabled: boolean; volume: number };
export const DEFAULT_MUSIC: MusicSettings = { enabled: false, volume: 40 };

export function parseMusicSettings(raw: string | null | undefined): MusicSettings {
  try {
    const v = JSON.parse(raw ?? "");
    if (typeof v?.enabled === "boolean" && Number.isInteger(v?.volume) && v.volume >= 0 && v.volume <= 100) {
      return { enabled: v.enabled, volume: v.volume };
    }
  } catch {}
  return DEFAULT_MUSIC;
}

// DB 규칙(키 순서 포함)과 같은 모양으로 저장
export function musicSettingsValue(s: MusicSettings) {
  return `{"enabled":${s.enabled},"volume":${s.volume}}`;
}

export function musicFileUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${MUSIC_BUCKET}/${path}`;
}
