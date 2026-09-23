import ExcelJS from "exceljs";

// 엑셀 파일 만들기·읽기 (서버에서만 사용)

type Row = Record<string, string | number>;

const HEADER_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF16224D" } };

// 시트 이름: 31자 이내, 일부 특수문자 금지, 중복 불가
function sheetName(label: string, used: Set<string>) {
  const base = label.replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "시트";
  let name = base;
  for (let i = 2; used.has(name); i++) name = `${base.slice(0, 26)} (${i})`;
  used.add(name);
  return name;
}

function addSheet(wb: ExcelJS.Workbook, name: string, rows: Row[], columns: string[]) {
  const ws = wb.addWorksheet(name, { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = columns.map((c) => ({ header: c, key: c, width: Math.max(8, c.length * 2 + 4) }));
  for (const r of rows) ws.addRow(r);
  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = HEADER_FILL;
  header.alignment = { vertical: "middle" };
  if (rows.length) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
  // 내용 길이에 맞춰 열 너비 조정 (한글은 2칸으로 계산)
  ws.columns.forEach((col) => {
    let max = 6;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const text = String(cell.value ?? "");
      const width = [...text].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x2e80 ? 2 : 1), 0);
      max = Math.max(max, width);
    });
    col.width = Math.min(max + 2, 50);
  });
  return ws;
}

/**
 * 명부 엑셀. 첫 시트는 전체, 묶음 보기면 묶음마다 시트를 하나씩 더 만듭니다.
 * 셀 값은 문자열·숫자로만 넣으므로 '=' 로 시작하는 글자도 수식으로 실행되지 않습니다.
 */
export async function rosterWorkbook(groups: { label: string; rows: Row[] }[], columns: string[], groupColumn?: string) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "세종리틀싱어즈";
  wb.created = new Date();
  const used = new Set<string>();

  const all = groups.flatMap((g) => (groupColumn ? g.rows.map((r) => ({ [groupColumn]: g.label, ...r })) : g.rows));
  addSheet(wb, sheetName("전체", used), all, groupColumn ? [groupColumn, ...columns] : columns);
  if (groupColumn) for (const g of groups) addSheet(wb, sheetName(g.label, used), g.rows, columns);

  return Buffer.from(await wb.xlsx.writeBuffer());
}

export async function templateWorkbook(columns: string[], example: Row, notes: string[]) {
  const wb = new ExcelJS.Workbook();
  const ws = addSheet(wb, "단원 입력", [example], columns);
  ws.getRow(2).font = { color: { argb: "FF888888" }, italic: true };
  // 날짜·연락처 열은 글자로 입력되도록 (엑셀이 자동으로 날짜·숫자로 바꾸지 않게)
  ws.columns.forEach((col) => {
    col.numFmt = "@";
    col.width = Math.max(col.width ?? 10, 14);
  });
  const help = wb.addWorksheet("작성 안내");
  help.getColumn(1).width = 100;
  notes.forEach((n, i) => (help.getCell(i + 1, 1).value = n));
  help.getRow(1).font = { bold: true, size: 13 };
  return Buffer.from(await wb.xlsx.writeBuffer());
}

// 셀 값을 글자로 (날짜 셀은 YYYY-MM-DD)
function cellText(v: ExcelJS.CellValue): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "object") {
    if ("text" in v && typeof v.text === "string") return v.text; // 하이퍼링크
    if ("richText" in v) return v.richText.map((t) => t.text).join("");
    if ("result" in v) return cellText(v.result as ExcelJS.CellValue); // 수식은 계산 결과만
    return "";
  }
  return String(v).trim();
}

// 첫 시트를 {머리글: 값} 목록으로. 빈 줄은 건너뜁니다.
export async function readSheet(data: ArrayBuffer, maxRows = 1000) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(data);
  const ws = wb.worksheets[0];
  if (!ws) return { headers: [] as string[], rows: [] as { line: number; values: Record<string, string> }[] };
  const headers: string[] = [];
  ws.getRow(1).eachCell({ includeEmpty: true }, (cell, col) => (headers[col - 1] = cellText(cell.value).replace(/\s*\*$/, "")));
  const rows: { line: number; values: Record<string, string> }[] = [];
  ws.eachRow({ includeEmpty: false }, (row, line) => {
    if (line === 1 || rows.length >= maxRows + 1) return;
    const values: Record<string, string> = {};
    headers.forEach((h, i) => {
      if (h) values[h] = cellText(row.getCell(i + 1).value);
    });
    if (Object.values(values).some(Boolean)) rows.push({ line, values });
  });
  return { headers, rows };
}
