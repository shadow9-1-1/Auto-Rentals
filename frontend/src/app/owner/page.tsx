"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { vehicleService, bookingService } from "@/services/api";
import { Vehicle, Booking } from "@/types";
import {
  Car,
  DollarSign,
  Calendar,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Star,
  Eye,
} from "lucide-react";
import Link from "next/link";



function OwnerDashboardContent() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      vehicleService.list().then((r) => setVehicles(r.data)).catch(() => {}),
      bookingService.list().then(setBookings).catch(() => {}),
    ]).finally(() => setIsLoading(false));
  }, []);

  const revenue = bookings.filter(b => b.paymentStatus === "paid").reduce((s, b) => s + b.totalPrice, 0);
  const avgRating = vehicles.reduce((s, v) => s + (v.averageRating || 0), 0) / (vehicles.length || 1);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this vehicle?")) {
      await vehicleService.delete(id);
      setVehicles(vs => vs.filter(v => v._id !== id));
    }
  };

  return (
    <DashboardLayout title="Owner Dashboard">
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { icon: Car, label: "My Vehicles", value: vehicles.length, color: "#a78bfa" },
          { icon: Calendar, label: "Total Bookings", value: bookings.length, color: "#60a5fa" },
          { icon: DollarSign, label: "Total Revenue", value: `$${revenue}`, color: "#10b981" },
          { icon: Star, label: "Avg. Rating", value: avgRating.toFixed(1), color: "#f59e0b" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card" style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>{label}</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "white" }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Vehicles */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "white" }}>My Vehicles</h2>
          <Link href="/owner/vehicles/new" className="btn-primary" style={{ textDecoration: "none", fontSize: "0.8125rem", padding: "0.4rem 0.875rem" }}>
            <Plus size={14} />
            Add Vehicle
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {vehicles.map(vehicle => (
            <div key={vehicle._id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "10px", background: "linear-gradient(135deg, #1e40af, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Car size={24} color="rgba(255,255,255,0.4)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "white", fontSize: "0.9rem" }}>{vehicle.make} {vehicle.model} ({vehicle.year})</div>
                <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{vehicle.type} · ${vehicle.pricePerDay}/day · {vehicle.location}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.2rem" }}>
                  <Star size={11} color="#f59e0b" fill="#f59e0b" />
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{vehicle.averageRating?.toFixed(1)} ({vehicle.reviewCount})</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className={`badge ${vehicle.status === "available" ? "badge-success" : "badge-warning"}`}>{vehicle.status}</span>
                <Link href={`/vehicles/${vehicle._id}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af", textDecoration: "none" }}>
                  <Eye size={13} />
                </Link>
                <Link href={`/owner/vehicles/${vehicle._id}/edit`} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "8px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa", textDecoration: "none" }}>
                  <Edit size={13} />
                </Link>
                <button onClick={() => handleDelete(vehicle._id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "white", marginBottom: "1.25rem" }}>Recent Bookings</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Renter", "Vehicle", "Dates", "Amount", "Status"].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", color: "#9ca3af", fontWeight: 600, fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const v = b.vehicle as Vehicle;
                const renter = b.renter as typeof MOCK_BOOKINGS[0]["renter"];
                return (
                  <tr key={b._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 0.875rem", color: "white", fontWeight: 500 }}>{renter.name}</td>
                    <td style={{ padding: "0.75rem 0.875rem", color: "#d1d5db" }}>{v.make} {v.model}</td>
                    <td style={{ padding: "0.75rem 0.875rem", color: "#9ca3af", fontSize: "0.8rem" }}>{new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}</td>
                    <td style={{ padding: "0.75rem 0.875rem", color: "#a78bfa", fontWeight: 700 }}>${b.totalPrice}</td>
                    <td style={{ padding: "0.75rem 0.875rem" }}>
                      <span className={`badge ${b.status === "completed" ? "badge-success" : b.status === "confirmed" ? "badge-info" : "badge-gray"}`}>{b.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function OwnerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <OwnerDashboardContent />
    </ProtectedRoute>
  );
}
