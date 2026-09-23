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
];

// 2026 조직도. 합창단 제공 조직도 기준. (선율반 보컬트레이너는 합창단 요청으로 추가)
// 학부모대표 옆의 '○○ 어머니' 표기는 아동 이름이 드러나므로 공개 홈페이지에는 싣지 않습니다.
export const accompanists: StaffMember[] = [
  {
    name: "정연수",
    role: "반주자",
    className: "울림반",
    sections: [
      {
        title: "학력",
        items: ["대전예술고등학교 피아노과 졸업", "목원대학교 피아노과 졸업", "목원대학교 반주과 석사과정 재학 중"],
      },
      { title: "현재 활동 (현)", items: ["너울가지 합창단 반주자"] },
    ],
  },
  {
    name: "박선희",
    role: "반주자",
    className: "화음반",
    sections: [
      { title: "학력", items: ["충남대학교 음악대학 피아노 전공 졸업"] },
      {
        title: "주요 경력 (전)",
        items: [
          "다수 피아노학원 강사 역임",
          "천주교 아시아 청년대회, 세계 청년대회 미사 반주자 역임",
          "아름다운합창단 반주자 역임",
        ],
      },
      { title: "현재 활동 (현)", items: ["세종 싱투게더콰이어 대표"] },
    ],
  },
  {
    name: "배성희",
    role: "반주자",
    className: "선율반",
    sections: [
      {
        title: "학력",
        items: [
          "목원대학교 건반학부 실기장학생 졸업",
          "Italy Firenze Art 피아노 Diploma 수료",
          "수원대학교 일반대학원 반주학과 석사 졸업",
          "한세대학교 일반대학원 반주학과 박사과정 재학 중",
        ],
      },
      {
        title: "현재 활동 (현)",
        items: [
          "Da름 공연예술단체 대표",
          "대덕문화관광재단 비상임이사",
          "대전광역시 서구청 청년예술위원",
          "반월합창단 반주자",
        ],
      },
    ],
  },
];

export const vocalTrainers: StaffMember[] = [
  {
    name: "이정윤",
    role: "보컬트레이너",
    className: "선율반",
    sections: [
      { title: "학력 · 이수", items: ["영남대학교 음악대학 성악과 졸업", "오르프 지도자 교육과정 이수"] },
      { title: "주요 경력", items: ["다수 음악학원 강사 및 원장 역임"] },
    ],
  },
];

export const theoryTeachers: StaffMember[] = [
  {
    name: "최오늘",
    role: "이론선생님",
    className: "울림반",
    sections: [
      { title: "학력", items: ["배재대 실용음악과 보컬전공 졸업 (부전공: 재즈피아노, 작곡)"] },
      {
        title: "주요 활동",
        items: [
          "3인 3색 콘서트 (조성모, 임태경) 코러스",
          "voice to voice 콘서트 (김태우, 윤종신, 케이윌) 코러스",
          "한국 오르프아트 연구소 동요 CD 보컬 녹음",
          "풀꽃 문학상 시상식 및 사랑 콘서트 공연",
          "헤리티지 가스펠 스쿨 정규과정 소프라노/파트장으로 수료",
          "서구다문화센터에서 주관한 ‘글로벌브릿지’ 프로그램에서 다문화 학생들 보컬 지도",
          "세종시 두루고등학교 방과후 학교에서 보컬지도",
          "유천초등학교에서 열린 우리동네 행복축제에서 공연",
          "세종시 거리예술가 연주",
        ],
      },
    ],
  },
  {
    name: "전하영",
    role: "이론선생님",
    className: "화음반",
    sections: [
      { title: "학력", items: ["전주대학교 음악대학 졸업"] },
      { title: "자격 · 수료", items: ["우쿨렐레지도자 2급 자격증", "뮤직플러스 아동 음악 연구회 수료"] },
      { title: "주요 경력 (전)", items: ["양지 어린이집, 나성 어린이집 음악강사역임"] },
      { title: "현재 활동 (현)", items: ["소담유치원, 한빛 유치원, 바른 유치원 음악 강사"] },
    ],
  },
  {
    name: "조애린",
    role: "이론선생님",
    className: "선율반",
    sections: [
      { title: "학력", items: ["목원대학교 피아노 전공 졸업", "목원대학교 일반대학원 음악대학 반주전공 졸업"] },
      {
        title: "활동",
        items: ["좋아해 피아노 대표", "Ensemble Comodo 대표", "앙상블 소리마루 대표", "퓨전국악실내악단 헤이락 단원"],
      },
      {
        title: "주요 경력",
        items: [
          "꿈다락문화예술학교(어린이 방송국, 세종키즈TV) 문화예술강사 역임",
          "세종문화관광재단 <일상 모아 예술제> 문화예술강사 역임",
          "딩동댕문화예술학교 <즐거운 나의 집> 문화예술강사 역임",
          "세종문화관광재단 유아 문화예술교육 보육자 연수 문화예술강사 역임",
          "한글 반딧불이 집현전 문화예술교육 주간행사 문화예술강사 역임",
          "세종문화관광재단 한글 시민상상 문화거리 문화예술강사 역임",
        ],
      },
      {
        title: "자격",
        items: [
          "예술융합교육지도사 자격 취득",
          "음악심리상담사 1급 자격 취득",
          "문화예술교육사 2급 자격 취득",
          "온라인 음악튜터 2급 자격 취득",
        ],
      },
    ],
  },
];

// 유튜브 담당
export const otherTeachers: StaffMember[] = [
  {
    name: "박세연",
    role: "유튜브 담당",
    sections: [
      {
        title: "학력",
        items: ["계명대학교 음악대학 실용작편곡 전공 졸업", "숙명여자대학교 대학원 피아노교수학과 휴학중"],
      },
      {
        title: "주요 경력 (전)",
        items: [
          "홈플러스 세종점 음악강사 역임",
          "이마트 세종점 음악강사 역임",
          "청주 현대백화점 문화센터 음악강사 역임",
          "뮤직트리, 뮤직어드벤처, 음악세계 음악교재 편집위원 역임",
        ],
      },
      {
        title: "현재 활동 (현)",
        items: ["창신초등학교 합창 강사", "연서초등학교 음악강사", "감성초등학교 음악강사"],
      },
    ],
  },
];

export const officeStaff: StaffMember[] = [
  {
    name: "박성희",
    role: "사무국장",
    sections: [
      { title: "학력", items: ["사회복지학 행정학사 수료"] },
      {
        title: "주요 경력",
        items: ["아동복지시설 사무원", "직장어린이집 사무원", "고등학교 교무행정사", "중학교 교무행정사"],
      },
      { title: "자격", items: ["컴퓨터활용능력 2급", "컴퓨터그래픽스운용기능사"] },
    ],
  },
];

// 소개 페이지에 표시할 강사진 묶음 (각 묶음 안에서는 울림반 → 화음반 → 선율반 순)
export const staffGroups = [
  { title: "부지휘자", members: assistantConductors },
  { title: "반주자", members: accompanists },
  { title: "보컬트레이너", members: vocalTrainers },
  { title: "이론선생님", members: theoryTeachers },
  { title: "유튜브 담당", members: otherTeachers },
  { title: "사무국", members: officeStaff },
];

export const organization = {
  year: 2026,
  director: { role: "단장", name: "지정윤" },
  office: { role: "사무국장", name: "박성희" },
  classes: [
    {
      name: "울림반",
      color: "#1f6fa8",
      members: [
        { role: "부지휘자", name: "오승하" },
        { role: "학부모대표", name: "국지은" },
        { role: "부대표", name: "안가영" },
        { role: "반주자", name: "정연수" },
        { role: "이론선생님", name: "박세연" },
      ],
    },
    {
      name: "화음반",
      color: "#8a2b3d",
      members: [
        { role: "부지휘자", name: "김연주" },
        { role: "학부모대표", name: "박지윤" },
        { role: "반주자", name: "박선희" },
        { role: "이론선생님", name: "전하영" },
      ],
    },
    {
      name: "선율반",
      color: "#3f6b4f",
      members: [
        { role: "부지휘자", name: "서지선" },
        { role: "보컬트레이너", name: "이정윤" },
        { role: "학부모대표", name: "김소영" },
        { role: "부대표", name: "이은희" },
        { role: "반주자", name: "배성희" },
        { role: "이론선생님", name: "조애린" },
      ],
    },
  ],
};
