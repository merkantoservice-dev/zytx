"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { useDemo, DemoProfile } from "@/hooks/useDemo";

export default function AdminDemoRequestsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const {
    demoRequests,
    isLoaded,
    updateDemoStatus,
    deleteDemoRequest,
    clearAllDemoRequests,
    fetchDemoVideos,
    saveDemoVideos,
    fetchDemoRequests
  } = useDemo();

  const [v1Title, setV1Title] = useState("DEMO VIDEO 1: MASTERCLASS OVERVIEW");
  const [v1Url, setV1Url] = useState("https://player.vimeo.com/video/1197817919?h=31d77d474c");
  const [v2Title, setV2Title] = useState("DEMO VIDEO 2: BASICS OF EXPORTING");
  const [v2Url, setV2Url] = useState("https://player.vimeo.com/video/1197817919?h=31d77d474c");
  const [whatsappNumber, setWhatsappNumber] = useState("+91 98765 43210");

  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected" | "paused">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savingVideos, setSavingVideos] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("merkanto_role");
      const user = localStorage.getItem("merkanto_user");
      if (!role || !user || role !== "admin") {
        router.push("/login");
      } else {
        setAuthChecked(true);
        loadVideos();
      }
    }
  }, [router]);

  const loadVideos = async () => {
    const vids = await fetchDemoVideos();
    if (vids) {
      setV1Title(vids.v1?.title || "DEMO VIDEO 1: MASTERCLASS OVERVIEW");
      setV1Url(vids.v1?.url || "https://player.vimeo.com/video/1197817919?h=31d77d474c");
      setV2Title(vids.v2?.title || "DEMO VIDEO 2: BASICS OF EXPORTING");
      setV2Url(vids.v2?.url || "https://player.vimeo.com/video/1197817919?h=31d77d474c");
      if (vids.whatsapp) setWhatsappNumber(vids.whatsapp);
    }
  };

  const handleSaveDemoVideos = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingVideos(true);
    setSaveMsg("");
    const ok = await saveDemoVideos(
      { title: v1Title, url: v1Url },
      { title: v2Title, url: v2Url },
      whatsappNumber
    );
    if (ok) {
      setSaveMsg("Configuration saved.");
      showToast("Demo video configuration & WhatsApp updated successfully.");
      setTimeout(() => setSaveMsg(""), 3500);
    } else {
      showToast("Error updating demo configuration.");
    }
    setSavingVideos(false);
  };

  const handleStatusChange = async (id: string, newStatus: DemoProfile["demo_status"], name?: string) => {
    const success = await updateDemoStatus(id, newStatus);
    if (success) {
      showToast(`Access ${newStatus.toUpperCase()} for ${name || "student"}.`);
    } else {
      showToast(`Failed to update status.`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete demo request for "${name}"?`)) {
      await deleteDemoRequest(id);
      showToast("Demo request removed from registry.");
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to delete ALL demo requests?")) {
      await clearAllDemoRequests();
      showToast("All demo requests cleared.");
    }
  };

  const filteredRequests = useMemo(() => {
    return demoRequests.filter((req) => {
      const matchSearch =
        req.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = filterStatus === "all" || req.demo_status === filterStatus;
      return matchSearch && matchFilter;
    });
  }, [demoRequests, searchQuery, filterStatus]);

  const pendingCount = useMemo(() => {
    return demoRequests.filter((r) => r.demo_status === "pending").length;
  }, [demoRequests]);

  const approvedCount = useMemo(() => {
    return demoRequests.filter((r) => r.demo_status === "approved").length;
  }, [demoRequests]);

  if (!mounted || !authChecked) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "12px", fontFamily: "Geist Mono, monospace" }}>
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

      <DashboardSidebar activeIndex={3} brandLabel="ACADEMY PORTAL" role="admin" />

      <div style={{ flex: 1, height: "100vh", overflowY: "auto" }} className="custom-scrollbar">
        {/* Header */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            padding: "20px 32px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0, lineHeight: 1 }}>
              DEMO ACCESS & MEDIA CONTROL
            </h1>
            <div style={{ fontSize: "11px", fontWeight: 500, color: "#64748b", marginTop: "4px" }}>
              Student Access Management <span style={{ color: "#cbd5e1", margin: "0 4px" }}>/</span> Course Demo Stream Setup
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Open Demo Page Link */}
            <a
              href="/demo"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                border: "1px solid #bfdbfe",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>visibility</span>
              View Live Demo
            </a>

            {demoRequests.length > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fca5a5",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete_sweep</span>
                Clear All
              </button>
            )}
          </div>
        </header>

        <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "28px", maxWidth: "1400px", margin: "0 auto" }}>
          
          {/* Quick Metrics Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ color: "#d97706", fontSize: "22px" }}>hourglass_top</span>
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{pendingCount}</div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>Pending Requests</div>
              </div>
            </div>

            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ color: "#2563eb", fontSize: "22px" }}>verified</span>
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{approvedCount}</div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>Active Access Granted</div>
              </div>
            </div>

            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ color: "#2563eb", fontSize: "22px" }}>groups</span>
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{demoRequests.length}</div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>Total Inquiries</div>
              </div>
            </div>
          </div>

          {/* Demo Media & WhatsApp Configuration Card */}
          <motion.div
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="material-symbols-outlined" style={{ color: "#2563eb" }}>play_circle</span>
                  DEMO MEDIA & WHATSAPP CONFIGURATION
                </h2>
                <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", margin: 0 }}>
                  Configure both demo streams and the WhatsApp contact target displayed to prospective students.
                </p>
              </div>
              {saveMsg && (
                <div style={{ color: "#2563eb", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}>
                  ✓ {saveMsg}
                </div>
              )}
            </div>

            <form onSubmit={handleSaveDemoVideos} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
                {/* Video 1 */}
                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#2563eb", textTransform: "uppercase" }}>
                      DEMO VIDEO 1 (TAB 1)
                    </div>
                    <span style={{ fontSize: "10px", backgroundColor: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>Active Showcase</span>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "4px" }}>Tab Display Title</label>
                    <input
                      type="text"
                      required
                      value={v1Title}
                      onChange={(e) => setV1Title(e.target.value)}
                      placeholder="DEMO VIDEO 1: MASTERCLASS OVERVIEW"
                      style={{ width: "100%", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "12px", padding: "10px", borderRadius: "8px", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "4px" }}>Vimeo / Video URL or Embed</label>
                    <input
                      type="text"
                      required
                      value={v1Url}
                      onChange={(e) => setV1Url(e.target.value)}
                      placeholder="https://player.vimeo.com/video/..."
                      style={{ width: "100%", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "12px", padding: "10px", borderRadius: "8px", outline: "none" }}
                    />
                  </div>
                </div>

                {/* Video 2 */}
                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#2563eb", textTransform: "uppercase" }}>
                      DEMO VIDEO 2 (TAB 2)
                    </div>
                    <span style={{ fontSize: "10px", backgroundColor: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>Second Video</span>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "4px" }}>Tab Display Title</label>
                    <input
                      type="text"
                      required
                      value={v2Title}
                      onChange={(e) => setV2Title(e.target.value)}
                      placeholder="DEMO VIDEO 2: BASICS OF EXPORTING"
                      style={{ width: "100%", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "12px", padding: "10px", borderRadius: "8px", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "4px" }}>Vimeo / Video URL or Embed</label>
                    <input
                      type="text"
                      required
                      value={v2Url}
                      onChange={(e) => setV2Url(e.target.value)}
                      placeholder="https://player.vimeo.com/video/..."
                      style={{ width: "100%", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "12px", padding: "10px", borderRadius: "8px", outline: "none" }}
                    />
                  </div>
                </div>

                {/* WhatsApp Support Number */}
                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#2563eb", textTransform: "uppercase" }}>
                      WHATSAPP RECIPIENT NUMBER
                    </div>
                    <span style={{ fontSize: "10px", backgroundColor: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>Contact Button</span>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "4px" }}>WhatsApp Phone (with Country Code)</label>
                    <input
                      type="text"
                      required
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      style={{ width: "100%", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "12px", padding: "10px", borderRadius: "8px", outline: "none" }}
                    />
                  </div>
                  <p style={{ fontSize: "11px", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                    Prospective students on the "Access Pending" screen will click this to message your admin team directly.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={savingVideos}
                  style={{
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontWeight: 700,
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 24px",
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>save</span>
                  {savingVideos ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Access Requests Registry Card */}
          <motion.div
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>
                    DEMO ACCESS REGISTRY ({demoRequests.length})
                  </h2>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0" }}>
                    Grant, reject, or pause demo access in real time for prospective candidates.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "8px", gap: "4px" }}>
                  {(["all", "pending", "approved", "rejected", "paused"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilterStatus(tab)}
                      style={{
                        padding: "6px 12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: filterStatus === tab ? "#ffffff" : "transparent",
                        color: filterStatus === tab ? "#2563eb" : "#64748b",
                        boxShadow: filterStatus === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "18px" }}>
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by student name or email..."
                    style={{
                      width: "100%",
                      padding: "10px 14px 10px 38px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#f8fafc",
                      fontSize: "12px",
                      color: "#0f172a",
                      outline: "none"
                    }}
                  />
                </div>
                <button
                  onClick={() => fetchDemoRequests()}
                  style={{
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    color: "#475569",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>refresh</span>
                  Refresh
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    {["Student", "Email Address", "Status", "Joined / Requested", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          color: "#64748b",
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          paddingBottom: "12px",
                          paddingRight: "12px"
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoaded &&
                    filteredRequests.map((req) => {
                      const initial = req.name ? req.name.charAt(0).toUpperCase() : "U";
                      const isApproved = req.demo_status === "approved";
                      const isPending = req.demo_status === "pending";
                      const isRejected = req.demo_status === "rejected";
                      const isPaused = req.demo_status === "paused";

                      return (
                        <tr key={req.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          {/* Student Name */}
                          <td style={{ padding: "14px 12px 14px 0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "50%",
                                  backgroundColor: isApproved ? "#2563eb" : isPending ? "#3b82f6" : "#64748b",
                                  color: "#ffffff",
                                  fontWeight: 800,
                                  fontSize: "13px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0
                                }}
                              >
                                {initial}
                              </div>
                              <div>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                                  {req.name || "Anonymous User"}
                                </div>
                                <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>
                                  Role: {req.role || "student"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td style={{ padding: "14px 12px", fontSize: "12px", color: "#475569", fontFamily: "Geist Mono, monospace" }}>
                            {req.email}
                          </td>

                          {/* Status Badge */}
                          <td style={{ padding: "14px 12px" }}>
                            <span
                              style={{
                                backgroundColor: isApproved
                                  ? "#eff6ff"
                                  : isPending
                                  ? "#f8fafc"
                                  : isRejected
                                  ? "#fef2f2"
                                  : "#f1f5f9",
                                color: isApproved
                                  ? "#2563eb"
                                  : isPending
                                  ? "#475569"
                                  : isRejected
                                  ? "#dc2626"
                                  : "#64748b",
                                border: `1px solid ${
                                  isApproved
                                    ? "#bfdbfe"
                                    : isPending
                                    ? "#cbd5e1"
                                    : isRejected
                                    ? "#fca5a5"
                                    : "#cbd5e1"
                                }`,
                                borderRadius: "9999px",
                                padding: "4px 12px",
                                fontSize: "10px",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px"
                              }}
                            >
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: isApproved ? "#2563eb" : isPending ? "#3b82f6" : "#64748b" }}></span>
                              {req.demo_status || "Pending"}
                            </span>
                          </td>

                          {/* Date */}
                          <td style={{ padding: "14px 12px", fontSize: "11px", color: "#64748b" }}>
                            {req.joined_date || "Recent"}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "14px 0 14px 12px" }}>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              {/* APPROVE BUTTON */}
                              {req.demo_status !== "approved" ? (
                                <button
                                  onClick={() => handleStatusChange(req.id, "approved", req.name)}
                                  style={{
                                    backgroundColor: "#eff6ff",
                                    color: "#2563eb",
                                    border: "1px solid #bfdbfe",
                                    borderRadius: "6px",
                                    padding: "6px 12px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    cursor: "pointer"
                                  }}
                                  title="Grant demo video access"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                                    check_circle
                                  </span>
                                  Approve Access
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStatusChange(req.id, "paused", req.name)}
                                  style={{
                                    backgroundColor: "#f1f5f9",
                                    color: "#64748b",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "6px",
                                    padding: "6px 10px",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    cursor: "pointer"
                                  }}
                                  title="Temporarily pause demo access"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                                    pause
                                  </span>
                                  Pause
                                </button>
                              )}

                              {/* REJECT BUTTON */}
                              {req.demo_status !== "rejected" && (
                                <button
                                  onClick={() => handleStatusChange(req.id, "rejected", req.name)}
                                  style={{
                                    backgroundColor: "#f8fafc",
                                    color: "#64748b",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "6px",
                                    padding: "6px 10px",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    cursor: "pointer"
                                  }}
                                  title="Reject access"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                                    cancel
                                  </span>
                                  Reject
                                </button>
                              )}

                              {/* DELETE BUTTON */}
                              <button
                                onClick={() => handleDelete(req.id, req.name)}
                                style={{
                                  backgroundColor: "#fef2f2",
                                  color: "#dc2626",
                                  border: "1px solid #fca5a5",
                                  borderRadius: "6px",
                                  padding: "6px 10px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  cursor: "pointer"
                                }}
                                title="Remove request"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                                  delete
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                  {isLoaded && filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "#94a3b8" }}>
                            inbox
                          </span>
                          <div>No demo requests found matching your filter.</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
