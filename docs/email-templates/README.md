# 인증 메일 한국어 문구

Supabase **Authentication → Emails → Templates** 에서 항목별로 제목(Subject)과 본문(Message body)을 바꿉니다.
본문은 각 `.html` 파일 내용 전체를 복사해 붙여 넣고 **Save changes** 를 누릅니다.
`{{ .SiteURL }}`, `{{ .TokenHash }}`, `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}` 은 Supabase 가 실제 값으로 바꿔 넣으므로 그대로 둡니다.

가입 인증·비밀번호 재설정 메일의 버튼은 `{{ .SiteURL }}/auth/callback?token_hash=…` 형식입니다.
요청한 브라우저가 아닌 곳(휴대폰 메일 앱, 다른 기기, 관리자가 대신 보낸 재설정 메일)에서 열어도 동작합니다.
그래서 **Authentication → URL Configuration 의 Site URL 이 실제 사이트 주소**(`https://sejonglittlesingers.com`)여야 합니다.

| 템플릿 | 제목(Subject) | 본문 파일 |
|---|---|---|
| Confirm signup | `[세종리틀싱어즈] 회원가입 이메일 인증` | `confirm-signup.html` |
| Reset password | `[세종리틀싱어즈] 비밀번호 재설정 안내` | `reset-password.html` |
| Change email address | `[세종리틀싱어즈] 이메일 주소 변경 확인` | `change-email.html` |

바꾼 뒤 비밀번호 재설정을 한 번 요청해 메일이 제대로 오는지 확인합니다.
