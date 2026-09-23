// 지휘자·부지휘자 약력. 합창단이 제공한 내용을 그대로 옮겼습니다. (띄어쓰기만 정리)

export type BioSection = { title: string; items: string[] };

export type StaffMember = {
  name: string;
  role: string;
  className?: string; // 담당 반
  website?: string; // 개인 홈페이지
  sections: BioSection[];
};

export const conductor: StaffMember = {
  name: "지정윤",
  role: "단장 · 상임지휘자",
  website: "https://sopranoji.vercel.app/",
  sections: [
    {
      title: "학력",
      items: [
        "이태리 Pescarese 시립음악원 최고연주자과정 성악전공 졸업",
        "이태리 Pescarese 시립음악원 'Canto spagnolo' 수료",
        "미국 Washington D.C The Theatre Lab School of Dramatic Arts Musical 연기 과정 수료",
        "숙명여자대학교 음악대학 성악과 석사 졸업",
      ],
    },
    {
      title: "연주",
      items: [
        "이태리 Pescara 독창회 연주",
        "논산시예총 음악협회 후원 독창회 개최",
        "세종시 문화재단 전문예술가지원사업 선정 독창회 개최",
        "세종시 문화재단 청년예술가지원사업 선정 독창회 개최",
      ],
    },
    {
      title: "수상",
      items: [
        "World choir games (세계합창대회) 어린이합창부분 Silver Diploma 수상",
        "세종시 예술인상 수상",
        "세종시 교육감상 수상 (119 소방동요대회 대상 지도자상)",
        "강경포구 전국 어린이 동요대회 지도자상 수상",
      ],
    },
    {
      title: "주요 경력 (전)",
      items: [
        "준 시어터 소속 뮤지컬 배우 및 팝페라 가수 활동",
        "계룡시어린이뮤지컬 합창단 상임 지휘자 역임",
        "경찰대학교 강사역임",
        "세종하모니앙상블 대표역임",
      ],
    },
    {
      title: "현재 활동 (현)",
      items: [
        "세종드림예술기획 대표",
        "세종리틀싱어즈 단장 및 상임지휘자",
        "세종사계절하모니합창단 예술감독 및 상임지휘자",
        "싱싱콰이어 지휘자",
        "클래시컬쇼콰이어그룹 튀김소보체 단원",
        "세종시 음악협회 회원",
        "세종생활음악협회 사무국장",
        "전문연주자로 왕성하게 활동중",
      ],
    },
  ],
};

export const assistantConductors: StaffMember[] = [
  {
    name: "오승하",
    role: "부지휘자",
    className: "울림반",
    sections: [
      {
        title: "학력",
        items: ["중앙대학교 음악대학 피아노과 졸업", "가톨릭대학교 교회음악대학원 지휘과 휴학"],
      },
      {
        title: "주요 경력 (전)",
        items: ["서울레이디스 싱어즈 단원", "호평성당 성가대 지휘자", "다수의 음악학원 강사 및 원장 역임"],
      },
    ],
  },
  {
    name: "서지선",
    role: "부지휘자",
    className: "선율반",
    sections: [
      {
        title: "학력",
        items: ["동덕여자대학교 음악학과 성악과 졸업", "미국 Temple University 성악과 석사 졸업"],
      },
      {
        title: "주요 경력 (전)",
        items: ["라루체합창단 솔리스트", "대전 맹학교 음악 강사", "세종사계절하모니합창단 부지휘자"],
      },
      {
        title: "현재 활동 (현)",
        items: ["유성구 여성합창단 솔리스트", "킨더뮤직코리아 객원 연구원", "전문 연주자로 활동 중"],
      },
    ],
  },
  {
    name: "김연주",
    role: "부지휘자",
    className: "화음반",
    sections: [
      {
        title: "학력",
        items: ["대전침례신학대학교 성악과 졸업 및 동 대학원 졸업"],
      },
      {
        title: "주요 경력 (전)",
        items: ["청주시립합창단 객원역임", "서산시립합창단 단원역임"],
      },
      {
        title: "현재 활동 (현)",
        items: [
          "대전아트콰이어 소프라노 단원으로 활동 중",
          "세종산울초등학교, 마을학교, 세종지역학습장 합창 지도",
        ],
      },
    ],
  },
];
