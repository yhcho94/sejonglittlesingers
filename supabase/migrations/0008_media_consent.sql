-- 초상권(사진·영상) 이용 동의
-- 0001~0007 을 실행한 뒤 SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
--
-- 선택 동의 3가지 (항목별로 따로 동의·철회)
--   ① consent_media_channels : 공연·활동 사진·영상을 합창단 공식 채널(홈페이지·유튜브·블로그·카페)과
--                              앨범·뮤직비디오에 게시
--   ② consent_media_press    : 언론 보도 자료·외부 홍보물(포스터·리플릿 등)에 사용
--   ③ 이름 표시               : 게시물·영상 자막과 홈페이지 '단원 소개'에 이름 표시
--                              (단원 명부는 기존 name_public 컬럼을 그대로 사용)
-- 입단 신청 때 받고, 단원 등록 시 명부로 옮기며, 보호자가 마이페이지에서 언제든 바꿀 수 있습니다.
-- 모든 변경은 동의 기록(media_consent_log)에 남습니다.

-- ─────────────────────────────────────────────
-- 입단 신청서
-- ─────────────────────────────────────────────
alter table public.applications
  add column if not exists consent_media_channels boolean not null default false,
  add column if not exists consent_media_press boolean not null default false,
  add column if not exists consent_media_name boolean not null default false,
  add column if not exists consent_media_version text check (char_length(consent_media_version) <= 40);

grant insert (consent_media_channels, consent_media_press, consent_media_name, consent_media_version)
  on public.applications to authenticated;

-- ─────────────────────────────────────────────
-- 단원 명부
-- ─────────────────────────────────────────────
alter table public.singers
  add column if not exists consent_media_channels boolean not null default false,
  add column if not exists consent_media_press boolean not null default false,
  add column if not exists consent_version text check (char_length(consent_version) <= 40),
  add column if not exists consent_updated_at timestamptz;

-- 동의 기록 (증빙). 단원 정보가 삭제되면 함께 삭제됩니다.
create table if not exists public.media_consent_log (
  id bigint generated always as identity primary key,
  singer_id bigint not null references public.singers (id) on delete cascade,
  channels boolean not null,
  press boolean not null,
  name boolean not null,
  version text,
  changed_by uuid,              -- 변경한 사람 (회원 id)
  by_guardian boolean not null, -- 보호자가 직접 변경했는지 (아니면 관리자 입력)
  created_at timestamptz not null default now()
);

create index if not exists media_consent_log_singer_idx on public.media_consent_log (singer_id, created_at desc);

alter table public.media_consent_log enable row level security;

drop policy if exists "관리자 조회" on public.media_consent_log;
create policy "관리자 조회" on public.media_consent_log
  for select to authenticated
  using ((select public.is_admin()));

revoke all on public.media_consent_log from anon, authenticated;
grant select on public.media_consent_log to authenticated;

-- 동의 항목이 바뀌면 변경 시각을 기록
create or replace function public.touch_singer_consent()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT'
     or new.consent_media_channels is distinct from old.consent_media_channels
     or new.consent_media_press is distinct from old.consent_media_press
     or new.name_public is distinct from old.name_public then
    new.consent_updated_at := now();
  end if;
  return new;
end;
$$;

create or replace trigger singers_consent_touch
  before insert or update on public.singers
  for each row execute function public.touch_singer_consent();

-- 동의 항목이 바뀌면 기록 남기기
create or replace function public.log_singer_consent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT'
     or new.consent_media_channels is distinct from old.consent_media_channels
     or new.consent_media_press is distinct from old.consent_media_press
     or new.name_public is distinct from old.name_public then
    insert into public.media_consent_log (singer_id, channels, press, name, version, changed_by, by_guardian)
    values (
      new.id, new.consent_media_channels, new.consent_media_press, new.name_public, new.consent_version,
      auth.uid(), coalesce(auth.uid() = new.guardian_id, false)
    );
  end if;
  return null;
end;
$$;

revoke execute on function public.log_singer_consent() from public, anon, authenticated;

create or replace trigger singers_consent_log
  after insert or update on public.singers
  for each row execute function public.log_singer_consent();

-- ─────────────────────────────────────────────
-- 보호자용: 내 자녀 단원 조회 · 동의 변경 (본인과 연결된 단원만)
-- ─────────────────────────────────────────────
create or replace function public.my_singers()
returns table (
  id bigint, name text, class_name text, status text,
  consent_media_channels boolean, consent_media_press boolean, name_public boolean,
  consent_updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select s.id, s.name, s.class_name, s.status,
         s.consent_media_channels, s.consent_media_press, s.name_public, s.consent_updated_at
  from public.singers s
  where s.guardian_id = auth.uid()
  order by s.name;
$$;

create or replace function public.set_my_media_consent(
  p_singer_id bigint, p_channels boolean, p_press boolean, p_name boolean, p_version text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  if p_version is null or char_length(p_version) > 40 then
    raise exception 'bad_version';
  end if;
  update public.singers
  set consent_media_channels = coalesce(p_channels, false),
      consent_media_press = coalesce(p_press, false),
      name_public = coalesce(p_name, false),
      consent_version = p_version
  where id = p_singer_id and guardian_id = auth.uid();
  if not found then
    raise exception 'not_your_singer';
  end if;
end;
$$;

revoke execute on function public.my_singers() from public, anon;
revoke execute on function public.set_my_media_consent(bigint, boolean, boolean, boolean, text) from public, anon;
grant execute on function public.my_singers() to authenticated;
grant execute on function public.set_my_media_consent(bigint, boolean, boolean, boolean, text) to authenticated;
