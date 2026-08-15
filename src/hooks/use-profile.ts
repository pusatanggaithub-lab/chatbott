import { useQuery } from "@tanstack/react-query";
import { supabase, type Profile } from "@/lib/supabase";

export async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Tidak terautentikasi");
  return data.user.id;
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile> => {
      const userId = await getCurrentUserId();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as Profile;

      const { data: created, error: insertError } = await supabase
        .from("profiles")
        .insert({ id: userId })
        .select("*")
        .single();
      if (insertError) throw insertError;
      return created as Profile;
    },
  });
}
