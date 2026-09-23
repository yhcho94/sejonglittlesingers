// 사이트 공통 정보.
// "[입력 필요]" 로 표시된 값은 실제 정보로 교체해야 합니다. 임의로 지어낸 정보를 넣지 않습니다.
export const site = {
  name: "세종리틀싱어즈",
  nameEn: "Sejong Little Singers",
  description: "음악을 통해 아이들의 감성과 협동심을 키우는 세종시 어린이 합창단, 세종리틀싱어즈 공식 홈페이지",
  // 공식 채널
  links: {
    cafe: "https://cafe.naver.com/sejonglittlesingers",
    youtube: `https://www.youtube.com/${encodeURIComponent("@세종리틀싱어즈")}`,
  },
  contact: {
    phone: "010-9294-2612",
    email: "jjyy1340@naver.com",
    address: "세종특별자치시 소담동 복합커뮤니티센터",
  },
  // 개인정보처리방침에 표시할 개인정보 보호책임자
  privacyOfficer: {
    name: "지정윤",
    contact: "010-9294-2612",
  },
};

export const TODO = "[입력 필요]";

// 전화·지도 링크용
export const telHref = `tel:${site.contact.phone.replaceAll("-", "")}`;
export const mailHref = `mailto:${site.contact.email}`;
export const mapHref = `https://map.naver.com/p/search/${encodeURIComponent(site.contact.address)}`;
