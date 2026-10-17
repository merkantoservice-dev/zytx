"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { useStudents, Student } from "@/hooks/useStudents";
import { useCourses } from "@/hooks/useCourses";

const emptyForm = { name: "", email: "", password: "", progress: 0, lastModule: "Module 01" };

const getYouTubeEmbedUrl = (input: string) => {
  try {
    let urlStr = input;
    const srcMatch = input.match(/src="([^"]+)"/);
    if (srcMatch) urlStr = srcMatch[1];
    urlStr = urlStr.replace(/&amp;/g, '&');
    const urlObj = new URL(urlStr);
    if (urlObj.hostname.includes("youtube.com") && urlObj.searchParams.get("v")) return `https://www.youtube.com/embed/${urlObj.searchParams.get("v")}`;
    if (urlObj.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`;
    if (urlObj.hostname.includes("vimeo.com") && !urlObj.hostname.includes("player.vimeo.com")) {
      const videoId = urlObj.pathname.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}${urlObj.search}`;
    }
    return urlStr;
  } catch (e) { return input; }
};

export default function StudentManagementPage() {
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

  const { students, isLoaded, addStudent, updateStudent, deleteStudent } = useStudents();
  const { courses } = useCourses();
  const [modalOpen, setModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const openAdd = () => { setEditingId(null); setForm({ ...emptyForm }); setModalOpen(true); };
  const openEdit = (s: Student) => {
    setEditingId(s.id);
    setForm({ name: s.name, email: s.email, password: s.password || "", progress: s.progress, lastModule: s.lastModule || "" });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) { 
      updateStudent(editingId, form); 
      showToast("Student updated successfully."); 
      setModalOpen(false);
    } else { 
      const result = await addStudent(form); 
      if (result && result.success) {
        showToast("Student enrolled successfully.");
        setModalOpen(false);
      } else {
        showToast(result?.error || "Failed to enroll student.");
      }
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Remove "${name}" from the system?`)) { deleteStudent(id); showToast("Student removed."); }
  };

  const filtered = students.filter(s => {
    return s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
  });

  const totalSessionsAll = courses.reduce((acc, c) => acc + (c.sessions ? c.sessions.length : 0), 0);
  const getDynamicProgress = (s: any) => {
    if (totalSessionsAll === 0) return 0;
    const watched = courses.reduce((acc, c) => {
      if (!c.sessions) return acc;
      return acc + c.sessions.filter(sess => s.watchedVideos?.includes(sess.youtubeUrl)).length;
    }, 0);
    return Math.round((watched / totalSessionsAll) * 100);
  };

  const avgProgress = students.length ? Math.round(students.reduce((a, s) => a + getDynamicProgress(s), 0) / students.length) : 0;

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

      <DashboardSidebar activeIndex={1} brandLabel="ACADEMY PORTAL" role="admin" onNewVenture={openAdd} />

      <div style={{ flex: 1, height: "100vh", overflowY: "auto" }} className="custom-scrollbar">
        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-header-title">
            <h1>
              STUDENTS REGISTRY
            </h1>
            <div className="dashboard-header-subtitle">
              Scholar Registry <span style={{ color: "#cbd5e1", margin: "0 4px" }}>/</span> Enrollment Control
            </div>
          </div>
          <div className="dashboard-header-actions">
            <button
              onClick={openAdd}
              style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
                fontWeight: 700,
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                fontSize: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(37, 99, 235, 0.25)"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>person_add</span>
              <span className="header-btn-text">Enroll Student</span>
            </button>
          </div>
        </header>

        <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1400px", margin: "0 auto" }}>
          {/* Stats Cards */}
          <motion.div className="dashboard-stats-grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>TOTAL ENROLLED</div>
              <div style={{ fontSize: "36px", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{students.length}</div>
              <div style={{ fontSize: "11px", color: "#2563eb", fontWeight: 600, marginTop: "8px" }}>registered students</div>
            </div>
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>AVG. PROGRESS</div>
              <div style={{ fontSize: "36px", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{avgProgress}%</div>
              <div style={{ fontSize: "11px", color: "#2563eb", fontWeight: 600, marginTop: "8px" }}>across all modules</div>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ position: "relative", maxWidth: "420px" }}>
              <span className="material-symbols-outlined" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: "18px" }}>search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  color: "#0f172a",
                  fontSize: "13px",
                  borderRadius: "12px",
                  padding: "12px 16px 12px 42px",
                  outline: "none"
                }}
              />
            </div>
          </motion.div>

          {/* Student Data Table Card */}
          <motion.div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="dashboard-table-container">
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "750px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: "12px", width: "25%" }}>SCHOLAR</th>
                    <th style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: "12px", width: "30%" }}>EMAIL</th>
                    <th style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: "12px", width: "22%" }}>PROGRESS</th>
                    <th style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: "12px", width: "11%" }}>STATUS</th>
                    <th style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: "12px", width: "12%", textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoaded && filtered.map((s) => {
                    const initials = s.name
                      ? s.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                      : "S";
                    const dynamicProgress = getDynamicProgress(s);

                    return (
                      <tr key={s.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "14px 12px 14px 0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {/* Blue Avatar Circle with White Text */}
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 800, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {initials}
                            </div>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{s.name}</div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 12px", fontSize: "12px", color: "#64748b" }}>{s.email}</td>
                        <td style={{ padding: "14px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", maxWidth: "160px" }}>
                            <div style={{ flex: 1, height: "6px", backgroundColor: "#e2e8f0", borderRadius: "9999px", overflow: "hidden" }}>
                              <div style={{ width: `${dynamicProgress}%`, height: "100%", backgroundColor: "#2563eb", borderRadius: "9999px" }} />
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb", minWidth: "32px", textAlign: "right" }}>{dynamicProgress}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          <span style={{ backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "9999px", padding: "4px 10px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", display: "inline-block" }}>
                            ACTIVE
                          </span>
                        </td>
                        <td style={{ padding: "14px 0 14px 12px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            <button onClick={() => { setSelectedStudent(s); setProgressModalOpen(true); }} style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="View Progress">
                              <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>visibility</span>
                            </button>
                            <button onClick={() => openEdit(s)} style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Edit">
                              <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>edit</span>
                            </button>
                            <button onClick={() => handleDelete(s.id, s.name)} style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Delete">
                              <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {isLoaded && filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: "30px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                        No students found matching search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enroll/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="modal-responsive" style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", width: "100%", maxWidth: "480px", padding: "28px", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
              <button onClick={() => setModalOpen(false)} style={{ position: "absolute", top: "20px", right: "20px", color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "20px" }}>
                {editingId ? "Edit Scholar" : "Enroll New Scholar"}
              </h2>
              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "6px" }}>Full Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "13px", padding: "10px 12px", borderRadius: "8px", outline: "none" }} placeholder="e.g. Jane Doe" />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "6px" }}>Email *</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "13px", padding: "10px 12px", borderRadius: "8px", outline: "none" }} placeholder="jane@university.edu" />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "6px" }}>Initial Password</label>
                  <input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "13px", padding: "10px 12px", borderRadius: "8px", outline: "none" }} placeholder="Set temporary password" />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                  <button type="button" onClick={() => setModalOpen(false)} style={{ backgroundColor: "transparent", border: "none", color: "#64748b", fontSize: "12px", fontWeight: 600, cursor: "padding", padding: "8px 16px" }}>Cancel</button>
                  <button type="submit" style={{ backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 700, border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "12px", cursor: "pointer" }}>
                    {editingId ? "Save Changes" : "Enroll Scholar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Log Modal */}
      <AnimatePresence>
        {progressModalOpen && selectedStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="modal-responsive" style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", width: "100%", maxWidth: "600px", padding: "28px", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
              <button onClick={() => setProgressModalOpen(false)} style={{ position: "absolute", top: "20px", right: "20px", color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                {selectedStudent.name}&apos;s Progress
              </h2>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>Watched Video Lessons History</div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
                {selectedStudent.watchedVideos && selectedStudent.watchedVideos.length > 0 ? (
                  selectedStudent.watchedVideos.map((url, i) => {
                    let matchedCourseTitle = "Unknown Module";
                    let matchedSessionTitle = "Unknown Lesson";
                    for (const c of courses) {
                      if (c.sessions) {
                        const session = c.sessions.find(s => getYouTubeEmbedUrl(s.youtubeUrl) === url || s.youtubeUrl === url);
                        if (session) { matchedCourseTitle = c.title; matchedSessionTitle = session.title; break; }
                      }
                    }
                    return (
                      <div key={i} style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#2563eb" }}>play_circle</span>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{matchedCourseTitle} — {matchedSessionTitle}</div>
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px", wordBreak: "break-all" }}>{url}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: "center", padding: "30px", color: "#64748b", border: "1px dashed #e2e8f0", borderRadius: "12px", fontSize: "13px" }}>
                    No lesson completions recorded yet.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}