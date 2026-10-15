"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabaseClient";

export interface DemoProfile {
  id: string;
  name: string;
  email: string;
  demo_status: "pending" | "approved" | "paused" | "rejected";
  role: string;
  joined_date?: string;
}

export interface DemoConfig {
  v1: { title: string; url: string };
  v2: { title: string; url: string };
  whatsapp: string;
}

const DEFAULT_DEMO_CONFIG: DemoConfig = {
  v1: {
    title: "DEMO VIDEO 1: MASTERCLASS OVERVIEW",
    url: "https://player.vimeo.com/video/1197817919?h=31d77d474c"
  },
  v2: {
    title: "DEMO VIDEO 2: BASICS OF EXPORTING",
    url: "https://player.vimeo.com/video/1197817919?h=31d77d474c"
  },
  whatsapp: "+91 98765 43210"
};

export function useDemo() {
  const [demoRequests, setDemoRequests] = useState<DemoProfile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchDemoRequests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, demo_status, role, joined_date")
        .not("demo_status", "is", null)
        .order("joined_date", { ascending: false });

      if (error) {
        console.error("Error loading demo requests:", error.message || error);
      } else {
        setDemoRequests(data as DemoProfile[]);
      }
    } catch (e) {
      console.error("Failed to query demo requests:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchDemoRequests();
  }, [fetchDemoRequests]);

  const updateDemoStatus = async (id: string, status: DemoProfile["demo_status"]) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ demo_status: status })
        .eq("id", id);
        
      if (error) throw error;
      await fetchDemoRequests();
      return true;
    } catch (e) {
      console.error("Failed to update status:", e);
      return false;
    }
  };

  const deleteDemoRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ demo_status: null })
        .eq("id", id);
        
      if (error) throw error;
      await fetchDemoRequests();
      return true;
    } catch (e) {
      console.error("Failed to clear demo request:", e);
      return false;
    }
  };

  const clearAllDemoRequests = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ demo_status: null })
        .not("demo_status", "is", null);
        
      if (error) throw error;
      await fetchDemoRequests();
      return true;
    } catch (e) {
      console.error("Failed to clear demo requests:", e);
      return false;
    }
  };

  const fetchDemoVideos = useCallback(async (): Promise<DemoConfig> => {
    try {
      const { data } = await supabase
        .from("merkanto_content")
        .select("key, value")
        .in("key", ["demo.v1.title", "demo.v1.url", "demo.v2.title", "demo.v2.url", "demo.whatsapp"]);

      if (data && data.length > 0) {
        const getVal = (k: string, fb: string) => data.find(d => d.key === k)?.value || fb;
        return {
          v1: {
            title: getVal("demo.v1.title", DEFAULT_DEMO_CONFIG.v1.title),
            url: getVal("demo.v1.url", DEFAULT_DEMO_CONFIG.v1.url)
          },
          v2: {
            title: getVal("demo.v2.title", DEFAULT_DEMO_CONFIG.v2.title),
            url: getVal("demo.v2.url", DEFAULT_DEMO_CONFIG.v2.url)
          },
          whatsapp: getVal("demo.whatsapp", DEFAULT_DEMO_CONFIG.whatsapp)
        };
      }
    } catch (e) {
      console.error("Failed to load demo configuration:", e);
    }
    return DEFAULT_DEMO_CONFIG;
  }, []);

  const saveDemoVideos = useCallback(async (
    v1: { title: string; url: string }, 
    v2: { title: string; url: string },
    whatsapp?: string
  ) => {
    try {
      const payload = [
        { key: "demo.v1.title", value: v1.title, category: "Demo", label: "Demo Video 1 Title", type: "text" },
        { key: "demo.v1.url", value: v1.url, category: "Demo", label: "Demo Video 1 URL", type: "video" },
        { key: "demo.v2.title", value: v2.title, category: "Demo", label: "Demo Video 2 Title", type: "text" },
        { key: "demo.v2.url", value: v2.url, category: "Demo", label: "Demo Video 2 URL", type: "video" },
        ...(whatsapp ? [{ key: "demo.whatsapp", value: whatsapp, category: "Demo", label: "WhatsApp Contact Number", type: "text" }] : [])
      ];
      await supabase.from("merkanto_content").upsert(payload, { onConflict: "key" });
      return true;
    } catch (e) {
      console.error("Error saving demo configuration:", e);
      return false;
    }
  }, []);

  return {
    demoRequests,
    isLoaded,
    updateDemoStatus,
    deleteDemoRequest,
    clearAllDemoRequests,
    fetchDemoRequests,
    fetchDemoVideos,
    saveDemoVideos
  };
}
