"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Developer fallback credentials
    if (activeTab === 'student' && cleanEmail === 'student@university.edu' && password === 'password123') {
      localStorage.setItem("merkanto_role", "student");
      localStorage.setItem("merkanto_user", cleanEmail);
      router.push('/dashboard/student');
      return;
    }
    if (activeTab === 'admin' && (cleanEmail === 'admin@zytx.com' || cleanEmail === 'admin@merkanto.com') && (password === 'password123' || password === 'admin123')) {
      localStorage.setItem("merkanto_role", "admin");
      localStorage.setItem("merkanto_user", cleanEmail);
      router.push('/dashboard/admin');
      return;
    }

    try {
      // 2. Authenticate against Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (!authError && authData.user) {
        // Query user's profile to get assigned role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, name")
          .eq("id", authData.user.id)
          .maybeSingle();

        const role = profile?.role || (authData.user.user_metadata?.role) || activeTab;

        if (role !== activeTab) {
          setError(`This account is registered as a ${role}. Please switch to the ${role.toUpperCase()} tab.`);
          setLoading(false);
          return;
        }

        localStorage.setItem("merkanto_role", role);
        localStorage.setItem("merkanto_user", cleanEmail);
        if (profile?.name) localStorage.setItem("merkanto_user_name", profile.name);

        if (role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/student');
        }
        return;
      }

      // 3. Fallback: check profiles table directly
      const { data: directProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (directProfile && (directProfile.password === password || !directProfile.password)) {
        const role = directProfile.role || activeTab;
        if (role !== activeTab) {
          setError(`This account is registered as a ${role}. Please switch to the ${role.toUpperCase()} tab.`);
          setLoading(false);
          return;
        }

        localStorage.setItem("merkanto_role", role);
        localStorage.setItem("merkanto_user", cleanEmail);
        if (directProfile.name) localStorage.setItem("merkanto_user_name", directProfile.name);

        if (role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/student');
        }
        return;
      }

      setError(authError?.message || "Invalid email or password.");
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      {/* Top Left Return to Website */}
      <div style={{ position: "absolute", top: "28px", left: "28px", zIndex: 50 }}>
        <Link href="/" className={styles.backToSite}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Main Website
        </Link>
      </div>

      <div className={styles.logoMark}>
        <Link href="/" className={styles.logo} style={{ textDecoration: "none" }}>
          <span className={styles.logoText}>ZYT</span>
          <span className={styles.logoX}>
            X
            <svg className={styles.logoArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="19" x2="19" y2="5"></line>
              <polyline points="5 5 19 5 19 19"></polyline>
            </svg>
          </span>
        </Link>
      </div>

      <div className={styles.loginCardWrapper}>
        <div className={styles.loginCard}>
          <div className={styles.header}>
            <h1 className={styles.title}>PORTAL ACCESS</h1>
            <p className={styles.subtitle}>SECURE AUTHENTICATION</p>
          </div>

          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'student' ? styles.activeTab : ''}`}
              onClick={() => { setActiveTab('student'); setError(''); }}
            >
              STUDENT
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'admin' ? styles.activeTab : ''}`}
              onClick={() => { setActiveTab('admin'); setError(''); }}
            >
              ADMIN
            </button>
          </div>

          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label>EMAIL</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeTab === 'student' ? "student@university.edu" : "admin@zytx.com"} 
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>PASSWORD</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className={styles.input}
              />
            </div>

            {error && <p style={{ color: '#ff4444', fontSize: '0.75rem', marginTop: '-1rem', marginBottom: '1rem' }}>{error}</p>}

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? "AUTHENTICATING..." : "AUTHENTICATE"}
            </button>
          </form>

          <div className={styles.footer}>
            <Link href="#" className={styles.forgotLink}>FORGOT PASSWORD?</Link>
            <Link href="/" className={styles.forgotLink} style={{ color: "#94a3b8" }}>
              ← Main Website
            </Link>
            <span className={styles.versionText}>ZYT X Academy v1.1</span>
          </div>
        </div>
      </div>
    </main>
  );
}
