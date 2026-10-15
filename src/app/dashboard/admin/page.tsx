"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { useCourses } from "@/hooks/useCourses";
import { useStudents } from "@/hooks/useStudents";
import { useAssignments } from "@/hooks/useAssignments";
import { useAdmins } from "@/hooks/useAdmins";
import { useDemo } from "@/hooks/useDemo";
import { supabase } from "@/utils/supabaseClient";

interface SessionForm {
  id: string;
  title: string;
  youtubeUrl: string;
  description?: string;
  img?: string;
}

const emptySessionForm = (): SessionForm => ({
  id: Math.random().toString(36).substring(2, 9),
  title: "",
  youtubeUrl: "",
  description: "",
  img: ""
});

export default function AdminHubPage() {
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

  const { courses, addCourse, updateCourse, deleteCourse, isLoaded: coursesLoaded } = useCourses();
  const { students } = useStudents();
  const { assignments, addAssignment, gradeAssignment, deleteAssignment, isLoaded: assignmentsLoaded } = useAssignments();
  const { admins, addAdmin, deleteAdmin, isLoaded: adminsLoaded } = useAdmins();
  const { demoRequests } = useDemo();
  const pendingDemoCount = demoRequests.filter(r => r.demo_status === "pending").length;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    img: string;
    sessions: SessionForm[];
  }>({
    title: "",
    description: "",
    img: "",
    sessions: [emptySessionForm()]
  });

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    targetOption: "all" as "all" | "select",
    selectedStudentIds: [] as string[]
  });
  
  const [toast, setToast] = useState<string | null>(null);
  const [viewAll, setViewAll] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const convertAndUploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          const MAX_WIDTH = 1000;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(async (blob) => {
            if (!blob) {
              reject(new Error("Canvas WebP conversion failed."));
              return;
            }
            try {
              const uniqueName = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.webp`;
              const { data, error } = await supabase
                .storage
                .from("resources")
                .upload(uniqueName, blob, {
                  contentType: "image/webp",
                  cacheControl: "3600",
                  upsert: false
                });

              if (error) {
                console.warn("Supabase storage bucket error, falling back to Base64 data URL:", error.message || error);
                const base64Reader = new FileReader();
                base64Reader.onloadend = () => {
                  resolve(base64Reader.result as string);
                };
                base64Reader.readAsDataURL(blob);
                return;
              }

              const { data: publicUrlData } = supabase
                .storage
                .from("resources")
                .getPublicUrl(uniqueName);

              resolve(publicUrlData.publicUrl);
            } catch (err) {
              console.warn("Supabase storage exception, falling back to Base64 data URL:", err);
              const base64Reader = new FileReader();
              base64Reader.onloadend = () => {
                resolve(base64Reader.result as string);
              };
              base64Reader.readAsDataURL(blob);
            }
          }, "image/webp", 0.85);
        };
        img.onerror = () => reject(new Error("Failed to load image file."));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read local file."));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string, sessionIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldKey);
    showToast("Converting and uploading file as WebP...");

    try {
      const uploadedUrl = await convertAndUploadImage(file);
      if (sessionIndex !== undefined) {
        handleSessionChange(sessionIndex, "img", uploadedUrl);
      } else {
        setFormData(prev => ({ ...prev, img: uploadedUrl }));
      }
      showToast("WebP Cover uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      showToast(`Error: ${err.message || "Failed to upload cover."}`);
    } finally {
      setUploadingField(null);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      img: "",
      sessions: [emptySessionForm()]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (course: any) => {
    setEditingId(course.id);
    setFormData({
      title: course.title,
      description: course.description || "",
      img: course.img || "",
      sessions: course.sessions && course.sessions.length > 0 
        ? course.sessions.map((s: any) => ({ ...s })) 
        : [emptySessionForm()]
    });
    setIsModalOpen(true);
  };

  const handleAddSessionField = () => {
    setFormData(prev => ({
      ...prev,
      sessions: [...prev.sessions, emptySessionForm()]
    }));
  };

  const handleRemoveSessionField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== index)
    }));
  };

  const handleSessionChange = (index: number, field: keyof SessionForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.map((session, i) => 
        i === index ? { ...session, [field]: value } : session
      )
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedSessions = formData.sessions.filter(s => s.title.trim() !== "" && s.youtubeUrl.trim() !== "");
    const coursePayload = {
      title: formData.title,
      description: formData.description,
      img: formData.img || "/images/brochure_page24_img1.jpeg",
      sessions: cleanedSessions
    };

    if (editingId) {
      updateCourse(editingId, coursePayload);
      showToast("Course module updated successfully.");
    } else {
      addCourse(coursePayload);
      showToast("New course module created successfully.");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteCourse(id);
      showToast("Module deleted.");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      showToast("Please fill in all details.");
      return;
    }
    const result = await addAdmin({
      name: adminForm.name,
      email: adminForm.email,
      password: adminForm.password
    });
    if (result.success) {
      setIsAdminModalOpen(false);
      setAdminForm({ name: "", email: "", password: "" });
      showToast(`Administrator account for ${adminForm.name} created successfully.`);
    } else {
      showToast(result.error || "Failed to create administrator.");
    }
  };

  const openAssignModal = () => {
    setAssignForm({
      title: "",
      description: "",
      dueDate: "",
      targetOption: "all",
      selectedStudentIds: []
    });
    setIsAssignModalOpen(true);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.title || !assignForm.dueDate) {
      showToast("Please fill in assignment title and due date.");
      return;
    }
    const assignedIds = assignForm.targetOption === "all" ? ["all"] : assignForm.selectedStudentIds;
    addAssignment({
      title: assignForm.title,
      description: assignForm.description,
      dueDate: assignForm.dueDate,
      assignedStudentIds: assignedIds
    });
    setIsAssignModalOpen(false);
    showToast(`Assignment "${assignForm.title}" published successfully!`);
  };

  const displayedCourses = viewAll ? courses : courses.slice(0, 3);
  const totalCourses = courses.length;
  const enrolledStudents = students.length;
  const totalWatchedVideos = students.reduce((acc, s) => acc + (s.watchedVideos ? s.watchedVideos.length : 0), 0);
  const avgProgress = enrolledStudents > 0 ? Math.round(totalWatchedVideos / (enrolledStudents || 1)) : 0;

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

      <DashboardSidebar activeIndex={0} brandLabel="ACADEMY PORTAL" role="admin" onNewVenture={openAddModal} />

      <div style={{ flex: 1, height: "100vh", overflowY: "auto" }} className="custom-scrollbar">
        {/* Header */}
        <header className="sticky top-0 z-40 px-3 sm:px-6 md:px-8 py-2.5 sm:py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-white/95 backdrop-blur-md">
          <div className="pl-11 md:pl-0 min-w-0">
            <h1 className="text-sm sm:text-lg font-black text-[#0f172a] tracking-wider uppercase m-0 leading-tight truncate">
              ADMINISTRATION PORTAL
            </h1>
            <div className="text-[10px] sm:text-xs font-medium text-[#64748b] mt-0.5 truncate">
              System Overview <span className="text-[#cbd5e1] mx-1">/</span> Command Center
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
            <button
              onClick={async () => {
                localStorage.removeItem("merkanto_role");
                localStorage.removeItem("merkanto_user");
                localStorage.removeItem("merkanto_user_name");
                try {
                  await supabase.auth.signOut();
                } catch {}
                router.push("/");
              }}
              className="flex items-center gap-1.5 bg-[#eff6ff] hover:bg-[#2563eb] text-[#2563eb] hover:text-white border border-[#bfdbfe] px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              title="Return to Main Website"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span className="hidden sm:inline">Main Website</span>
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 bg-white border border-[#e2e8f0] px-2 sm:px-3 py-1.5 rounded-xl shadow-xs">
              <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white font-extrabold flex items-center justify-center text-[10px]">
                E
              </div>
              <span className="hidden md:inline text-[13px] font-semibold text-[#0f172a]">Executive Director</span>
              <span className="material-symbols-outlined text-[16px] text-[#64748b]">
                expand_more
              </span>
            </div>
          </div>
        </header>

        <div className="p-3.5 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-7 max-w-[1400px] mx-auto">
          {/* Top Stat Cards — Mobile 2-Column Grid */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {/* Card 1: Active Modules */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#2563eb] text-sm sm:text-base">inventory_2</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#64748b] tracking-wider uppercase truncate">ACTIVE MODULES</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0f172a] leading-none mb-1">{totalCourses}</div>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#64748b] mt-1.5 sm:mt-2">
                    <span className="truncate">active modules</span>
                    <div className="hidden sm:block w-8 h-1 bg-[#e2e8f0] rounded" />
                  </div>
                </div>
              </div>

              {/* Card 2: Registered Students */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#2563eb] text-sm sm:text-base">group</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#64748b] tracking-wider uppercase truncate">STUDENTS</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0f172a] leading-none mb-1">{enrolledStudents}</div>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#64748b] mt-1.5 sm:mt-2">
                    <span className="truncate">registered scholars</span>
                    <svg className="hidden sm:block" width="36" height="14" viewBox="0 0 45 18" fill="none">
                      <path d="M2 14 Q 12 16, 22 8 T 43 3" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card 3: Lessons Watched */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#2563eb] text-sm sm:text-base">play_circle</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#64748b] tracking-wider uppercase truncate">WATCHED</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0f172a] leading-none mb-1">{totalWatchedVideos}</div>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#64748b] mt-1.5 sm:mt-2">
                    <span className="truncate">completions</span>
                    <svg className="hidden sm:block" width="36" height="14" viewBox="0 0 45 18" fill="none">
                      <rect x="2" y="10" width="4" height="8" rx="1" fill="#2563eb" opacity="0.4" />
                      <rect x="9" y="6" width="4" height="12" rx="1" fill="#2563eb" opacity="0.6" />
                      <rect x="16" y="12" width="4" height="6" rx="1" fill="#2563eb" opacity="0.5" />
                      <rect x="23" y="4" width="4" height="14" rx="1" fill="#2563eb" opacity="0.8" />
                      <rect x="30" y="2" width="4" height="16" fill="#2563eb" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card 4: Average Progress */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#2563eb] text-sm sm:text-base">trending_up</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#64748b] tracking-wider uppercase truncate">PROGRESS</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0f172a] leading-none mb-1">{avgProgress}%</div>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#64748b] mt-1.5 sm:mt-2">
                    <span className="truncate">avg scholar</span>
                    <svg className="hidden sm:block" width="36" height="14" viewBox="0 0 45 18" fill="none">
                      <path d="M2 15 C 15 15, 25 8, 43 4" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card 5: Demo Access Inquiries (Spans full width on mobile, 1 col on desktop) */}
              <div
                onClick={() => router.push("/dashboard/admin/demo-requests")}
                className="col-span-2 lg:col-span-1 bg-white border border-[#e2e8f0] hover:border-blue-400 rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col justify-between shadow-xs cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#2563eb] text-sm sm:text-base">play_circle</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#64748b] tracking-wider uppercase truncate">DEMO INQUIRIES</span>
                  </div>
                  {pendingDemoCount > 0 && (
                    <span className="bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                      {pendingDemoCount} PENDING
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between lg:block">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0f172a] leading-none mb-0 lg:mb-1">{demoRequests.length}</div>
                  <div className="text-[11px] text-[#2563eb] font-semibold flex items-center gap-1">
                    <span>Manage Demo Access →</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Demo Requests Quick Alert Banner */}
            {pendingDemoCount > 0 && (
              <div style={{ marginTop: "16px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="material-symbols-outlined" style={{ color: "#d97706", fontSize: "22px" }}>warning</span>
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#92400e" }}>
                      {pendingDemoCount} Candidate{pendingDemoCount > 1 ? "s" : ""} awaiting demo course access approval
                    </span>
                    <div style={{ fontSize: "11px", color: "#b45309" }}>Review submissions to grant video playback access immediately.</div>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/dashboard/admin/demo-requests")}
                  style={{ backgroundColor: "#d97706", color: "#ffffff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                >
                  Review Inquiries →
                </button>
              </div>
            )}
          </motion.section>

          {/* Middle Card 1: ACADEMY MODULES */}
          <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>
                  ACADEMY MODULES
                </h2>
                <button
                  onClick={() => setViewAll(!viewAll)}
                  style={{ backgroundColor: "transparent", border: "none", color: "#2563eb", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                >
                  {viewAll ? "Show Less" : "View All"}
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    {viewAll ? "expand_less" : "arrow_forward"}
                  </span>
                </button>
              </div>

              {/* Upload Drop Zone */}
              <div
                onClick={openAddModal}
                style={{
                  border: "1px dashed #cbd5e1",
                  borderRadius: "14px",
                  padding: "36px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  backgroundColor: "#f8fafc",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>add</span>
                </div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Upload new module</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Add video lessons, materials and resources</div>
              </div>

              {/* Render Course Modules if any exist */}
              {coursesLoaded && courses.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginTop: "20px" }}>
                  {displayedCourses.map((mod) => (
                    <div key={mod.id} style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ height: "140px", borderRadius: "10px", overflow: "hidden", marginBottom: "12px", backgroundColor: "#e2e8f0" }}>
                          <img
                            src={mod.img || "/images/brochure_page24_img1.jpeg"}
                            alt={mod.title}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/images/brochure_page24_img1.jpeg";
                            }}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: 0 }}>{mod.title}</h4>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>video_library</span>
                          {mod.sessions?.length || 0} Lessons
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "10px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                        <button onClick={() => openEditModal(mod)} style={{ flex: 1, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#475569", borderRadius: "8px", padding: "8px 0", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(mod.id, mod.title)} style={{ flex: 1, backgroundColor: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: "8px", padding: "8px 0", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>

          {/* Middle Card 2: ASSIGNMENTS & DELIVERABLES */}
          <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>
                  ASSIGNMENTS & DELIVERABLES
                </h2>
              </div>

              {assignmentsLoaded && assignments.length === 0 ? (
                <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                  <div style={{ position: "relative", marginBottom: "12px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "42px", color: "#94a3b8" }}>content_copy</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ position: "absolute", top: "-6px", right: "-6px" }}>
                      <path d="M12 2L12 6M2 12L6 12M18 12L22 12" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>No assignments published yet.</div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", marginBottom: "20px" }}>Click "Publish Work" to assign tasks to scholars.</div>
                  <button
                    onClick={openAssignModal}
                    style={{
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      fontWeight: 700,
                      padding: "10px 24px",
                      borderRadius: "9999px",
                      border: "none",
                      fontSize: "13px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(37, 99, 235, 0.25)"
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                    Publish Work
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={openAssignModal}
                      style={{ backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 700, padding: "8px 20px", borderRadius: "9999px", border: "none", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span> Publish Work
                    </button>
                  </div>
                  {assignments.map((assign) => (
                    <div key={assign.id} style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", position: "relative" }}>
                      <button onClick={() => { if(confirm(`Delete "${assign.title}"?`)) deleteAssignment(assign.id); }} style={{ position: "absolute", top: "12px", right: "12px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                      </button>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{assign.title}</div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{assign.description}</div>
                      <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600, marginTop: "8px" }}>Due: {assign.dueDate}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>

          {/* Bottom Split Row: Student Registry & Admin Registry */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            {/* Left: Student Registry & Status */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>
                      STUDENT REGISTRY & STATUS
                    </h2>
                    <button
                      onClick={() => router.push("/dashboard/admin/students")}
                      style={{ backgroundColor: "transparent", border: "none", color: "#2563eb", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                    >
                      Go to Student Registry <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
                    </button>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <th style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: "12px" }}>STUDENT</th>
                          <th style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: "12px" }}>LESSONS MATCHED</th>
                          <th style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: "12px" }}>PROGRESS</th>
                          <th style={{ paddingBottom: "12px" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.slice(0, 4).map((student) => {
                          const totalSessions = courses.reduce((acc, c) => acc + (c.sessions ? c.sessions.length : 0), 0);
                          const watchedSessions = courses.reduce((acc, c) => {
                            if (!c.sessions) return acc;
                            return acc + c.sessions.filter(s => student.watchedVideos?.includes(s.youtubeUrl)).length;
                          }, 0);
                          const dynamicProgress = totalSessions > 0 ? Math.round((watchedSessions / totalSessions) * 100) : 0;
                          const initial = student.name ? student.name.charAt(0).toUpperCase() : "S";

                          return (
                            <tr key={student.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                              <td style={{ padding: "14px 12px 14px 0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {initial}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{student.name}</div>
                                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{student.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: "14px 12px", fontSize: "12px", color: "#475569", whiteSpace: "nowrap" }}>
                                {watchedSessions} Lessons Matched
                              </td>
                              <td style={{ padding: "14px 12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <div style={{ width: "100px", height: "6px", backgroundColor: "#e2e8f0", borderRadius: "9999px", overflow: "hidden" }}>
                                    <div style={{ width: `${dynamicProgress}%`, height: "100%", backgroundColor: "#2563eb", borderRadius: "9999px" }} />
                                  </div>
                                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>{dynamicProgress}%</span>
                                </div>
                              </td>
                              <td style={{ padding: "14px 0 14px 12px", textAlign: "right" }}>
                                <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#94a3b8", cursor: "pointer" }}>more_vert</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Administrators Registry */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.22 }}>
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>
                      ADMINISTRATORS REGISTRY
                    </h2>
                    <button
                      onClick={() => setIsAdminModalOpen(true)}
                      style={{ backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 700, padding: "8px 16px", borderRadius: "8px", border: "none", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
                      Add Admin
                    </button>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <th style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: "12px" }}>ADMINISTRATOR</th>
                          <th style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: "12px" }}>ROLE</th>
                          <th style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: "12px", textAlign: "right" }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminsLoaded && admins.map((admin) => {
                          const initial = admin.name ? admin.name.charAt(0).toUpperCase() : "A";
                          return (
                            <tr key={admin.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                              <td style={{ padding: "14px 12px 14px 0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {initial}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{admin.name}</div>
                                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{admin.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: "14px 12px" }}>
                                <span style={{ backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "9999px", padding: "4px 12px", fontSize: "11px", fontWeight: 600, display: "inline-block" }}>
                                  Administrator
                                </span>
                              </td>
                              <td style={{ padding: "14px 0 14px 12px", textAlign: "right" }}>
                                {admin.id !== "a1" ? (
                                  <button
                                    onClick={() => { if (confirm(`Revoke admin privileges for ${admin.name}?`)) deleteAdmin(admin.id); }}
                                    style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>delete</span>
                                    Revoke
                                  </button>
                                ) : (
                                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>Primary</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ fontSize: "12px", color: "#64748b", paddingTop: "16px", borderTop: "1px solid #e2e8f0", marginTop: "16px" }}>
                  Active system administrators: {admins.length}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", overflowY: "auto" }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", width: "100%", maxWidth: "600px", padding: "28px", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
              <button onClick={() => setIsModalOpen(false)} style={{ position: "absolute", top: "20px", right: "20px", color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "20px" }}>
                {editingId ? "Edit Course Module" : "Upload New Course Module"}
              </h2>
              
              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Course Title *</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "13px", borderRadius: "8px", padding: "10px 12px", outline: "none" }} placeholder="e.g. Advanced Logistics & Supply Chain" />
                </div>
                
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Description (Optional)</label>
                  <textarea rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "13px", borderRadius: "8px", padding: "10px 12px", outline: "none", resize: "none" }} placeholder="A brief overview of the module..." />
                </div>

                <div style={{ padding: "16px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>Course Cover Image</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "80px", height: "55px", backgroundColor: "#e2e8f0", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {formData.img ? <img src={formData.img} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span className="material-symbols-outlined" style={{ color: "#64748b" }}>image</span>}
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                      <input type="text" value={formData.img} onChange={e => setFormData({ ...formData, img: e.target.value })} style={{ width: "100%", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "12px", borderRadius: "6px", padding: "8px", outline: "none" }} placeholder="Paste Cover Image URL" />
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: 700, width: "fit-content" }}>
                        {uploadingField === "course-img" ? "Converting..." : "Upload File"}
                        <input type="file" accept="image/*" onChange={e => handleFileUpload(e, "course-img")} style={{ display: "none" }} />
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>LESSON SESSIONS</span>
                    <button type="button" onClick={handleAddSessionField} style={{ backgroundColor: "transparent", border: "none", color: "#2563eb", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span> Add Lesson
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "200px", overflowY: "auto" }}>
                    {formData.sessions.map((session, index) => (
                      <div key={session.id} style={{ padding: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", position: "relative" }}>
                        <button type="button" onClick={() => handleRemoveSessionField(index)} style={{ position: "absolute", top: "8px", right: "8px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                        </button>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", paddingTop: "4px" }}>
                          <input type="text" required value={session.title} onChange={e => handleSessionChange(index, "title", e.target.value)} style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "12px", padding: "8px", borderRadius: "6px", outline: "none" }} placeholder="Lesson Title *" />
                          <input type="text" required value={session.youtubeUrl} onChange={e => handleSessionChange(index, "youtubeUrl", e.target.value)} style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "12px", padding: "8px", borderRadius: "6px", outline: "none" }} placeholder="Video Embed URL *" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: "transparent", border: "none", color: "#64748b", fontSize: "12px", fontWeight: 600, cursor: "pointer", padding: "8px 16px" }}>Cancel</button>
                  <button type="submit" style={{ backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 700, border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "12px", cursor: "pointer" }}>Save Module</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", width: "100%", maxWidth: "420px", padding: "24px", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
              <button onClick={() => setIsAdminModalOpen(false)} style={{ position: "absolute", top: "16px", right: "16px", color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>Add Administrator</h2>
              <form onSubmit={handleCreateAdmin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "4px" }}>Full Name</label>
                  <input type="text" required value={adminForm.name} onChange={e => setAdminForm({ ...adminForm, name: e.target.value })} style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "12px", padding: "10px", borderRadius: "8px", outline: "none" }} placeholder="e.g. Depiotal" />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "4px" }}>Email Address</label>
                  <input type="email" required value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "12px", padding: "10px", borderRadius: "8px", outline: "none" }} placeholder="depiotal@gmail.com" />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "4px" }}>Password</label>
                  <input type="password" required value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "12px", padding: "10px", borderRadius: "8px", outline: "none" }} placeholder="••••••••" />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "8px" }}>
                  <button type="button" onClick={() => setIsAdminModalOpen(false)} style={{ backgroundColor: "transparent", border: "none", color: "#64748b", fontSize: "12px", cursor: "pointer", padding: "6px 12px" }}>Cancel</button>
                  <button type="submit" style={{ backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 700, border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", cursor: "pointer" }}>Create Admin</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Publish Assignment Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", width: "100%", maxWidth: "420px", padding: "24px", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
              <button onClick={() => setIsAssignModalOpen(false)} style={{ position: "absolute", top: "16px", right: "16px", color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>Publish Work / Assignment</h2>
              <form onSubmit={handleCreateAssignment} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "4px" }}>Title *</label>
                  <input type="text" required value={assignForm.title} onChange={e => setAssignForm({ ...assignForm, title: e.target.value })} style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "12px", padding: "10px", borderRadius: "8px", outline: "none" }} placeholder="Assignment Title" />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "4px" }}>Description</label>
                  <textarea rows={2} value={assignForm.description} onChange={e => setAssignForm({ ...assignForm, description: e.target.value })} style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "12px", padding: "10px", borderRadius: "8px", outline: "none", resize: "none" }} placeholder="Instructions for scholars..." />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "4px" }}>Due Date *</label>
                  <input type="date" required value={assignForm.dueDate} onChange={e => setAssignForm({ ...assignForm, dueDate: e.target.value })} style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "12px", padding: "10px", borderRadius: "8px", outline: "none" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "8px" }}>
                  <button type="button" onClick={() => setIsAssignModalOpen(false)} style={{ backgroundColor: "transparent", border: "none", color: "#64748b", fontSize: "12px", cursor: "pointer", padding: "6px 12px" }}>Cancel</button>
                  <button type="submit" style={{ backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 700, border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", cursor: "pointer" }}>Publish Work</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
