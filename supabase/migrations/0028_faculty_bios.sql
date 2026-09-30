-- 강사진 소개 약력을 DB 로: 최상위 관리자가 관리자 → 강사진 소개에서, 선생님 본인이 마이페이지 → 강사 프로필에서 수정
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다. (0027 다음에 실행)
--
-- 1) faculty_bios: 강사 한 명당 한 줄 (이름·역할·담당 반·순서·항목별 약력(JSON)·개인 홈페이지)
--    누구나 읽을 수 있음(공개 화면). 삭제와 이름·역할·반·순서 변경은 최상위 관리자만
-- 2) 선생님 본인 수정: 강사 역할의 운영진 회원으로 조직도 게시가 승인되었고, 이름이 같은 줄의 약력·홈페이지만
--    (승인된 이름은 본인이 바꿀 수 없음 — 0024). 강사진 소개에 없으면 회원 정보(이름·역할·반) 그대로 본인 줄 추가 가능
-- 3) 지금 홈페이지 강사진 소개 내용을 기본값으로 넣음 (이미 있는 사람은 건드리지 않음 → 다시 실행해도 수정한 내용 유지)

-- 강사진 소개에 나오는 역할 (src/lib/staff-bio.ts 의 FACULTY_ROLES 와 같아야 합니다)
create or replace function public.is_faculty_role(role_name text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(role_name in ('단장', '지휘자', '부지휘자', '반주자', '보컬트레이너', '이론선생님', '사무국장'), false);
$$;

create table if not exists public.faculty_bios (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 50),
  role text not null check (char_length(role) between 1 and 30),
  class_name text check (class_name is null or char_length(class_name) <= 20),
  sort_order integer not null default 0,
  sections jsonb not null default '{}'::jsonb
    check (jsonb_typeof(sections) = 'object' and octet_length(sections::text) <= 20000),
  website text check (website is null or (char_length(website) <= 300 and website ~ '^https?://[^[:space:]<>"]+$')),
  updated_at timestamptz not null default now(),
  constraint faculty_bios_name_role unique (name, role)
);
alter table public.faculty_bios enable row level security;

-- 로그인한 사람이 이 이름의 강사 본인인지 (승인된 강사 역할 운영진 회원)
create or replace function public.is_own_faculty_name(bio_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and member_type in ('teacher', 'staff')
      and public.is_faculty_role(staff_role)
      and org_visible
      and guardian_name = bio_name
  );
$$;
revoke execute on function public.is_own_faculty_name(text) from public, anon;
grant execute on function public.is_own_faculty_name(text) to authenticated;

-- 승인된 선생님이 강사진 소개에 없을 때 본인 줄을 만들 수 있는지 (이름·역할·반이 회원 정보와 같아야 함)
create or replace function public.can_add_own_faculty(bio_name text, bio_role text, bio_class text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and member_type in ('teacher', 'staff')
      and public.is_faculty_role(staff_role)
      and org_visible
      and guardian_name = bio_name
      and staff_role = bio_role
      and staff_class is not distinct from bio_class
  );
$$;
revoke execute on function public.can_add_own_faculty(text, text, text) from public, anon;
grant execute on function public.can_add_own_faculty(text, text, text) to authenticated;

drop policy if exists "강사진 소개 공개 조회" on public.faculty_bios;
create policy "강사진 소개 공개 조회" on public.faculty_bios
  for select to anon, authenticated
  using (true);

drop policy if exists "최상위 관리자 강사진 추가" on public.faculty_bios;
create policy "최상위 관리자 강사진 추가" on public.faculty_bios
  for insert to authenticated
  with check ((select public.is_admin()) or public.can_add_own_faculty(name, role, class_name));

drop policy if exists "최상위 관리자·본인 강사진 수정" on public.faculty_bios;
create policy "최상위 관리자·본인 강사진 수정" on public.faculty_bios
  for update to authenticated
  using ((select public.is_admin()) or public.is_own_faculty_name(name))
  with check ((select public.is_admin()) or public.is_own_faculty_name(name));

drop policy if exists "최상위 관리자 강사진 삭제" on public.faculty_bios;
create policy "최상위 관리자 강사진 삭제" on public.faculty_bios
  for delete to authenticated
  using ((select public.is_admin()));

revoke all on public.faculty_bios from anon, authenticated;
grant select on public.faculty_bios to anon, authenticated;
grant insert, update, delete on public.faculty_bios to authenticated;

-- 선생님 본인은 약력·홈페이지만 (이름·역할·반·순서는 최상위 관리자만)
create or replace function public.guard_faculty_bio()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  if not public.is_admin()
     and (new.name, new.role, new.class_name, new.sort_order) is distinct from (old.name, old.role, old.class_name, old.sort_order) then
    raise exception 'faculty_fields_locked';
  end if;
  return new;
end;
$$;
revoke execute on function public.guard_faculty_bio() from public, anon, authenticated;

drop trigger if exists faculty_bios_guard on public.faculty_bios;
create trigger faculty_bios_guard
  before update on public.faculty_bios
  for each row execute function public.guard_faculty_bio();

-- 기본값: 지금 홈페이지 강사진 소개 (합창단 제공 약력)
insert into public.faculty_bios (name, role, class_name, sort_order, sections, website) values
  ('지정윤', '단장 · 상임지휘자', null, 10, '{"education":["이태리 Pescarese 시립음악원 최고연주자과정 성악전공 졸업","이태리 Pescarese 시립음악원 ''Canto spagnolo'' 수료","미국 Washington D.C The Theatre Lab School of Dramatic Arts Musical 연기 과정 수료","숙명여자대학교 음악대학 성악과 석사 졸업"],"performances":["이태리 Pescara 독창회 연주","논산시예총 음악협회 후원 독창회 개최","세종시 문화재단 전문예술가지원사업 선정 독창회 개최","세종시 문화재단 청년예술가지원사업 선정 독창회 개최"],"awards":["World choir games (세계합창대회) 어린이합창부분 Silver Diploma 수상","세종시 예술인상 수상","세종시 교육감상 수상 (119 소방동요대회 대상 지도자상)","강경포구 전국 어린이 동요대회 지도자상 수상"],"career":["준 시어터 소속 뮤지컬 배우 및 팝페라 가수 활동","계룡시어린이뮤지컬 합창단 상임 지휘자 역임","경찰대학교 강사역임","세종하모니앙상블 대표역임","세종사계절하모니합창단 지휘자 역임"],"current":["세종드림예술기획 대표","세종리틀싱어즈 단장 및 상임지휘자","싱싱콰이어 지휘자","클래시컬쇼콰이어그룹 튀김소보체 단원","세종시 음악협회 회원","세종생활음악협회 사무국장","전문연주자로 왕성하게 활동중"]}'::jsonb, 'https://sopranoji.vercel.app/'),
  ('오승하', '부지휘자', '울림반', 20, '{"education":["중앙대학교 음악대학 피아노과 졸업","가톨릭대학교 교회음악대학원 지휘과 휴학"],"career":["서울레이디스 싱어즈 단원","호평성당 성가대 지휘자","다수의 음악학원 강사 및 원장 역임"]}'::jsonb, null),
  ('김연주', '부지휘자', '화음반', 30, '{"education":["대전침례신학대학교 성악과 졸업 및 동 대학원 졸업"],"career":["청주시립합창단 객원역임","서산시립합창단 단원역임"],"current":["대전아트콰이어 소프라노 단원으로 활동 중","세종산울초등학교, 마을학교, 세종지역학습장 합창 지도"]}'::jsonb, null),
  ('서지선', '부지휘자', '선율반', 40, '{"education":["동덕여자대학교 음악학과 성악과 졸업","미국 Temple University 성악과 석사 졸업"],"career":["라루체합창단 솔리스트","대전 맹학교 음악 강사","세종사계절하모니합창단 부지휘자"],"current":["유성구 여성합창단 솔리스트","킨더뮤직코리아 객원 연구원","전문 연주자로 활동 중"]}'::jsonb, null),
  ('정연수', '반주자', '울림반', 50, '{"education":["대전예술고등학교 피아노과 졸업","목원대학교 피아노과 졸업","목원대학교 반주과 석사과정 재학 중"],"current":["너울가지 합창단 반주자"]}'::jsonb, null),
  ('박선희', '반주자', '화음반', 60, '{"education":["충남대학교 음악대학 피아노 전공 졸업"],"career":["다수 피아노학원 강사 역임","천주교 아시아 청년대회, 세계 청년대회 미사 반주자 역임","아름다운합창단 반주자 역임"],"current":["세종 싱투게더콰이어 대표"]}'::jsonb, null),
  ('배성희', '반주자', '선율반', 70, '{"education":["목원대학교 건반학부 실기장학생 졸업","Italy Firenze Art 피아노 Diploma 수료","수원대학교 일반대학원 반주학과 석사 졸업","한세대학교 일반대학원 반주학과 박사과정 재학 중"],"current":["Da름 공연예술단체 대표","대덕문화관광재단 비상임이사","대전광역시 서구청 청년예술위원","반월합창단 반주자"]}'::jsonb, null),
  ('최오늘', '이론선생님', '울림반', 80, '{"education":["배재대 실용음악과 보컬전공 졸업 (부전공: 재즈피아노, 작곡)"],"activities":["3인 3색 콘서트 (조성모, 임태경) 코러스","voice to voice 콘서트 (김태우, 윤종신, 케이윌) 코러스","한국 오르프아트 연구소 동요 CD 보컬 녹음","풀꽃 문학상 시상식 및 사랑 콘서트 공연","헤리티지 가스펠 스쿨 정규과정 소프라노/파트장으로 수료","서구다문화센터에서 주관한 ‘글로벌브릿지’ 프로그램에서 다문화 학생들 보컬 지도","세종시 두루고등학교 방과후 학교에서 보컬지도","유천초등학교에서 열린 우리동네 행복축제에서 공연","세종시 거리예술가 연주"]}'::jsonb, null),
  ('전하영', '이론선생님', '화음반', 90, '{"education":["전주대학교 음악대학 졸업"],"certificates":["우쿨렐레지도자 2급 자격증","뮤직플러스 아동 음악 연구회 수료"],"career":["양지 어린이집, 나성 어린이집 음악강사역임"],"current":["소담유치원, 한빛 유치원, 바른 유치원 음악 강사"]}'::jsonb, null),
  ('조애린', '이론선생님', '선율반', 100, '{"education":["목원대학교 피아노 전공 졸업","목원대학교 일반대학원 음악대학 반주전공 졸업"],"current":["좋아해 피아노 대표","Ensemble Comodo 대표","앙상블 소리마루 대표","퓨전국악실내악단 헤이락 단원"],"career":["꿈다락문화예술학교(어린이 방송국, 세종키즈TV) 문화예술강사 역임","세종문화관광재단 <일상 모아 예술제> 문화예술강사 역임","딩동댕문화예술학교 <즐거운 나의 집> 문화예술강사 역임","세종문화관광재단 유아 문화예술교육 보육자 연수 문화예술강사 역임","한글 반딧불이 집현전 문화예술교육 주간행사 문화예술강사 역임","세종문화관광재단 한글 시민상상 문화거리 문화예술강사 역임"],"certificates":["예술융합교육지도사 자격 취득","음악심리상담사 1급 자격 취득","문화예술교육사 2급 자격 취득","온라인 음악튜터 2급 자격 취득"]}'::jsonb, null),
  ('박성희', '사무국장', null, 110, '{"education":["사회복지학 행정학사 수료"],"career":["아동복지시설 사무원","직장어린이집 사무원","고등학교 교무행정사","중학교 교무행정사"],"certificates":["컴퓨터활용능력 2급","컴퓨터그래픽스운용기능사"]}'::jsonb, null)

on conflict (name, role) do nothing;
