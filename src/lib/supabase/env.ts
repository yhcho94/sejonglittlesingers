// Supabase 접속 정보는 Vercel 환경변수에서 읽습니다. (코드에 키를 적지 않습니다)
// NEXT_PUBLIC_ 변수는 빌드할 때 코드에 들어가므로, 환경변수를 바꾼 뒤에는 다시 배포해야 합니다.
export const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
export const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// 설정 안내용: 빠진 변수 이름만 알려줍니다. (값은 노출하지 않음)
export const missingSupabaseEnv = [
  !supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
  !supabaseKey && "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
].filter(Boolean) as string[];
