import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://lmsgunuqsigdpnagkmjq.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtc2d1bnVxc2lnZHBuYWdrbWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NjE5NzMsImV4cCI6MjEwMjMzNzk3M30.-sl-P0_Mr7hakna5XYq0hj_Q0g-EgM0ef5nAeX6iqKA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
    detectSessionInUrl: typeof window !== "undefined",
  },
});

export type Profile = {
  id: string;
  email: string | null;
  api_key: string;
  bot_name: string;
  welcome_message: string;
  primary_color: string;
  icon_type: string;
  icon_url: string | null;
};

export type Faq = {
  id: string;
  user_id: string;
  kategori: string | null;
  keywords: string[];
  jawaban: string;
  created_at: string;
};

export type UnansweredLog = {
  id: string;
  user_id: string;
  pertanyaan: string;
  resolved: boolean;
  created_at: string;
};
