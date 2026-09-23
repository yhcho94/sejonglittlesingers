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
3. 성공하면 Table Editor 에 `profiles`, `notices`, `applications`, `recruitment`, `faqs`, `concerts` 테이블이,
   Storage 에 `application-photos` 버킷(비공개)이 생깁니다.
4. 모든 파일은 **여러 번 실행해도 안전**합니다. 이미 있는 것은 건너뛰고 빠진 것만 만들므로, 테이블이 빠졌거나 중간에 오류가 났다면 0001 → 0002 를 다시 실행하면 됩니다.

## 2. Supabase: 로그인 링크 주소 설정

**Authentication → URL Configuration**

| 항목 | 값 |
|---|---|
| Site URL | 실제 사이트 주소 (예: `https://sejonglittlesingers.vercel.app`) |
| Redirect URLs | `https://<실제 사이트 주소>/**` 추가 |

- Vercel 미리보기(Preview) 주소에서도 가입·비밀번호 재설정을 시험하려면 미리보기 주소 패턴도 추가합니다.
  (Vercel 대시보드에서 실제 미리보기 주소를 확인한 뒤 입력)
- 나중에 전용 도메인을 연결하면 그 도메인으로 다시 바꿔 주세요.

## 3. Supabase: 이메일 발송 (정식 오픈 전 필수)

Supabase 기본 메일 발송은 **테스트용**입니다. 발송량이 적게 제한되고 수신 대상에도 제약이 있습니다.
실제 보호자들이 가입하려면 **Authentication → Emails → SMTP Settings** 에서 외부 메일 발송 서비스(SMTP)를 연결해야 합니다.
(정확한 제한 사항은 Supabase 문서에서 최신 내용을 확인하세요.)

## 4. Vercel: 환경변수

Supabase **Project Settings → API Keys** 에서 값을 복사해
Vercel **Settings → Environment Variables** 에 추가합니다. (Production, Preview 모두 체크)

| 이름 | 값 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Publishable key** (`sb_publishable_...`). 없으면 legacy `anon` 키 |

- **secret 키 / service_role 키는 넣지 않습니다.** 이 사이트는 그 키 없이 동작합니다.
- 환경변수를 추가·변경한 뒤에는 **Redeploy** 해야 반영됩니다.

## 5. Vercel: 프레임워크 설정

`vercel.json` 에 `"framework": "nextjs"` 를 지정해 두었으므로 대시보드의 Framework Preset 이 `Other` 여도 Next.js 로 빌드됩니다.
(대시보드에서도 **Settings → Build and Deployment → Framework Preset** 을 **Next.js** 로 맞춰 두면 더 명확합니다.)

`vercel.json` 에서 서버 실행 지역을 서울(`icn1`)로 지정했습니다. Supabase(서울)와 가까워 빠르고, 요청 처리도 국내에서 이루어집니다.

## 6. 최초 관리자 지정

1. 사이트에서 관리자로 쓸 계정으로 **회원가입** → 인증 메일 확인
2. Supabase **SQL Editor** 에서 아래를 실행 (이메일만 바꿔서)

```sql
update public.profiles set role = 'admin' where email = '관리자이메일@example.com';
```

3. 다시 로그인하면 상단에 **관리자** 메뉴가 보입니다.
   이후 관리자 추가·해제는 사이트의 **관리자 → 회원 관리** 화면에서 할 수 있습니다.

## 7. 내용 채우기

**관리자 화면에서 입력** (코드 수정 불필요)
- 입단 안내(모집 대상·일정·장소·회비·반 구성·오디션, 모집 중 배너): 관리자 → 입단 안내
- 자주 묻는 질문: 관리자 → FAQ
- 공연 일정(예매 링크, YouTube 영상): 관리자 → 공연 일정
- 공지사항: 관리자 → 공지사항
- 보도자료(기사 링크): 관리자 → 보도자료

**코드에서 수정** — 사이트 곳곳의 **노란 점선 상자(입력 필요)** 는 실제 정보로 바꿔야 하는 자리입니다.

- 연락처·주소·개인정보 보호책임자: `src/lib/site.ts`
- 소개·연혁·지휘자: `src/app/about/page.tsx`
- 대표 문구·입단 안내: `src/app/page.tsx`
- 개인정보처리방침(초안): `src/app/privacy/page.tsx` → **게시 전 법률 검토 필요**
