"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/api";
import {
  Car,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Globe,
  CheckCircle,
} from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
    role: z.enum(["renter", "owner"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "renter" },
  });

  const password = watch("password", "");
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setApiError("");
    try {
      await authRegister(data.name, data.email, data.password, data.role);
      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setApiError(e?.response?.data?.error || "Registration failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authService.getGoogleOAuthUrl();
  };

  return (
    <div
      className="hero-gradient"
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <div
        className="glass-strong animate-fade-in-up"
        style={{
          width: "100%",
          maxWidth: "480px",
          borderRadius: "1.5rem",
          padding: "2.5rem",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              boxShadow: "0 0 24px rgba(124,58,237,0.4)",
            }}
          >
            <Car size={24} color="white" />
          </div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "white", marginBottom: "0.375rem" }}>
            Create Account
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Join AutoRentals and start your journey
          </p>
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          className="btn-secondary"
          style={{ width: "100%", justifyContent: "center", marginBottom: "1.5rem" }}
        >
          <Globe size={16} />
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        </div>

        {/* Error */}
        {apiError && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              color: "#ef4444",
              fontSize: "0.8125rem",
            }}
          >
            <AlertCircle size={14} />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Role Selection */}
          <div>
            <label className="label">I want to</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {(["renter", "owner"] as const).map((role) => (
                <label
                  key={role}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                    border: `1px solid ${watch("role") === role ? "#7c3aed" : "var(--border)"}`,
                    background: watch("role") === role ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: watch("role") === role ? "#a78bfa" : "#9ca3af",
                  }}
                >
                  <input type="radio" value={role} {...register("role")} style={{ display: "none" }} />
                  {role === "renter" ? "🚗 Rent Cars" : "🔑 List My Cars"}
                </label>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="label" htmlFor="name">Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={15} color="#6b7280" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
              <input id="name" type="text" placeholder="John Doe" className="input" style={{ paddingLeft: "2.75rem" }} {...register("name")} />
            </div>
            {errors.name && <p className="error-msg">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="label" htmlFor="reg-email">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={15} color="#6b7280" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
              <input id="reg-email" type="email" placeholder="you@example.com" className="input" style={{ paddingLeft: "2.75rem" }} {...register("email")} />
            </div>
            {errors.email && <p className="error-msg">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="label" htmlFor="reg-password">Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={15} color="#6b7280" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
              <input id="reg-password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="input" style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }} {...register("password")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 0 }}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {/* Password strength */}
            {password && (
              <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {[
                  { key: "length", label: "At least 8 characters" },
                  { key: "uppercase", label: "Uppercase letter" },
                  { key: "number", label: "Contains a number" },
                ].map(({ key, label }) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem" }}>
                    <CheckCircle size={12} color={passwordChecks[key as keyof typeof passwordChecks] ? "#10b981" : "#4b5563"} />
                    <span style={{ color: passwordChecks[key as keyof typeof passwordChecks] ? "#10b981" : "#6b7280" }}>{label}</span>
                  </div>
                ))}
              </div>
            )}
            {errors.password && <p className="error-msg">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="label" htmlFor="confirm-password">Confirm Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={15} color="#6b7280" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
              <input id="confirm-password" type="password" placeholder="••••••••" className="input" style={{ paddingLeft: "2.75rem" }} {...register("confirmPassword")} />
            </div>
            {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? (
              <>
                <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} />
                Creating Account...
              </>
            ) : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}>
            Sign In
          </Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
