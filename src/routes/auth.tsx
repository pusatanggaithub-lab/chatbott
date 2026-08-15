import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Masuk atau Daftar — ChatDesk" },
      { name: "description", content: "Masuk ke dashboard ChatDesk atau buat akun baru untuk mulai membangun chatbot FAQ Anda." },
      { property: "og:title", content: "Masuk atau Daftar — ChatDesk" },
      { property: "og:description", content: "Akses dashboard ChatDesk untuk mengelola FAQ, log, dan widget chatbot Anda." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Berhasil masuk!");
    navigate({ to: "/dashboard", replace: true });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password minimal 6 karakter.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/dashboard" },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      await supabase.from("profiles").upsert({ id: data.session.user.id, email }, { onConflict: "id" });
      toast.success("Akun dibuat!");
      navigate({ to: "/dashboard", replace: true });
    } else {
      toast.success("Cek email Anda untuk verifikasi akun.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 text-lg font-extrabold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MessageSquare className="h-5 w-5" />
          </span>
          ChatDesk
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Masuk</TabsTrigger>
              <TabsTrigger value="register">Daftar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <Fields email={email} password={password} setEmail={setEmail} setPassword={setPassword} />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Memproses..." : "Masuk"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 pt-4">
                <Fields email={email} password={password} setEmail={setEmail} setPassword={setPassword} />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Memproses..." : "Buat Akun"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Fields(props: {
  email: string;
  password: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          maxLength={255}
          value={props.email}
          onChange={(e) => props.setEmail(e.target.value)}
          placeholder="nama@perusahaan.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          maxLength={72}
          value={props.password}
          onChange={(e) => props.setPassword(e.target.value)}
          placeholder="••••••"
        />
      </div>
    </>
  );
}
