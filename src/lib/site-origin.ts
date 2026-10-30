import { site } from "@/lib/site";

// 인증 메일(가입·비밀번호 재설정) 링크의 사이트 주소: 요청 헤더가 아닌 고정 주소를 씁니다.
// (헤더는 요청하는 쪽이 바꿀 수 있어, 남의 재설정 링크를 다른 사이트로 보내는 데 악용될 수 있음)
// 개발·미리보기 환경에서만 SITE_URL 환경변수로 바꿀 수 있습니다.
export function siteOrigin() {
  const override = (process.env.SITE_URL ?? "").trim().replace(/\/+$/, "");
  return /^https?:\/\/[^/\s]+$/.test(override) ? override : site.url;
}
