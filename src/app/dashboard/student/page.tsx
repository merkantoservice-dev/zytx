"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCourses, Course, Session } from "@/hooks/useCourses";
import { useStudents } from "@/hooks/useStudents";
import { useAssignments } from "@/hooks/useAssignments";
import { useQA } from "@/hooks/useQA";
import { supabase } from "@/utils/supabaseClient";

const getEmbedUrl = (input: string) => {
  try {
    let urlStr = input;
    const srcMatch = input.match(/src="([^"]+)"/);
    if (srcMatch) urlStr = srcMatch[1];
    urlStr = urlStr.replace(/&amp;/g, "&");
    const u = new URL(urlStr);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("vimeo.com") && !u.hostname.includes("player.vimeo.com")) {
      const videoId = u.pathname.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}${u.search}`;
    }
    return urlStr;
  } catch { return input; }
};

// ── Sidebar ──────────────────────────────────────────────────────────────────
const studentNavLinks = [
  { icon: "dashboard", label: "Dashboard", tab: -1 },
  { icon: "play_circle", label: "My Learning", tab: 0 },
  { icon: "menu_book", label: "Course Library", tab: 1 },
  { icon: "workspace_premium", label: "Certificates", tab: 2 },
  { icon: "forum", label: "Q&A Forum", tab: 3 },
];

function StudentSidebar({
  activeTab,
  setActiveTab,
  name,
  initials,
}: {
  activeTab: number;
  setActiveTab: (t: number) => void;
  name: string;
  initials: string;
}) {
  const router = useRouter();
  const handleSignOut = async () => {
    localStorage.removeItem("merkanto_role");
    localStorage.removeItem("merkanto_user");
    localStorage.removeItem("merkanto_user_name");
    try {
      await supabase.auth.signOut();
    } catch {}
    router.push("/login");
  };

  const handleExitToWebsite = async () => {
    localStorage.removeItem("merkanto_role");
    localStorage.removeItem("merkanto_user");
    localStorage.removeItem("merkanto_user_name");
    try {
      await supabase.auth.signOut();
    } catch {}
    router.push("/");
  };

  return (
    <aside style={{
      width: "220px", minWidth: "220px", height: "100vh", backgroundColor: "#ffffff",
      borderRight: "1px solid #e2e8f0", position: "sticky", top: 0, display: "flex",
      flexDirection: "column", flexShrink: 0, overflowY: "auto"
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 18px" }}>
        <button
          onClick={handleExitToWebsite}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", display: "flex", flexDirection: "column", gap: "6px" }}
          title="Return to Main Website (Requires password to re-enter)"
        >
          <Image
            src="/logo.png"
            alt="ZYT X - Driven by Growth"
            width={105}
            height={54}
            style={{ height: "34px", width: "auto", display: "block" }}
            priority
          />
          <div style={{ fontSize: "9px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.18em", textTransform: "uppercase" }}>ACADEMY</div>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {studentNavLinks.map((link) => {
          const isActive = link.tab === activeTab;
          return (
            <button
              key={link.label}
              onClick={() => link.tab >= 0 && setActiveTab(link.tab)}
              style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px",
                borderRadius: "10px", fontSize: "13.5px", fontWeight: isActive ? 700 : 500,
                color: isActive ? "#2563eb" : "#475569",
                backgroundColor: isActive ? "#eff6ff" : "transparent",
                border: "none", cursor: "pointer", textAlign: "left", width: "100%",
                transition: "all 0.15s ease", fontFamily: "Outfit, sans-serif"
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = "#f8fafc"; e.currentTarget.style.color = "#0f172a"; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#475569"; } }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "19px", color: isActive ? "#2563eb" : "#94a3b8" }}>{link.icon}</span>
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px", borderTop: "1px solid #f1f5f9" }}>
        {/* Keep Learning card */}
        <div style={{
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          borderRadius: "12px", padding: "16px", marginBottom: "12px", position: "relative", overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: "-10px", right: "-10px", width: "60px", height: "60px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: "-15px", right: "10px", width: "40px", height: "40px", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
          <span className="material-symbols-outlined" style={{ fontSize: "22px", color: "rgba(255,255,255,0.8)", marginBottom: "8px", display: "block" }}>emoji_events</span>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff", lineHeight: 1.3, marginBottom: "4px" }}>Keep Learning<br />Keep Growing</div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", lineHeight: 1.4, marginBottom: "12px" }}>Complete your courses and earn certificates</div>
          <button
            onClick={() => setActiveTab(0)}
            style={{
              backgroundColor: "#ffffff", color: "#2563eb", fontWeight: 700, fontSize: "10px",
              border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "4px"
            }}
          >
            View Progress →
          </button>
        </div>

        <button
          onClick={handleExitToWebsite}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#2563eb",
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            padding: "9px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 700,
            width: "100%",
            cursor: "pointer",
            fontFamily: "Outfit, sans-serif",
            marginBottom: "6px",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = "#2563eb";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = "#eff6ff";
            e.currentTarget.style.color = "#2563eb";
          }}
          title="Return to Main Website (Requires password to re-enter)"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>arrow_back</span>
          Main Website
        </button>

        <button onClick={() => window.open("mailto:support@zytx.com", "_blank")} style={{
          display: "flex", alignItems: "center", gap: "10px", color: "#64748b", padding: "9px 14px",
          borderRadius: "8px", fontSize: "13px", fontWeight: 500, width: "100%", background: "none",
          border: "none", cursor: "pointer", fontFamily: "Outfit, sans-serif"
        }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8fafc"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>headset_mic</span>
          Help & Support
        </button>

        <button onClick={handleSignOut} style={{
          display: "flex", alignItems: "center", gap: "10px", color: "#64748b", padding: "9px 14px",
          borderRadius: "8px", fontSize: "13px", fontWeight: 500, width: "100%", background: "none",
          border: "none", cursor: "pointer", fontFamily: "Outfit, sans-serif"
        }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8fafc"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("merkanto_role");
      const user = localStorage.getItem("merkanto_user");
      if (!role || !user || role !== "student") {
        router.push("/login");
      } else {
        setAuthChecked(true);
      }
    }
  }, [router]);

  const { courses, isLoaded: coursesLoaded } = useCourses();
  const { students, markVideoWatched } = useStudents();
  const { assignments, submitAssignment, isLoaded: assignmentsLoaded } = useAssignments();
  const { qaList: globalQaList, postQuestion, upvoteQuestion } = useQA();

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<Course | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [notebookTab, setNotebookTab] = useState<"notes" | "qa">("notes");
  const [notesText, setNotesText] = useState("");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Resolve logged-in student
  const userEmail = typeof window !== "undefined" ? localStorage.getItem("merkanto_user") : null;
  const userName = typeof window !== "undefined" ? localStorage.getItem("merkanto_user_name") : null;
  const currentStudent = students.find(s => s.email === userEmail) || {
    id: "s_demo",
    name: userName || "Student",
    email: userEmail || "student@zytx.com",
    track: "Executive Track",
    progress: 0,
    lastModule: "",
    status: "Active" as const,
    joinedDate: new Date().toISOString().split("T")[0],
    watchedVideos: [] as string[]
  };

  const initialLetters = currentStudent.name
    ? currentStudent.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "S";

  // Active session notes
  useEffect(() => {
    if (activeSession) {
      setNotesText(localStorage.getItem(`merkanto_notes_${activeSession.id}`) || "");
    }
  }, [activeSession]);

  const handleSaveNotes = (text: string) => {
    setNotesText(text);
    if (activeSession) localStorage.setItem(`merkanto_notes_${activeSession.id}`, text);
  };

  const activeSessionQa = activeSession
    ? globalQaList.filter(q => q.session_id === activeSession.id)
    : [];

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !activeSession || !currentStudent.id) return;
    const success = await postQuestion(activeSession.id, currentStudent.id, currentStudent.name, newQuestionText);
    if (success) { setNewQuestionText(""); showToast("Question posted to classroom feed."); }
    else showToast("Failed to post question. Please try again.");
  };

  const playVideo = (session: Session) => {
    const embedUrl = getEmbedUrl(session.youtubeUrl);
    setPlayingUrl(embedUrl);
    setActiveSession(session);
    setSelectedCourseDetail(null);
    if (currentStudent.id) {
      markVideoWatched(currentStudent.id, session.youtubeUrl);
      showToast("Lesson started. Progress recorded.");
    }
  };

  // Progress metrics
  const totalSessionsCount = courses.reduce((acc, c) => acc + (c.sessions ? c.sessions.length : 0), 0);
  const watchedSessionsCount = courses.reduce((acc, c) => {
    if (!c.sessions) return acc;
    return acc + c.sessions.filter(s => currentStudent.watchedVideos?.includes(s.youtubeUrl)).length;
  }, 0);
  const dynamicCompletion = totalSessionsCount > 0 ? Math.round((watchedSessionsCount / totalSessionsCount) * 100) : 0;

  // Resume watching
  let lastWatchedSession: Session | null = null;
  let lastWatchedCourse: Course | null = null;
  if (courses.length > 0) {
    for (const c of courses) {
      if (c.sessions) {
        const found = c.sessions.find(s => currentStudent.watchedVideos?.includes(s.youtubeUrl));
        if (found) { lastWatchedSession = found; lastWatchedCourse = c; break; }
      }
    }
    if (!lastWatchedSession && courses[0]?.sessions?.length) {
      lastWatchedSession = courses[0].sessions[0];
      lastWatchedCourse = courses[0];
    }
  }

  const newestCourse = courses.length > 0 ? courses[courses.length - 1] : null;
  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const studentAssignments = assignments.filter(a =>
    a.assignedStudentIds.includes("all") || a.assignedStudentIds.includes(currentStudent.id)
  );

  // Notifications
  const studentNotifications: { text: string; time: string }[] = [];
  [...courses].reverse().slice(0, 3).forEach(c => studentNotifications.push({ text: `New Module: "${c.title}"`, time: "Course Release" }));
  [...studentAssignments].reverse().slice(0, 3).forEach(a => studentNotifications.push({ text: `Assignment: "${a.title}"`, time: `Due: ${a.dueDate}` }));

  const handleSubmitWorkClick = (id: string) => { setSubmittingAssignmentId(id); setSubmissionText(""); };
  const handlePublishSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim()) { showToast("Please enter submission text."); return; }
    if (submittingAssignmentId && currentStudent.id) {
      const result = await submitAssignment(submittingAssignmentId, currentStudent.id, submissionText);
      if (result?.success) { showToast("Assignment submitted successfully!"); setSubmittingAssignmentId(null); }
      else showToast(result?.error || "Failed to submit assignment.");
    }
  };

  if (!mounted || !authChecked) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "12px", fontFamily: "Outfit, sans-serif" }}>
          Authenticating...
        </div>
      </div>
    );
  }

  // ── Course detail modal — active course progress
  const getCourseProg = (course: Course) => {
    const total = course.sessions?.length || 0;
    const watched = course.sessions?.filter(s => currentStudent.watchedVideos?.includes(s.youtubeUrl)).length || 0;
    return { total, watched, pct: total > 0 ? Math.round((watched / total) * 100) : 0 };
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9", fontFamily: "Outfit, sans-serif" }}>
      <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} name={currentStudent.name} initials={initialLetters} />

      {/* Main Content */}
      <div style={{ flex: 1, height: "100vh", overflowY: "auto", backgroundColor: "#f8fafc" }} className="custom-scrollbar">

        {/* ── Top Header ── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 40,
          backgroundColor: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e2e8f0", padding: "0 32px"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
            {/* Left: Title */}
            <div>
              <h1 style={{ fontSize: "17px", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "0.02em" }}>
                ACADEMY DASHBOARD
              </h1>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500, marginTop: "2px" }}>
                Student Portal&nbsp;
                <span style={{ color: "#cbd5e1" }}>/</span>
                &nbsp;Learning Center
              </div>
            </div>

            {/* Center: Search Bar */}
            <div style={{ flex: 1, maxWidth: "360px", margin: "0 32px", position: "relative" }}>
              <span className="material-symbols-outlined" style={{
                position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                fontSize: "17px", color: "#94a3b8", pointerEvents: "none"
              }}>search</span>
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); if (e.target.value) setActiveTab(1); }}
                placeholder="Search for courses, lessons or topics..."
                style={{
                  width: "100%", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
                  borderRadius: "10px", padding: "9px 12px 9px 38px", fontSize: "13px",
                  color: "#0f172a", outline: "none", fontFamily: "Outfit, sans-serif",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Right: Notif + Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* Notification bell */}
              <div style={{ position: "relative" }}>
                <button onClick={() => setNotifOpen(!notifOpen)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "36px", height: "36px", borderRadius: "50%",
                  color: "#64748b", position: "relative"
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>notifications</span>
                  {studentNotifications.length > 0 && (
                    <span style={{
                      position: "absolute", top: "5px", right: "5px", width: "8px", height: "8px",
                      backgroundColor: "#2563eb", borderRadius: "50%", border: "2px solid #ffffff"
                    }} />
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      style={{
                        position: "absolute", right: 0, top: "44px", width: "290px",
                        backgroundColor: "#ffffff", border: "1px solid #e2e8f0",
                        borderRadius: "14px", padding: "16px", zIndex: 100,
                        boxShadow: "0 12px 32px rgba(0,0,0,0.1)"
                      }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
                        NOTIFICATIONS
                      </div>
                      {studentNotifications.length === 0 ? (
                        <div style={{ fontSize: "12px", color: "#94a3b8", padding: "8px 0" }}>No new notifications.</div>
                      ) : (
                        studentNotifications.map((n, i) => (
                          <div key={i} style={{ padding: "8px 0", borderBottom: i < studentNotifications.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                            <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#0f172a" }}>{n.text}</div>
                            <div style={{ fontSize: "10px", color: "#2563eb", marginTop: "2px" }}>{n.time}</div>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Avatar dropdown */}
              <div style={{ position: "relative" }}>
                <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} style={{
                  display: "flex", alignItems: "center", gap: "10px", background: "none",
                  border: "none", cursor: "pointer", padding: 0
                }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#2563eb",
                    color: "#ffffff", fontWeight: 800, fontSize: "13px",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    {initialLetters}
                  </div>
                  <div style={{ textAlign: "left", display: "none" as any }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>{currentStudent.name.split(" ")[0]}</div>
                    <div style={{ fontSize: "10px", color: "#94a3b8" }}>Student</div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>{currentStudent.name.split(" ")[0]}</div>
                    <div style={{ fontSize: "10px", color: "#94a3b8" }}>Student</div>
                  </div>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#94a3b8" }}>keyboard_arrow_down</span>
                </button>
                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      style={{
                        position: "absolute", right: 0, top: "48px", width: "200px",
                        backgroundColor: "#ffffff", border: "1px solid #e2e8f0",
                        borderRadius: "12px", padding: "8px", zIndex: 100,
                        boxShadow: "0 12px 32px rgba(0,0,0,0.1)"
                      }}>
                      <div style={{ padding: "8px 12px 12px", borderBottom: "1px solid #f1f5f9", marginBottom: "8px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{currentStudent.name}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{currentStudent.email}</div>
                      </div>
                      <button onClick={async () => {
                        setProfileMenuOpen(false);
                        localStorage.removeItem("merkanto_role");
                        localStorage.removeItem("merkanto_user");
                        localStorage.removeItem("merkanto_user_name");
                        try {
                          await supabase.auth.signOut();
                        } catch {}
                        router.push("/");
                      }} style={{
                        display: "flex", alignItems: "center", gap: "8px", width: "100%",
                        padding: "8px 12px", borderRadius: "8px", border: "none",
                        background: "none", cursor: "pointer", fontSize: "13px",
                        color: "#2563eb", fontWeight: 600, marginBottom: "4px"
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
                        Main Website
                      </button>
                      <button onClick={async () => {
                        setProfileMenuOpen(false);
                        localStorage.removeItem("merkanto_role");
                        localStorage.removeItem("merkanto_user");
                        localStorage.removeItem("merkanto_user_name");
                        try {
                          await supabase.auth.signOut();
                        } catch {}
                        router.push("/login");
                      }} style={{
                        display: "flex", alignItems: "center", gap: "8px", width: "100%",
                        padding: "8px 12px", borderRadius: "8px", border: "none",
                        background: "none", cursor: "pointer", fontSize: "13px",
                        color: "#ef4444", fontWeight: 600
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>logout</span>
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0px", borderTop: "1px solid #f1f5f9" }}>
            {["My Learning", "Course Library"].map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)} style={{
                padding: "14px 20px", fontSize: "13px",
                fontWeight: activeTab === i ? 700 : 500,
                color: activeTab === i ? "#2563eb" : "#94a3b8",
                background: "none", border: "none",
                borderBottom: activeTab === i ? "2px solid #2563eb" : "2px solid transparent",
                cursor: "pointer", transition: "all 0.2s ease", fontFamily: "Outfit, sans-serif"
              }}>
                {tab}
              </button>
            ))}
          </div>
        </header>

        {/* ── Body ── */}
        <div style={{ padding: "28px 32px", maxWidth: "1300px", margin: "0 auto" }}>

          {/* ══ TAB 0: MY LEARNING ══ */}
          {activeTab === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

              {/* Hero Row: Resume Watching + Newest Module */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px" }}>

                {/* Left: Resume Watching */}
                <div style={{
                  backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px",
                  padding: "24px", display: "flex", flexDirection: "column", gap: "16px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#2563eb",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "15px", color: "#ffffff" }}>play_arrow</span>
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#2563eb", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      RESUME WATCHING
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "20px", flex: 1 }}>
                    <div style={{ flex: 1 }}>
                      {lastWatchedCourse && (
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                          {lastWatchedCourse.title}
                        </div>
                      )}
                      {lastWatchedSession ? (
                        <>
                          <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px", lineHeight: 1.3 }}>
                            {lastWatchedSession.title}
                          </h2>
                          <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5, margin: "0 0 20px" }}>
                            {lastWatchedSession.description || "Pick up where you left off."}
                          </p>
                        </>
                      ) : (
                        <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic", margin: "0 0 20px", padding: "12px 0" }}>
                          No active video sessions found. Start a course to begin learning.
                        </p>
                      )}
                      {lastWatchedSession && (
                        <button onClick={() => playVideo(lastWatchedSession!)} style={{
                          backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 700, fontSize: "12px",
                          border: "none", borderRadius: "10px", padding: "12px 22px", cursor: "pointer",
                          display: "inline-flex", alignItems: "center", gap: "8px",
                          boxShadow: "0 4px 16px rgba(37,99,235,0.3)", letterSpacing: "0.05em", textTransform: "uppercase"
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>play_arrow</span>
                          PLAY LESSON VIDEO
                        </button>
                      )}
                    </div>
                    {/* Course Thumbnail */}
                    {lastWatchedCourse?.img && (
                      <div style={{
                        width: "160px", height: "130px", borderRadius: "12px", overflow: "hidden", flexShrink: 0,
                        backgroundColor: "#e2e8f0"
                      }}>
                        <img src={lastWatchedCourse.img} alt={lastWatchedCourse.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    {!lastWatchedCourse?.img && (
                      <div style={{
                        width: "160px", height: "130px", borderRadius: "12px", overflow: "hidden", flexShrink: 0,
                        background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #0ea5e9 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "rgba(255,255,255,0.4)" }}>play_circle</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Newest Course Module */}
                <div style={{
                  backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px",
                  padding: "24px", display: "flex", flexDirection: "column", gap: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#2563eb" }}>menu_book</span>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      NEWEST COURSE MODULE
                    </span>
                  </div>
                  {newestCourse ? (
                    <>
                      <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0, lineHeight: 1.35 }}>
                        {newestCourse.title}
                      </h3>
                      <p style={{ fontSize: "12.5px", color: "#64748b", lineHeight: 1.55, margin: 0, flex: 1 }}>
                        {newestCourse.description
                          ? newestCourse.description.slice(0, 140) + (newestCourse.description.length > 140 ? "..." : "")
                          : "Explore our newest curriculum module and trade resources."}
                      </p>
                      <button onClick={() => setSelectedCourseDetail(newestCourse)} style={{
                        backgroundColor: "#ffffff", color: "#2563eb", border: "1.5px solid #2563eb",
                        fontWeight: 700, fontSize: "11px", borderRadius: "10px", padding: "11px 18px",
                        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px",
                        letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "auto"
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>menu_book</span>
                        EXPLORE COURSE LESSONS
                      </button>
                    </>
                  ) : (
                    <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic", flex: 1 }}>
                      No courses published yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Module Progress */}
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
                    MODULE PROGRESS
                  </h2>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>{courses.length} Modules Total</span>
                </div>

                {coursesLoaded && courses.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>Active Course Library</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {courses.map((course) => {
                        const { total, watched, pct } = getCourseProg(course);
                        return (
                          <div key={course.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{course.title}</div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#2563eb" }}>{pct}% Done</div>
                                <div style={{ fontSize: "10px", color: "#94a3b8" }}>{watched}/{total} LESSONS</div>
                              </div>
                            </div>
                            <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "9999px", overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "#2563eb", borderRadius: "9999px", transition: "width 0.5s ease" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed #e2e8f0", borderRadius: "12px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "#cbd5e1", display: "block", marginBottom: "12px" }}>school</span>
                    <div style={{ fontSize: "13px", color: "#94a3b8" }}>No active courses assigned yet.</div>
                  </div>
                )}
              </div>

              {/* Critical Deliverables */}
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
                    CRITICAL DELIVERABLES
                  </h2>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>{studentAssignments.length} Assignments</span>
                </div>

                {assignmentsLoaded && studentAssignments.length === 0 ? (
                  <div style={{ padding: "48px 20px", textAlign: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "#cbd5e1", display: "block", marginBottom: "12px" }}>assignment</span>
                    <div style={{ fontSize: "13px", color: "#94a3b8" }}>No assignments published or assigned to your profile yet!</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {studentAssignments.map((assign) => {
                      const studentSubmission = assign.submissions?.find(sub => sub.studentId === currentStudent.id);
                      return (
                        <div key={assign.id} style={{
                          padding: "16px 20px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
                          borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px"
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                              <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>Due: {assign.dueDate}</span>
                              {studentSubmission?.status === "Graded" ? (
                                <span style={{ backgroundColor: "#dcfce7", color: "#16a34a", borderRadius: "9999px", padding: "2px 8px", fontSize: "10px", fontWeight: 700 }}>✓ Graded: {studentSubmission.grade}</span>
                              ) : studentSubmission?.status === "Submitted" ? (
                                <span style={{ backgroundColor: "#fef3c7", color: "#d97706", borderRadius: "9999px", padding: "2px 8px", fontSize: "10px", fontWeight: 700 }}>✓ Submitted · Pending Grade</span>
                              ) : (
                                <span style={{ backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "9999px", padding: "2px 8px", fontSize: "10px", fontWeight: 700 }}>Pending Submission</span>
                              )}
                            </div>
                            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: "0 0 3px" }}>{assign.title}</h3>
                            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>{assign.description}</p>
                          </div>
                          <div>
                            {studentSubmission ? (
                              <button disabled style={{ backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "8px 16px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, cursor: "not-allowed" }}>Completed</button>
                            ) : (
                              <button onClick={() => handleSubmitWorkClick(assign.id)} style={{ backgroundColor: "#2563eb", color: "#ffffff", border: "none", padding: "9px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.2)" }}>
                                Submit Work
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══ TAB 1: COURSE LIBRARY ══ */}
          {activeTab === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <h2 style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px" }}>
                COURSE LIBRARY
              </h2>

              {coursesLoaded && filteredCourses.length === 0 && (
                <div style={{ padding: "60px 20px", textAlign: "center", border: "1px dashed #e2e8f0", borderRadius: "16px", backgroundColor: "#ffffff" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "#cbd5e1", display: "block", marginBottom: "12px" }}>search_off</span>
                  <div style={{ fontSize: "13px", color: "#94a3b8" }}>No courses match your search.</div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                {coursesLoaded && filteredCourses.map((course) => {
                  const { total, watched } = getCourseProg(course);
                  return (
                    <div key={course.id} style={{
                      backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px",
                      overflow: "hidden", display: "flex", flexDirection: "column",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)", transition: "box-shadow 0.2s ease"
                    }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.1)")}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)")}
                    >
                      {/* Image */}
                      <div style={{ height: "180px", position: "relative", overflow: "hidden", backgroundColor: "#e2e8f0" }}>
                        <img
                          src={course.img || "/images/brochure_page24_img1.jpeg"}
                          alt={course.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        {/* Lessons badge */}
                        <div style={{
                          position: "absolute", top: "12px", right: "12px",
                          backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)",
                          borderRadius: "8px", padding: "5px 10px",
                          display: "flex", alignItems: "center", gap: "5px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "13px", color: "#2563eb" }}>bar_chart</span>
                          <span style={{ fontSize: "10px", fontWeight: 800, color: "#0f172a" }}>{watched}/{total} LESSONS DONE</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{ padding: "18px 18px 14px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                        <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0, lineHeight: 1.35 }}>{course.title}</h4>
                        {course.description && (
                          <p style={{ fontSize: "12.5px", color: "#64748b", lineHeight: 1.5, margin: 0, flex: 1 }}>
                            {course.description.slice(0, 120)}{course.description.length > 120 ? "..." : ""}
                          </p>
                        )}
                        <button
                          onClick={() => setSelectedCourseDetail(course)}
                          style={{
                            marginTop: "8px", width: "100%", padding: "11px 0",
                            backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 700, fontSize: "12px",
                            borderRadius: "10px", border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                            letterSpacing: "0.05em", textTransform: "uppercase",
                            boxShadow: "0 4px 14px rgba(37,99,235,0.25)"
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>menu_book</span>
                          VIEW VIDEO LESSONS
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ══ TAB 2: CERTIFICATES (placeholder) ══ */}
          {activeTab === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              style={{ textAlign: "center", padding: "80px 20px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "#cbd5e1", display: "block", marginBottom: "16px" }}>workspace_premium</span>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Certificates</h2>
              <p style={{ fontSize: "14px", color: "#94a3b8" }}>Complete your courses to earn certificates of completion.</p>
              <button onClick={() => setActiveTab(1)} style={{
                marginTop: "20px", backgroundColor: "#2563eb", color: "#ffffff", border: "none",
                borderRadius: "10px", padding: "12px 24px", fontSize: "13px", fontWeight: 700,
                cursor: "pointer"
              }}>Explore Courses</button>
            </motion.div>
          )}

          {/* ══ TAB 3: Q&A FORUM (standalone) ══ */}
          {activeTab === 3 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              style={{ textAlign: "center", padding: "80px 20px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "#cbd5e1", display: "block", marginBottom: "16px" }}>forum</span>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Classroom Q&A</h2>
              <p style={{ fontSize: "14px", color: "#94a3b8" }}>Open a course lesson to ask questions and engage with the classroom forum.</p>
              <button onClick={() => setActiveTab(0)} style={{
                marginTop: "20px", backgroundColor: "#2563eb", color: "#ffffff", border: "none",
                borderRadius: "10px", padding: "12px 24px", fontSize: "13px", fontWeight: 700,
                cursor: "pointer"
              }}>Go to My Learning</button>
            </motion.div>
          )}

        </div>
      </div>

      {/* ══ DISCLAIMER MODAL ══ */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }}
              style={{ backgroundColor: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "560px", padding: "32px", boxShadow: "0 24px 48px rgba(0,0,0,0.18)", position: "relative" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.12em" }}>Important Notice</div>
              <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: "6px 0 16px", textTransform: "uppercase" }}>Educational Disclaimer</h2>
              <div style={{ maxHeight: "38vh", overflowY: "auto", fontSize: "13px", color: "#475569", lineHeight: 1.65, paddingRight: "6px" }} className="custom-scrollbar">
                <p>This Export Management Course is an independent educational program offered by ZYT X for learning and skill-development purposes only. The Certificate of Completion issued upon successful completion of the course is a private certificate issued by ZYT X and is not affiliated with, approved by, recognized by, or endorsed by any government authority, university, regulatory body, or accreditation agency unless explicitly stated otherwise.</p>
                <p>The information provided in this course is intended for educational purposes only. Completion of this course does not guarantee employment, business success, export licenses, government approvals, certifications, contracts, clients, profits, or income of any kind.</p>
                <p>While every effort is made to ensure the accuracy and relevance of the course content, ZYT X and its instructors make no representations or warranties regarding the completeness, accuracy, or future applicability of the information provided.</p>
              </div>
              <button onClick={() => setShowDisclaimer(false)} style={{
                marginTop: "24px", width: "100%", backgroundColor: "#2563eb", color: "#ffffff",
                fontWeight: 700, padding: "14px", borderRadius: "10px", border: "none",
                fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.3)"
              }}>
                I Understand and Agree
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ COURSE DETAIL MODAL (Image + Lesson List) ══ */}
      <AnimatePresence>
        {selectedCourseDetail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)", overflowY: "auto" }}>
            <motion.div initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }}
              style={{
                backgroundColor: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "820px",
                display: "flex", overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.22)", position: "relative"
              }}>

              {/* Close */}
              <button onClick={() => setSelectedCourseDetail(null)} style={{
                position: "absolute", top: "16px", right: "16px", zIndex: 10,
                width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#f1f5f9",
                border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#64748b"
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
              </button>

              {/* Left: Image + Description */}
              <div style={{ width: "300px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "28px 24px 20px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#2563eb", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
                    COURSE MODULES
                  </div>
                  <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: "0 0 12px", textTransform: "uppercase", lineHeight: 1.25 }}>
                    {selectedCourseDetail.title}
                  </h2>
                  <p style={{ fontSize: "12.5px", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                    {selectedCourseDetail.description || "Explore all the video lessons inside this course module."}
                  </p>
                </div>
                <div style={{ flex: 1, overflow: "hidden", minHeight: "200px", position: "relative", margin: "0 0 0 0" }}>
                  <img
                    src={selectedCourseDetail.img || "/images/brochure_page24_img1.jpeg"}
                    alt={selectedCourseDetail.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>

              {/* Right: Lesson List */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", borderLeft: "1px solid #f1f5f9" }}>
                <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "13px", color: "#ffffff" }}>play_arrow</span>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        VIDEO LESSONS
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {selectedCourseDetail.sessions?.length || 0} lessons
                    </span>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 16px" }} className="custom-scrollbar">
                  {selectedCourseDetail.sessions && selectedCourseDetail.sessions.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {selectedCourseDetail.sessions.map((session, index) => {
                        const watched = currentStudent.watchedVideos?.includes(session.youtubeUrl);
                        const isFirst = index === 0;
                        return (
                          <div key={session.id} style={{
                            display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px",
                            borderRadius: "12px", border: isFirst ? "1.5px solid #bfdbfe" : "1px solid #f1f5f9",
                            backgroundColor: isFirst ? "#f8fbff" : "#ffffff",
                            transition: "all 0.15s ease"
                          }}
                            onMouseEnter={e => { if (!isFirst) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                            onMouseLeave={e => { if (!isFirst) e.currentTarget.style.backgroundColor = "#ffffff"; }}
                          >
                            <span style={{
                              fontSize: "16px", fontWeight: 800, color: isFirst ? "#2563eb" : "#94a3b8",
                              width: "28px", textAlign: "center", flexShrink: 0
                            }}>
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{session.title}</div>
                              {session.description && (
                                <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>{session.description}</div>
                              )}
                            </div>
                            {watched && (
                              <span style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: "13px", color: "#16a34a" }}>check</span>
                              </span>
                            )}
                            <button
                              onClick={() => playVideo(session)}
                              style={{
                                padding: "8px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
                                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px",
                                backgroundColor: "#2563eb", color: "#ffffff", border: "none",
                                boxShadow: "0 2px 8px rgba(37,99,235,0.2)", flexShrink: 0
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>play_arrow</span>
                              Play
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                      No video sessions uploaded yet.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ SUBMIT ASSIGNMENT MODAL ══ */}
      <AnimatePresence>
        {submittingAssignmentId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 160, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }}
              style={{ backgroundColor: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "500px", padding: "28px", position: "relative", boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }}>
              <button onClick={() => setSubmittingAssignmentId(null)} style={{ position: "absolute", top: "16px", right: "16px", color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.12em" }}>Submit Assignment</div>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "6px 0 4px" }}>
                {assignments.find(a => a.id === submittingAssignmentId)?.title}
              </h2>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "20px" }}>
                {assignments.find(a => a.id === submittingAssignmentId)?.description}
              </p>
              <form onSubmit={handlePublishSubmission} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>YOUR SUBMISSION *</label>
                  <textarea rows={6} required value={submissionText} onChange={e => setSubmissionText(e.target.value)}
                    style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px", color: "#0f172a", fontSize: "13px", resize: "none", outline: "none", boxSizing: "border-box" }}
                    placeholder="Type your completed homework or deliverable summary here..." />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button type="button" onClick={() => setSubmittingAssignmentId(null)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "13px", fontWeight: 600, cursor: "pointer", padding: "10px 16px" }}>Cancel</button>
                  <button type="submit" style={{ backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 700, border: "none", borderRadius: "10px", padding: "10px 24px", fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>Submit Work</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ VIDEO PLAYER MODAL ══ */}
      <AnimatePresence>
        {playingUrl && activeSession && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 180, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px", backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}>
            <div style={{
              position: "relative", width: "100%", maxWidth: "1200px", height: "88vh",
              backgroundColor: "#f8fafc", borderRadius: "18px", display: "flex",
              flexDirection: "row", overflow: "hidden", boxShadow: "0 32px 64px rgba(0,0,0,0.3)"
            }}>
              {/* Left: Video Area */}
              <div style={{ flex: 1, backgroundColor: "#ffffff", display: "flex", flexDirection: "column" }}>
                {/* Breadcrumb header */}
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>
                    My Learning&nbsp;
                    <span style={{ margin: "0 4px" }}>›</span>
                    {lastWatchedCourse?.title || "Course"}&nbsp;
                    <span style={{ margin: "0 4px" }}>›</span>
                    <span style={{ color: "#0f172a", fontWeight: 600 }}>{activeSession.title}</span>
                  </div>
                </div>

                {/* Course info strip */}
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#ffffff", display: "flex", alignItems: "center", gap: "14px" }}>
                  {lastWatchedCourse?.img && (
                    <div style={{ width: "48px", height: "48px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, backgroundColor: "#e2e8f0" }}>
                      <img src={lastWatchedCourse.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.1em" }}>COURSE MODULE</div>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>{lastWatchedCourse?.title || "Course"}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{lastWatchedCourse?.description?.slice(0, 80)}...</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>Course Progress</div>
                    <div style={{ width: "120px", height: "5px", backgroundColor: "#e2e8f0", borderRadius: "9999px", overflow: "hidden", marginTop: "6px" }}>
                      <div style={{ width: `${dynamicCompletion}%`, height: "100%", backgroundColor: "#2563eb", borderRadius: "9999px" }} />
                    </div>
                    <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>{watchedSessionsCount}/{totalSessionsCount} lessons</div>
                  </div>
                  <button onClick={() => { setPlayingUrl(null); setActiveSession(null); }}
                    style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", cursor: "pointer" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>close</span>
                  </button>
                </div>

                {/* Active session label */}
                <div style={{ padding: "10px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "8px", height: "8px", backgroundColor: "#22c55e", borderRadius: "50%", flexShrink: 0 }} />
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#22c55e", letterSpacing: "0.08em" }}>Active Session</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>{activeSession.title}</span>
                </div>

                {/* Video embed */}
                <div style={{ flex: 1, position: "relative", backgroundColor: "#000" }}>
                  <iframe
                    src={`${playingUrl}?autoplay=1`}
                    style={{ width: "100%", height: "100%", position: "absolute", inset: 0, border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Lesson tabs below video */}
                <div style={{ borderTop: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                  <div style={{ display: "flex", padding: "0 16px", gap: "4px" }}>
                    {["Lesson List", "Overview", "Resources", "Discussion"].map((t, ti) => (
                      <button key={t} style={{
                        padding: "12px 16px", fontSize: "12px", fontWeight: ti === 0 ? 700 : 500,
                        color: ti === 0 ? "#2563eb" : "#94a3b8",
                        borderBottom: ti === 0 ? "2px solid #2563eb" : "2px solid transparent",
                        background: "none", border: "none", borderTop: "none", borderLeft: "none", borderRight: "none",
                        cursor: "pointer", fontFamily: "Outfit, sans-serif"
                      }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Notes + Q&A */}
              <div style={{ width: "340px", borderLeft: "1px solid #e2e8f0", display: "flex", flexDirection: "column", backgroundColor: "#ffffff" }}>
                {/* Tab Switcher */}
                <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
                  {[
                    { key: "notes", icon: "edit_note", label: "My Notes" },
                    { key: "qa", icon: "forum", label: "Classroom Q&A" },
                  ].map(({ key, icon, label }) => (
                    <button key={key} onClick={() => setNotebookTab(key as "notes" | "qa")} style={{
                      flex: 1, padding: "14px 0", fontSize: "12px", fontWeight: notebookTab === key ? 700 : 500,
                      color: notebookTab === key ? "#2563eb" : "#94a3b8",
                      borderBottom: notebookTab === key ? "2px solid #2563eb" : "2px solid transparent",
                      background: "none", border: "none", borderTop: "none", borderLeft: "none", borderRight: "none",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      fontFamily: "Outfit, sans-serif"
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }} className="custom-scrollbar">
                  {notebookTab === "notes" ? (
                    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#94a3b8" }}>edit_note</span>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Personal Notepad</span>
                        </div>
                        <button
                          onClick={() => handleSaveNotes(notesText + `\n[${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}] - `)}
                          style={{ backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "6px", padding: "5px 10px", fontSize: "10px", fontWeight: 700, cursor: "pointer" }}>
                          + Add Note
                        </button>
                      </div>

                      {notesText ? (
                        <textarea
                          value={notesText}
                          onChange={e => handleSaveNotes(e.target.value)}
                          style={{ flex: 1, minHeight: "220px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", color: "#0f172a", fontSize: "12.5px", padding: "12px", resize: "none", outline: "none", lineHeight: 1.65 }}
                        />
                      ) : (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "12px" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "#cbd5e1" }}>edit_note</span>
                          <div style={{ fontWeight: 700, color: "#64748b", fontSize: "13px" }}>No notes yet</div>
                          <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>Write down key takeaways, logistics routes, or pricing structures. Notes are saved automatically on your device.</div>
                          <textarea
                            value={notesText}
                            onChange={e => handleSaveNotes(e.target.value)}
                            style={{ width: "100%", minHeight: "80px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", color: "#0f172a", fontSize: "12.5px", padding: "12px", resize: "none", outline: "none", lineHeight: 1.65 }}
                            placeholder="Start typing..."
                          />
                        </div>
                      )}

                      <div style={{ fontSize: "10px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>cloud_done</span>
                        Notes are saved automatically on your device.
                      </div>

                      {/* Quick Notes */}
                      <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#d97706" }}>lightbulb</span>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#92400e" }}>Quick Notes</span>
                        </div>
                        <ul style={{ margin: 0, padding: "0 0 0 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                          {["Focus on key export opportunities", "Understand logistics and compliance", "Identify target markets", "Learn pricing strategies"].map(tip => (
                            <li key={tip} style={{ fontSize: "11.5px", color: "#78350f", lineHeight: 1.4 }}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "12px" }}>
                      <form onSubmit={handlePostQuestion} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <textarea
                          value={newQuestionText}
                          onChange={e => setNewQuestionText(e.target.value)}
                          style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#0f172a", fontSize: "12.5px", padding: "10px 12px", resize: "none", height: "70px", outline: "none", fontFamily: "Outfit, sans-serif" }}
                          placeholder="Ask a question about this lecture..."
                        />
                        <button type="submit" style={{ width: "100%", padding: "9px 0", backgroundColor: "#2563eb", color: "#ffffff", fontSize: "11px", fontWeight: 700, borderRadius: "8px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>send</span>
                          Submit Question
                        </button>
                      </form>
                      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }} className="custom-scrollbar">
                        {activeSessionQa.length === 0 && (
                          <div style={{ textAlign: "center", padding: "24px 12px", color: "#94a3b8", fontSize: "12px" }}>
                            No questions posted for this lesson yet. Be the first!
                          </div>
                        )}
                        {activeSessionQa.map((q) => (
                          <div key={q.id} style={{ padding: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb" }}>{q.student_name}</span>
                              <button type="button" onClick={() => upvoteQuestion(q.id, q.upvotes)} style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>thumb_up</span>
                                {q.upvotes}
                              </button>
                            </div>
                            <p style={{ fontSize: "12px", color: "#0f172a", lineHeight: 1.5, margin: 0 }}>{q.question_text}</p>
                            {q.replies && q.replies.length > 0 && (
                              <div style={{ paddingLeft: "10px", borderLeft: "2px solid #bfdbfe", marginTop: "8px" }}>
                                <div style={{ fontSize: "9px", color: "#2563eb", fontWeight: 700, marginBottom: "4px" }}>INSTRUCTOR ANSWER</div>
                                {q.replies.map((r, i) => (
                                  <p key={i} style={{ fontSize: "11px", color: "#475569", lineHeight: 1.4, margin: 0 }}>{r}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#0f172a", color: "#ffffff", fontWeight: 700, padding: "10px 22px", borderRadius: "10px", zIndex: 999, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", fontSize: "12.5px", whiteSpace: "nowrap" }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close dropdowns on outside click */}
      {(notifOpen || profileMenuOpen) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 30 }} onClick={() => { setNotifOpen(false); setProfileMenuOpen(false); }} />
      )}
    </div>
  );
}
