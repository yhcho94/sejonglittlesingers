import { getCurrentUser } from "@/lib/auth";
import { IMPORT_COLUMNS, IMPORT_EXAMPLE, IMPORT_NOTES } from "@/lib/singers-import";
import { templateWorkbook } from "@/lib/singers-xlsx";

// 일괄 등록용 빈 양식
export async function GET() {
  const current = await getCurrentUser();
  if (current?.profile?.role !== "admin") return new Response("관리자만 내려받을 수 있습니다.", { status: 403 });
  const body = await templateWorkbook([...IMPORT_COLUMNS], IMPORT_EXAMPLE, IMPORT_NOTES);
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="singers_template.xlsx"; filename*=UTF-8''${encodeURIComponent("세종리틀싱어즈_단원등록양식.xlsx")}`,
      "Cache-Control": "private, no-store",
    },
  });
}
