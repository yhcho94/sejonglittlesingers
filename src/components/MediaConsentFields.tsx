import { MEDIA_ITEMS, MEDIA_NOTICE, type MediaKey } from "@/lib/media-consent";

// 초상권 동의 체크박스 (폼 필드 이름: media_channels / media_press / media_name)
export function MediaConsentFields({
  defaults = {},
  showNotice = true,
  idPrefix = "media",
}: {
  defaults?: Partial<Record<MediaKey, boolean>>;
  showNotice?: boolean;
  idPrefix?: string;
}) {
  return (
    <div className="space-y-3 text-sm">
      {showNotice && (
        <ul className="list-disc space-y-1 pl-5 text-ink-soft">
          {MEDIA_NOTICE.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      {MEDIA_ITEMS.map((item, i) => (
        <label key={item.key} htmlFor={`${idPrefix}-${item.key}`} className="flex items-start gap-2">
          <input
            id={`${idPrefix}-${item.key}`}
            type="checkbox"
            name={`media_${item.key}`}
            defaultChecked={defaults[item.key] ?? false}
            className="mt-1"
          />
          <span>
            <strong className="font-medium">
              (선택) {"①②③"[i]} {item.label}
            </strong>{" "}
            <span className="text-ink-soft">— {item.text}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

