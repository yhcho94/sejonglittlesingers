import { consentSummary } from "@/lib/media-consent";

const STYLE = {
  all: "bg-emerald-50 text-emerald-800",
  some: "bg-amber-50 text-amber-800",
  none: "bg-red-50 text-red-700",
};

// 초상권 동의 상태 (영상·사진 편집 시 가려야 할 단원 확인용)
export function ConsentPill({
  singer,
}: {
  singer: { consent_media_channels: boolean; consent_media_press: boolean; name_public: boolean };
}) {
  const c = consentSummary(singer);
  return (
    <span
      title={c.detail ? `동의: ${c.detail}` : "초상권 미동의 — 사진·영상 게시 시 제외하거나 얼굴을 가려야 합니다"}
      className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${STYLE[c.level]}`}
    >
      {c.label}
    </span>
  );
}
