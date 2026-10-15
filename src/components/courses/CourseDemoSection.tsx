"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { useDemo, DemoConfig } from "@/hooks/useDemo";

const getEmbedUrl = (input: string) => {
  try {
    let urlStr = input;
    const srcMatch = input.match(/src="([^"]+)"/);
    if (srcMatch) urlStr = srcMatch[1];
    urlStr = urlStr.replace(/&amp;/g, "&");
    const u = new URL(urlStr);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}?autoplay=1`;
    }
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}?autoplay=1`;
    }
    if (u.hostname.includes("vimeo.com") && !u.hostname.includes("player.vimeo.com")) {
      const videoId = u.pathname.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}${u.search ? u.search : ""}`;
    }
    return urlStr;
  } catch {
    return input;
  }
};

export default function CourseDemoSection() {
  const { fetchDemoVideos } = useDemo();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [demoStatus, setDemoStatus] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const [demoConfig, setDemoConfig] = useState<DemoConfig>({
    v1: { title: "DEMO VIDEO 1: MASTERCLASS OVERVIEW", url: "https://player.vimeo.com/video/1197817919?h=31d77d474c" },
    v2: { title: "DEMO VIDEO 2: BASICS OF EXPORTING", url: "https://player.vimeo.com/video/1197817919?h=31d77d474c" },
    whatsapp: "+91 98765 43210"
  });
  const [activeVidIdx, setActiveVidIdx] = useState<0 | 1>(0);

  // Form states: DEFAULT is Request Access (isLogin = false)
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeField, setActiveField] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userIdOrEmail: string) => {
    try {
      let query = supabase.from("profiles").select("id, email, name, role, demo_status");
      if (userIdOrEmail.includes("@")) {
        query = query.eq("email", userIdOrEmail.toLowerCase().trim());
      } else {
        query = query.eq("id", userIdOrEmail);
      }
      const { data } = await query.maybeSingle();

      if (data) {
        const status = data.demo_status || "none";
        setDemoStatus(status);
        localStorage.setItem("zytx_demo_status", status);
        return status;
      }
      return null;
    } catch (e) {
      console.error("Failed to fetch demo profile:", e);
      return null;
    }
  }, []);

  const checkSession = useCallback(async () => {
    const savedDemoEmail = localStorage.getItem("zytx_demo_user");
    const savedDemoStatus = localStorage.getItem("zytx_demo_status");

    if (savedDemoEmail) {
      setCurrentUser({
        id: savedDemoEmail,
        email: savedDemoEmail,
        name: localStorage.getItem("zytx_demo_name") || savedDemoEmail.split("@")[0]
      });
      if (savedDemoStatus) {
        setDemoStatus(savedDemoStatus);
      }
      await fetchProfile(savedDemoEmail);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && session.user.email) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("demo_status, name")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile && profile.demo_status) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          name: profile.name || session.user.email.split("@")[0]
        });
        setDemoStatus(profile.demo_status);
        localStorage.setItem("zytx_demo_user", session.user.email);
        localStorage.setItem("zytx_demo_status", profile.demo_status);
      }
    }
  }, [fetchProfile]);

  useEffect(() => {
    setMounted(true);
    checkSession();
    fetchDemoVideos().then(cfg => {
      if (cfg) setDemoConfig(cfg);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentUserId = currentUser?.id;
  const currentUserEmail = currentUser?.email;

  // Polling mechanism when demoStatus is 'pending': check every 3 seconds
  useEffect(() => {
    if ((currentUserId || currentUserEmail) && demoStatus === "pending") {
      const interval = setInterval(async () => {
        const identifier = currentUserId || currentUserEmail || "";
        const latest = await fetchProfile(identifier);
        if (latest === "approved") {
          clearInterval(interval);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentUserId, currentUserEmail, demoStatus, fetchProfile]);

  const handleManualCheckStatus = async () => {
    if (!currentUser) return;
    setCheckingStatus(true);
    await fetchProfile(currentUser.id || currentUser.email);
    setTimeout(() => setCheckingStatus(false), 500);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isLogin) {
        // --- SIGN IN FLOW ---
        const { data: directProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (directProfile) {
          if (directProfile.password && directProfile.password !== password) {
            const { error: authErr } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password
            });
            if (authErr) throw new Error("Invalid email or password.");
          }

          setCurrentUser({
            id: directProfile.id,
            email: cleanEmail,
            name: directProfile.name
          });
          localStorage.setItem("zytx_demo_user", cleanEmail);
          localStorage.setItem("zytx_demo_name", directProfile.name || cleanEmail.split("@")[0]);

          const status = directProfile.demo_status || "pending";
          if (!directProfile.demo_status) {
            await supabase.from("profiles").update({ demo_status: "pending" }).eq("id", directProfile.id);
          }
          setDemoStatus(status);
          localStorage.setItem("zytx_demo_status", status);
          return;
        }

        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (!authErr && authData.user) {
          setCurrentUser({
            id: authData.user.id,
            email: cleanEmail,
            name: authData.user.user_metadata?.name || cleanEmail.split("@")[0]
          });
          localStorage.setItem("zytx_demo_user", cleanEmail);
          const st = await fetchProfile(authData.user.id);
          if (!st || st === "none") {
            await supabase.from("profiles").update({ demo_status: "pending" }).eq("id", authData.user.id);
            setDemoStatus("pending");
            localStorage.setItem("zytx_demo_status", "pending");
          }
          return;
        }

        throw new Error(authErr?.message || "Invalid credentials. Please request access first.");
      } else {
        // --- REQUEST ACCESS FLOW ---
        const today = new Date().toISOString().split("T")[0];
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (existingProfile) {
          await supabase.from("profiles").update({
            demo_status: "pending",
            name: name || existingProfile.name || cleanEmail.split("@")[0],
            joined_date: today
          }).eq("id", existingProfile.id);

          setCurrentUser({
            id: existingProfile.id,
            email: cleanEmail,
            name: name || existingProfile.name
          });
          localStorage.setItem("zytx_demo_user", cleanEmail);
          localStorage.setItem("zytx_demo_name", name || existingProfile.name || cleanEmail.split("@")[0]);
          localStorage.setItem("zytx_demo_status", "pending");
          setDemoStatus("pending");
          return;
        }

        let userId = "";
        try {
          const { data: authSignUp } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: { name: name || cleanEmail.split("@")[0] }
            }
          });
          if (authSignUp?.user) {
            userId = authSignUp.user.id;
          }
        } catch {}

        if (!userId) {
          userId = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 12);
        }

        await supabase.from("profiles").upsert({
          id: userId,
          email: cleanEmail,
          name: name || cleanEmail.split("@")[0],
          password,
          role: "student",
          demo_status: "pending",
          progress: 0,
          joined_date: today
        }, { onConflict: "email" });

        setCurrentUser({
          id: userId,
          email: cleanEmail,
          name: name || cleanEmail.split("@")[0]
        });
        localStorage.setItem("zytx_demo_user", cleanEmail);
        localStorage.setItem("zytx_demo_name", name || cleanEmail.split("@")[0]);
        localStorage.setItem("zytx_demo_status", "pending");
        setDemoStatus("pending");
      }
    } catch (err: any) {
      if (err.message?.includes("already registered") || err.message?.includes("profiles_email_key")) {
        setIsLogin(true);
        setError("This email is already registered. Please click 'Sign In' below or enter your password.");
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("zytx_demo_user");
    localStorage.removeItem("zytx_demo_status");
    localStorage.removeItem("zytx_demo_name");
    setCurrentUser(null);
    setDemoStatus(null);
  };

  const cleanWhatsappNumber = (demoConfig.whatsapp || "").replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber || "919876543210"}?text=${encodeURIComponent(
    `Hi, I have requested access for the ZYTX Course Demo with email: ${currentUser?.email || "my email"}. Could you please grant access?`
  )}`;

  if (!mounted) return null;

  return (
    <section
      id="demo"
      style={{
        padding: "6rem 4rem",
        backgroundColor: "#ffffff",
        borderTop: "1px solid #e2e8f0",
        borderBottom: "1px solid #e2e8f0",
        position: "relative",
        fontFamily: "Outfit, sans-serif"
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Section Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", letterSpacing: "1px", textTransform: "uppercase" }}>
            COURSE DEMO PREVIEW
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>03</span>
        </div>

        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 3.5rem" }}>
          <span
            style={{
              color: "#2563eb",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              backgroundColor: "#eff6ff",
              padding: "4px 12px",
              borderRadius: "4px",
              display: "inline-block",
              marginBottom: "1rem",
              border: "1px solid #bfdbfe",
              fontFamily: "Geist Mono, monospace"
            }}
          >
            INTERACTIVE COURSE DEMO
          </span>
          <h2 style={{ fontSize: "3rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "1rem" }}>
            Preview our masterclass before you enroll.
          </h2>
          <p style={{ fontSize: "1.125rem", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
            Request instant demo access below to preview our actual lessons, instructor walk-throughs, and learning dashboard directly.
          </p>
        </div>

        {/* Interactive Demo Container */}
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <AnimatePresence mode="wait">
            {/* ---------------- STATE 1: REQUEST ACCESS / SIGN IN ---------------- */}
            {!currentUser || !demoStatus || demoStatus === "none" ? (
              <motion.div
                key="auth-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                style={{
                  width: "100%",
                  maxWidth: "460px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderTop: "3px solid #2563eb",
                  padding: "38px 34px",
                  position: "relative",
                  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
                  borderRadius: "8px"
                }}
              >
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "26px" }}>
                  <h3
                    style={{
                      color: "#0f172a",
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      marginBottom: "8px",
                      fontWeight: 900,
                      fontSize: "20px",
                      fontFamily: "Outfit, sans-serif"
                    }}
                  >
                    COURSE DEMO
                  </h3>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      fontFamily: "Geist Mono, monospace",
                      fontWeight: 600,
                      margin: 0
                    }}
                  >
                    UNLOCK ACCESS TO PREVIEW OUR MASTERCLASS
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div
                    style={{
                      marginBottom: "20px",
                      padding: "10px 14px",
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#dc2626",
                      fontSize: "12px",
                      textAlign: "center",
                      lineHeight: 1.4,
                      borderRadius: "6px"
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {!isLogin && (
                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "#475569",
                          fontSize: "10px",
                          letterSpacing: "0.12em",
                          marginBottom: "6px",
                          fontWeight: 700,
                          fontFamily: "Geist Mono, monospace"
                        }}
                      >
                        FULL NAME
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Alex Morgan"
                        value={name}
                        onFocus={() => setActiveField("name")}
                        onBlur={() => setActiveField(null)}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                          width: "100%",
                          backgroundColor: "#f8fafc",
                          border: `1px solid ${activeField === "name" ? "#2563eb" : "#cbd5e1"}`,
                          outline: "none",
                          color: "#0f172a",
                          padding: "12px 14px",
                          fontSize: "14px",
                          transition: "all 0.2s ease",
                          borderRadius: "6px",
                          boxShadow: activeField === "name" ? "0 0 0 3px rgba(37,99,235,0.12)" : "none"
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <label
                      style={{
                        display: "block",
                        color: "#475569",
                        fontSize: "10px",
                        letterSpacing: "0.12em",
                        marginBottom: "6px",
                        fontWeight: 700,
                        fontFamily: "Geist Mono, monospace"
                      }}
                    >
                      EMAIL ADDRESS
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="alex@domain.com"
                      value={email}
                      onFocus={() => setActiveField("email")}
                      onBlur={() => setActiveField(null)}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "#f8fafc",
                        border: `1px solid ${activeField === "email" ? "#2563eb" : "#cbd5e1"}`,
                        outline: "none",
                        color: "#0f172a",
                        padding: "12px 14px",
                        fontSize: "14px",
                        transition: "all 0.2s ease",
                        borderRadius: "6px",
                        boxShadow: activeField === "email" ? "0 0 0 3px rgba(37,99,235,0.12)" : "none"
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        color: "#475569",
                        fontSize: "10px",
                        letterSpacing: "0.12em",
                        marginBottom: "6px",
                        fontWeight: 700,
                        fontFamily: "Geist Mono, monospace"
                      }}
                    >
                      PASSWORD
                    </label>
                    <input
                      required
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onFocus={() => setActiveField("password")}
                      onBlur={() => setActiveField(null)}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "#f8fafc",
                        border: `1px solid ${activeField === "password" ? "#2563eb" : "#cbd5e1"}`,
                        outline: "none",
                        color: "#0f172a",
                        padding: "12px 14px",
                        fontSize: "14px",
                        transition: "all 0.2s ease",
                        borderRadius: "6px",
                        boxShadow: activeField === "password" ? "0 0 0 3px rgba(37,99,235,0.12)" : "none"
                      }}
                    />
                  </div>

                  {/* Primary CTA Button: Royal Blue */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%",
                      marginTop: "6px",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      fontWeight: 800,
                      padding: "14px",
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      fontSize: "12px",
                      fontFamily: "Geist Mono, monospace",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(37, 99, 235, 0.35)",
                      opacity: loading ? 0.6 : 1,
                      transition: "all 0.2s ease"
                    }}
                  >
                    {loading ? "AUTHENTICATING..." : isLogin ? "SIGN IN" : "REQUEST ACCESS"}
                  </button>
                </form>

                {/* Mode Toggle Link in Blue */}
                <div style={{ marginTop: "22px", textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#2563eb",
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      cursor: "pointer",
                      fontFamily: "Geist Mono, monospace",
                      textDecoration: "none"
                    }}
                  >
                    {isLogin ? "DON'T HAVE AN ACCOUNT? REQUEST ACCESS" : "ALREADY REQUESTED? SIGN IN"}
                  </button>
                </div>
              </motion.div>
            ) : demoStatus === "approved" ? (
              /* ---------------- STATE 3: ACCESS GRANTED / SHOWCASE ---------------- */
              <motion.div
                key="approved-card"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  width: "100%",
                  maxWidth: "1050px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "24px",
                  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)"
                }}
              >
                {/* Header Bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                    paddingBottom: "16px",
                    borderBottom: "1px solid #e2e8f0"
                  }}
                >
                  {/* Left Badge: ACCESS GRANTED */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        color: "#2563eb",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        fontWeight: 800,
                        backgroundColor: "#eff6ff",
                        padding: "6px 14px",
                        border: "1px solid #bfdbfe",
                        borderRadius: "6px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "Geist Mono, monospace"
                      }}
                    >
                      <svg style={{ width: "14px", height: "14px", fill: "#2563eb" }} viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      ACCESS GRANTED
                    </span>
                  </div>

                  {/* Video Switcher Tabs */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#f1f5f9",
                      padding: "4px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px"
                    }}
                  >
                    <button
                      onClick={() => setActiveVidIdx(0)}
                      style={{
                        padding: "8px 14px",
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontWeight: 800,
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: activeVidIdx === 0 ? "#2563eb" : "transparent",
                        color: activeVidIdx === 0 ? "#ffffff" : "#64748b",
                        boxShadow: activeVidIdx === 0 ? "0 2px 8px rgba(37,99,235,0.3)" : "none",
                        fontFamily: "Geist Mono, monospace",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {demoConfig.v1.title}
                    </button>
                    <button
                      onClick={() => setActiveVidIdx(1)}
                      style={{
                        padding: "8px 14px",
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontWeight: 800,
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: activeVidIdx === 1 ? "#2563eb" : "transparent",
                        color: activeVidIdx === 1 ? "#ffffff" : "#64748b",
                        boxShadow: activeVidIdx === 1 ? "0 2px 8px rgba(37,99,235,0.3)" : "none",
                        fontFamily: "Geist Mono, monospace",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {demoConfig.v2.title}
                    </button>
                  </div>

                  {/* Sign Out */}
                  <button
                    onClick={handleLogout}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "Geist Mono, monospace"
                    }}
                  >
                    SIGN OUT
                  </button>
                </div>

                {/* Video Player Box */}
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    backgroundColor: "#000000",
                    borderRadius: "6px",
                    position: "relative",
                    overflow: "hidden",
                    marginTop: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)"
                  }}
                >
                  {(() => {
                    const rawUrl = (activeVidIdx === 0 ? demoConfig.v1.url : demoConfig.v2.url) || "";
                    const isHtmlEmbed = rawUrl.trim().startsWith("<iframe") || rawUrl.trim().startsWith("<div");
                    if (isHtmlEmbed) {
                      return (
                        <div
                          key={activeVidIdx}
                          style={{ width: "100%", height: "100%" }}
                          dangerouslySetInnerHTML={{ __html: rawUrl }}
                        />
                      );
                    }
                    return (
                      <iframe
                        key={activeVidIdx}
                        src={getEmbedUrl(rawUrl)}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                        allowFullScreen
                        style={{ width: "100%", height: "100%", border: "none" }}
                      ></iframe>
                    );
                  })()}
                </div>
              </motion.div>
            ) : (
              /* ---------------- STATE 2: ACCESS PENDING ---------------- */
              <motion.div
                key="pending-card"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  width: "100%",
                  maxWidth: "480px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderTop: "3px solid #2563eb",
                  borderRadius: "8px",
                  padding: "44px 36px",
                  textAlign: "center",
                  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
                  position: "relative"
                }}
              >
                {/* Blue Hourglass Icon */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "22px" }}>
                  <div
                    style={{
                      width: "68px",
                      height: "68px",
                      borderRadius: "50%",
                      backgroundColor: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 15px rgba(37, 99, 235, 0.15)"
                    }}
                  >
                    <svg
                      style={{ width: "32px", height: "32px" }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 22h14"></path>
                      <path d="M5 2h14"></path>
                      <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
                      <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
                    </svg>
                  </div>
                </div>

                {/* Title */}
                <h3
                  style={{
                    color: "#0f172a",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    marginBottom: "12px",
                    fontWeight: 900,
                    fontSize: "20px"
                  }}
                >
                  ACCESS {demoStatus === "rejected" ? "DECLINED" : demoStatus === "paused" ? "PAUSED" : "PENDING"}
                </h3>

                {/* Description */}
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    marginBottom: "28px",
                    maxWidth: "360px",
                    margin: "0 auto 28px"
                  }}
                >
                  If you already contacted the provider, please wait to get access. Otherwise, contact the provider for
                  access to this exclusive course demo.
                </p>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Blue WhatsApp CTA Button */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: "100%",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      fontWeight: 800,
                      padding: "14px",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      borderRadius: "6px",
                      boxShadow: "0 4px 15px rgba(37, 99, 235, 0.35)",
                      textDecoration: "none",
                      fontFamily: "Geist Mono, monospace"
                    }}
                  >
                    <svg style={{ width: "20px", height: "20px", fill: "#ffffff" }} viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.199.534 1.286.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.353.101.174.449.741.963 1.2 1.015.908 1.488 1.002 1.734 1.103.188.077.298.058.411-.072.116-.13.491-.572.622-.767.13-.195.26-.163.433-.099.173.064 1.097.517 1.285.611.188.094.314.139.36.219.046.079.046.462-.098.867z" />
                    </svg>
                    CONTACT ON WHATSAPP
                  </a>

                  {/* Auto check / Refresh status button */}
                  <button
                    type="button"
                    onClick={handleManualCheckStatus}
                    disabled={checkingStatus}
                    style={{
                      width: "100%",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #cbd5e1",
                      color: "#334155",
                      fontWeight: 700,
                      padding: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      fontSize: "11px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      fontFamily: "Geist Mono, monospace"
                    }}
                  >
                    <span
                      className={`material-symbols-outlined ${checkingStatus ? "animate-spin" : ""}`}
                      style={{ fontSize: "14px", color: checkingStatus ? "#2563eb" : "inherit" }}
                    >
                      sync
                    </span>
                    {checkingStatus ? "CHECKING STATUS..." : "CHECK ACCESS STATUS"}
                  </button>

                  {/* Sign Out */}
                  <button
                    onClick={handleLogout}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#64748b",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      fontWeight: 600,
                      cursor: "pointer",
                      marginTop: "6px",
                      fontFamily: "Geist Mono, monospace"
                    }}
                  >
                    SIGN OUT
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
