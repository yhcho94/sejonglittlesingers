import { supabaseUrl } from "./supabase/env";

// 홈페이지 로고 (머리글·바닥글). 최상위 관리자가 관리자 → 로고에서 고르거나 새로 올립니다. (0027)
// site_settings.site_logo 값: "circle"(원형 로고, 기본) · "classic"(예전 무지개 음표) · "logos/<uuid>.png" 등(올린 로고)
export const LOGO_BUCKET = "site-assets";
export const LOGO_DIR = "logos";
export const LOGO_MAX_BYTES = 2 * 1024 * 1024;

export const BUILTIN_LOGOS = [
  { id: "circle", label: "원형 로고", note: "무지개 · SEJONG LITTLE SINGERS · 세종시 어린이 합창단" },
  { id: "classic", label: "예전 로고", note: "파스텔 무지개와 음표 · SINCE 2023" },
] as const;
export type BuiltinLogoId = (typeof BUILTIN_LOGOS)[number]["id"];

export type SiteLogo = { kind: BuiltinLogoId } | { kind: "upload"; path: string };
export const DEFAULT_LOGO: SiteLogo = { kind: "circle" };

const UPLOAD_PATH = /^logos\/[0-9a-f-]{36}\.(png|jpg|webp)$/;

export function isUploadedLogoPath(path: string) {
  return UPLOAD_PATH.test(path);
}

export function parseSiteLogo(raw: string | null | undefined): SiteLogo {
  if (raw === "circle" || raw === "classic") return { kind: raw };
  if (raw && isUploadedLogoPath(raw)) return { kind: "upload", path: raw };
  return DEFAULT_LOGO;
}

export function siteLogoValue(logo: SiteLogo) {
  return logo.kind === "upload" ? logo.path : logo.kind;
}

export function logoPublicUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${LOGO_BUCKET}/${path}`;
}
