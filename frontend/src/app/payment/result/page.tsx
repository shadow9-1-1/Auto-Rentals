"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, ArrowRight, Car } from "lucide-react";

function PaymentResultInner() {
  const params = useSearchParams();
  const success = params.get("success") === "true" || !params.get("cancelled");
  const cancelled = params.get("cancelled") === "true";

  const isSuccess = success && !cancelled;

  return (
    <div style={{ textAlign: "center" }}>
      {isSuccess ? (
        <>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <CheckCircle size={40} color="#10b981" />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>Payment Successful!</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Your booking has been confirmed. You'll receive a confirmation email shortly.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/dashboard" className="btn-primary" style={{ textDecoration: "none" }}>
              View My Bookings
              <ArrowRight size={15} />
            </Link>
            <Link href="/vehicles" className="btn-secondary" style={{ textDecoration: "none" }}>
              Browse More Cars
            </Link>
          </div>
        </>
      ) : (
        <>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <XCircle size={40} color="#ef4444" />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>Payment Cancelled</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Your payment was cancelled. No charges were made to your account.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/vehicles" className="btn-primary" style={{ textDecoration: "none" }}>
              Try Again
              <ArrowRight size={15} />
            </Link>
            <Link href="/dashboard" className="btn-secondary" style={{ textDecoration: "none" }}>
              Go to Dashboard
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <div className="hero-gradient" style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <div className="glass-strong" style={{ borderRadius: "1.5rem", padding: "3rem 2.5rem", maxWidth: "480px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Car size={22} color="white" />
          </div>
        </div>
        <Suspense fallback={<div style={{ textAlign: "center", color: "var(--text-secondary)" }}>Loading...</div>}>
          <PaymentResultInner />
        </Suspense>
      </div>
    </div>
  );
}
