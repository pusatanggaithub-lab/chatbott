import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare, ListChecks, Palette, Code2, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
});

const NAV = [
  { to: "/dashboard", label: "Kelola FAQ", icon: MessageSquare, exact: true },
  { to: "/dashboard/logs", label: "Unanswered Logs", icon: ListChecks, exact: false },
  { to: "/dashboard/widget", label: "Kustomisasi Widget", icon: Palette, exact: false },
  { to: "/dashboard/embed", label: "Embed Script", icon: Code2, exact: false },
] as const;

function DashboardLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-secondary/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="rounded-2xl border border-sidebar-border bg-sidebar p-4">
            <div className="mb-5 flex items-center gap-2 text-base font-extrabold text-sidebar-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <MessageSquare className="h-4 w-4" />
              </span>
              ChatDesk
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                  activeProps={{
                    className: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <Button variant="outline" className="mt-5 w-full" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Keluar
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
