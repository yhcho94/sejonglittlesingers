// 공연 이력. 합창단이 제공한 내용을 그대로 옮겼습니다.
// (날짜 표기 통일, 같은 해 안에서 날짜순 정렬만 했습니다)
// kind: 공연 외 이력(창단·수상·앨범)은 강조 표시합니다.

export type HistoryItem = {
  date: string; // "12.3" 형식, 날짜가 없으면 ""
  title: string;
  place?: string;
  kind?: "milestone" | "award" | "album";
};

export const history: { year: number; items: HistoryItem[] }[] = [
  {
    year: 2026,
    items: [
      { date: "1.10", title: "조상호 경제부시장 출판기념회 오프닝공연", place: "정부세종청사체육관" },
      { date: "1.24", title: "최민호 세종시장 출판기념회 축하공연", place: "세종문화예술회관" },
      { date: "2.7", title: "한국영재음악콩쿠르 참가 대상, 최고지도자상 수상", kind: "award" },
      { date: "2.28", title: "황운하 출판기념회 오프닝 공연", place: "아름동 복합커뮤니티센터" },
      { date: "3.28", title: "문화살롱석가헌 함께 봄 음악회", place: "세종호수공원 매화공연장" },
      { date: "4.3", title: "세종리틀싱어즈 1집앨범 발매", kind: "album" },
      { date: "4.16", title: "세월호 참사 12주기 추모 음악회", place: "박연문화관" },
      { date: "4.18", title: "국립세종수목원 지역상생꽃축제 세록세록", place: "국립세종수목원" },
      { date: "5.5", title: "세종시 어린이날 행사", place: "세종호수공원" },
      { date: "5.6", title: "세종시 교육청 소통공감의날 행사", place: "세종시교육청" },
      { date: "6.10", title: "제39주년 6.10민주항쟁 세종시민대회", place: "세종호수공원" },
      { date: "6.13", title: "세종환경교육한마당", place: "세종호수공원" },
      { date: "7.1", title: "조상호 세종시장 취임식", place: "세종시청" },
      { date: "7.8", title: "대전국악방송 개국9주년 특집방송 출연" },
      { date: "7.18", title: "세종리틀싱어즈 기획연주회", place: "김인홀" },
      { date: "8.14", title: "위안부 피해자 기림의날 행사 초청공연", place: "세종호수공원" },
      { date: "8.30", title: "세종리틀싱어즈 향상 음악회", place: "Bok아트센터" },
      { date: "9.13", title: "현대 프리미엄 아울렛 연주", place: "현대 프리미엄 아울렛" },
      { date: "9.19", title: "세종시 체육대회 애국가 제창", place: "세종시민운동장" },
    ],
  },
  {
    year: 2025,
    items: [
      { date: "5.3", title: "중소벤처기업부 동행축제 초청공연", place: "세종중앙공원 야외무대" },
      { date: "5.5", title: "국립세종수목원 어린이날 행사 식전공연", place: "세종국립수목원 야외무대" },
      { date: "7.22", title: "제3회 기획연주회 The Sound of Dreams", place: "비오케이아트센터" },
      { date: "10.11", title: "세종한글축제 폐막식 공연", place: "세종호수공원 메인무대" },
      { date: "10.17", title: "제14회 전국병아리동요제 동상수상", place: "이천아트센터", kind: "award" },
      { date: "10.25", title: "세종시 어린이 음악제 연주", place: "보람초 강당" },
      { date: "11.2", title: "제2회 119메모리얼데이 애국가 제창", place: "세종중앙공원" },
      { date: "12.16", title: "제3회 정기연주회 '우리들의꿈'", place: "세종문화예술회관" },
    ],
  },
  {
    year: 2024,
    items: [
      { date: "4.27", title: "세종중앙공원 도시축제한마당 초청공연", place: "세종 중앙공원 야외무대" },
      { date: "5.3", title: "대전국악방송 송진주의 음악정원 출연", place: "대전 국악방송" },
      { date: "7.23", title: "세종리틀싱어즈, 예원클래식 공동 주최 Together Concert", place: "비오케이 아트센터" },
      { date: "8.29", title: "세종시교육청 공무원 훈포장 전수식 초청공연", place: "세종시 교육청" },
      { date: "11.2", title: "제12회 세종음악제 연주", place: "세종이음학교 대강당" },
      { date: "12.11", title: "제2회 정기연주회", place: "세종문화예술회관" },
      { date: "12.13", title: "세종빛축제 개막식 연주", place: "금강보행교 야외무대" },
    ],
  },
  {
    year: 2023,
    items: [
      { date: "", title: "세종리틀싱어즈 창단", kind: "milestone" },
      { date: "12.3", title: "정기연주회", place: "비오케이 아트센터" },
      { date: "12.16", title: "세종시 사회서비스원 초청공연", place: "세종시청" },
    ],
  },
];
