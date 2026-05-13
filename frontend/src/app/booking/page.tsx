"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { bookingService, paymentService, vehicleService } from "@/services/api";
import { Vehicle, Booking } from "@/types";
import {
  Car,
  Calendar,
  MapPin,
  Shield,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import Link from "next/link";



type Step = "summary" | "processing" | "confirm";

function BookingInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const vehicleId = searchParams.get("vehicleId") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [vehicleLoading, setVehicleLoading] = useState(true);
  const [step, setStep] = useState<Step>("summary");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const days =
    startDate && endDate && vehicle
      ? Math.max(1, differenceInDays(parseISO(endDate), parseISO(startDate)))
      : 1;
  const totalPrice = vehicle ? days * vehicle.pricePerDay : 0;
  const serviceFee = Math.round(totalPrice * 0.05);

  useEffect(() => {
    if (!vehicleId) return;
    setVehicleLoading(true);
    vehicleService
      .get(vehicleId)
      .then(setVehicle)
      .catch(() => {})
      .finally(() => setVehicleLoading(false));
  }, [vehicleId]);

  if (vehicleLoading) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid rgba(124,58,237,0.3)", borderTopColor: "#7c3aed", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Vehicle not found. <a href="/vehicles" style={{ color: "#a78bfa" }}>Browse vehicles →</a></p>
      </div>
    );
  }

  const handleConfirmBooking = async () => {
    setIsLoading(true);
    setError("");
    try {
      const b = await bookingService.create({ vehicleId, startDate, endDate });
      setBooking(b);
      setStep("confirm");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || "Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!booking) return;
    setIsLoading(true);
    setStep("processing");
    try {
      const { url } = await paymentService.createCheckoutSession({
        bookingId: booking._id,
        vehicleId,
        startDate,
        endDate,
        totalPrice: totalPrice + serviceFee,
      });
      window.location.href = url;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || "Payment initialization failed");
      setStep("confirm");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg-primary)", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>Complete Your Booking</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.875rem" }}>Review your booking details before confirming</p>

        {/* Progress Steps */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2.5rem" }}>
          {(["summary", "confirm"] as Step[]).map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: step === s || (step === "processing" && s === "confirm") || (step === "confirm" && i === 0) ? "#7c3aed" : "rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", fontWeight: 700, color: "white",
              }}>
                {step === "confirm" && i === 0 ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: "0.8125rem", color: step === s ? "#a78bfa" : "#9ca3af", fontWeight: step === s ? 600 : 400, textTransform: "capitalize" }}>
                {s === "summary" ? "Summary" : "Payment"}
              </span>
              {i < 1 && <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)", width: "40px" }} />}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Vehicle Summary */}
            <div className="card">
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "white", marginBottom: "1rem" }}>Vehicle</h3>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{ width: "80px", height: "60px", borderRadius: "0.75rem", background: "linear-gradient(135deg, #1e40af, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Car size={28} color="rgba(255,255,255,0.4)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "white" }}>{vehicle.make} {vehicle.model}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#9ca3af", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                    <MapPin size={11} /> {vehicle.location}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="card">
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "white", marginBottom: "1rem" }}>Rental Period</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {[
                  { label: "Pick-up", date: startDate },
                  { label: "Return", date: endDate },
                ].map(({ label, date }) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "0.75rem", padding: "0.875rem", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#9ca3af", fontSize: "0.75rem", marginBottom: "0.375rem" }}>
                      <Calendar size={12} /> {label}
                    </div>
                    <div style={{ fontWeight: 700, color: "white" }}>{date ? format(parseISO(date), "MMM dd, yyyy") : "—"}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "0.75rem", color: "#a78bfa", fontWeight: 600, fontSize: "0.875rem" }}>
                {days} day{days !== 1 ? "s" : ""} total
              </div>
            </div>

            {/* Renter Info */}
            <div className="card">
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "white", marginBottom: "1rem" }}>Renter Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <div style={{ color: "#9ca3af", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Full Name</div>
                  <div style={{ color: "white", fontWeight: 600 }}>{user?.name}</div>
                </div>
                <div>
                  <div style={{ color: "#9ca3af", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Email</div>
                  <div style={{ color: "white", fontWeight: 600 }}>{user?.email}</div>
                </div>
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.75rem", padding: "0.875rem 1rem", color: "#ef4444", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}

            {/* Actions */}
            {step === "summary" && (
              <button className="btn-primary" style={{ justifyContent: "center" }} onClick={handleConfirmBooking} disabled={isLoading}>
                {isLoading ? <><Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Processing...</> : <>Confirm Booking <ArrowRight size={15} /></>}
              </button>
            )}
            {step === "confirm" && (
              <button className="btn-primary" style={{ justifyContent: "center" }} onClick={handleStripeCheckout} disabled={isLoading}>
                {isLoading ? <><Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Redirecting to Stripe...</> : <><CreditCard size={15} /> Pay Now — ${totalPrice + serviceFee}</>}
              </button>
            )}
            {step === "processing" && (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid rgba(124,58,237,0.3)", borderTopColor: "#7c3aed", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
                <p style={{ color: "var(--text-secondary)" }}>Redirecting to Stripe...</p>
              </div>
            )}
          </div>

          {/* Right: Price Summary */}
          <div style={{ position: "sticky", top: "80px" }}>
            <div className="card">
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "white", marginBottom: "1.25rem" }}>Price Summary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>${vehicle.pricePerDay}/day × {days}</span>
                  <span style={{ color: "white" }}>${vehicle.pricePerDay * days}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Service fee (5%)</span>
                  <span style={{ color: "white" }}>${serviceFee}</span>
                </div>
                <div style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, color: "white" }}>Total</span>
                  <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#a78bfa" }}>${totalPrice + serviceFee}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1rem" }}>
                {["Secure Stripe payment", "Free cancellation", "24/7 support"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#9ca3af", fontSize: "0.75rem" }}>
                    <Shield size={12} color="#10b981" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function BookingPage() {
  return (
    <ProtectedRoute allowedRoles={["renter", "admin"]}>
      <Suspense fallback={<div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid rgba(124,58,237,0.3)", borderTopColor: "#7c3aed", animation: "spin 0.8s linear infinite" }} /></div>}>
        <BookingInner />
      </Suspense>
    </ProtectedRoute>
  );
}
