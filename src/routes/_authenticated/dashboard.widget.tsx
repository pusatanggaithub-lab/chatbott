import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useProfile, getCurrentUserId } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WidgetPreview, ICON_OPTIONS } from "@/components/widget-preview";

export const Route = createFileRoute("/_authenticated/dashboard/widget")({
  component: WidgetPage,
});

const schema = z.object({
  bot_name: z.string().trim().min(1, "Nama bot wajib diisi").max(50, "Nama bot maksimal 50 karakter"),
  welcome_message: z.string().trim().min(1, "Welcome message wajib diisi").max(300),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Warna harus format hex, contoh #0F8A78"),
  icon_type: z.enum(["chat", "bot", "help", "custom"]),
  icon_url: z.string().trim().url("URL ikon tidak valid").max(500).optional().or(z.literal("")),
});

function WidgetPage() {
  const profile = useProfile();
  const queryClient = useQueryClient();

  const [botName, setBotName] = useState("Asisten AI");
  const [welcome, setWelcome] = useState("Halo! Ada yang bisa saya bantu?");
  const [color, setColor] = useState("#0F8A78");
  const [iconType, setIconType] = useState("chat");
  const [iconUrl, setIconUrl] = useState("");

  useEffect(() => {
    if (!profile.data) return;
    setBotName(profile.data.bot_name);
    setWelcome(profile.data.welcome_message);
    setColor(profile.data.primary_color);
    setIconType(profile.data.icon_type);
    setIconUrl(profile.data.icon_url ?? "");
  }, [profile.data]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse({
        bot_name: botName,
        welcome_message: welcome,
        primary_color: color,
        icon_type: iconType,
        icon_url: iconUrl,
      });
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      if (iconType === "custom" && !iconUrl) throw new Error("URL ikon custom wajib diisi.");

      const userId = await getCurrentUserId();
      const { error } = await supabase
        .from("profiles")
        .update({
          bot_name: botName.trim(),
          welcome_message: welcome.trim(),
          primary_color: color,
          icon_type: iconType,
          icon_url: iconUrl.trim() || null,
        })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pengaturan widget disimpan.");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Kustomisasi Widget</h1>
        <p className="text-sm text-muted-foreground">
          Atur tampilan widget chat lalu lihat pratinjaunya secara langsung.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="botName">Nama Bot</Label>
            <Input id="botName" maxLength={50} value={botName} onChange={(e) => setBotName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="welcome">Welcome Message</Label>
            <Textarea
              id="welcome"
              rows={3}
              maxLength={300}
              value={welcome}
              onChange={(e) => setWelcome(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Warna Utama</Label>
            <div className="flex gap-2">
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background p-1"
              />
              <Input value={color} maxLength={7} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ikon Widget</Label>
            <div className="flex flex-wrap gap-2">
              {(["chat", "bot", "help", "custom"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIconType(key)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border text-xs capitalize transition-colors ${
                    iconType === key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-accent"
                  }`}
                  aria-label={`Ikon ${key}`}
                >
                  {key === "custom" ? (
                    "URL"
                  ) : (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d={ICON_OPTIONS[key]} />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            {iconType === "custom" && (
              <Input
                className="mt-2"
                placeholder="https://contoh.com/icon.png"
                maxLength={500}
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
              />
            )}
          </div>
          <Button onClick={() => save.mutate()} disabled={save.isPending || profile.isLoading}>
            {save.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </div>

        <div className="relative min-h-[520px] overflow-hidden rounded-2xl border border-border bg-secondary p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Live Preview
          </p>
          <WidgetPreview
            botName={botName}
            welcome={welcome}
            color={color}
            iconType={iconType}
            iconUrl={iconUrl}
          />
        </div>
      </div>
    </div>
  );
}
