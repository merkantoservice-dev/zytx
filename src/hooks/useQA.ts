"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";

export interface QA {
  id: string;
  created_at: string;
  session_id: string;
  student_id: string;
  student_name: string;
  question_text: string;
  upvotes: number;
  replies: string[];
}

export function useQA() {
  const [qaList, setQaList] = useState<QA[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchQA = async () => {
    try {
      const { data, error } = await supabase
        .from("qa_forum")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading Q&A:", error.message || error);
      } else {
        setQaList(data || []);
      }
    } catch (e) {
      console.error("Failed to query Q&A:", e);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchQA();
    
    // Optional: Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'qa_forum' }, (payload) => {
        fetchQA();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const postQuestion = async (sessionId: string, studentId: string, studentName: string, text: string) => {
    try {
      const { error } = await supabase
        .from("qa_forum")
        .insert({
          session_id: sessionId,
          student_id: studentId,
          student_name: studentName,
          question_text: text,
          upvotes: 0,
          replies: []
        });

      if (error) {
        console.error("Error posting question:", error.message || error);
        return false;
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const upvoteQuestion = async (id: string, currentUpvotes: number) => {
    try {
      const { error } = await supabase
        .from("qa_forum")
        .update({ upvotes: currentUpvotes + 1 })
        .eq("id", id);

      if (error) {
        console.error("Error upvoting:", error.message || error);
        return false;
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const addReply = async (id: string, currentReplies: string[], replyText: string) => {
    try {
      const updatedReplies = [...currentReplies, replyText];
      const { error } = await supabase
        .from("qa_forum")
        .update({ replies: updatedReplies })
        .eq("id", id);

      if (error) {
        console.error("Error adding reply:", error.message || error);
        return false;
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return {
    qaList,
    isLoaded,
    fetchQA,
    postQuestion,
    upvoteQuestion,
    addReply
  };
}
