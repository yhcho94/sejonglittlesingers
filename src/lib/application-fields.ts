// 입단 신청서 선택지 (기존 네이버 폼 기준)
export const CLASS_OPTIONS = [
  { name: "울림반", day: "월요일" },
  { name: "화음반", day: "화요일" },
  { name: "선율반", day: "수요일" },
] as const;

export const GENDERS = ["남", "여"] as const;

// 오디션 동영상 제출 (홈페이지에 올리지 않고 합창단 이메일로 받음)
export const AUDITION_EMAIL = "sejonglittlesingers@naver.com";

export const AUDITION_GUIDE = [
  "지정곡 반주에 맞춰 1절을 부르는 모습을 휴대폰으로 찍어 주세요. (2분 이내)",
  "얼굴과 상반신이 잘 보이게, 조용한 곳에서 찍어 주세요. 반주는 다른 기기로 틀어 주세요.",
  "메일 제목에 단원 이름과 생년월일을 적어 보내 주세요. 예: [입단 오디션] 홍길동 (2019-03-15)",
  "파일이 크면 메일 앱이 '대용량 첨부(내려받기 링크)'로 바꿔 보냅니다. 그대로 보내시면 됩니다.",
  "영상은 입단 심사에만 사용하며, 심사 결과를 정한 날부터 30일 이내에 메일함에서 삭제합니다.",
];

export function auditionMailto(childName: string, birthdate: string) {
  const subject = `[입단 오디션] ${childName} (${birthdate})`;
  return `mailto:${AUDITION_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
