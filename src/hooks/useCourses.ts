"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";

export interface Session {
  id: string;
  title: string;
  youtubeUrl: string;
  description?: string;
  img?: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  status?: "Draft" | "Live";
  img?: string;
  sessions: Session[];
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading courses:", error.message || error);
      } else {
        setCourses(data || []);
      }
    } catch (e) {
      console.error("Failed to query courses:", e);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const addCourse = async (courseData: Omit<Course, "id">) => {
    try {
      const { error } = await supabase
        .from("courses")
        .insert([courseData]);

      if (error) {
        console.error("Error adding course:", error);
      } else {
        // Trigger student email notification dispatch
        await fetch("/api/notify-students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "course",
            title: courseData.title,
            details: courseData.description
          })
        }).catch(err => console.error("Notification API failed:", err));
      }
      await fetchCourses();
    } catch (e) {
      console.error(e);
    }
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    try {
      const { error } = await supabase
        .from("courses")
        .update(updates)
        .eq("id", id);

      if (error) console.error("Error updating course:", error);
      await fetchCourses();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id);

      if (error) console.error("Error deleting course:", error);
      await fetchCourses();
    } catch (e) {
      console.error(e);
    }
  };

  return {
    courses,
    isLoaded,
    addCourse,
    updateCourse,
    deleteCourse
  };
}
