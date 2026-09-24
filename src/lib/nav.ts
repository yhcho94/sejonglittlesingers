// 주 메뉴 (헤더·모바일 메뉴·푸터 공통). topOnly 는 상단 메뉴에만 표시
export const NAV: { href: string; label: string; topOnly?: boolean }[] = [
  { href: "/", label: "홈" },
  { href: "/about", label: "합창단 소개" },
  { href: "/faculty", label: "강사진 소개" },
  { href: "/singers", label: "단원 소개" },
  { href: "/join", label: "입단 안내" },
  { href: "/concerts", label: "공연" },
  { href: "/gallery", label: "사진 갤러리", topOnly: true },
  { href: "/notices", label: "공지사항" },
  { href: "/press", label: "보도자료" },
];
