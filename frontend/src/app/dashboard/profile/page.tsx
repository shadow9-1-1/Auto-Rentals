"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Phone, CheckCircle } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

function ProfileContent() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || "", email: user?.email || "", phone: user?.phone || "" },
  });

  const onSubmit = async (data: ProfileForm) => {
    // In production, call an update profile API
    console.log("Profile update:", data);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout title="My Profile">
      <div style={{ maxWidth: "600px" }}>
        {/* Avatar */}
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.5rem", fontWeight: 800, color: "white" }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "white", fontSize: "1.125rem" }}>{user?.name}</div>
            <div style={{ color: "#9ca3af", fontSize: "0.875rem" }}>{user?.email}</div>
            <span className="badge badge-info" style={{ marginTop: "0.375rem", display: "inline-flex", textTransform: "capitalize" }}>{user?.role}</span>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "white", marginBottom: "1.25rem" }}>Edit Profile</h3>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="label">Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={14} color="#6b7280" style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }} />
                <input type="text" className="input" style={{ paddingLeft: "2.5rem" }} {...register("name")} />
              </div>
              {errors.name && <p className="error-msg">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={14} color="#6b7280" style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }} />
                <input type="email" className="input" style={{ paddingLeft: "2.5rem" }} {...register("email")} />
              </div>
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <div style={{ position: "relative" }}>
                <Phone size={14} color="#6b7280" style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }} />
                <input type="tel" className="input" placeholder="+1 234 567 8900" style={{ paddingLeft: "2.5rem" }} {...register("phone")} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <button type="submit" className="btn-primary">Save Changes</button>
              {saved && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#10b981", fontSize: "0.875rem" }}>
                  <CheckCircle size={15} />
                  Saved!
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
