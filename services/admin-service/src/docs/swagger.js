const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

const port = process.env.ADMIN_SERVICE_PORT || process.env.PORT || 4007;
const baseUrl = process.env.ADMIN_SERVICE_URL || `http://localhost:${port}`;

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Admin Service API",
      version: "1.0.0",
      description: "Admin and moderation service for the Auto Rentals platform."
    },
    servers: [{ url: baseUrl }],
    tags: [
      { name: "Health", description: "Service health checks" },
      { name: "Admin", description: "Admin overview" },
      { name: "Analytics", description: "Platform analytics" }
    ],
    components: {
      schemas: {
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            service: { type: "string", example: "admin-service" }
          },
          required: ["status"]
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "Internal server error" }
          },
          required: ["error"]
        },
        AdminOverviewResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            message: { type: "string", example: "Admin service ready" }
          },
          required: ["status", "message"]
        },
        RevenueAnalyticsResponse: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                totalRevenue: { type: "number", example: 45200 },
                totalTransactions: { type: "number", example: 120 },
                averageTransactionValue: { type: "number", example: 377 }
              }
            },
            byCurrency: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "USD" },
                  totalRevenue: { type: "number", example: 40000 },
                  totalTransactions: { type: "number", example: 98 }
                }
              }
            },
            byStatus: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "paid" },
                  totalRevenue: { type: "number", example: 38000 },
                  totalTransactions: { type: "number", example: 90 }
                }
              }
            },
            timeSeries: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "2026-05-01" },
                  totalRevenue: { type: "number", example: 1200 },
                  totalTransactions: { type: "number", example: 4 }
                }
              }
            }
          }
        },
        BookingAnalyticsResponse: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                totalBookings: { type: "number", example: 120 },
                totalRevenue: { type: "number", example: 45200 },
                averageBookingValue: { type: "number", example: 377 },
                averageDurationDays: { type: "number", example: 3.5 }
              }
            },
            statusBreakdown: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "confirmed" },
                  count: { type: "number", example: 42 }
                }
              }
            },
            timeSeries: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "2026-05-01" },
                  totalBookings: { type: "number", example: 6 },
                  totalRevenue: { type: "number", example: 1200 }
                }
              }
            },
            recentBookings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  renter: { type: "object" },
                  vehicle: { type: "object" },
                  status: { type: "string", example: "confirmed" },
                  startDate: { type: "string", format: "date-time" },
                  endDate: { type: "string", format: "date-time" },
                  createdAt: { type: "string", format: "date-time" },
                  pricing: { type: "object" }
                }
              }
            }
          }
        },
        UserGrowthAnalyticsResponse: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                totalUsers: { type: "number", example: 500 },
                activeUsers: { type: "number", example: 450 },
                inactiveUsers: { type: "number", example: 50 }
              }
            },
            roleBreakdown: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "renter" },
                  count: { type: "number", example: 320 }
                }
              }
            },
            growthSeries: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "2026-05-01" },
                  newUsers: { type: "number", example: 12 }
                }
              }
            }
          }
        },
        VehicleUsageAnalyticsResponse: {
          type: "object",
          properties: {
            vehicleTotals: { type: "number", example: 220 },
            statusBreakdown: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "available" },
                  count: { type: "number", example: 140 }
                }
              }
            },
            moderationBreakdown: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "approved" },
                  count: { type: "number", example: 120 }
                }
              }
            },
            topVehiclesByBookings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "vehicle-001" },
                  totalBookings: { type: "number", example: 18 },
                  confirmed: { type: "number", example: 12 },
                  cancelled: { type: "number", example: 3 },
                  completed: { type: "number", example: 3 },
                  totalRevenue: { type: "number", example: 2400 }
                }
              }
            }
          }
        }
      }
    },
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            200: {
              description: "Service is healthy.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthResponse" }
                }
              }
            },
            500: {
              description: "Service unhealthy.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/admin/overview": {
        get: {
          tags: ["Admin"],
          summary: "Admin overview",
          responses: {
            200: {
              description: "Service overview.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AdminOverviewResponse" }
                }
              }
            }
          }
        }
      },
      "/admin/analytics/revenue": {
        get: {
          tags: ["Analytics"],
          summary: "Revenue analytics",
          parameters: [
            { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "status", in: "query", schema: { type: "string" }, description: "Comma-separated list" },
            { name: "currency", in: "query", schema: { type: "string", example: "USD" } },
            { name: "groupBy", in: "query", schema: { type: "string", enum: ["day", "month"] } }
          ],
          responses: {
            200: {
              description: "Revenue analytics.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/RevenueAnalyticsResponse" }
                }
              }
            }
          }
        }
      },
      "/admin/analytics/bookings": {
        get: {
          tags: ["Analytics"],
          summary: "Booking analytics",
          parameters: [
            { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "status", in: "query", schema: { type: "string" } },
            { name: "groupBy", in: "query", schema: { type: "string", enum: ["day", "month"] } }
          ],
          responses: {
            200: {
              description: "Booking analytics.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BookingAnalyticsResponse" }
                }
              }
            }
          }
        }
      },
      "/admin/analytics/users": {
        get: {
          tags: ["Analytics"],
          summary: "User growth analytics",
          parameters: [
            { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "groupBy", in: "query", schema: { type: "string", enum: ["day", "month"] } }
          ],
          responses: {
            200: {
              description: "User growth analytics.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UserGrowthAnalyticsResponse" }
                }
              }
            }
          }
        }
      },
      "/admin/analytics/vehicles": {
        get: {
          tags: ["Analytics"],
          summary: "Vehicle usage analytics",
          parameters: [
            { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "limit", in: "query", schema: { type: "number", example: 10 } }
          ],
          responses: {
            200: {
              description: "Vehicle usage analytics.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/VehicleUsageAnalyticsResponse" }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: [path.join(__dirname, "..", "routes", "*.js")]
};

module.exports = swaggerJsdoc(options);
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

const port = process.env.ADMIN_SERVICE_PORT || process.env.PORT || 4007;
const baseUrl = process.env.ADMIN_SERVICE_URL || `http://localhost:${port}`;

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Admin Service API",
      version: "1.0.0",
      description: "Admin and moderation service for the Auto Rentals platform."
    },
    servers: [{ url: baseUrl }],
    tags: [
      { name: "Health", description: "Service health checks" },
      { name: "Admin", description: "Admin overview" },
      { name: "Analytics", description: "Platform analytics" }
    ],
    components: {
      schemas: {
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            service: { type: "string", example: "admin-service" }
          },
          required: ["status"]
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "Internal server error" }
          },
          required: ["error"]
        },
        AdminOverviewResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            message: { type: "string", example: "Admin service ready" }
          },
          required: ["status", "message"]
        },
        RevenueAnalyticsResponse: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                totalRevenue: { type: "number", example: 45200 },
                totalTransactions: { type: "number", example: 120 },
                averageTransactionValue: { type: "number", example: 377 }
              }
            },
            byCurrency: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "USD" },
                  totalRevenue: { type: "number", example: 40000 },
                  totalTransactions: { type: "number", example: 98 }
                }
              }
            },
            byStatus: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "paid" },
                  totalRevenue: { type: "number", example: 38000 },
                  totalTransactions: { type: "number", example: 90 }
                }
              }
            },
            timeSeries: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "2026-05-01" },
                  totalRevenue: { type: "number", example: 1200 },
                  totalTransactions: { type: "number", example: 4 }
                }
              }
            }
          }
        },
        BookingAnalyticsResponse: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                totalBookings: { type: "number", example: 120 },
                totalRevenue: { type: "number", example: 45200 },
                averageBookingValue: { type: "number", example: 377 },
                averageDurationDays: { type: "number", example: 3.5 }
              }
            },
            statusBreakdown: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "confirmed" },
                  count: { type: "number", example: 42 }
                }
              }
            },
            timeSeries: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "2026-05-01" },
                  totalBookings: { type: "number", example: 6 },
                  totalRevenue: { type: "number", example: 1200 }
                }
              }
            },
            recentBookings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  renter: { type: "object" },
                  vehicle: { type: "object" },
                  status: { type: "string", example: "confirmed" },
                  startDate: { type: "string", format: "date-time" },
                  endDate: { type: "string", format: "date-time" },
                  createdAt: { type: "string", format: "date-time" },
                  pricing: { type: "object" }
                }
              }
            }
          }
        },
        UserGrowthAnalyticsResponse: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                totalUsers: { type: "number", example: 500 },
                activeUsers: { type: "number", example: 450 },
                inactiveUsers: { type: "number", example: 50 }
              }
            },
            roleBreakdown: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "renter" },
                  count: { type: "number", example: 320 }
                }
              }
            },
            growthSeries: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "2026-05-01" },
                  newUsers: { type: "number", example: 12 }
                }
              }
            }
          }
        },
        VehicleUsageAnalyticsResponse: {
          type: "object",
          properties: {
            vehicleTotals: { type: "number", example: 220 },
            statusBreakdown: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "available" },
                  count: { type: "number", example: 140 }
                }
              }
            },
            moderationBreakdown: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "approved" },
                  count: { type: "number", example: 120 }
                }
              }
            },
            topVehiclesByBookings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "vehicle-001" },
                  totalBookings: { type: "number", example: 18 },
                  confirmed: { type: "number", example: 12 },
                  cancelled: { type: "number", example: 3 },
                  completed: { type: "number", example: 3 },
                  totalRevenue: { type: "number", example: 2400 }
                }
              }
            }
          }
        }
      }
    },
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            200: {
              description: "Service is healthy.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthResponse" }
                }
              }
            },
            500: {
              description: "Service unhealthy.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/admin/overview": {
        get: {
          tags: ["Admin"],
          summary: "Admin overview",
          responses: {
            200: {
              description: "Service overview.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AdminOverviewResponse" }
                }
              }
            }
          }
        }
      },
      "/admin/analytics/revenue": {
        get: {
          tags: ["Analytics"],
          summary: "Revenue analytics",
          parameters: [
            { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "status", in: "query", schema: { type: "string" }, description: "Comma-separated list" },
            { name: "currency", in: "query", schema: { type: "string", example: "USD" } },
            { name: "groupBy", in: "query", schema: { type: "string", enum: ["day", "month"] } }
          ],
          responses: {
            200: {
              description: "Revenue analytics.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/RevenueAnalyticsResponse" }
                }
              }
            }
          }
        }
      },
      "/admin/analytics/bookings": {
        get: {
          tags: ["Analytics"],
          summary: "Booking analytics",
          parameters: [
            { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
            {
              name: "status",
              in: "query",
              schema: { type: "string", enum: ["pending", "confirmed", "cancelled", "completed", "expired"] }
            },
            { name: "groupBy", in: "query", schema: { type: "string", enum: ["day", "month"] } }
          ],
          responses: {
            200: {
              description: "Booking analytics.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BookingAnalyticsResponse" }
                }
              }
            }
          }
        }
      },
      "/admin/analytics/users": {
        get: {
          tags: ["Analytics"],
          summary: "User growth analytics",
          parameters: [
            { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "groupBy", in: "query", schema: { type: "string", enum: ["day", "month"] } }
          ],
          responses: {
            200: {
              description: "User growth analytics.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UserGrowthAnalyticsResponse" }
                }
              }
            }
          }
        }
      },
      "/admin/analytics/vehicles": {
        get: {
          tags: ["Analytics"],
          summary: "Vehicle usage analytics",
          parameters: [
            { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "limit", in: "query", schema: { type: "number", example: 10 } }
          ],
          responses: {
            200: {
              description: "Vehicle usage analytics.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/VehicleUsageAnalyticsResponse" }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: [path.join(__dirname, "..", "routes", "*.js")]
};

module.exports = swaggerJsdoc(options);
