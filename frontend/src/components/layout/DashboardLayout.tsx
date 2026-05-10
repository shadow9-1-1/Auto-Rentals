"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Car,
  Calendar,
  Star,
  User,
  LogOut,
  ChevronRight,
  Shield,
  BarChart3,
  Users,
} from "lucide-react";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const USER_LINKS: SidebarLink[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "My Bookings", icon: Calendar },
  { href: "/dashboard/reviews", label: "My Reviews", icon: Star },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

const OWNER_LINKS: SidebarLink[] = [
  { href: "/owner", label: "Overview", icon: LayoutDashboard },
  { href: "/owner/vehicles", label: "My Vehicles", icon: Car },
  { href: "/owner/bookings", label: "Bookings", icon: Calendar },
  { href: "/owner/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/owner/profile", label: "Profile", icon: User },
];

const ADMIN_LINKS: SidebarLink[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/vehicles", label: "Vehicles", icon: Car },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const links =
    user?.role === "admin"
      ? ADMIN_LINKS
      : user?.role === "owner"
      ? OWNER_LINKS
      : USER_LINKS;

  const roleLabel =
    user?.role === "admin" ? "Admin Panel" : user?.role === "owner" ? "Owner Dashboard" : "My Dashboard";

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", background: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          flexShrink: 0,
          background: "var(--bg-secondary)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.375rem",
        }}
      >
        {/* Role Badge */}
        <div style={{ padding: "0.75rem 0.75rem", marginBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {user?.role === "admin" ? <Shield size={14} color="white" /> : <User size={14} color="white" />}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontWeight: 700, color: "white", fontSize: "0.8125rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
              <div style={{ fontSize: "0.7rem", color: "#a78bfa", fontWeight: 600, textTransform: "capitalize" }}>{user?.role}</div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 0.75rem", marginBottom: "0.25rem" }}>
          {roleLabel}
        </p>

        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.75rem",
                textDecoration: "none",
                fontSize: "0.8375rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#a78bfa" : "#9ca3af",
                background: isActive ? "rgba(124,58,237,0.12)" : "transparent",
                border: `1px solid ${isActive ? "rgba(124,58,237,0.25)" : "transparent"}`,
                transition: "all 0.2s",
              }}
            >
              <link.icon size={15} />
              {link.label}
              {isActive && <ChevronRight size={13} style={{ marginLeft: "auto" }} />}
            </Link>
          );
        })}

        {/* Logout */}
        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.625rem 0.75rem",
              borderRadius: "0.75rem",
              fontSize: "0.8375rem",
              fontWeight: 500,
              color: "#ef4444",
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.15)",
              cursor: "pointer",
              width: "100%",
              transition: "all 0.2s",
            }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: "1.75rem" }}>{title}</h1>
        {children}
      </main>
    </div>
  );
}
