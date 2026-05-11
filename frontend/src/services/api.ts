import apiClient from "@/lib/apiClient";
import {
  AuthTokens,
  User,
  Vehicle,
  VehicleFilters,
  PaginatedResponse,
  Booking,
  CreateBookingPayload,
  Review,
  CreateReviewPayload,
  AdminOverview,
  CheckoutPayload,
} from "@/types";

// =============================================
// AUTH SERVICE
// =============================================
export const authService = {
  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const { data } = await apiClient.post<AuthTokens & { user: User }>(
      "/auth/register",
      payload
    );
    return data;
  },

  login: async (payload: { email: string; password: string }) => {
    const { data } = await apiClient.post<AuthTokens & { user: User }>(
      "/auth/login",
      payload
    );
    return data;
  },

  refresh: async (refreshToken: string) => {
    const { data } = await apiClient.post<AuthTokens>("/auth/refresh", {
      refreshToken,
    });
    return data;
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
  },

  getGoogleOAuthUrl: () =>
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/google`,
};

// =============================================
// VEHICLE SERVICE
// =============================================
export const vehicleService = {
  list: async (filters?: VehicleFilters) => {
    const { data } = await apiClient.get<PaginatedResponse<Vehicle>>(
      "/vehicles",
      { params: filters }
    );
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get<Vehicle>(`/vehicles/${id}`);
    return data;
  },

  create: async (formData: FormData) => {
    const { data } = await apiClient.post<Vehicle>("/vehicles", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  update: async (id: string, formData: FormData) => {
    const { data } = await apiClient.put<Vehicle>(`/vehicles/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/vehicles/${id}`);
  },
};

// =============================================
// BOOKING SERVICE
// =============================================
export const bookingService = {
  list: async () => {
    const { data } = await apiClient.get<Booking[]>("/bookings");
    return data;
  },

  create: async (payload: CreateBookingPayload) => {
    const { data } = await apiClient.post<Booking>("/bookings", payload);
    return data;
  },

  updateStatus: async (id: string, status: string) => {
    const { data } = await apiClient.patch<Booking>(`/bookings/${id}/status`, {
      status,
    });
    return data;
  },
};

// =============================================
// PAYMENT SERVICE
// =============================================
export const paymentService = {
  createCheckoutSession: async (payload: CheckoutPayload) => {
    const { data } = await apiClient.post<{ url: string }>(
      "/payments/checkout",
      payload
    );
    return data;
  },
};

// =============================================
// REVIEW SERVICE
// =============================================
export const reviewService = {
  list: async (vehicleId?: string) => {
    const { data } = await apiClient.get<Review[]>("/reviews", {
      params: vehicleId ? { vehicleId } : undefined,
    });
    return data;
  },

  create: async (payload: CreateReviewPayload) => {
    const { data } = await apiClient.post<Review>("/reviews", payload);
    return data;
  },
};

// =============================================
// ADMIN SERVICE
// =============================================
export const adminService = {
  getOverview: async () => {
    const { data } = await apiClient.get<AdminOverview>("/admin/overview");
    return data;
  },
};
