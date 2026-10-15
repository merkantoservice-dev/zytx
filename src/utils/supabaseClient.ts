import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kzgatooruldrtbyibxdy.supabase.co";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6Z2F0b29ydWxkcnRieWlieGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MTMxNzgsImV4cCI6MjEwNzM4OTE3OH0.Rso8s5n7eKbPHMkz9Kx-ihFoV53aFDgCLbjFbTfdLf4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
