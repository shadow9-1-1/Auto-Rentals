"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService } from "@/services/api";
import { AdminOverview } from "@/types";
import {
  Users,
  Car,
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const MOCK_OVERVIEW: AdminOverview = {
  totalUsers: 1248,
  totalVehicles: 342,
  totalBookings: 2891,
  totalRevenue: 487320,
  recentBookings: [],
  bookingsByStatus: {
    pending: 48,
    confirmed: 234,
    active: 89,
    completed: 2390,
    cancelled: 130,
  },
  revenueByMonth: [
    { month: "Jan", revenue: 32000 },
    { month: "Feb", revenue: 41000 },
    { month: "Mar", revenue: 38000 },
    { month: "Apr", revenue: 52000 },
    { month: "May", revenue: 61000 },
    { month: "Jun", revenue: 75000 },
    { month: "Jul", revenue: 89000 },
    { month: "Aug", revenue: 95000 },
    { month: "Sep", revenue: 72000 },
    { month: "Oct", revenue: 68000 },
    { month: "Nov", revenue: 57000 },
    { month: "Dec", revenue: 71000 },
  ],
};

const MOCK_USERS = [
  { _id: "u1", name: "Alice Johnson", email: "alice@example.com", role: "renter", createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { _id: "u2", name: "Bob Smith", email: "bob@example.com", role: "owner", createdAt: new Date(Date.now() - 86400000 * 12).toISOString() },
  { _id: "u3", name: "Carlos Rivera", email: "carlos@example.com", role: "renter", createdAt: new Date(Date.now() - 86400000 * 20).toISOString() },
  { _id: "u4", name: "Diana Prince", email: "diana@example.com", role: "owner", createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { _id: "u5", name: "Ethan Wong", email: "ethan@example.com", role: "renter", createdAt: new Date(Date.now() - 86400000 * 45).toISOString() },
];

const PIE_COLORS = ["#7c3aed", "#3b82f6", "#10b981", "#6b7280", "#ef4444"];

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: "#1f2937",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "0.75rem",
  color: "#e5e7eb",
  fontSize: "0.8125rem",
  padding: "0.625rem 0.875rem",
};

function AdminDashboardContent() {
  const [overview, setOverview] = useState<AdminOverview>(MOCK_OVERVIEW);

  useEffect(() => {
    adminService.getOverview().then(setOverview).catch(() => setOverview(MOCK_OVERVIEW));
  }, []);

  const pieData = Object.entries(overview.bookingsByStatus).map(([name, value]) => ({ name, value }));

  const statsCards = [
    { icon: Users, label: "Total Users", value: overview.totalUsers.toLocaleString(), color: "#a78bfa", change: "+12%" },
    { icon: Car, label: "Total Vehicles", value: overview.totalVehicles.toLocaleString(), color: "#60a5fa", change: "+8%" },
    { icon: Calendar, label: "Total Bookings", value: overview.totalBookings.toLocaleString(), color: "#10b981", change: "+23%" },
    { icon: DollarSign, label: "Total Revenue", value: `$${(overview.totalRevenue / 1000).toFixed(1)}K`, color: "#f59e0b", change: "+18%" },
  ];

  return (
    <DashboardLayout title="Admin Overview">
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {statsCards.map(({ icon: Icon, label, value, color, change }) => (
          <div key={label} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={20} color={color} />
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "0.2rem 0.5rem", borderRadius: "9999px" }}>
                {change}
              </span>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "white", marginBottom: "0.25rem" }}>{value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <TrendingUp size={18} color="#a78bfa" />
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "white" }}>Revenue Overview (12 months)</h2>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={overview.revenueByMonth} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}K`} />
            <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#colorRevenue)" dot={{ fill: "#7c3aed", r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Booking Status Pie */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <BarChart3 size={16} color="#a78bfa" />
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "white" }}>Bookings by Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status Bar */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <BarChart3 size={16} color="#60a5fa" />
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "white" }}>Status Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pieData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Management Table */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <Shield size={16} color="#a78bfa" />
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "white" }}>Recent Users</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["User", "Email", "Role", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", color: "#9ca3af", fontWeight: 600, fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map(user => (
                <tr key={user._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}>
                  <td style={{ padding: "0.875rem 0.875rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: "0.75rem", flexShrink: 0 }}>
                        {user.name[0]}
                      </div>
                      <span style={{ fontWeight: 600, color: "white" }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "0.875rem 0.875rem", color: "#9ca3af" }}>{user.email}</td>
                  <td style={{ padding: "0.875rem 0.875rem" }}>
                    <span className={`badge ${user.role === "admin" ? "badge-danger" : user.role === "owner" ? "badge-info" : "badge-success"}`} style={{ textTransform: "capitalize" }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 0.875rem", color: "#9ca3af", fontSize: "0.8rem" }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "0.875rem 0.875rem" }}>
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <button style={{ padding: "0.3rem 0.625rem", borderRadius: "0.5rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer", fontWeight: 500 }}>
                        Suspend
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Moderation Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
        {[
          { icon: Car, label: "Pending Vehicles", value: "7", color: "#f59e0b", action: "Review" },
          { icon: CheckCircle, label: "Completed Today", value: "23", color: "#10b981", action: "View" },
          { icon: Clock, label: "Pending Bookings", value: "48", color: "#60a5fa", action: "Manage" },
          { icon: XCircle, label: "Disputes", value: "3", color: "#ef4444", action: "Resolve" },
        ].map(({ icon: Icon, label, value, color, action }) => (
          <div key={label} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Icon size={18} color={color} />
              <div>
                <div style={{ fontWeight: 800, color: "white", fontSize: "1.125rem" }}>{value}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{label}</div>
              </div>
            </div>
            <button style={{ fontSize: "0.75rem", padding: "0.3rem 0.625rem", borderRadius: "0.5rem", border: `1px solid ${color}30`, background: `${color}10`, color, cursor: "pointer", fontWeight: 600 }}>
              {action}
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
