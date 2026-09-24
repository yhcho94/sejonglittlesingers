// 입단 오디션 지정곡: 서버·브라우저 공통 (서버 전용 모듈을 가져오지 않음)
import { supabaseUrl } from "@/lib/supabase/env";

export const AUDITION_SONG_BUCKET = "audition-songs";
export const AUDITION_SONG_SLOTS = [1, 2, 3, 4, 5] as const;
export const AUDITION_SONG_MAX_BYTES = 30 * 1024 * 1024;
export const AUDITION_SONG_TYPES: Record<string, "mp3" | "m4a"> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "m4a",
};

export type AuditionSong = {
  slot: number;
  title: string;
  accompaniment_url: string | null;
  file_path: string | null;
  note: string | null;
};

export const AUDITION_FILE_RE = /^songs\/[0-9a-f-]{36}\.(mp3|m4a)$/;

// 공개 버킷의 반주 음원 주소
export function auditionSongFileUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${AUDITION_SONG_BUCKET}/${path}`;
}
