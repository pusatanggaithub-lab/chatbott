import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard/embed")({
  component: EmbedPage,
});

const WIDGET_SRC = "https://chattbott-lilac.vercel.app/widget.js";

function EmbedPage() {
  const profile = useProfile();
  const [copied, setCopied] = useState<string | null>(null);
  const apiKey = profile.data?.api_key ?? "";
  const snippet = `<script src="${WIDGET_SRC}" data-api-key="${apiKey || "API_KEY_ANDA"}"></script>`;

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      toast.success("Disalin ke clipboard.");
      setTimeout(() => setCopied(null), 1800);
    } catch {
      toast.error("Gagal menyalin. Salin manual ya.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Embed Script</h1>
        <p className="text-sm text-muted-foreground">
          Tempel kode di bawah tepat sebelum tag <code>&lt;/body&gt;</code> pada website Anda.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-bold text-card-foreground">API Key Anda</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
            {profile.isLoading ? "Memuat..." : apiKey}
          </code>
          <Button variant="outline" size="sm" onClick={() => copy(apiKey, "key")} disabled={!apiKey}>
            {copied === "key" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Salin
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Jaga kerahasiaan API Key ini — key inilah yang menghubungkan widget dengan FAQ akun Anda.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-bold text-card-foreground">Kode Embed</h2>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-foreground p-4 text-xs leading-relaxed text-background">
          <code>{snippet}</code>
        </pre>
        <Button className="mt-3" onClick={() => copy(snippet, "snippet")} disabled={!apiKey}>
          {copied === "snippet" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Salin Kode
        </Button>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card p-6">
        <h2 className="text-sm font-bold text-card-foreground">Cara Pemasangan</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Salin kode embed di atas.</li>
          <li>Buka file HTML atau template website Anda.</li>
          <li>Tempel sebelum penutup tag body, lalu simpan dan refresh.</li>
          <li>Widget chat akan muncul melayang di pojok kanan bawah.</li>
        </ol>
      </div>
    </div>
  );
}
