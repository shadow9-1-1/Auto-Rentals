const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

const port = process.env.BOOKING_SERVICE_PORT || process.env.PORT || 4003;
const baseUrl = process.env.BOOKING_SERVICE_URL || `http://localhost:${port}`;

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Booking Service API",
      version: "1.0.0",
      description: "Booking lifecycle service for the Auto Rentals platform."
    },
    servers: [{ url: baseUrl }],
    tags: [
      { name: "Health", description: "Service health checks" },
      { name: "Bookings", description: "Booking operations" },
      { name: "Admin", description: "Admin booking operations" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            service: { type: "string", example: "booking-service" }
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
        BookingRenter: {
          type: "object",
          properties: {
            userId: { type: "string", example: "user-123" },
            fullName: { type: "string", example: "Jamie Lee" },
            email: { type: "string", format: "email", example: "jamie@example.com" },
            phone: { type: "string", example: "+1-555-0100" }
          },
          required: ["userId"]
        },
        BookingVehicleSnapshot: {
          type: "object",
          properties: {
            vehicleId: { type: "string", example: "vehicle-001" },
            make: { type: "string", example: "Toyota" },
            model: { type: "string", example: "RAV4" },
            year: { type: "number", example: 2022 }
          },
          required: ["vehicleId"]
        },
        BookingPricing: {
          type: "object",
          properties: {
            totalAmount: { type: "number", example: 420 },
            currency: { type: "string", example: "USD" }
          },
          required: ["totalAmount"]
        },
        BookingPayment: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["unpaid", "authorized", "paid", "failed", "refunded"],
              example: "paid"
            },
            provider: { type: "string", example: "stripe" },
            intentId: { type: "string", example: "pi_123" },
            amount: { type: "number", example: 420 },
            currency: { type: "string", example: "USD" },
            paidAt: { type: "string", format: "date-time", nullable: true },
            refundedAt: { type: "string", format: "date-time", nullable: true }
          }
        },
        Booking: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6651d1b7b8f9c00012a1bcdf" },
            renter: { $ref: "#/components/schemas/BookingRenter" },
            vehicle: { $ref: "#/components/schemas/BookingVehicleSnapshot" },
            startDate: { type: "string", format: "date-time", example: "2026-06-01T00:00:00Z" },
            endDate: { type: "string", format: "date-time", example: "2026-06-07T00:00:00Z" },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "cancelled", "completed", "expired"],
              example: "confirmed"
            },
            cancellationReason: { type: "string", example: "Change of plans" },
            pricing: { $ref: "#/components/schemas/BookingPricing" },
            payment: { $ref: "#/components/schemas/BookingPayment" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          },
          required: ["renter", "vehicle", "startDate", "endDate", "status", "pricing"]
        },
        BookingCreateRequest: {
          type: "object",
          properties: {
            renter: {
              allOf: [
                { $ref: "#/components/schemas/BookingRenter" },
                { description: "userId is inferred from token when authenticated." }
              ]
            },
            vehicle: { $ref: "#/components/schemas/BookingVehicleSnapshot" },
            startDate: { type: "string", format: "date-time", example: "2026-06-01T00:00:00Z" },
            endDate: { type: "string", format: "date-time", example: "2026-06-07T00:00:00Z" },
            pricing: { $ref: "#/components/schemas/BookingPricing" }
          },
          required: ["vehicle", "startDate", "endDate", "pricing"]
        },
        BookingStatusUpdateRequest: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["confirmed", "cancelled"], example: "cancelled" },
            cancellationReason: { type: "string", example: "Change of plans" }
          },
          required: ["status"]
        },
        BookingResponse: {
          type: "object",
          properties: {
            item: { $ref: "#/components/schemas/Booking" }
          }
        },
        BookingListResponse: {
          type: "object",
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/Booking" } }
          }
        },
        BookingAdminListResponse: {
          type: "object",
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/Booking" } },
            pagination: {
              type: "object",
              properties: {
                totalItems: { type: "number", example: 120 },
                totalPages: { type: "number", example: 12 },
                currentPage: { type: "number", example: 1 },
                limit: { type: "number", example: 20 }
              }
            }
          }
        },
        BookingStatsResponse: {
          type: "object",
          properties: {
            overview: {
              type: "object",
              properties: {
                totalBookings: { type: "number", example: 120 },
                totalRevenue: { type: "number", example: 45200 },
                averageBookingValue: { type: "number", example: 377 }
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
            paymentBreakdown: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "paid" },
                  count: { type: "number", example: 38 }
                }
              }
            },
            recentBookings: { type: "array", items: { $ref: "#/components/schemas/Booking" } }
          }
        },
        AdminCancelRequest: {
          type: "object",
          properties: {
            cancellationReason: { type: "string", example: "Cancelled by admin" }
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
      "/bookings": {
        get: {
          tags: ["Bookings"],
          summary: "List bookings",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Bookings list.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BookingListResponse" }
                }
              }
            },
            401: {
              description: "Authorization token required.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            500: {
              description: "Server error.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        },
        post: {
          tags: ["Bookings"],
          summary: "Create a booking",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BookingCreateRequest" }
              }
            }
          },
          responses: {
            201: {
              description: "Booking created.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BookingResponse" }
                }
              }
            },
            400: {
              description: "Invalid input or date range.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            401: {
              description: "Authorization token required.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            409: {
              description: "Vehicle is already booked for the requested dates.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            500: {
              description: "Server error.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/bookings/{id}/status": {
        patch: {
          tags: ["Bookings"],
          summary: "Update booking status",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BookingStatusUpdateRequest" }
              }
            }
          },
          responses: {
            200: {
              description: "Booking updated.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BookingResponse" }
                }
              }
            },
            400: {
              description: "Invalid status update.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            401: {
              description: "Authorization token required.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            403: {
              description: "Not authorized to update this booking.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            404: {
              description: "Booking not found.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            500: {
              description: "Server error.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/bookings/admin/activity": {
        get: {
          tags: ["Admin"],
          summary: "List booking activity (admin)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "number", example: 1 } },
            { name: "limit", in: "query", schema: { type: "number", example: 20 } },
            {
              name: "status",
              in: "query",
              schema: { type: "string", enum: ["pending", "confirmed", "cancelled", "completed", "expired"] }
            },
            { name: "renterId", in: "query", schema: { type: "string" } },
            { name: "vehicleId", in: "query", schema: { type: "string" } },
            {
              name: "paymentStatus",
              in: "query",
              schema: { type: "string", enum: ["unpaid", "authorized", "paid", "failed", "refunded"] }
            },
            { name: "startFrom", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "startTo", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "endFrom", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "endTo", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "createdFrom", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "createdTo", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "sortBy", in: "query", schema: { type: "string", enum: ["created", "start", "end", "status"] } }
          ],
          responses: {
            200: {
              description: "Booking activity list.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BookingAdminListResponse" }
                }
              }
            },
            401: {
              description: "Authorization token required.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            403: {
              description: "Admin role required.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            500: {
              description: "Server error.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/bookings/admin/stats": {
        get: {
          tags: ["Admin"],
          summary: "Get booking statistics",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Booking stats.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BookingStatsResponse" }
                }
              }
            },
            401: {
              description: "Authorization token required.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            403: {
              description: "Admin role required.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            500: {
              description: "Server error.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/bookings/admin/{id}/cancel": {
        patch: {
          tags: ["Admin"],
          summary: "Cancel a booking (admin)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } }
          ],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminCancelRequest" }
              }
            }
          },
          responses: {
            200: {
              description: "Booking cancelled.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BookingResponse" }
                }
              }
            },
            400: {
              description: "Invalid cancellation request.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            401: {
              description: "Authorization token required.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            403: {
              description: "Admin role required.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            404: {
              description: "Booking not found.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            500: {
              description: "Server error.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
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
