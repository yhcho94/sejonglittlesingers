// 비밀번호 규칙: Supabase Authentication 설정과 같게 유지합니다.
// (Minimum password length 8 · Lowercase, uppercase letters, digits and symbols)
export const PASSWORD_MIN = 8;
export const PASSWORD_HINT = "8자 이상, 영문 대문자·소문자·숫자·특수문자를 각각 1개 이상";

// Supabase 가 특수문자로 인정하는 문자
const SYMBOLS = "!@#$%^&*()_+-=[]{};'\\:\"|<>?,./`~";

export function passwordProblem(password: string) {
  const missing = [
    !/[a-z]/.test(password) && "영문 소문자",
    !/[A-Z]/.test(password) && "영문 대문자",
    !/[0-9]/.test(password) && "숫자",
    ![...password].some((ch) => SYMBOLS.includes(ch)) && "특수문자",
  ].filter(Boolean);
  if (password.length < PASSWORD_MIN) return `비밀번호는 ${PASSWORD_MIN}자 이상이어야 합니다.`;
  if (missing.length) return `비밀번호에 ${missing.join("·")}를 포함해 주세요.`;
  return null;
}
