"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";

export interface Submission {
  studentId: string;
  submittedAt: string;
  answer?: string;
  status: "Pending" | "Submitted" | "Graded";
  grade?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  assignedStudentIds: string[]; // "all" or specific list of student IDs
  submissions: Submission[];
}

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchAssignments = async () => {
    try {
      // Fetch both assignments and submissions from Supabase
      const { data: aData, error: aError } = await supabase
        .from("assignments")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: sData, error: sError } = await supabase
        .from("submissions")
        .select("*");

      if (aError) console.error("Error loading assignments:", aError);
      if (sError) console.error("Error loading submissions:", sError);

      if (aData) {
        const mapped = aData.map((a: any) => {
          const subs = (sData || [])
            .filter((s: any) => s.assignment_id === a.id)
            .map((s: any) => ({
              studentId: s.student_id,
              submittedAt: s.submitted_at,
              answer: s.answer,
              status: s.status as any,
              grade: s.grade || undefined
            }));

          return {
            id: a.id,
            title: a.title,
            description: a.description,
            dueDate: a.due_date,
            assignedStudentIds: a.assigned_student_ids || ["all"],
            submissions: subs
          };
        });

        setAssignments(mapped);
      }
    } catch (e) {
      console.error("Failed to query assignments:", e);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const addAssignment = async (data: Omit<Assignment, "id" | "submissions">) => {
    try {
      const { error } = await supabase
        .from("assignments")
        .insert([{
          title: data.title,
          description: data.description,
          due_date: data.dueDate,
          assigned_student_ids: data.assignedStudentIds
        }]);

      if (error) {
        console.error("Error adding assignment:", error);
      } else {
        // Trigger student email notification dispatch
        await fetch("/api/notify-students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "assignment",
            title: data.title,
            details: data.description
          })
        }).catch(err => console.error("Notification API failed:", err));
      }
      await fetchAssignments();
    } catch (e) {
      console.error(e);
    }
  };

  const submitAssignment = async (assignmentId: string, studentId: string, answer: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // First check if a submission already exists
      const { data: existing, error: checkError } = await supabase
        .from("submissions")
        .select("id")
        .eq("assignment_id", assignmentId)
        .eq("student_id", studentId)
        .maybeSingle();

      let error;
      if (existing) {
        // Update existing submission
        const { error: updateError } = await supabase
          .from("submissions")
          .update({
            answer: answer,
            status: "Submitted"
          })
          .eq("id", existing.id);
        error = updateError;
      } else {
        // Insert new submission
        const { error: insertError } = await supabase
          .from("submissions")
          .insert([{
            assignment_id: assignmentId,
            student_id: studentId,
            answer: answer,
            status: "Submitted"
          }]);
        error = insertError;
      }

      if (error) {
        console.warn("Notice submitting assignment:", error.message || error);
        return { success: false, error: error.message || "Database security blocked submission." };
      }
      
      await fetchAssignments();
      return { success: true };
    } catch (e: any) {
      console.warn("Exception in submitAssignment:", e);
      return { success: false, error: e.message || "Failed to submit assignment." };
    }
  };

  const gradeAssignment = async (assignmentId: string, studentId: string, grade: string) => {
    try {
      const { error } = await supabase
        .from("submissions")
        .update({ grade: grade, status: "Graded" })
        .eq("assignment_id", assignmentId)
        .eq("student_id", studentId);

      if (error) console.error("Error grading submission:", error);
      await fetchAssignments();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      const { error } = await supabase
        .from("assignments")
        .delete()
        .eq("id", id);

      if (error) console.error("Error deleting assignment:", error);
      await fetchAssignments();
    } catch (e) {
      console.error(e);
    }
  };

  return {
    assignments,
    isLoaded,
    addAssignment,
    submitAssignment,
    gradeAssignment,
    deleteAssignment
  };
}
