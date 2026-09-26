# 배포·운영 설정 가이드

이 문서는 코드 밖에서 **직접 해야 하는 설정**을 순서대로 정리합니다.
비밀번호나 API 키는 이 문서, 코드, 채팅 어디에도 적지 마세요.

## 1. Supabase: DB 만들기 (최초 1회)

1. Supabase 대시보드에서 프로젝트 → **SQL Editor** → **New query**
2. `supabase/migrations/` 폴더의 파일을 **번호 순서대로** 하나씩, 내용 **전체**를 붙여넣고 **Run**
   - `0001_init.sql`: 회원, 공지사항, 입단 신청, 사진 저장소
   - `0002_recruitment_faq_concerts.sql`: 입단 안내, FAQ, 공연 일정
   - `0003_purge_rejected.sql`: 반려된 입단 신청 정보 파기 (반려 즉시 상세 정보 삭제, 5일 후 기록 삭제)
   - `0004_press.sql`: 보도자료 (초기 기사 16건 포함)
   - `0005_singers.sql`: 단원 명부(관리자 전용), 단원 사진 저장소 `singer-photos`(비공개), 공개 '단원 소개'용 통계 함수
   - `0006_retention.sql`: 회원 탈퇴, 퇴단 1년 후 자동 삭제, 사진 삭제 대기열, 매일 새벽 예약 작업(pg_cron)
   - `0007_purge_left_applications.sql`: 퇴단 1년 후 삭제 시 연결된 입단 신청서도 함께 삭제
   - `0008_media_consent.sql`: 초상권(사진·영상) 이용 동의 항목·변경 기록, 보호자 마이페이지 동의 변경
   - `0009_concert_time_tbd.sql`: 공연 시각 미정 표시
   - `0010_gallery.sql`: 사진 갤러리 (앨범·사진, 공개 저장소 `gallery-photos`)
   - `0011_birth_year_join_source.sql`: 출생연도만 아는 단원, 가입경로
   - `0012_optional_birthdate.sql`: 단원 생년월일 선택 입력 (이름·반만으로 등록)
   - `0013_public_names.sql`: 단원 소개에 활동 단원 이름·반 게시 (보호자 요청 시 게시 중단)
   - `0014_public_counts.sql`: 단원 소개에는 반별 인원 수만 제공 (학년·출생연도 비공개)
   - `0015_join_source_options.sql`: 가입경로 선택지 변경 (지인소개·SNS·인터넷 검색·세종리틀싱어즈 공연관람·기타 직접 입력)
   - `0016_consent_note_written.sql`: 초상권 동의 비고 칸 · 기존 단원 서면 동의 반영
   - `0017_application_fields.sql`: 입단 신청서 항목 정리 (성별·원하는 반·사는 동·소개해 준 사람·특이사항, 사진 제외)
   - `0018_audition_songs.sql`: 입단 오디션 지정곡(최대 5곡)과 반주 음원 저장소(audition-songs, 공개)
   - `0019_site_visits.sql`: 방문자 수 (날짜별 방문 수만 저장, 개인정보 없음)
   - `0020_admin_permissions.sql`: 관리자 신청·승인과 메뉴별 권한 (실행 시점의 기존 관리자는 최상위 관리자가 됨)
   - `0021_member_types.sql`: 회원 구분(보호자·운영진). 운영진으로 가입하면 관리자 권한 신청이 함께 접수됨
   - `0022_staff_roles_parent_reps.sql`: 운영진 역할 · 반별 학부모 대표 지정(최상위 관리자)
   - `0023_org_chart.sql`: 운영진 담당 반·승인, 학부모 부대표, 회원 구분 변경, 조직도 표시 방식(예전 고정 ↔ 회원 정보로 자동).
     운영진의 역할·반·세부 담당은 최상위 관리자만 수정, 최상위 관리자는 운영진 회원만 (기존에 보호자로 되어 있던 최상위 관리자는 운영진으로 옮김)
   - `0024_access_hardening.sql`: 보안 점검 반영 — 신청 사진 업로드 권한 삭제, 대기 신청 6개월·명부 미등록 승인 신청 3개월 파기, 일반 관리자 조회 범위 축소, 조직도 이름 잠금, 입단 신청서 이름 게시 동의
3. 성공하면 Table Editor 에 `profiles`, `notices`, `applications`, `recruitment`, `faqs`, `concerts` 테이블이,
   Storage 에 `application-photos` 버킷(비공개)이 생깁니다.
4. 모든 파일은 **여러 번 실행해도 안전**합니다. 이미 있는 것은 건너뛰고 빠진 것만 만들므로, 테이블이 빠졌거나 중간에 오류가 났다면 0001 → 0002 를 다시 실행하면 됩니다.

## 2. Supabase: 로그인 링크 주소 설정

**Authentication → URL Configuration**

| 항목 | 값 |
|---|---|
| Site URL | 실제 사이트 주소 (`https://sejonglittlesingers.com`) |
| Redirect URLs | `https://<실제 사이트 주소>/**` 추가 |

- Vercel 미리보기(Preview) 주소에서도 가입·비밀번호 재설정을 시험하려면 미리보기 주소 패턴도 추가합니다.
  (Vercel 대시보드에서 실제 미리보기 주소를 확인한 뒤 입력)
- 나중에 전용 도메인을 연결하면 그 도메인으로 다시 바꿔 주세요.

## 3. Supabase: 이메일 발송 (정식 오픈 전 필수)

Supabase 기본 메일 발송은 **테스트용**입니다. 발송량이 적게 제한되고 수신 대상에도 제약이 있습니다.
실제 보호자들이 가입하려면 **Authentication → Emails → SMTP Settings** 에서 외부 메일 발송 서비스(SMTP)를 연결해야 합니다.
메일 문구는 `docs/email-templates/README.md` 를 보고 한국어로 바꿉니다.
(정확한 제한 사항은 Supabase 문서에서 최신 내용을 확인하세요.)

### 비밀번호 규칙

홈페이지는 **영문과 숫자를 섞어 10자 이상, 특수문자도 넣으면 8자 이상**을 요구합니다 (`src/lib/password.ts`).
Supabase **Authentication → Sign In / Providers → Email** 의 비밀번호 설정은 이보다 느슨하거나 같게 둡니다.

| 항목 | 값 |
|---|---|
| Minimum password length | `8` |
| Password Requirements | `Letters and digits` |

Supabase 쪽이 더 엄격하면(예: 대문자·특수문자 필수) 홈페이지 규칙을 지킨 비밀번호도 가입이 거절됩니다.

## 4. Vercel: 환경변수

Supabase **Project Settings → API Keys** 에서 값을 복사해
Vercel **Settings → Environment Variables** 에 추가합니다. (Production, Preview 모두 체크)

| 이름 | 값 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Publishable key** (`sb_publishable_...`). 없으면 legacy `anon` 키 |

개인정보 자동 파기(사진 파일 삭제) 예약 작업용으로 아래 두 개를 **Production 에만** 추가합니다.

| 이름 | 값 |
|---|---|
| `SUPABASE_SECRET_KEY` | Supabase **Project Settings → API Keys → Secret keys** 의 키 (`sb_secret_...`) |
| `CRON_SECRET` | 아무도 추측할 수 없는 긴 임의 문자열 (예: 비밀번호 생성기로 만든 40자 이상) |

- 두 값은 **Sensitive** 로 표시하고, 이름에 `NEXT_PUBLIC_` 을 붙이지 않습니다. (브라우저로 보내지지 않음)
- Secret key 는 모든 데이터에 접근할 수 있는 키입니다. 이 두 곳(Supabase, Vercel) 외에는 복사·공유하지 마세요.
- 설정하지 않아도 사이트는 동작하며, 이 경우 사진 파일은 관리자가 대시보드에 접속할 때 삭제됩니다.
- 환경변수를 추가·변경한 뒤에는 **Redeploy** 해야 반영됩니다.

## 5. Vercel: 프레임워크 설정

`vercel.json` 에 `"framework": "nextjs"` 를 지정해 두었으므로 대시보드의 Framework Preset 이 `Other` 여도 Next.js 로 빌드됩니다.
(대시보드에서도 **Settings → Build and Deployment → Framework Preset** 을 **Next.js** 로 맞춰 두면 더 명확합니다.)

`vercel.json` 에 매일 한국 시간 03:30 에 `/api/cron/cleanup` 을 호출하는 예약 작업(Cron)을 등록했습니다.
배포 후 **Settings → Cron Jobs** 에서 확인하고 **Run** 으로 한 번 실행해 볼 수 있습니다.

`vercel.json` 에서 서버 실행 지역을 서울(`icn1`)로 지정했습니다. Supabase(서울)와 가까워 빠르고, 요청 처리도 국내에서 이루어집니다.

## 6. 최초 관리자 지정

1. 사이트에서 관리자로 쓸 계정으로 **운영진 회원가입**(입단 안내 → 운영진 회원가입) → 인증 메일 확인
2. Supabase **SQL Editor** 에서 아래를 실행 (이메일만 바꿔서)

```sql
update public.profiles set role = 'admin', is_super = true, member_type = 'staff' where email = '관리자이메일@example.com';
```

3. 다시 로그인하면 상단에 **관리자** 메뉴가 보입니다. 이후에는 SQL 없이 사이트에서 관리합니다.
   - **관리자 → 운영진 회원**: 관리자 권한 신청 승인(맡길 메뉴 체크), 권한 변경·해제, 운영진 역할·반 수정과 승인, 조직도 표시 방식
   - **관리자 → 보호자 회원**: 보호자 명단, 반별 학부모 대표·부대표 지정, 운영진으로 구분 변경
   - 운영진으로 가입하면 관리자 권한 신청이 자동 접수되고, 보호자는 **마이페이지 → 관리자 권한**에서 신청합니다.
   - 일반 관리자는 체크된 메뉴만 보고 고칠 수 있습니다. 보호자·운영진 회원 관리는 최상위 관리자만 할 수 있습니다.
   - 최상위 관리자는 최상위 관리자만, 운영진 회원에게만 지정할 수 있습니다. 마지막 최상위 관리자는 탈퇴할 수 없으니 2명 이상 두기를 권장합니다.
   - 위 SQL 은 최상위 관리자 계정을 모두 쓸 수 없게 됐을 때 복구용으로도 씁니다.

## 7. 내용 채우기

**관리자 화면에서 입력** (코드 수정 불필요)
- 입단 안내(모집 대상·일정·장소·회비·반 구성·오디션, 모집 중 배너)와 오디션 지정곡(최대 5곡): 관리자 → 입단 안내
- 자주 묻는 질문: 관리자 → FAQ
- 공연 일정(예매 링크, YouTube 영상, 시각 미정): 관리자 → 공연 일정
- 사진 앨범: 관리자 → 사진 갤러리
- 공지사항: 관리자 → 공지사항
- 보도자료(기사 링크): 관리자 → 보도자료
- 단원 명부(엑셀 일괄 등록·내보내기, 사진 명단, 통계, 초상권 동의): 관리자 → 단원 관리
- 조직도의 운영진·학부모 대표: 관리자 → 운영진 회원 / 보호자 회원 (표시 방식은 운영진 회원 화면에서 전환)

**코드에서 수정**

- 연락처·주소·공식 채널·개인정보 보호책임자: `src/lib/site.ts`
- 강사진 소개(약력)·예전(고정) 조직도·반 색상: `src/lib/staff.ts`
- 합창단 소개: `src/app/about/page.tsx`, 연혁: `src/lib/history.ts`
- 홈 대표 문구: `src/app/page.tsx`
- 공연·행사 사진첩(네이버 블로그 글 목록): `src/lib/event-albums.ts`
- 운영진 역할 목록: `src/lib/member-types.ts` (DB 함수 `staff_kind()`·`is_class_role()` 과 함께 바꿔야 함)
- 개인정보처리방침: `src/app/privacy/page.tsx` → 내용을 바꾸면 게시 전 검토

## 8. 정기 운영 (홈페이지 밖에서 직접 할 일)

자동 파기는 매일 새벽 예약 작업이 처리하지만, 아래는 사람이 직접 지워야 합니다. (개인정보처리방침과 같은 기준)

- **오디션 동영상**: 심사 결과를 정한 날부터 30일 이내에 합창단 메일함에서 삭제 (휴지통 포함)
- **인증 메일 발송 기록**: 메일 발송용 Gmail 보낸편지함을 매월 1회 삭제
- 관리자 목록 점검: 활동하지 않는 사람의 관리자 권한 해제

운영진용 자세한 사용법은 별도의 「홈페이지 개발 내용 및 관리 매뉴얼」(Word)을 참고합니다.

## 검색엔진 등록 (네이버·구글)

- 사이트맵: `https://sejonglittlesingers.com/sitemap.xml`, 수집 규칙: `/robots.txt` (관리자·회원 화면 제외)
- 소유 확인은 **HTML 태그** 방식을 고르고, 태그의 `content="..."` 값만 Vercel 환경변수에 넣은 뒤 다시 배포합니다.

| 이름 | 값 |
|---|---|
| `NAVER_SITE_VERIFICATION` | 네이버 서치어드바이저가 준 코드 |
| `GOOGLE_SITE_VERIFICATION` | 구글 서치콘솔(URL 접두어 방식)이 준 코드 |
