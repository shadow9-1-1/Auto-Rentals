"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { bookingService } from "@/services/api";
import { Booking } from "@/types";
import { Car, Calendar, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "badge-warning" },
  confirmed: { label: "Confirmed", className: "badge-info" },
  active: { label: "Active", className: "badge-success" },
  completed: { label: "Completed", className: "badge-gray" },
  cancelled: { label: "Cancelled", className: "badge-danger" },
};

const MOCK_BOOKINGS: Booking[] = [
  { _id: "b1", vehicle: { _id: "v1", make: "BMW", model: "M4", year: 2023, type: "Sports", fuelType: "petrol", transmission: "automatic", seats: 4, pricePerDay: 280, location: "New York", images: [], features: [], status: "available", owner: "o1", createdAt: "", updatedAt: "" }, renter: { _id: "u1", name: "You", email: "", role: "renter", createdAt: "" }, startDate: new Date(Date.now() + 86400000 * 3).toISOString(), endDate: new Date(Date.now() + 86400000 * 6).toISOString(), totalDays: 3, totalPrice: 840, status: "confirmed", paymentStatus: "paid", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: "b2", vehicle: { _id: "v2", make: "Tesla", model: "Model S", year: 2022, type: "Sedan", fuelType: "electric", transmission: "automatic", seats: 5, pricePerDay: 195, location: "Los Angeles", images: [], features: [], status: "available", owner: "o2", createdAt: "", updatedAt: "" }, renter: { _id: "u1", name: "You", email: "", role: "renter", createdAt: "" }, startDate: new Date(Date.now() - 86400000 * 10).toISOString(), endDate: new Date(Date.now() - 86400000 * 7).toISOString(), totalDays: 3, totalPrice: 585, status: "completed", paymentStatus: "paid", createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), updatedAt: new Date().toISOString() },
  { _id: "b3", vehicle: { _id: "v3", make: "Porsche", model: "Cayenne", year: 2023, type: "SUV", fuelType: "petrol", transmission: "automatic", seats: 5, pricePerDay: 310, location: "Miami", images: [], features: [], status: "available", owner: "o3", createdAt: "", updatedAt: "" }, renter: { _id: "u1", name: "You", email: "", role: "renter", createdAt: "" }, startDate: new Date(Date.now() - 86400000 * 30).toISOString(), endDate: new Date(Date.now() - 86400000 * 27).toISOString(), totalDays: 3, totalPrice: 930, status: "cancelled", paymentStatus: "refunded", createdAt: new Date(Date.now() - 86400000 * 35).toISOString(), updatedAt: new Date().toISOString() },
];

function BookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    bookingService.list().then(setBookings).catch(() => setBookings(MOCK_BOOKINGS));
  }, []);

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  return (
    <DashboardLayout title="My Bookings">
      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {["all", "confirmed", "active", "completed", "cancelled"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "0.4rem 0.875rem",
              borderRadius: "9999px",
              border: `1px solid ${filter === f ? "#7c3aed" : "rgba(255,255,255,0.08)"}`,
              background: filter === f ? "rgba(124,58,237,0.15)" : "transparent",
              color: filter === f ? "#a78bfa" : "#9ca3af",
              fontSize: "0.8rem",
              fontWeight: filter === f ? 600 : 400,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.2s",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
          <Car size={48} color="#4b5563" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ color: "white", fontWeight: 700, marginBottom: "0.5rem" }}>No bookings found</h3>
          <Link href="/vehicles" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", marginTop: "1rem" }}>Browse Cars</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filtered.map(booking => {
            const vehicle = booking.vehicle as typeof MOCK_BOOKINGS[0]["vehicle"];
            const sc = statusConfig[booking.status];
            return (
              <div key={booking._id} className="card" style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: "linear-gradient(135deg, #1e40af, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Car size={26} color="rgba(255,255,255,0.5)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "white", marginBottom: "0.25rem" }}>{vehicle.make} {vehicle.model} ({vehicle.year})</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#9ca3af", fontSize: "0.8rem" }}>
                      <Calendar size={12} />
                      {format(parseISO(booking.startDate), "MMM dd")} — {format(parseISO(booking.endDate), "MMM dd, yyyy")} · {booking.totalDays} days
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1.125rem", fontWeight: 800, color: "#a78bfa" }}>${booking.totalPrice}</span>
                    <span className={`badge ${sc.className}`}>{sc.label}</span>
                    <span className={`badge ${booking.paymentStatus === "paid" ? "badge-success" : booking.paymentStatus === "refunded" ? "badge-warning" : "badge-gray"}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
                {booking.status === "confirmed" && (
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={async () => {
                        await bookingService.updateStatus(booking._id, "cancelled");
                        setBookings(bs => bs.map(b => b._id === booking._id ? { ...b, status: "cancelled" } : b));
                      }}
                      style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.625rem", padding: "0.4rem 0.875rem", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer" }}
                    >
                      <XCircle size={13} />
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

export default function DashboardBookingsPage() {
  return (
    <ProtectedRoute allowedRoles={["renter"]}>
      <BookingsContent />
    </ProtectedRoute>
  );
}
