import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase, type UnansweredLog } from "@/lib/supabase";
import { getCurrentUserId } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard/logs")({
  component: LogsPage,
});

function LogsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logs = useQuery({
    queryKey: ["logs"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      const { data, error } = await supabase
        .from("unanswered_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as UnansweredLog[];
    },
  });

  const resolve = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("unanswered_logs").update({ resolved: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Log ditandai selesai.");
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Unanswered Logs</h1>
        <p className="text-sm text-muted-foreground">
          Pertanyaan pengunjung yang belum bisa dijawab bot Anda.
        </p>
      </div>

      {logs.isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat...</p>
      ) : logs.data && logs.data.length > 0 ? (
        <div className="grid gap-3">
          {logs.data.map((log) => (
            <div
              key={log.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-card-foreground">{log.pertanyaan}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString("id-ID")} ·{" "}
                  {log.resolved ? "Selesai" : "Belum ditangani"}
                </p>
              </div>
              {log.resolved ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
                </span>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => resolve.mutate(log.id)}>
                    Tandai Selesai
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate({
                        to: "/dashboard",
                        search: { add: log.pertanyaan, logId: log.id },
                      })
                    }
                  >
                    <PlusCircle className="h-4 w-4" /> Tambahkan ke FAQ
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Belum ada pertanyaan tak terjawab. Bagus!</p>
        </div>
      )}
    </div>
  );
}
