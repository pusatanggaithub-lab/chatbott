import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, Zap, ShieldCheck, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChatDesk — Chatbot FAQ Otomatis untuk Website Anda" },
      {
        name: "description",
        content:
          "ChatDesk adalah platform chatbot FAQ multi-tenant: kelola jawaban, pantau pertanyaan tak terjawab, dan pasang widget chat dengan satu baris script.",
      },
      { property: "og:title", content: "ChatDesk — Chatbot FAQ Otomatis untuk Website Anda" },
      {
        property: "og:description",
        content:
          "Kelola FAQ, pantau log pertanyaan, kustomisasi widget, dan embed chatbot ke website Anda dalam hitungan menit.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: MessageSquare, title: "Kelola FAQ", desc: "CRUD pertanyaan, kata kunci, dan jawaban bot dalam satu dashboard." },
  { icon: Zap, title: "Log Tak Terjawab", desc: "Lihat pertanyaan yang gagal dijawab lalu ubah jadi FAQ sekali klik." },
  { icon: ShieldCheck, title: "Aman & Multi-Tenant", desc: "Setiap akun punya API Key unik dengan data terisolasi." },
  { icon: Code2, title: "Embed 1 Baris", desc: "Tempel satu tag script dan widget chat langsung tampil." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MessageSquare className="h-5 w-5" />
          </span>
          ChatDesk
        </div>
        <Button asChild>
          <Link to="/auth">Masuk</Link>
        </Button>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-6 pb-16 pt-14 text-center">
          <p className="mb-4 inline-flex rounded-full bg-accent px-4 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
            SaaS Chatbot Admin
          </p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            Jawab pertanyaan pengunjung website Anda, otomatis 24/7
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground">
            ChatDesk mengubah daftar FAQ Anda menjadi asisten chat melayang yang siap menjawab
            pengunjung. Tanpa server, tanpa ribet — cukup satu script.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Mulai Gratis</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Sudah punya akun</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <f.icon className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-base font-bold text-card-foreground">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ChatDesk
      </footer>
    </div>
  );
}
