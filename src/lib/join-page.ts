import { AUDITION_EMAIL } from "./application-fields";
import type { Recruitment } from "./types";

// 입단 안내 페이지 문구 (0030). 관리자 → 입단 안내에서 수정, 비어 있으면 아래 기본 문구
export type JoinStep = { title: string; body: string };

export const JOIN_STEPS_MAX = 8;
export const JOIN_DEFAULTS = {
  page_intro: "노래를 사랑하는 어린이 단원을 기다립니다.",
  steps: [
    { title: "온라인 입단 신청", body: "회원가입 없이 보호자 정보와 자녀(단원) 정보를 입력해 신청서를 제출합니다." },
    { title: "오디션 동영상 제출", body: `자유곡 한 곡을 1절 부른 영상을 ${AUDITION_EMAIL} 로 보냅니다.` },
    { title: "심사", body: "선생님들이 신청서와 동영상을 보고 심사합니다." },
    { title: "결과 안내", body: "심사 결과를 보호자 연락처로 전화·문자·카카오톡으로 알려 드립니다." },
  ] as JoinStep[],
  songs_title: "오디션 자유곡",
  songs_intro: `부르고 싶은 노래 한 곡을 자유롭게 골라 1절을 부르는 모습을 휴대폰으로 찍어 ${AUDITION_EMAIL} 로 보내 주세요. 아래 곡과 반주를 참고해도 좋습니다. 반주는 다른 기기로 틀어 주세요.`,
};

function parseSteps(raw: unknown): JoinStep[] | null {
  if (!Array.isArray(raw)) return null;
  const steps = raw
    .filter((s): s is JoinStep => !!s && typeof s.title === "string" && typeof s.body === "string")
    .map((s) => ({ title: s.title.trim(), body: s.body.trim() }))
    .filter((s) => s.title);
  return steps.length ? steps.slice(0, JOIN_STEPS_MAX) : null;
}

// 화면에 쓸 문구: 저장된 값, 없으면 기본 문구
export function joinPageText(r: Partial<Recruitment> | null) {
  return {
    page_intro: r?.page_intro?.trim() || JOIN_DEFAULTS.page_intro,
    steps: parseSteps(r?.steps) ?? JOIN_DEFAULTS.steps,
    songs_title: r?.songs_title?.trim() || JOIN_DEFAULTS.songs_title,
    songs_intro: r?.songs_intro?.trim() || JOIN_DEFAULTS.songs_intro,
  };
}
