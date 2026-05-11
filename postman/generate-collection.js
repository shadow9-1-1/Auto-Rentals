const fs = require("fs");

const env = {
  id: "auto-rentals-env",
  name: "Auto Rentals - Local",
  _postman_variable_scope: "environment",
  values: [
    { key: "base_url",      value: "http://localhost:4000", enabled: true },
    { key: "access_token",  value: "", enabled: true },
    { key: "refresh_token", value: "", enabled: true },
    { key: "user_id",       value: "", enabled: true },
    { key: "vehicle_id",    value: "", enabled: true },
    { key: "booking_id",    value: "", enabled: true },
    { key: "review_id",     value: "", enabled: true },
    { key: "payment_id",    value: "", enabled: true }
  ]
};

const auth = () => ({
  type: "bearer",
  bearer: [{ key: "token", value: "{{access_token}}", type: "string" }]
});

const req = (name, method, path, body, tests, preReq, noAuth, params) => {
  const item = {
    name,
    request: {
      method,
      header: [{ key: "Content-Type", value: "application/json" }],
      url: {
        raw: `{{base_url}}${path}`,
        host: ["{{base_url}}"],
        path: path.replace(/^\//, "").split("/"),
        ...(params ? { query: params.map(([k,v]) => ({ key: k, value: v })) } : {})
      }
    },
    response: []
  };
  if (!noAuth) item.request.auth = auth();
  if (body) item.request.body = { mode: "raw", raw: JSON.stringify(body, null, 2), options: { raw: { language: "json" } } };
  if (preReq) item.event = [{ listen: "prerequest", script: { type: "text/javascript", exec: preReq } }];
  const testEvents = [{ listen: "test", script: { type: "text/javascript", exec: tests || [] } }];
  item.event = [...(item.event || []), ...testEvents];
  return item;
};

const folder = (name, items, desc) => ({ name, description: desc || "", item: items });

// ── SCRIPTS ────────────────────────────────────────────────────────────────────
const s = {
  status200: `pm.test("Status 200", () => pm.response.to.have.status(200));`,
  status201: `pm.test("Status 201", () => pm.response.to.have.status(201));`,
  status400: `pm.test("Status 400", () => pm.response.to.have.status(400));`,
  status401: `pm.test("Status 401", () => pm.response.to.have.status(401));`,
  status403: `pm.test("Status 403", () => pm.response.to.have.status(403));`,
  status404: `pm.test("Status 404", () => pm.response.to.have.status(404));`,
  status409: `pm.test("Status 409", () => pm.response.to.have.status(409));`,
  isJson:    `pm.test("Response is JSON", () => pm.response.to.be.json);`,
  noError:   `pm.test("No error field", () => pm.expect(pm.response.json()).to.not.have.property("error"));`,
  hasError:  `pm.test("Has error field", () => pm.expect(pm.response.json()).to.have.property("error"));`,
  saveToken: [
    `const j = pm.response.json();`,
    `if (j.accessToken)  pm.environment.set("access_token",  j.accessToken);`,
    `if (j.refreshToken) pm.environment.set("refresh_token", j.refreshToken);`,
    `if (j.user && j.user._id) pm.environment.set("user_id", j.user._id);`
  ],
  saveVehicle: [
    `const j = pm.response.json();`,
    `if (j.item && j.item._id) pm.environment.set("vehicle_id", j.item._id);`
  ],
  saveBooking: [
    `const j = pm.response.json();`,
    `if (j.item && j.item._id) pm.environment.set("booking_id", j.item._id);`
  ],
  saveReview: [
    `const j = pm.response.json();`,
    `if (j.item && j.item._id) pm.environment.set("review_id", j.item._id);`
  ],
  savePayment: [
    `const j = pm.response.json();`,
    `if (j.paymentId) pm.environment.set("payment_id", j.paymentId);`
  ]
};

const ok     = [s.status200, s.isJson, s.noError];
const okItems= [...ok, `pm.test("Has items array", () => pm.expect(pm.response.json()).to.have.property("items"));`];

// ── AUTH ───────────────────────────────────────────────────────────────────────
const authFolder = folder("🔐 Auth", [
  req("Register - Renter", "POST", "/auth/register",
    { fullName: "Test Renter", email: "renter@test.com", password: "Test1234!", roles: ["renter"] },
    [s.status201, s.isJson, ...s.saveToken], [], true),

  req("Register - Owner", "POST", "/auth/register",
    { fullName: "Test Owner", email: "owner@test.com", password: "Test1234!", roles: ["owner"] },
    [s.status201, s.isJson], [], true),

  req("Register - Admin", "POST", "/auth/register",
    { fullName: "Admin User", email: "admin@test.com", password: "Test1234!", roles: ["admin"] },
    [s.status201, s.isJson], [], true),

  req("Login - Renter", "POST", "/auth/login",
    { email: "renter@test.com", password: "Test1234!" },
    [s.status200, s.isJson, ...s.saveToken], [], true),

  req("Login - Admin", "POST", "/auth/login",
    { email: "admin@test.com", password: "Test1234!" },
    [s.status200, s.isJson, ...s.saveToken], [], true),

  req("Refresh Token", "POST", "/auth/refresh",
    { refreshToken: "{{refresh_token}}" },
    [s.status200, s.isJson, ...s.saveToken], [], true),

  req("Logout", "POST", "/auth/logout",
    { refreshToken: "{{refresh_token}}" },
    [s.status200, s.isJson], [], true),

  req("Register - Missing Fields (400)", "POST", "/auth/register",
    { email: "bad@test.com" },
    [s.status400, s.hasError], [], true),

  req("Login - Wrong Password (401)", "POST", "/auth/login",
    { email: "renter@test.com", password: "wrong" },
    [s.status401, s.hasError], [], true),
], "Authentication endpoints — register, login, token refresh, logout");

// ── VEHICLES ───────────────────────────────────────────────────────────────────
const vehicleBody = {
  make: "Toyota", model: "Camry", year: 2022, type: "sedan",
  pricePerDay: 75, location: { city: "Nairobi", country: "Kenya" },
  features: ["AC", "GPS"], availability: { isAvailable: true }
};

const vehiclesFolder = folder("🚗 Vehicles", [
  req("List Vehicles", "GET", "/vehicles", null, okItems),
  req("List Vehicles - Filter by City", "GET", "/vehicles", null, [s.status200, s.isJson], [],
    false, [["city","Nairobi"],["type","sedan"],["page","1"],["limit","10"]]),
  req("Get Top Rated Vehicles", "GET", "/vehicles/ratings/top", null, ok),
  req("Create Vehicle (Owner)", "POST", "/vehicles", vehicleBody,
    [s.status201, s.isJson, ...s.saveVehicle]),
  req("Get Vehicle by ID", "GET", "/vehicles/{{vehicle_id}}", null, ok),
  req("Get Vehicle Ratings", "GET", "/vehicles/{{vehicle_id}}/ratings", null, ok),
  req("Update Vehicle (Owner)", "PUT", "/vehicles/{{vehicle_id}}",
    { ...vehicleBody, pricePerDay: 90 }, ok),
  req("Delete Vehicle (Owner)", "DELETE", "/vehicles/{{vehicle_id}}", null,
    [s.status200, s.isJson]),

  folder("🔧 Vehicle Admin", [
    req("List Admin Vehicle Listings", "GET", "/vehicles/admin/listings", null, [s.status200, s.isJson]),
    req("Approve Vehicle Listing", "PATCH", "/vehicles/admin/{{vehicle_id}}/approve",
      { approved: true }, [s.status200, s.isJson]),
    req("Remove Vehicle Listing", "PATCH", "/vehicles/admin/{{vehicle_id}}/remove",
      { reason: "Policy violation" }, [s.status200, s.isJson]),
  ], "Admin vehicle moderation"),
], "Vehicle CRUD and admin moderation");

// ── BOOKINGS ───────────────────────────────────────────────────────────────────
const bookingBody = {
  vehicle: { vehicleId: "{{vehicle_id}}", make: "Toyota", model: "Camry" },
  startDate: "2026-06-01T00:00:00Z",
  endDate:   "2026-06-05T00:00:00Z",
  renter: { fullName: "Test Renter", email: "renter@test.com" },
  pricing: { pricePerDay: 75, totalDays: 4, totalAmount: 300 }
};

const bookingsFolder = folder("📅 Bookings", [
  req("List My Bookings", "GET", "/bookings", null, [s.status200, s.isJson]),
  req("Create Booking", "POST", "/bookings", bookingBody,
    [s.status201, s.isJson, ...s.saveBooking]),
  req("Create Booking - Overlap (409)", "POST", "/bookings", bookingBody,
    [s.status409, s.hasError]),
  req("Create Booking - Missing Dates (400)", "POST", "/bookings",
    { vehicle: { vehicleId: "{{vehicle_id}}" } }, [s.status400, s.hasError]),
  req("Confirm Booking", "PATCH", "/bookings/{{booking_id}}/status",
    { status: "confirmed" }, ok),
  req("Cancel Booking", "PATCH", "/bookings/{{booking_id}}/status",
    { status: "cancelled", cancellationReason: "Change of plans" }, ok),
  req("Cancel Already Cancelled (400)", "PATCH", "/bookings/{{booking_id}}/status",
    { status: "cancelled" }, [s.status400, s.hasError]),

  folder("🔧 Booking Admin", [
    req("List Booking Activity", "GET", "/bookings/admin/activity", null,
      [s.status200, s.isJson], [], false, [["page","1"],["limit","20"]]),
    req("List Booking Activity - Filter by Status", "GET", "/bookings/admin/activity", null,
      [s.status200, s.isJson], [], false, [["status","confirmed"]]),
    req("Get Booking Stats", "GET", "/bookings/admin/stats", null, [s.status200, s.isJson]),
    req("Admin Cancel Booking", "PATCH", "/bookings/admin/{{booking_id}}/cancel",
      { cancellationReason: "Admin override" }, [s.status200, s.isJson]),
  ], "Admin booking management"),
], "Booking creation, status updates, and admin management");

// ── PAYMENTS ───────────────────────────────────────────────────────────────────
const paymentsFolder = folder("💳 Payments", [
  req("Create Checkout Session", "POST", "/payments/checkout",
    { bookingId: "{{booking_id}}", userId: "{{user_id}}", amount: 300, currency: "USD" },
    [s.status201, s.isJson, ...s.savePayment,
     `pm.test("Has checkout URL", () => pm.expect(pm.response.json()).to.have.property("url"));`]),

  req("Create Checkout - Missing Fields (400)", "POST", "/payments/checkout",
    { bookingId: "{{booking_id}}" }, [s.status400, s.hasError]),
], "Stripe Checkout session creation");

// ── REVIEWS ────────────────────────────────────────────────────────────────────
const reviewBody = {
  vehicleId: "{{vehicle_id}}",
  bookingId: "{{booking_id}}",
  rating: 5,
  comment: "Excellent vehicle, smooth ride!"
};

const reviewsFolder = folder("⭐ Reviews", [
  req("List Reviews", "GET", "/reviews", null, ok),
  req("List Reviews - Filter by Vehicle", "GET", "/reviews", null, ok,
    [], false, [["vehicleId","{{vehicle_id}}"]]),
  req("Get Review Stats Overview", "GET", "/reviews/stats/overview", null, ok),
  req("Get Vehicle Rating Details", "GET", "/reviews/{{vehicle_id}}/rating-details", null, ok),
  req("Create Review", "POST", "/reviews", reviewBody,
    [s.status201, s.isJson, ...s.saveReview]),
  req("Update Review", "PUT", "/reviews/{{review_id}}",
    { ...reviewBody, rating: 4, comment: "Updated review" }, ok),
  req("Delete Review", "DELETE", "/reviews/{{review_id}}", null, [s.status200, s.isJson]),
  req("Admin Recalculate All Ratings", "GET", "/reviews/admin/recalculate", null,
    [s.status200, s.isJson]),
], "Vehicle reviews and rating management");

// ── ADMIN ──────────────────────────────────────────────────────────────────────
const adminFolder = folder("🛡️ Admin Dashboard", [
  folder("📊 Analytics", [
    req("Platform Overview", "GET", "/admin/overview", null, ok),
    req("Revenue Analytics", "GET", "/admin/analytics/revenue", null,
      [...ok, `pm.test("Has summary", () => pm.expect(pm.response.json()).to.have.property("summary"));`,
              `pm.test("Has timeSeries", () => pm.expect(pm.response.json()).to.have.property("timeSeries"));`]),
    req("Revenue Analytics - By Month", "GET", "/admin/analytics/revenue", null,
      [s.status200, s.isJson], [], false, [["groupBy","month"],["from","2026-01-01"],["to","2026-12-31"]]),
    req("Revenue Analytics - Filter Currency", "GET", "/admin/analytics/revenue", null,
      [s.status200, s.isJson], [], false, [["currency","USD"]]),
    req("Booking Analytics", "GET", "/admin/analytics/bookings", null,
      [...ok, `pm.test("Has summary", () => pm.expect(pm.response.json()).to.have.property("summary"));`,
              `pm.test("Has statusBreakdown", () => pm.expect(pm.response.json()).to.have.property("statusBreakdown"));`]),
    req("Booking Analytics - Monthly", "GET", "/admin/analytics/bookings", null,
      [s.status200, s.isJson], [], false, [["groupBy","month"],["status","confirmed"]]),
    req("User Growth Analytics", "GET", "/admin/analytics/users", null,
      [...ok, `pm.test("Has summary", () => pm.expect(pm.response.json()).to.have.property("summary"));`,
              `pm.test("Has roleBreakdown", () => pm.expect(pm.response.json()).to.have.property("roleBreakdown"));`]),
    req("User Growth Analytics - Monthly", "GET", "/admin/analytics/users", null,
      [s.status200, s.isJson], [], false, [["groupBy","month"]]),
    req("Vehicle Usage Analytics", "GET", "/admin/analytics/vehicles", null,
      [...ok, `pm.test("Has vehicleTotals", () => pm.expect(pm.response.json()).to.have.property("vehicleTotals"));`,
              `pm.test("Has topVehiclesByBookings", () => pm.expect(pm.response.json()).to.have.property("topVehiclesByBookings"));`]),
    req("Vehicle Usage Analytics - With Limit", "GET", "/admin/analytics/vehicles", null,
      [s.status200, s.isJson], [], false, [["limit","5"]]),
  ], "Platform-wide analytics dashboards"),

  folder("👥 User Management", [
    req("List All Users", "GET", "/auth/admin/users", null,
      [s.status200, s.isJson, `pm.test("Returns array", () => pm.expect(pm.response.json()).to.be.an("array"));`]),
    req("Suspend User", "PATCH", "/auth/admin/users/{{user_id}}/suspend",
      { suspended: true }, [s.status200, s.isJson]),
    req("Update User Roles", "PATCH", "/auth/admin/users/{{user_id}}/roles",
      { roles: ["renter", "owner"] }, [s.status200, s.isJson]),
    req("Delete User", "DELETE", "/auth/admin/users/{{user_id}}", null,
      [s.status200, s.isJson]),
    req("Access Without Auth (401)", "GET", "/admin/overview", null,
      [s.status401, s.hasError], [], true),
    req("Access as Non-Admin (403)", "GET", "/admin/overview", null,
      [s.status403, s.hasError]),
  ], "Admin user management via auth-service"),
], "All admin-only endpoints via API Gateway");

// ── HEALTH CHECKS ──────────────────────────────────────────────────────────────
const healthFolder = folder("🏥 Health Checks", [
  req("API Gateway Health",      "GET", "/health", null, [s.status200, s.isJson], [], true),
  req("Auth Service Health",     "GET", "/auth/health", null, [s.status200, s.isJson], [], true),
  req("Vehicle Service Health",  "GET", "/vehicles/health", null, [s.status200, s.isJson], [], true),
  req("Booking Service Health",  "GET", "/bookings/health", null, [s.status200, s.isJson], [], true),
  req("Payment Service Health",  "GET", "/payments/health", null, [s.status200, s.isJson], [], true),
  req("Review Service Health",   "GET", "/reviews/health", null, [s.status200, s.isJson], [], true),
  req("Admin Service Health",    "GET", "/admin/health", null, [s.status200, s.isJson], [], true),
], "Health check endpoints for all services via API Gateway");

// ── COLLECTION ────────────────────────────────────────────────────────────────
const collection = {
  info: {
    name: "Auto Rentals API",
    description: "Full API test collection for the Auto Rentals microservices platform. All requests route through the API Gateway on port 4000.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  auth: auth(),
  event: [
    {
      listen: "prerequest",
      script: {
        type: "text/javascript",
        exec: [
          "// Collection-level pre-request: nothing needed, auth handled per-request"
        ]
      }
    }
  ],
  variable: [{ key: "base_url", value: "http://localhost:4000" }],
  item: [
    healthFolder,
    authFolder,
    vehiclesFolder,
    bookingsFolder,
    paymentsFolder,
    reviewsFolder,
    adminFolder
  ]
};

fs.writeFileSync("./postman/Auto-Rentals.collection.json", JSON.stringify(collection, null, 2));
fs.writeFileSync("./postman/Auto-Rentals.environment.json", JSON.stringify(env, null, 2));
console.log("✅ Postman collection generated → postman/Auto-Rentals.collection.json");
console.log("✅ Postman environment generated → postman/Auto-Rentals.environment.json");
