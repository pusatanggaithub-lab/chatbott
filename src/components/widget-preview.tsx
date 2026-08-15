import { useState } from "react";

export const ICON_OPTIONS: Record<string, string> = {
  chat: "M12 3C7 3 3 6.6 3 11c0 2.4 1.2 4.5 3.2 5.9L5.5 21l4.3-2.2c.7.1 1.4.2 2.2.2 5 0 9-3.6 9-8s-4-8-9-8Z",
  bot: "M12 2v3m-7 4h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z",
  help: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 15h.01M12 8a2 2 0 0 1 1 3.7c-.6.4-1 .8-1 1.3",
};

type Props = {
  botName: string;
  welcome: string;
  color: string;
  iconType: string;
  iconUrl?: string;
};

export function WidgetPreview({ botName, welcome, color, iconType, iconUrl }: Props) {
  const [open, setOpen] = useState(true);
  const safeColor = /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#0F8A78";

  return (
    <div className="absolute inset-0 flex flex-col items-end justify-end p-6">
      {open && (
        <div className="mb-3 flex h-[400px] w-[320px] max-w-full flex-col overflow-hidden rounded-[18px] bg-white shadow-2xl">
          <div className="px-4 py-3 text-sm font-bold text-white" style={{ background: safeColor }}>
            {botName || "Asisten AI"}
          </div>
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto bg-[#F5F8F7] p-3.5">
            <div className="max-w-[80%] self-start rounded-[14px] rounded-tl-sm bg-white px-3 py-2 text-sm text-[#10201E] shadow-sm">
              {welcome || "Halo! Ada yang bisa saya bantu?"}
            </div>
            <div
              className="max-w-[80%] self-end rounded-[14px] rounded-tr-sm px-3 py-2 text-sm text-white"
              style={{ background: safeColor }}
            >
              Jam buka kapan?
            </div>
          </div>
          <div className="flex gap-2 border-t border-[#E2EAE8] bg-white p-2.5">
            <div className="flex-1 rounded-full border border-[#D2DEDB] px-3.5 py-2 text-sm text-[#9AA9A6]">
              Ketik pesan...
            </div>
            <div
              className="rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ background: safeColor }}
            >
              Kirim
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-[60px] w-[60px] items-center justify-center rounded-full shadow-xl"
        style={{ background: safeColor }}
        aria-label="Toggle pratinjau widget"
      >
        {iconType === "custom" && iconUrl ? (
          <img src={iconUrl} alt="Ikon widget" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
            <path d={ICON_OPTIONS[iconType] ?? ICON_OPTIONS['chat']} />
          </svg>
        )}
      </button>
    </div>
  );
}
