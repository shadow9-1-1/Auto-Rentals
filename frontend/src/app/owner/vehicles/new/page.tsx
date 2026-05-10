"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { vehicleService } from "@/services/api";
import { Car, Upload, Plus, X } from "lucide-react";

const vehicleSchema = z.object({
  make: z.string().min(1, "Required"),
  model: z.string().min(1, "Required"),
  year: z.number().min(1990).max(new Date().getFullYear() + 1),
  type: z.string().min(1, "Required"),
  fuelType: z.enum(["petrol", "diesel", "electric", "hybrid"]),
  transmission: z.enum(["automatic", "manual"]),
  seats: z.number().min(1).max(15),
  pricePerDay: z.number().min(1, "Must be positive"),
  location: z.string().min(2, "Required"),
  description: z.string().optional(),
});

type VehicleForm = z.infer<typeof vehicleSchema>;

const VEHICLE_TYPES = ["Sedan", "SUV", "Sports", "Hatchback", "Truck", "Van", "Luxury", "Coupe"];
const FEATURES_LIST = ["GPS Navigation", "Leather Seats", "Sunroof", "Bose Audio", "360° Camera", "Heated Seats", "Apple CarPlay", "Sport Mode", "Blind Spot Assist", "Keyless Entry"];

function NewVehicleContent() {
  const router = useRouter();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: { year: new Date().getFullYear(), seats: 5, fuelType: "petrol", transmission: "automatic" },
  });

  const toggleFeature = (f: string) =>
    setSelectedFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const onSubmit = async (data: VehicleForm) => {
    setIsLoading(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, String(v)));
      selectedFeatures.forEach(f => formData.append("features", f));
      await vehicleService.create(formData);
      router.push("/owner/vehicles");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || "Failed to create vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add New Vehicle">
      <div style={{ maxWidth: "720px" }}>
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "#ef4444", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="label">Make *</label>
                <input type="text" className="input" placeholder="e.g. BMW" {...register("make")} />
                {errors.make && <p className="error-msg">{errors.make.message}</p>}
              </div>
              <div>
                <label className="label">Model *</label>
                <input type="text" className="input" placeholder="e.g. M4" {...register("model")} />
                {errors.model && <p className="error-msg">{errors.model.message}</p>}
              </div>
              <div>
                <label className="label">Year *</label>
                <input type="number" className="input" {...register("year", { valueAsNumber: true })} />
                {errors.year && <p className="error-msg">{errors.year.message}</p>}
              </div>
              <div>
                <label className="label">Vehicle Type *</label>
                <select className="input" {...register("type")}>
                  <option value="">Select type</option>
                  {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <p className="error-msg">{errors.type.message}</p>}
              </div>
              <div>
                <label className="label">Fuel Type *</label>
                <select className="input" {...register("fuelType")}>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="label">Transmission *</label>
                <select className="input" {...register("transmission")}>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="label">Seats *</label>
                <input type="number" className="input" min={1} max={15} {...register("seats", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="label">Price per Day (USD) *</label>
                <input type="number" className="input" placeholder="e.g. 150" {...register("pricePerDay", { valueAsNumber: true })} />
                {errors.pricePerDay && <p className="error-msg">{errors.pricePerDay.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Location *</label>
              <input type="text" className="input" placeholder="e.g. New York, NY" {...register("location")} />
              {errors.location && <p className="error-msg">{errors.location.message}</p>}
            </div>

            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={3} placeholder="Describe your vehicle..." style={{ resize: "vertical" }} {...register("description")} />
            </div>

            {/* Features */}
            <div>
              <label className="label">Features</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {FEATURES_LIST.map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFeature(f)}
                    style={{
                      padding: "0.35rem 0.75rem",
                      borderRadius: "9999px",
                      border: `1px solid ${selectedFeatures.includes(f) ? "#7c3aed" : "rgba(255,255,255,0.1)"}`,
                      background: selectedFeatures.includes(f) ? "rgba(124,58,237,0.15)" : "transparent",
                      color: selectedFeatures.includes(f) ? "#a78bfa" : "#9ca3af",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload Placeholder */}
            <div>
              <label className="label">Photos (up to 10)</label>
              <div style={{ border: "2px dashed rgba(255,255,255,0.12)", borderRadius: "0.875rem", padding: "2rem", textAlign: "center", color: "#6b7280", background: "rgba(255,255,255,0.02)" }}>
                <Upload size={28} style={{ margin: "0 auto 0.5rem" }} color="#9ca3af" />
                <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>Drag & drop photos or click to upload</p>
                <p style={{ fontSize: "0.75rem" }}>JPG, PNG up to 5MB each</p>
                <input type="file" multiple accept="image/*" name="images" style={{ display: "none" }} id="image-upload" />
                <label htmlFor="image-upload" style={{ marginTop: "0.75rem", display: "inline-flex", cursor: "pointer" }} className="btn-secondary">
                  Choose Files
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? "Creating..." : <><Plus size={15} /> Create Vehicle</>}
              </button>
              <button type="button" className="btn-secondary" onClick={() => router.back()}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function NewVehiclePage() {
  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <NewVehicleContent />
    </ProtectedRoute>
  );
}
