"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Car,
  MapPin,
  Calendar,
  Star,
  Shield,
  Zap,
  Users,
  ArrowRight,
  ChevronRight,
  Check,
} from "lucide-react";

const FEATURED_VEHICLES = [
  {
    id: "1",
    make: "BMW",
    model: "M4 Competition",
    type: "Sports",
    pricePerDay: 280,
    location: "New York",
    images: [],
    averageRating: 4.9,
    reviewCount: 47,
    features: ["GPS", "Leather", "Sunroof"],
    fuelType: "petrol",
    seats: 4,
    gradient: "from-blue-600 to-violet-600",
  },
  {
    id: "2",
    make: "Tesla",
    model: "Model S Plaid",
    type: "Sedan",
    pricePerDay: 195,
    location: "Los Angeles",
    images: [],
    averageRating: 4.8,
    reviewCount: 83,
    features: ["Autopilot", "360° Camera", "WiFi"],
    fuelType: "electric",
    seats: 5,
    gradient: "from-emerald-600 to-teal-600",
  },
  {
    id: "3",
    make: "Porsche",
    model: "Cayenne GTS",
    type: "SUV",
    pricePerDay: 310,
    location: "Miami",
    images: [],
    averageRating: 4.9,
    reviewCount: 31,
    features: ["Sport Mode", "Panoramic", "Bose"],
    fuelType: "petrol",
    seats: 5,
    gradient: "from-amber-600 to-orange-600",
  },
];

const STATS = [
  { label: "Vehicles Available", value: "2,400+", icon: Car },
  { label: "Happy Customers", value: "18,000+", icon: Users },
  { label: "Cities Covered", value: "120+", icon: MapPin },
  { label: "5-Star Reviews", value: "95%", icon: Star },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Search & Filter",
    desc: "Browse thousands of vehicles. Filter by type, price, location, and features.",
    icon: Car,
  },
  {
    step: "02",
    title: "Book Instantly",
    desc: "Select your dates, review pricing, and confirm your booking in seconds.",
    icon: Calendar,
  },
  {
    step: "03",
    title: "Pay Securely",
    desc: "Stripe-powered checkout. Your payment is protected with bank-level security.",
    icon: Shield,
  },
  {
    step: "04",
    title: "Hit the Road",
    desc: "Receive confirmation, pick up your keys, and enjoy the ride.",
    icon: Zap,
  },
];

export default function HomePage() {
  const [searchLocation, setSearchLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation) params.set("location", searchLocation);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    window.location.href = `/vehicles?${params.toString()}`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* =================== HERO =================== */}
      <section className="hero-gradient" style={{ padding: "6rem 1.5rem 5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <div
            className="animate-fade-in-up"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.3)",
              borderRadius: "9999px",
              padding: "0.35rem 1rem",
              marginBottom: "1.5rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#a78bfa",
            }}
          >
            <Zap size={12} />
            Premium Car Rentals · Instant Booking
          </div>

          <h1
            className="animate-fade-in-up stagger-1"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "1.5rem",
              letterSpacing: "-0.02em",
            }}
          >
            Drive Your Dream Car
            <br />
            <span className="gradient-text">Anywhere, Anytime</span>
          </h1>

          <p
            className="animate-fade-in-up stagger-2"
            style={{
              fontSize: "1.125rem",
              color: "var(--text-secondary)",
              maxWidth: "580px",
              margin: "0 auto 3rem",
              lineHeight: 1.7,
            }}
          >
            Access thousands of premium vehicles. Flexible rentals, transparent
            pricing, and seamless Stripe-powered checkout — all in one platform.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="animate-fade-in-up stagger-3 glass-strong"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              padding: "1rem",
              borderRadius: "1.25rem",
              maxWidth: "860px",
              margin: "0 auto 2rem",
            }}
          >
            <div style={{ flex: "1 1 200px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.75rem",
                  padding: "0.75rem 1rem",
                }}
              >
                <MapPin size={16} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Pick-up Location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    color: "white",
                    fontSize: "0.875rem",
                    width: "100%",
                  }}
                />
              </div>
            </div>
            <div style={{ flex: "1 1 150px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.75rem",
                  padding: "0.75rem 1rem",
                }}
              >
                <Calendar size={16} color="#9ca3af" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    color: startDate ? "white" : "#9ca3af",
                    fontSize: "0.875rem",
                    width: "100%",
                    colorScheme: "dark",
                  }}
                />
              </div>
            </div>
            <div style={{ flex: "1 1 150px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.75rem",
                  padding: "0.75rem 1rem",
                }}
              >
                <Calendar size={16} color="#9ca3af" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    color: endDate ? "white" : "#9ca3af",
                    fontSize: "0.875rem",
                    width: "100%",
                    colorScheme: "dark",
                  }}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ flex: "0 0 auto" }}>
              Search Cars
              <ArrowRight size={16} />
            </button>
          </form>

          <div
            className="animate-fade-in-up stagger-4"
            style={{
              display: "flex",
              gap: "1.5rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {["No hidden fees", "Free cancellation", "24/7 support"].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  color: "#9ca3af",
                  fontSize: "0.8125rem",
                }}
              >
                <Check size={14} color="#10b981" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== STATS =================== */}
      <section style={{ padding: "4rem 1.5rem", background: "var(--bg-secondary)" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`card animate-fade-in-up stagger-${i + 1}`}
              style={{ textAlign: "center", padding: "2rem 1.5rem" }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(124,58,237,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                <stat.icon size={22} color="#a78bfa" />
              </div>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "white",
                  marginBottom: "0.25rem",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =================== FEATURED VEHICLES =================== */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "2.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#a78bfa",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                Top Picks
              </p>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "white",
                }}
              >
                Featured Vehicles
              </h2>
            </div>
            <Link
              href="/vehicles"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                color: "#a78bfa",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                transition: "gap 0.2s",
              }}
            >
              View All Cars
              <ChevronRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {FEATURED_VEHICLES.map((vehicle, i) => (
              <div
                key={vehicle.id}
                className={`card animate-fade-in-up stagger-${i + 1}`}
                style={{ overflow: "hidden", cursor: "pointer", padding: 0 }}
              >
                {/* Card image placeholder */}
                <div
                  style={{
                    height: "180px",
                    background: `linear-gradient(135deg, var(--tw-gradient-from, #2563eb), var(--tw-gradient-to, #7c3aed))`,
                    backgroundImage: `linear-gradient(135deg, ${
                      vehicle.gradient.includes("blue")
                        ? "#1e40af, #6d28d9"
                        : vehicle.gradient.includes("emerald")
                        ? "#065f46, #0f766e"
                        : "#92400e, #9a3412"
                    })`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <Car size={64} color="rgba(255,255,255,0.2)" />
                  <div
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                      background: "rgba(0,0,0,0.4)",
                      borderRadius: "0.5rem",
                      padding: "0.25rem 0.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <Star size={12} color="#f59e0b" fill="#f59e0b" />
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "white",
                      }}
                    >
                      {vehicle.averageRating}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                      ({vehicle.reviewCount})
                    </span>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0.75rem",
                      left: "0.75rem",
                    }}
                  >
                    <span
                      className={`badge badge-${
                        vehicle.fuelType === "electric" ? "success" : "info"
                      }`}
                    >
                      {vehicle.fuelType}
                    </span>
                  </div>
                </div>

                <div style={{ padding: "1.25rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "white",
                        }}
                      >
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          color: "#9ca3af",
                          fontSize: "0.8rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        <MapPin size={11} />
                        {vehicle.location}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 800,
                          color: "#a78bfa",
                        }}
                      >
                        ${vehicle.pricePerDay}
                      </span>
                      <span
                        style={{ fontSize: "0.75rem", color: "#9ca3af" }}
                      >
                        /day
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.375rem",
                      flexWrap: "wrap",
                      marginBottom: "1rem",
                    }}
                  >
                    {vehicle.features.map((f) => (
                      <span
                        key={f}
                        style={{
                          fontSize: "0.7rem",
                          color: "#9ca3af",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "0.375rem",
                          padding: "0.2rem 0.5rem",
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  <Link href={`/vehicles/${vehicle.id}`} className="btn-primary" style={{ width: "100%", justifyContent: "center", textDecoration: "none", display: "flex" }}>
                    Book Now
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== HOW IT WORKS =================== */}
      <section
        id="how-it-works"
        style={{ padding: "5rem 1.5rem", background: "var(--bg-secondary)" }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#a78bfa",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
              }}
            >
              Simple Process
            </p>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "white" }}>
              How It Works
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.step}
                className={`card animate-fade-in-up stagger-${i + 1}`}
                style={{ textAlign: "center", padding: "2rem 1.5rem" }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    fontWeight: 900,
                    color: "rgba(124,58,237,0.2)",
                    marginBottom: "0.75rem",
                    lineHeight: 1,
                  }}
                >
                  {step.step}
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(124,58,237,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  <step.icon size={22} color="#a78bfa" />
                </div>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "white",
                    marginBottom: "0.5rem",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.8375rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== CTA =================== */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.15), transparent)",
            padding: "4rem 2rem",
            borderRadius: "2rem",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          <h2
            style={{
              fontSize: "2.25rem",
              fontWeight: 900,
              color: "white",
              marginBottom: "1rem",
            }}
          >
            Ready to Hit the Road?
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--text-secondary)",
              marginBottom: "2rem",
            }}
          >
            Join thousands of drivers enjoying premium rentals. Sign up in
            seconds.
          </p>
          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link href="/auth/register" className="btn-primary" style={{ textDecoration: "none" }}>
              Start Renting Today
              <ArrowRight size={16} />
            </Link>
            <Link href="/vehicles" className="btn-secondary" style={{ textDecoration: "none" }}>
              Browse Vehicles
            </Link>
          </div>
        </div>
      </section>

      {/* =================== FOOTER =================== */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "2rem 1.5rem",
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: "0.8125rem",
        }}
      >
        <p>
          © {year || "2024"} AutoRentals. Built with Next.js &
          Tailwind CSS.
        </p>
      </footer>
    </div>
  );
}
