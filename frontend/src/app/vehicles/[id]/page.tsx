"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { vehicleService, reviewService } from "@/services/api";
import { Vehicle, Review } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Loader2, AlertCircle } from "lucide-react";
import {
  Car,
  MapPin,
  Star,
  Users,
  Fuel,
  Gauge,
  Calendar,
  ArrowLeft,
  Shield,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";



export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const id = params?.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const days =
    startDate && endDate && vehicle
      ? Math.max(0, differenceInDays(parseISO(endDate), parseISO(startDate)))
      : 0;
  const totalPrice = vehicle ? days * vehicle.pricePerDay : 0;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const [v, r] = await Promise.all([
          vehicleService.get(id),
          reviewService.list(id),
        ]);
        setVehicle(v);
        setReviews(r);
      } catch {
        setLoadError("Could not load vehicle details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleBooking = () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (!startDate || !endDate || days < 1) return;
    router.push(
      `/booking?vehicleId=${id}&startDate=${startDate}&endDate=${endDate}`
    );
  };

  const placeholderColors = [
    "linear-gradient(135deg, #1e40af, #6d28d9)",
    "linear-gradient(135deg, #065f46, #0f766e)",
    "linear-gradient(135deg, #7c2d12, #9a3412)",
  ];

  if (isLoading) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 size={48} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading vehicle details...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (loadError || !vehicle) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ color: "white", fontWeight: 700, marginBottom: "0.5rem" }}>Vehicle Not Found</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{loadError || "This vehicle does not exist."}</p>
          <Link href="/vehicles" className="btn-primary" style={{ textDecoration: "none" }}>Back to Listings</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg-primary)", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Back */}
        <Link href="/vehicles" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#9ca3af", textDecoration: "none", fontSize: "0.875rem", marginBottom: "1.5rem", transition: "color 0.2s" }}>
          <ArrowLeft size={16} />
          Back to Listings
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr min(380px, 35%)", gap: "2rem", alignItems: "start" }}>
          {/* LEFT: Gallery + Details */}
          <div>
            {/* Gallery */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  height: "340px",
                  borderRadius: "1.25rem",
                  background: placeholderColors[activeImage % placeholderColors.length],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.75rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Car size={100} color="rgba(255,255,255,0.15)" />
                <div style={{ position: "absolute", bottom: "1rem", right: "1rem" }}>
                  <span className={`badge ${vehicle.status === "available" ? "badge-success" : "badge-danger"}`}>
                    {vehicle.status}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {placeholderColors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    style={{
                      width: "80px",
                      height: "60px",
                      borderRadius: "0.625rem",
                      background: c,
                      border: activeImage === i ? "2px solid #7c3aed" : "2px solid transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <Car size={20} color="rgba(255,255,255,0.4)" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", marginBottom: "0.25rem" }}>
                    {vehicle.make} {vehicle.model}
                  </h1>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#9ca3af", fontSize: "0.875rem" }}>
                      <MapPin size={14} />
                      {vehicle.location}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />
                      <span style={{ fontWeight: 700, color: "white", fontSize: "0.875rem" }}>{vehicle.averageRating?.toFixed(1)}</span>
                      <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>({vehicle.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "2rem", fontWeight: 900, color: "#a78bfa" }}>${vehicle.pricePerDay}</span>
                  <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>/day</div>
                </div>
              </div>

              {/* Specs Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
                {[
                  { icon: Calendar, label: "Year", value: vehicle.year },
                  { icon: Users, label: "Seats", value: `${vehicle.seats} passengers` },
                  { icon: Fuel, label: "Fuel", value: vehicle.fuelType },
                  { icon: Gauge, label: "Transmission", value: vehicle.transmission },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "0.75rem", padding: "0.875rem", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#9ca3af", fontSize: "0.75rem", marginBottom: "0.375rem" }}>
                      <Icon size={13} />
                      {label}
                    </div>
                    <div style={{ color: "white", fontWeight: 600, fontSize: "0.875rem", textTransform: "capitalize" }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>About This Vehicle</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.7 }}>{vehicle.description}</p>
              </div>
            </div>

            {/* Features */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "white", marginBottom: "1rem" }}>Features & Amenities</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.625rem" }}>
                {vehicle.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#d1d5db", fontSize: "0.8375rem" }}>
                    <CheckCircle size={14} color="#10b981" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "white" }}>Reviews ({reviews.length})</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <Star size={16} color="#f59e0b" fill="#f59e0b" />
                  <span style={{ fontWeight: 700, color: "white" }}>{vehicle.averageRating?.toFixed(1)}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {reviews.map((review) => (
                  <div key={review._id} style={{ paddingBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "white" }}>
                          {review.reviewer.name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>{review.reviewer.name}</div>
                          <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
                            {format(parseISO(review.createdAt), "MMM dd, yyyy")}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "1px" }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} color="#f59e0b" fill={i < review.rating ? "#f59e0b" : "transparent"} />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: "#d1d5db", fontSize: "0.8375rem", lineHeight: 1.6 }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Booking Card */}
          <div style={{ position: "sticky", top: "80px" }}>
            <div className="card">
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "white", marginBottom: "1.25rem" }}>Book This Vehicle</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "1.25rem" }}>
                <div>
                  <label className="label">Pick-up Date</label>
                  <div style={{ position: "relative" }}>
                    <Calendar size={14} color="#6b7280" style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="date"
                      className="input"
                      style={{ paddingLeft: "2.5rem", colorScheme: "dark" }}
                      min={format(new Date(), "yyyy-MM-dd")}
                      value={startDate}
                      onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value >= endDate) setEndDate(""); }}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Return Date</label>
                  <div style={{ position: "relative" }}>
                    <Calendar size={14} color="#6b7280" style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="date"
                      className="input"
                      style={{ paddingLeft: "2.5rem", colorScheme: "dark" }}
                      min={startDate || format(new Date(), "yyyy-MM-dd")}
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {days > 0 && (
                <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "0.75rem", padding: "1rem", marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>${vehicle.pricePerDay} × {days} days</span>
                    <span style={{ color: "white", fontWeight: 600 }}>${vehicle.pricePerDay * days}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Service fee</span>
                    <span style={{ color: "white", fontWeight: 600 }}>$0</span>
                  </div>
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "0.75rem 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, color: "white" }}>Total</span>
                    <span style={{ fontSize: "1.125rem", fontWeight: 800, color: "#a78bfa" }}>${totalPrice}</span>
                  </div>
                </div>
              )}

              <button
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", opacity: days < 1 ? 0.5 : 1 }}
                disabled={days < 1 || bookingLoading}
                onClick={handleBooking}
              >
                {bookingLoading ? "Processing..." : days < 1 ? "Select Dates" : "Reserve Now"}
                {days >= 1 && <ArrowRight size={15} />}
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", marginTop: "1rem", color: "#9ca3af", fontSize: "0.75rem" }}>
                <Shield size={13} />
                Secure booking · Free cancellation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
