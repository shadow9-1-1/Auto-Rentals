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
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/auth/google`,
};

// =============================================
// VEHICLE SERVICE
// =============================================
export const vehicleService = {
  list: async (filters?: VehicleFilters) => {
    const { data } = await apiClient.get<any>(
      "/vehicles",
      { params: filters }
    );
    return {
      data: data.items || [],
      total: data.pagination?.totalItems || 0,
      page: data.pagination?.currentPage || 1,
      totalPages: data.pagination?.totalPages || 1,
      limit: data.pagination?.limit || 12,
    } as PaginatedResponse<Vehicle>;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get<any>(`/vehicles/${id}`);
    return data.item || data;
  },

  // GET /vehicles/ratings/top?limit=N  — real backend endpoint
  topRated: async (limit = 3) => {
    const { data } = await apiClient.get<any>("/vehicles/ratings/top", {
      params: { limit },
    });
    return data.items || data;
  },

  create: async (formData: FormData) => {
    const { data } = await apiClient.post<any>("/vehicles", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.item || data;
  },

  update: async (id: string, formData: FormData) => {
    const { data } = await apiClient.put<any>(`/vehicles/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.item || data;
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
    const { data } = await apiClient.get<any>("/bookings");
    return data.items || [];
  },

  create: async (payload: CreateBookingPayload) => {
    const { data } = await apiClient.post<any>("/bookings", payload);
    return data.item || data;
  },

  updateStatus: async (id: string, status: string) => {
    const { data } = await apiClient.patch<any>(`/bookings/${id}/status`, {
      status,
    });
    return data.item || data;
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
    const { data } = await apiClient.get<any>("/reviews", {
      params: vehicleId ? { vehicleId } : undefined,
    });
    return data.items || [];
  },

  create: async (payload: CreateReviewPayload) => {
    const { data } = await apiClient.post<any>("/reviews", payload);
    return data.item || data;
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

// =============================================
// ADMIN USERS SERVICE  (routes through auth-service via gateway at /auth/admin/users)
// =============================================
export const adminUsersService = {
  list: async () => {
    const { data } = await apiClient.get<any>("/auth/admin/users");
    return data.items || [];
  },

  suspend: async (userId: string) => {
    const { data } = await apiClient.patch<any>(
      `/auth/admin/users/${userId}/suspend`,
      {}
    );
    return data.item || data;
  },

  updateRole: async (userId: string, role: string) => {
    const { data } = await apiClient.patch<any>(
      `/auth/admin/users/${userId}/roles`,
      { role }
    );
    return data.item || data;
  },

  delete: async (userId: string) => {
    await apiClient.delete(`/auth/admin/users/${userId}`);
  },
};
