import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase, type Faq } from "@/lib/supabase";
import { getCurrentUserId } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const searchSchema = z.object({
  add: z.string().optional(),
  logId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/dashboard/")({
  validateSearch: searchSchema,
  component: FaqPage,
});

const faqSchema = z.object({
  kategori: z.string().trim().max(80, "Kategori maksimal 80 karakter"),
  keywordsRaw: z.string().trim().min(1, "Minimal satu kata kunci"),
  jawaban: z.string().trim().min(1, "Jawaban wajib diisi").max(2000, "Jawaban maksimal 2000 karakter"),
});

function FaqPage() {
  const search = useSearch({ from: "/_authenticated/dashboard/" });
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [kategori, setKategori] = useState("");
  const [keywordsRaw, setKeywordsRaw] = useState("");
  const [jawaban, setJawaban] = useState("");
  const [logId, setLogId] = useState<string | null>(null);

  const faqs = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Faq[];
    },
  });

  useEffect(() => {
    if (search.add) {
      setEditing(null);
      setKategori("");
      setKeywordsRaw(search.add);
      setJawaban("");
      setLogId(search.logId ?? null);
      setOpen(true);
    }
  }, [search.add, search.logId]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = faqSchema.safeParse({ kategori, keywordsRaw, jawaban });
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      const keywords = keywordsRaw
        .split(",")
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k.length > 1);
      if (keywords.length === 0) throw new Error("Kata kunci minimal 2 huruf, pisahkan dengan koma.");

      const userId = await getCurrentUserId();
      const payload = { user_id: userId, kategori: kategori.trim() || null, keywords, jawaban: jawaban.trim() };

      if (editing) {
        const { error } = await supabase.from("faqs").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("faqs").insert(payload);
        if (error) throw error;
      }

      if (logId) {
        await supabase.from("unanswered_logs").update({ resolved: true }).eq("id", logId);
      }
    },
    onSuccess: () => {
      toast.success(editing ? "FAQ diperbarui." : "FAQ ditambahkan.");
      setOpen(false);
      setLogId(null);
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("FAQ dihapus.");
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openCreate() {
    setEditing(null);
    setKategori("");
    setKeywordsRaw("");
    setJawaban("");
    setLogId(null);
    setOpen(true);
  }

  function openEdit(faq: Faq) {
    setEditing(faq);
    setKategori(faq.kategori ?? "");
    setKeywordsRaw(faq.keywords.join(", "));
    setJawaban(faq.jawaban);
    setLogId(null);
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Kelola FAQ</h1>
          <p className="text-sm text-muted-foreground">
            Tambahkan pertanyaan, kata kunci, dan jawaban yang akan dipakai bot Anda.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah FAQ
        </Button>
      </div>

      {faqs.isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat...</p>
      ) : faqs.data && faqs.data.length > 0 ? (
        <div className="grid gap-4">
          {faqs.data.map((faq) => (
            <div key={faq.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-bold text-card-foreground">
                  {faq.kategori || "Tanpa Kategori"}
                </h2>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(faq)} aria-label="Ubah FAQ">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove.mutate(faq.id)}
                    aria-label="Hapus FAQ"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-sm text-foreground">{faq.jawaban}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {faq.keywords.map((k) => (
                  <span key={k} className="rounded-full bg-accent px-2.5 py-0.5 text-xs text-accent-foreground">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Belum ada FAQ. Tambahkan yang pertama!</p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah FAQ" : "Tambah FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kategori">Pertanyaan / Kategori</Label>
              <Input
                id="kategori"
                maxLength={80}
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                placeholder="Jam Operasional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Kata Kunci (pisahkan dengan koma)</Label>
              <Textarea
                id="keywords"
                rows={3}
                value={keywordsRaw}
                onChange={(e) => setKeywordsRaw(e.target.value)}
                placeholder="jam, buka, tutup, operasional"
              />
              <p className="text-xs text-muted-foreground">
                Kata kunci 1 huruf atau kosong akan diabaikan otomatis.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jawaban">Jawaban Bot</Label>
              <Textarea
                id="jawaban"
                rows={4}
                maxLength={2000}
                value={jawaban}
                onChange={(e) => setJawaban(e.target.value)}
                placeholder="Kami buka Senin - Jumat pukul 08.00 - 17.00 WIB."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
