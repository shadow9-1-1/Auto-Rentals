"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { vehicleService } from "@/services/api";
import { Vehicle, VehicleFilters } from "@/types";
import {
  Car,
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Fuel,
  Users,
  Gauge,
} from "lucide-react";

const VEHICLE_TYPES = ["All", "Sedan", "SUV", "Sports", "Hatchback", "Truck", "Van", "Luxury"];
const FUEL_TYPES = ["All", "petrol", "diesel", "electric", "hybrid"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const MOCK_VEHICLES: Vehicle[] = Array.from({ length: 12 }, (_, i) => ({
  _id: String(i + 1),
  owner: "owner1",
  make: ["BMW", "Tesla", "Porsche", "Audi", "Mercedes", "Toyota", "Ford", "Volkswagen"][i % 8],
  model: ["M4", "Model S", "Cayenne", "A6", "C-Class", "Camry", "Mustang", "Golf"][i % 8],
  year: 2021 + (i % 4),
  type: VEHICLE_TYPES[1 + (i % 7)],
  fuelType: (["petrol", "electric", "diesel", "hybrid"] as const)[i % 4],
  transmission: (i % 2 === 0 ? "automatic" : "manual") as "automatic" | "manual",
  seats: [4, 5, 2, 7][i % 4],
  pricePerDay: [120, 195, 280, 90, 160, 75, 210, 310, 85, 145, 220, 95][i],
  location: ["New York", "Los Angeles", "Miami", "Chicago", "Houston"][i % 5],
  description: "Premium vehicle in excellent condition.",
  images: [],
  features: ["GPS", "Leather", "Sunroof"].slice(0, 1 + (i % 3)),
  status: "available" as const,
  averageRating: 4.5 + (i % 5) * 0.1,
  reviewCount: 10 + i * 7,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const gradients = [
    "linear-gradient(135deg, #1e40af, #6d28d9)",
    "linear-gradient(135deg, #065f46, #0f766e)",
    "linear-gradient(135deg, #92400e, #9a3412)",
    "linear-gradient(135deg, #1e3a5f, #1e40af)",
    "linear-gradient(135deg, #4c1d95, #1d4ed8)",
  ];
  const grad = gradients[vehicle._id.length % gradients.length] || gradients[0];

  return (
    <div className="card" style={{ overflow: "hidden", padding: 0, transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(124,58,237,0.2)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
    >
      {/* Image */}
      <div style={{ height: "160px", background: grad, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <Car size={56} color="rgba(255,255,255,0.2)" />
        <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "rgba(0,0,0,0.5)", borderRadius: "0.5rem", padding: "0.2rem 0.5rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <Star size={11} color="#f59e0b" fill="#f59e0b" />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "white" }}>{vehicle.averageRating?.toFixed(1)}</span>
        </div>
        <div style={{ position: "absolute", bottom: "0.75rem", left: "0.75rem" }}>
          <span className={`badge ${vehicle.fuelType === "electric" ? "badge-success" : "badge-info"}`}>{vehicle.fuelType}</span>
        </div>
        <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem" }}>
          <span className="badge badge-gray">{vehicle.type}</span>
        </div>
      </div>

      <div style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
          <div>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "white" }}>{vehicle.make} {vehicle.model}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#9ca3af", fontSize: "0.75rem", marginTop: "0.2rem" }}>
              <MapPin size={10} />
              {vehicle.location}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "1.125rem", fontWeight: 800, color: "#a78bfa" }}>${vehicle.pricePerDay}</span>
            <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>/day</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#9ca3af", fontSize: "0.75rem" }}>
            <Users size={12} />
            {vehicle.seats} seats
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#9ca3af", fontSize: "0.75rem" }}>
            <Gauge size={12} />
            {vehicle.transmission}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#9ca3af", fontSize: "0.75rem" }}>
            <Fuel size={12} />
            {vehicle.fuelType}
          </div>
        </div>

        <Link href={`/vehicles/${vehicle._id}`} className="btn-primary" style={{ width: "100%", justifyContent: "center", textDecoration: "none", display: "flex", fontSize: "0.8125rem", padding: "0.5rem 1rem" }}>
          View Details
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(MOCK_VEHICLES.length);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<VehicleFilters>({
    page: 1,
    limit: 12,
    sortBy: "newest",
  });
  const [searchInput, setSearchInput] = useState("");

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await vehicleService.list(filters);
      setVehicles(data.data);
      setTotal(data.total);
    } catch {
      // Use mock data if backend unavailable
      let filtered = [...MOCK_VEHICLES];
      if (filters.search) filtered = filtered.filter(v => `${v.make} ${v.model}`.toLowerCase().includes(filters.search!.toLowerCase()));
      if (filters.type && filters.type !== "All") filtered = filtered.filter(v => v.type === filters.type);
      if (filters.fuelType && filters.fuelType !== ("All" as string)) filtered = filtered.filter(v => v.fuelType === filters.fuelType);
      if (filters.minPrice) filtered = filtered.filter(v => v.pricePerDay >= filters.minPrice!);
      if (filters.maxPrice) filtered = filtered.filter(v => v.pricePerDay <= filters.maxPrice!);
      setVehicles(filtered);
      setTotal(filtered.length);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const totalPages = Math.ceil(total / (filters.limit || 12));

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg-primary)", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>Browse Vehicles</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{total} vehicles available</p>
        </div>

        {/* Search + Filter Bar */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 300px", position: "relative" }}>
            <Search size={15} color="#6b7280" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by make, model..."
              className="input"
              style={{ paddingLeft: "2.75rem" }}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && setFilters(f => ({ ...f, search: searchInput, page: 1 }))}
            />
          </div>
          <select
            className="input"
            style={{ flex: "0 1 180px" }}
            value={filters.sortBy}
            onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value as VehicleFilters["sortBy"], page: 1 }))}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            className="btn-secondary"
            onClick={() => setShowFilters(!showFilters)}
            style={{ flex: "0 0 auto" }}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="glass" style={{ padding: "1.25rem", borderRadius: "1rem", marginBottom: "1.5rem", display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ flex: "1 1 180px" }}>
              <label className="label">Vehicle Type</label>
              <select className="input" value={filters.type || "All"} onChange={e => setFilters(f => ({ ...f, type: e.target.value === "All" ? undefined : e.target.value, page: 1 }))}>
                {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: "1 1 180px" }}>
              <label className="label">Fuel Type</label>
              <select className="input" value={filters.fuelType || "All"} onChange={e => setFilters(f => ({ ...f, fuelType: e.target.value === "All" ? undefined : e.target.value as VehicleFilters["fuelType"], page: 1 }))}>
                {FUEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <label className="label">Min Price ($/day)</label>
              <input type="number" className="input" placeholder="0" value={filters.minPrice || ""} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 }))} />
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <label className="label">Max Price ($/day)</label>
              <input type="number" className="input" placeholder="1000" value={filters.maxPrice || ""} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 }))} />
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <label className="label">Location</label>
              <input type="text" className="input" placeholder="Any city" value={filters.location || ""} onChange={e => setFilters(f => ({ ...f, location: e.target.value || undefined, page: 1 }))} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn-danger" onClick={() => setFilters({ page: 1, limit: 12, sortBy: "newest" })}>Reset</button>
            </div>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid rgba(124,58,237,0.3)", borderTopColor: "#7c3aed", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : vehicles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
            <Car size={64} color="#4b5563" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ color: "white", fontWeight: 700, marginBottom: "0.5rem" }}>No vehicles found</h3>
            <p style={{ color: "var(--text-secondary)" }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
            {vehicles.map(v => <VehicleCard key={v._id} vehicle={v} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.75rem" }}>
            <button className="btn-secondary" disabled={(filters.page || 1) <= 1} onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) - 1 }))}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
              Page {filters.page} of {totalPages}
            </span>
            <button className="btn-secondary" disabled={(filters.page || 1) >= totalPages} onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
