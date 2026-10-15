"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabase, supabaseUrl, supabaseAnonKey } from "@/utils/supabaseClient";

export interface Student {
  id: string;
  name: string;
  email: string;
  track?: string;
  progress: number;
  joinedDate: string;
  watchedVideos?: string[];
  status?: "Active" | "Inactive";
  password?: string;
  lastModule?: string;
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");

      if (error) {
        console.error("Error loading students:", error.message || error);
      } else {
        const mapped = (data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          track: p.track,
          progress: p.progress,
          joinedDate: p.joined_date,
          watchedVideos: p.watched_videos || [],
          password: p.password,
          status: p.progress > 0 ? ("Active" as const) : ("Inactive" as const)
        }));
        setStudents(mapped);
      }
    } catch (e) {
      console.error("Failed to query students:", e);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const addStudent = async (s: Omit<Student, "id" | "joinedDate">): Promise<{ success: boolean; error?: string }> => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const cleanEmail = s.email.toLowerCase().trim();

      // 1. Check if the email already exists in profiles table
      const { data: existing } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", cleanEmail)
        .maybeSingle();

      if (existing) {
        console.log("Email already exists in profiles. Enrolling/updating directly...");
        // Update their role and password directly and clear demo_status
        const { error: promoteError } = await supabase
          .from("profiles")
          .update({
            role: "student",
            name: s.name,
            track: s.track || "Executive Track",
            progress: s.progress || existing.progress || 0,
            password: s.password || existing.password || "student123",
            demo_status: null
          })
          .eq("id", existing.id);

        if (promoteError) {
          console.error("Error promoting user to student:", promoteError);
          return { success: false, error: promoteError.message || "Failed to enroll existing profile." };
        }
        await fetchStudents();
        return { success: true };
      }

      // 2. Create a temporary client with persistSession: false to avoid overwriting current session
      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });

      const { data: signUpData, error: signUpError } = await tempClient.auth.signUp({
        email: cleanEmail,
        password: s.password || "student123",
        options: {
          data: {
            name: s.name,
            role: "student",
            track: s.track || "Executive Track"
          }
        }
      });

      if (signUpError) {
        if (signUpError.message?.toLowerCase().includes("already registered") || signUpError.message?.toLowerCase().includes("already exists")) {
          console.log("Auth user already exists in auth.users. Re-creating/updating student profile record in database...");
          const { error: upsertConflictError } = await supabase
            .from("profiles")
            .upsert({
              email: cleanEmail,
              name: s.name,
              password: s.password || "student123",
              role: "student",
              track: s.track || "Executive Track",
              progress: 0,
              joined_date: today,
              demo_status: null
            }, { onConflict: "email" });

          if (upsertConflictError) {
            console.error("Error updating student profile:", upsertConflictError);
            return { success: false, error: upsertConflictError.message };
          }
          await fetchStudents();
          return { success: true };
        }

        console.warn("Notice signing up student auth:", signUpError.message || signUpError);
        return { success: false, error: signUpError.message };
      }
      
      const newUserId = signUpData?.user?.id || crypto.randomUUID();

      // Upsert the profile record matching on email to avoid duplicate key conflicts
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({ 
          id: newUserId,
          email: cleanEmail,
          name: s.name,
          password: s.password || "student123",
          role: "student",
          track: s.track || "Executive Track",
          progress: 0,
          joined_date: today,
          demo_status: null
        }, { onConflict: "email" });
        
      if (upsertError) {
        console.warn("Upsert with ID had conflict, updating profile by email:", upsertError.message);
        await supabase
          .from("profiles")
          .update({
            name: s.name,
            password: s.password || "student123",
            role: "student",
            track: s.track || "Executive Track"
          })
          .eq("email", cleanEmail);
      }

      await fetchStudents();
      return { success: true };
    } catch (e: any) {
      console.error("Failed to enroll student:", e);
      return { success: false, error: e.message || "Failed to enroll scholar." };
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email.toLowerCase().trim();
      if (updates.password !== undefined) dbUpdates.password = updates.password;
      if (updates.track !== undefined) dbUpdates.track = updates.track;
      if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
      if (updates.watchedVideos !== undefined) dbUpdates.watched_videos = updates.watchedVideos;

      const { error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq("id", id);

      if (error) console.error("Error updating profile:", error);
      await fetchStudents();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

      if (error) console.error("Error deleting student profile:", error);
      await fetchStudents();
    } catch (e) {
      console.error(e);
    }
  };

  const markVideoWatched = async (studentId: string, videoUrl: string) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      const watched = student.watchedVideos || [];
      if (!watched.includes(videoUrl)) {
        const updatedList = [...watched, videoUrl];
        const { error } = await supabase
          .from("profiles")
          .update({ watched_videos: updatedList })
          .eq("id", studentId);

        if (error) {
          console.error("Error saving watched videos:", error);
        }
        await fetchStudents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return {
    students,
    isLoaded,
    addStudent,
    updateStudent,
    deleteStudent,
    markVideoWatched
  };
}
