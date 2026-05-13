"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { bookingService } from "@/services/api";
import { Booking } from "@/types";
import {
  Calendar,
  Car,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "badge-warning" },
  confirmed: { label: "Confirmed", className: "badge-info" },
  active: { label: "Active", className: "badge-success" },
  completed: { label: "Completed", className: "badge-gray" },
  cancelled: { label: "Cancelled", className: "badge-danger" },
};



function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>{label}</div>
        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>{value}</div>
      </div>
    </div>
  );
}

function UserDashboardContent() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bookingService
      .list()
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setIsLoading(false));
  }, []);

  const stats = {
    total: bookings.length,
    active: bookings.filter(b => ["confirmed", "active"].includes(b.status)).length,
    completed: bookings.filter(b => b.status === "completed").length,
    spent: bookings.filter(b => b.paymentStatus === "paid").reduce((s, b) => s + b.totalPrice, 0),
  };

  return (
    <DashboardLayout title={`Welcome back, ${user?.name?.split(" ")[0]} 👋`}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard icon={Calendar} label="Total Bookings" value={stats.total} color="#a78bfa" />
        <StatCard icon={Clock} label="Active / Upcoming" value={stats.active} color="#60a5fa" />
        <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="#10b981" />
        <StatCard icon={CreditCard} label="Total Spent" value={`$${stats.spent}`} color="#f59e0b" />
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "white" }}>Recent Bookings</h2>
          <Link href="/dashboard/bookings" style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#a78bfa", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600 }}>
            View All <ArrowRight size={13} />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
            <Car size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
            <p>No bookings yet.</p>
            <Link href="/vehicles" className="btn-primary" style={{ textDecoration: "none", marginTop: "1rem", display: "inline-flex" }}>
              Browse Cars
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {bookings.slice(0, 5).map((booking) => {
              const vehicle = booking.vehicle as typeof MOCK_BOOKINGS[0]["vehicle"];
              const sc = statusConfig[booking.status];
              return (
                <div key={booking._id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "linear-gradient(135deg, #1e40af, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Car size={20} color="rgba(255,255,255,0.5)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>{vehicle.make} {vehicle.model}</div>
                    <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
                      {format(parseISO(booking.startDate), "MMM dd")} — {format(parseISO(booking.endDate), "MMM dd, yyyy")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: "0.25rem" }}>${booking.totalPrice}</div>
                    <span className={`badge ${sc.className}`}>{sc.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
        <Link href="/vehicles" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1.25rem", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "1rem", textDecoration: "none", transition: "background 0.2s" }}>
          <Car size={20} color="#a78bfa" />
          <span style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>Browse Cars</span>
        </Link>
        <Link href="/dashboard/reviews" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1.25rem", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "1rem", textDecoration: "none" }}>
          <Star size={20} color="#f59e0b" />
          <span style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>Write a Review</span>
        </Link>
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["renter"]}>
      <UserDashboardContent />
    </ProtectedRoute>
  );
}
