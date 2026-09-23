const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

const concertFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23", // 오전/오후 표기는 서버 환경마다 달라질 수 있어 24시간제로 통일
});

export function formatConcertDate(value: string) {
  return concertFormatter.format(new Date(value));
}

// 한국 시간 기준 월/일 (공연 카드용)
export function concertDateParts(value: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { year: get("year"), month: get("month"), day: get("day") };
}

// DB 시각(ISO) → <input type="datetime-local"> 값 (한국 시간)
export function toKstInputValue(value: string) {
  const kst = new Date(new Date(value).getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 16);
}

// <input type="datetime-local"> 값(한국 시간) → ISO. 형식이 틀리면 null
export function fromKstInputValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00+09:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
