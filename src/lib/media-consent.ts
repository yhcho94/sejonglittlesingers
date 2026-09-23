// 초상권(사진·영상) 이용 동의: 신청서·마이페이지·관리자 화면 공통 문구
// 문구를 바꾸면 VERSION 도 올려 주세요. (동의 기록에 어떤 문구에 동의했는지 남습니다)
export const MEDIA_CONSENT_VERSION = "2026-11-01";

export const MEDIA_ITEMS = [
  {
    key: "channels",
    label: "공식 채널 게시",
    text: "공연·연습·행사 중 촬영한 사진과 영상을 합창단 홈페이지, 유튜브, 네이버 블로그·카페와 앨범·뮤직비디오에 게시하는 것에 동의합니다.",
  },
  {
    key: "press",
    label: "언론·홍보물",
    text: "위 사진과 영상을 언론 보도 자료와 외부 홍보물(공연 포스터·리플릿, 후원·협력 기관 홍보 등)에 사용하는 것에 동의합니다.",
  },
  {
    key: "name",
    label: "이름 표시",
    text: "게시물·영상 자막과 홈페이지 '단원 소개' 화면에 단원 이름(반 포함)을 표시하는 것에 동의합니다.",
  },
] as const;

export type MediaKey = (typeof MEDIA_ITEMS)[number]["key"];

// 동의 안내 (신청서·마이페이지에 표시)
export const MEDIA_NOTICE = [
  "목적: 합창단 공연·활동 기록과 홍보",
  "항목: 단원의 얼굴이 나온 사진·영상, (③ 동의 시) 이름",
  "게시 기간: 게시물을 내릴 때까지. 동의를 철회하면 이후 새 게시물에는 사용하지 않고, 요청하시면 이미 올린 게시물도 삭제하거나 얼굴을 가립니다.",
  "이미 배포된 앨범·인쇄물·언론 기사처럼 합창단이 회수할 수 없는 경우가 있습니다.",
  "관객·언론 등 다른 사람이 공연장에서 촬영한 사진·영상은 합창단이 관리할 수 없습니다.",
  "동의하지 않아도 입단과 활동에 불이익이 없으며, 마이페이지에서 언제든 항목별로 바꿀 수 있습니다.",
];

// 명부·엑셀 표시용 요약
export function consentSummary(s: { consent_media_channels: boolean; consent_media_press: boolean; name_public: boolean }) {
  const on = [s.consent_media_channels && "공식채널", s.consent_media_press && "언론·홍보", s.name_public && "이름"].filter(Boolean);
  if (on.length === 3) return { level: "all" as const, label: "전체 동의", detail: on.join("·") };
  if (on.length === 0) return { level: "none" as const, label: "미동의", detail: "" };
  return { level: "some" as const, label: "일부 동의", detail: on.join("·") };
}

// 서버에서 폼 값 읽기
export function readMediaConsent(formData: FormData) {
  return {
    channels: formData.get("media_channels") === "on",
    press: formData.get("media_press") === "on",
    name: formData.get("media_name") === "on",
  };
}
