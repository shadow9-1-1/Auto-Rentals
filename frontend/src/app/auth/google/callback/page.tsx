"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/types";
import { Car, CheckCircle, AlertCircle } from "lucide-react";

function GoogleCallbackInner() {
  const { setTokens } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = params.get("token");
    const userStr = params.get("user");
    const error = params.get("error");

    if (error || !token || !userStr) {
      setStatus("error");
      setTimeout(() => router.push("/auth/login"), 2000);
      return;
    }
    try {
      const user = JSON.parse(decodeURIComponent(userStr)) as User;
      setTokens(token, user);
      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch {
      setStatus("error");
      setTimeout(() => router.push("/auth/login"), 2000);
    }
  }, [params, setTokens, router]);

  return (
    <div style={{ textAlign: "center" }}>
      {status === "loading" && (
        <>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid rgba(124,58,237,0.3)", borderTopColor: "#7c3aed", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--text-secondary)" }}>Completing sign-in...</p>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle size={48} color="#10b981" style={{ margin: "0 auto 1rem" }} />
          <p style={{ color: "#10b981", fontWeight: 600 }}>Success! Redirecting...</p>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle size={48} color="#ef4444" style={{ margin: "0 auto 1rem" }} />
          <p style={{ color: "#ef4444", fontWeight: 600 }}>Authentication failed</p>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Redirecting to login...</p>
        </>
      )}
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="hero-gradient" style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="glass-strong" style={{ padding: "3rem 2.5rem", borderRadius: "1.5rem", minWidth: "300px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Car size={22} color="white" />
          </div>
        </div>
        <Suspense fallback={<div style={{ color: "var(--text-secondary)" }}>Loading...</div>}>
          <GoogleCallbackInner />
        </Suspense>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
