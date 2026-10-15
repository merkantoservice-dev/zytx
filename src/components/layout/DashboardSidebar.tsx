"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/utils/supabaseClient";

const adminLinks = [
  { href: "/dashboard/admin", icon: "grid_view", label: "Command Center" },
  { href: "/dashboard/admin/students", icon: "person", label: "Students Registry" },
  { href: "/dashboard/admin/qa", icon: "chat_bubble_outline", label: "Q&A Forum" },
  { href: "/dashboard/admin/demo-requests", icon: "description", label: "Demo Requests" },
];

const studentLinks = [
  { href: "/dashboard/student", icon: "grid_view", label: "My Dashboard" },
];

interface DashboardSidebarProps {
  activeIndex?: number;
  brandLabel?: string;
  role?: "admin" | "student";
  onNewVenture?: () => void;
}

export default function DashboardSidebar({
  activeIndex = 0,
  brandLabel = "ACADEMY PORTAL",
  role = "admin",
  onNewVenture,
}: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = role === "student" ? studentLinks : adminLinks;

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

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-[#0f172a]">
      {/* Brand Header */}
      <div style={{ padding: "28px 24px 24px" }}>
        <button
          onClick={handleExitToWebsite}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
          title="Return to Main Website (Requires re-login to return)"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px", fontFamily: "Outfit, sans-serif", lineHeight: 1 }}>ZYT</span>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#2563eb", fontFamily: "Outfit, sans-serif", lineHeight: 1, position: "relative" }}>
              X
              <svg style={{ position: "absolute", top: "-2px", right: "-8px" }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="19" x2="19" y2="5" />
                <polyline points="5 5 19 5 19 19" />
              </svg>
            </span>
          </div>
        </button>
        <div style={{ fontFamily: "Outfit, sans-serif", fontSize: "10px", fontWeight: 700, color: "#64748b", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "6px" }}>
          {brandLabel}
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "8px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {links.map((link, i) => {
          const isActive = i === activeIndex || pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "12px",
                fontFamily: "Outfit, sans-serif",
                fontSize: "13px",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#2563eb" : "#475569",
                backgroundColor: isActive ? "#eff6ff" : "transparent",
                border: isActive ? "1px solid #bfdbfe" : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px", color: isActive ? "#2563eb" : "#64748b" }}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div style={{ padding: "16px", borderTop: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "6px" }}>
        <button
          onClick={handleExitToWebsite}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#2563eb",
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            padding: "10px 16px",
            borderRadius: "10px",
            fontFamily: "Outfit, sans-serif",
            fontSize: "13px",
            fontWeight: 700,
            width: "100%",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.2s ease",
            marginBottom: "4px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#2563eb";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#eff6ff";
            e.currentTarget.style.color = "#2563eb";
          }}
          title="Return to Main Website (Requires password to re-enter)"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
          Main Website
        </button>
        <button
          onClick={() => window.open("mailto:contact@zytx.com", "_blank")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#475569",
            padding: "10px 16px",
            borderRadius: "10px",
            fontFamily: "Outfit, sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            width: "100%",
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>headset</span>
          Support
        </button>
        <button
          onClick={handleSignOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#475569",
            padding: "10px 16px",
            borderRadius: "10px",
            fontFamily: "Outfit, sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            width: "100%",
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-[#e2e8f0] rounded-lg text-[#475569] shadow-md"
        aria-label="Open navigation"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>menu</span>
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="md:hidden fixed left-0 top-0 h-full z-50 overflow-hidden shadow-2xl"
              style={{ width: "250px", background: "#ffffff", borderRight: "1px solid #e2e8f0" }}
            >
              <button onClick={() => setMobileOpen(false)} style={{ position: "absolute", top: "16px", right: "16px", color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:block"
        style={{
          width: "250px",
          minWidth: "250px",
          height: "100vh",
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          position: "sticky",
          top: 0,
          flexShrink: 0,
          overflowY: "auto",
        }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
