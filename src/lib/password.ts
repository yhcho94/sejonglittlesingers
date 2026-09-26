// 비밀번호 규칙: 영문·숫자를 섞어 10자 이상, 또는 특수문자까지 섞으면 8자 이상 (대문자는 필요 없음)
// (2종류 10자 이상 또는 3종류 8자 이상. 휴대폰에서도 입력하기 쉽도록 대·소문자 구분 조건은 두지 않음)
// Supabase Authentication 설정은 이보다 느슨하거나 같아야 합니다:
// Minimum password length 8 · Password requirements "Letters and digits"
export const PASSWORD_MIN = 8;
export const PASSWORD_MIN_WITHOUT_SYMBOL = 10;
export const PASSWORD_HINT = "영문과 숫자를 섞어 10자 이상 (특수문자도 넣으면 8자 이상)";

// Supabase 가 특수문자로 인정하는 문자
const SYMBOLS = "!@#$%^&*()_+-=[]{};'\\:\"|<>?,./`~";

export function passwordProblem(password: string) {
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = [...password].some((ch) => SYMBOLS.includes(ch));
  if (password.length < PASSWORD_MIN) return `비밀번호는 ${PASSWORD_MIN}자 이상이어야 합니다.`;
  if (!hasLetter || !hasDigit) return "비밀번호에 영문과 숫자를 모두 넣어 주세요.";
  if (!hasSymbol && password.length < PASSWORD_MIN_WITHOUT_SYMBOL) {
    return `특수문자 없이 만들려면 ${PASSWORD_MIN_WITHOUT_SYMBOL}자 이상이어야 합니다. (특수문자를 넣으면 ${PASSWORD_MIN}자 이상)`;
  }
  return null;
}
