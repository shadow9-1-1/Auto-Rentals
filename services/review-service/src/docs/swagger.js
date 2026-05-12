const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

const port = process.env.REVIEW_SERVICE_PORT || process.env.PORT || 4006;
const baseUrl = process.env.REVIEW_SERVICE_URL || `http://localhost:${port}`;

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Review Service API",
      version: "1.0.0",
      description: "Review and rating service for the Auto Rentals platform."
    },
    servers: [{ url: baseUrl }],
    tags: [
      { name: "Health", description: "Service health checks" },
      { name: "Reviews", description: "Review operations" },
      { name: "Ratings", description: "Rating analytics" },
      { name: "Admin", description: "Admin review operations" }
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
            service: { type: "string", example: "review-service" }
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
        ReviewReviewer: {
          type: "object",
          properties: {
            userId: { type: "string", example: "user-123" },
            displayName: { type: "string", example: "Jamie Lee" },
            avatarUrl: { type: "string", example: "https://cdn.example.com/avatar.png" }
          },
          required: ["userId"]
        },
        Review: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6651d1b7b8f9c00012a1bce0" },
            reviewer: { $ref: "#/components/schemas/ReviewReviewer" },
            vehicleId: { type: "string", example: "vehicle-001" },
            bookingId: { type: "string", example: "booking-001" },
            rating: { type: "number", example: 5 },
            title: { type: "string", example: "Smooth ride" },
            comment: { type: "string", example: "Clean car and great host." },
            isPublished: { type: "boolean", example: true },
            flaggedAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          },
          required: ["reviewer", "vehicleId", "rating"]
        },
        ReviewCreateRequest: {
          type: "object",
          properties: {
            bookingId: { type: "string", example: "booking-001" },
            vehicleId: { type: "string", example: "vehicle-001" },
            rating: { type: "number", example: 5 },
            title: { type: "string", example: "Smooth ride" },
            comment: { type: "string", example: "Clean car and great host." },
            reviewer: {
              type: "object",
              properties: {
                displayName: { type: "string", example: "Jamie Lee" },
                avatarUrl: { type: "string", example: "https://cdn.example.com/avatar.png" }
              }
            }
          },
          required: ["bookingId", "vehicleId", "rating"]
        },
        ReviewUpdateRequest: {
          type: "object",
          properties: {
            rating: { type: "number", example: 4 },
            title: { type: "string", example: "Good overall" },
            comment: { type: "string", example: "Minor scratches but ok." }
          }
        },
        ReviewResponse: {
          type: "object",
          properties: {
            item: { $ref: "#/components/schemas/Review" }
          }
        },
        ReviewListResponse: {
          type: "object",
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/Review" } }
          }
        },
        ReviewStatsResponse: {
          type: "object",
          properties: {
            overview: {
              type: "object",
              properties: {
                totalReviews: { type: "number", example: 420 },
                averageRating: { type: "number", example: 4.6 },
                minRating: { type: "number", example: 1 },
                maxRating: { type: "number", example: 5 }
              }
            },
            ratingDistribution: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "number", example: 5 },
                  count: { type: "number", example: 120 }
                }
              }
            },
            topReviewedVehicles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "vehicle-001" },
                  reviewCount: { type: "number", example: 32 },
                  averageRating: { type: "number", example: 4.8 }
                }
              }
            }
          }
        },
        VehicleRatingDetailsResponse: {
          type: "object",
          properties: {
            vehicleId: { type: "string", example: "vehicle-001" },
            stats: {
              type: "object",
              properties: {
                _id: { type: "string", example: "vehicle-001" },
                totalReviews: { type: "number", example: 42 },
                averageRating: { type: "number", example: 4.7 },
                medianRating: { type: "number", example: 4.5 }
              }
            },
            distribution: {
              type: "object",
              properties: {
                five: { type: "number", example: 28 },
                four: { type: "number", example: 10 },
                three: { type: "number", example: 3 },
                two: { type: "number", example: 1 },
                one: { type: "number", example: 0 }
              }
            },
            recentReviews: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  reviewer: { $ref: "#/components/schemas/ReviewReviewer" },
                  rating: { type: "number", example: 5 },
                  title: { type: "string", example: "Smooth ride" },
                  comment: { type: "string", example: "Clean car and great host." },
                  createdAt: { type: "string", format: "date-time" }
                }
              }
            }
          }
        },
        RecalculateResponse: {
          type: "object",
          properties: {
            total: { type: "number", example: 10 },
            successful: { type: "number", example: 9 },
            failed: { type: "number", example: 1 },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  vehicleId: { type: "string", example: "vehicle-001" },
                  success: { type: "boolean", example: true },
                  error: { type: "string", example: "" }
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
      "/reviews": {
        get: {
          tags: ["Reviews"],
          summary: "List reviews",
          responses: {
            200: {
              description: "Review list.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ReviewListResponse" }
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
          tags: ["Reviews"],
          summary: "Create a review",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReviewCreateRequest" }
              }
            }
          },
          responses: {
            201: {
              description: "Review created.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ReviewResponse" }
                }
              }
            },
            400: {
              description: "Invalid input.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            401: {
              description: "Authentication required.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            403: {
              description: "You can only review your own bookings.",
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
            409: {
              description: "Review already exists for this booking.",
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
      "/reviews/{reviewId}": {
        put: {
          tags: ["Reviews"],
          summary: "Update a review",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "reviewId", in: "path", required: true, schema: { type: "string" } }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReviewUpdateRequest" }
              }
            }
          },
          responses: {
            200: {
              description: "Review updated.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ReviewResponse" }
                }
              }
            },
            400: {
              description: "Invalid input.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            401: {
              description: "Authentication required.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            403: {
              description: "You can only edit your own reviews.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            404: {
              description: "Review not found.",
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
        delete: {
          tags: ["Reviews"],
          summary: "Delete a review",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "reviewId", in: "path", required: true, schema: { type: "string" } }
          ],
          responses: {
            204: { description: "Review deleted." },
            400: {
              description: "reviewId is required.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            401: {
              description: "Authentication required.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            403: {
              description: "You can only delete your own reviews.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            404: {
              description: "Review not found.",
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
      "/reviews/stats/overview": {
        get: {
          tags: ["Ratings"],
          summary: "Review statistics overview",
          responses: {
            200: {
              description: "Review stats.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ReviewStatsResponse" }
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
      "/reviews/{vehicleId}/rating-details": {
        get: {
          tags: ["Ratings"],
          summary: "Vehicle rating details",
          parameters: [
            { name: "vehicleId", in: "path", required: true, schema: { type: "string" } }
          ],
          responses: {
            200: {
              description: "Vehicle rating details.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/VehicleRatingDetailsResponse" }
                }
              }
            },
            400: {
              description: "vehicleId is required.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            404: {
              description: "No reviews found for this vehicle.",
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
      "/reviews/admin/recalculate": {
        get: {
          tags: ["Admin"],
          summary: "Recalculate all vehicle ratings",
          responses: {
            200: {
              description: "Recalculation summary.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/RecalculateResponse" }
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
