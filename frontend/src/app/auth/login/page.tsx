"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/api";
import { Car, Mail, Lock, Eye, EyeOff, AlertCircle, Globe } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setApiError("");
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setApiError(e?.response?.data?.error || "Invalid email or password");
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
          maxWidth: "440px",
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
          <h1
            style={{
              fontSize: "1.625rem",
              fontWeight: 800,
              color: "white",
              marginBottom: "0.375rem",
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Sign in to your AutoRentals account
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
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

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label className="label" htmlFor="email">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail
                size={15}
                color="#6b7280"
                style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="input"
                style={{ paddingLeft: "2.75rem" }}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="error-msg">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={15}
                color="#6b7280"
                style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="input"
                style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <p className="error-msg">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? (
              <>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
          }}
        >
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}
          >
            Sign Up
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
