"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { useQA, QA } from "@/hooks/useQA";
import { useCourses } from "@/hooks/useCourses";

export default function AdminQAPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("merkanto_role");
      const user = localStorage.getItem("merkanto_user");
      if (!role || !user || role !== "admin") {
        router.push("/login");
      } else {
        setAuthChecked(true);
      }
    }
  }, [router]);

  const { qaList, isLoaded: qaLoaded, addReply } = useQA();
  const { courses, isLoaded: coursesLoaded } = useCourses();
  
  const [filterCourse, setFilterCourse] = useState<string>("All");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const getSessionInfo = (sessionId: string) => {
    for (const c of courses) {
      const sess = c.sessions?.find(s => s.id === sessionId);
      if (sess) {
        return { course: c.title, session: sess.title };
      }
    }
    return { course: "Unknown Course", session: "Unknown Session" };
  };

  const handleReplySubmit = async (e: React.FormEvent, q: QA) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const success = await addReply(q.id, q.replies, replyText);
    if (success) {
      setReplyingTo(null);
      setReplyText("");
      showToast("Official reply posted successfully!");
    } else {
      showToast("Failed to post reply.");
    }
  };

  const enhancedQA = qaList.map(q => {
    const info = getSessionInfo(q.session_id);
    return { ...q, courseName: info.course, sessionName: info.session };
  });

  const filteredQA = enhancedQA.filter(q => {
    if (filterCourse !== "All" && q.courseName !== filterCourse) return false;
    return true;
  });

  const uniqueCourses = Array.from(new Set(enhancedQA.map(q => q.courseName)));

  if (!mounted || !authChecked) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "12px", fontFamily: "Geist, monospace" }}>
          Authenticating Session...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", color: "#0f172a", fontFamily: "Outfit, sans-serif" }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: "16px",
              right: "16px",
              zIndex: 9999,
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontWeight: 700,
              padding: "10px 18px",
              borderRadius: "8px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <DashboardSidebar activeIndex={2} brandLabel="ACADEMY PORTAL" role="admin" />

      <div style={{ flex: 1, height: "100vh", overflowY: "auto" }} className="custom-scrollbar">
        {/* Header */}
        <header className="sticky top-0 z-40 px-3 sm:px-6 md:px-8 py-2.5 sm:py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-white/95 backdrop-blur-md">
          <div className="pl-11 md:pl-0 min-w-0">
            <h1 className="text-sm sm:text-lg font-black text-[#0f172a] tracking-wider uppercase m-0 leading-tight truncate">
              Q&A COMMAND CENTER
            </h1>
            <div className="text-[10px] sm:text-xs font-medium text-[#64748b] mt-0.5 truncate">
              Global Student Inquiries <span className="text-[#cbd5e1] mx-1">/</span> Course Forum Support
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6 max-w-[1400px] mx-auto">
          {/* Course Filter Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Filter Course:</span>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                color: "#0f172a",
                fontSize: "13px",
                padding: "10px 16px",
                borderRadius: "10px",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="All">All Courses</option>
              {uniqueCourses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Q&A Inquiries List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {!qaLoaded || !coursesLoaded ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>Loading inquiries...</div>
            ) : filteredQA.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748b", border: "1px dashed #cbd5e1", borderRadius: "16px", fontSize: "13px" }}>No questions submitted yet.</div>
            ) : (
              filteredQA.map((q) => (
                <motion.div 
                  key={q.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.03)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                      <div style={{ color: "#2563eb", fontWeight: 800, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                        {q.student_name}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#94a3b8" }}>book</span>
                        <span>{q.courseName}</span> 
                        <span style={{ color: "#cbd5e1" }}>•</span>
                        <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#94a3b8" }}>play_lesson</span>
                        <span>{q.sessionName}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#64748b", fontSize: "12px", fontWeight: 600 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#2563eb" }}>thumb_up</span>
                      {q.upvotes}
                    </div>
                  </div>
                  
                  <p style={{ fontSize: "14px", color: "#0f172a", lineHeight: 1.6, marginBottom: "20px" }}>
                    {q.question_text}
                  </p>

                  {/* Official Replies List */}
                  {q.replies && q.replies.length > 0 && (
                    <div style={{ paddingLeft: "16px", borderLeft: "2px solid #2563eb", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                      <div style={{ fontSize: "11px", color: "#2563eb", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Official Instructor Reply</div>
                      {q.replies.map((r, i) => (
                        <p key={i} style={{ fontSize: "13px", color: "#334155", lineHeight: 1.5, margin: 0 }}>
                          {r}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Reply Form / Action Button */}
                  {replyingTo === q.id ? (
                    <form onSubmit={(e) => handleReplySubmit(e, q)} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write official response to student..."
                        style={{
                          width: "100%",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #cbd5e1",
                          color: "#0f172a",
                          fontSize: "13px",
                          borderRadius: "10px",
                          padding: "12px",
                          outline: "none",
                          resize: "none",
                          height: "90px"
                        }}
                        autoFocus
                      />
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button 
                          type="button" 
                          onClick={() => { setReplyingTo(null); setReplyText(""); }}
                          style={{ backgroundColor: "transparent", border: "none", color: "#64748b", fontSize: "12px", fontWeight: 600, cursor: "pointer", padding: "8px 16px" }}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          style={{ backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 700, border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "12px", cursor: "pointer" }}
                        >
                          Post Reply
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button 
                      onClick={() => setReplyingTo(q.id)}
                      style={{
                        backgroundColor: "#eff6ff",
                        color: "#2563eb",
                        border: "1px solid #bfdbfe",
                        borderRadius: "8px",
                        padding: "8px 16px",
                        fontSize: "12px",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer"
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>reply</span>
                      Add Official Reply
                    </button>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
