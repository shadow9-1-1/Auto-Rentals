// =============================================
// AUTO RENTALS - TYPE DEFINITIONS
// =============================================

export type Role = "renter" | "owner" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// =============================================
// VEHICLE TYPES
// =============================================

export type FuelType = "petrol" | "diesel" | "electric" | "hybrid";
export type TransmissionType = "automatic" | "manual";
export type VehicleStatus = "available" | "unavailable" | "maintenance";

export interface Vehicle {
  _id: string;
  owner: string | User;
  make: string;
  model: string;
  year: number;
  type: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  seats: number;
  pricePerDay: number;
  location: string;
  description?: string;
  images: string[];
  features: string[];
  status: VehicleStatus;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFilters {
  search?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  seats?: number;
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// =============================================
// BOOKING TYPES
// =============================================

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

export interface Booking {
  _id: string;
  vehicle: Vehicle;
  renter: User;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: "unpaid" | "paid" | "refunded";
  stripeSessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  vehicleId: string;
  startDate: string;
  endDate: string;
}

// =============================================
// PAYMENT TYPES
// =============================================

export interface CheckoutPayload {
  bookingId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

// =============================================
// REVIEW TYPES
// =============================================

export interface Review {
  _id: string;
  vehicle: string;
  reviewer: User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  vehicleId: string;
  rating: number;
  comment: string;
}

// =============================================
// ADMIN TYPES
// =============================================

export interface AdminOverview {
  totalUsers: number;
  totalVehicles: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: Booking[];
  bookingsByStatus: Record<BookingStatus, number>;
  revenueByMonth: { month: string; revenue: number }[];
}

// =============================================
// API TYPES
// =============================================

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
