import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ywxbynjfbicfehguhotb.supabase.co";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3eGJ5bmpmYmljZmVoZ3Vob3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNTc5OTMsImV4cCI6MjEwNzYzMzk5M30.dRUpuMxJB2NXmRv1LSaXBjLa2yrGTyq_r7efmFdsoj4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
