const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

const port = process.env.VEHICLE_SERVICE_PORT || process.env.PORT || 4002;
const baseUrl = process.env.VEHICLE_SERVICE_URL || `http://localhost:${port}`;

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Vehicle Service API",
      version: "1.0.0",
      description: "Vehicle management service for the Auto Rentals platform."
    },
    servers: [{ url: baseUrl }],
    tags: [
      { name: "Health", description: "Service health checks" },
      { name: "Vehicles", description: "Vehicle listings" },
      { name: "Ratings", description: "Vehicle ratings" },
      { name: "Admin", description: "Admin vehicle moderation" }
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
            service: { type: "string", example: "vehicle-service" }
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
        ValidationErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "Validation failed" },
            details: {
              type: "array",
              items: { type: "string" },
              example: ["make is required", "pricing.perDay is required and must be a valid number"]
            }
          },
          required: ["error", "details"]
        },
        VehicleImage: {
          type: "object",
          properties: {
            url: { type: "string", example: "/uploads/images-1715165490123-123456789.jpg" },
            caption: { type: "string", example: "Front view" },
            isPrimary: { type: "boolean", example: true },
            sortOrder: { type: "number", example: 0 }
          },
          required: ["url"]
        },
        VehiclePricing: {
          type: "object",
          properties: {
            perDay: { type: "number", example: 65 },
            perHour: { type: "number", example: 12 },
            currency: { type: "string", example: "USD" },
            securityDeposit: { type: "number", example: 200 },
            cleaningFee: { type: "number", example: 20 },
            weeklyDiscountPercent: { type: "number", example: 10 },
            monthlyDiscountPercent: { type: "number", example: 25 }
          },
          required: ["perDay"]
        },
        VehicleLocation: {
          type: "object",
          properties: {
            addressLine1: { type: "string", example: "123 Market St" },
            addressLine2: { type: "string", example: "Suite 4" },
            city: { type: "string", example: "San Francisco" },
            state: { type: "string", example: "CA" },
            country: { type: "string", example: "US" },
            postalCode: { type: "string", example: "94103" },
            coordinates: {
              type: "object",
              properties: {
                type: { type: "string", example: "Point" },
                coordinates: {
                  type: "array",
                  items: { type: "number" },
                  example: [-122.4194, 37.7749]
                }
              }
            }
          }
        },
        VehicleAvailability: {
          type: "object",
          properties: {
            startDate: { type: "string", format: "date-time", example: "2026-06-01T00:00:00Z" },
            endDate: { type: "string", format: "date-time", example: "2026-06-10T00:00:00Z" },
            status: { type: "string", enum: ["available", "blocked", "booked"], example: "available" },
            reason: { type: "string", example: "Owner vacation" }
          },
          required: ["startDate", "endDate"]
        },
        VehicleModeration: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["pending", "approved", "rejected", "removed"], example: "approved" },
            reason: { type: "string", example: "Missing insurance" },
            notes: { type: "string", example: "Reviewed by admin" },
            updatedAt: { type: "string", format: "date-time" },
            updatedBy: { type: "string", example: "admin-123" },
            approvedAt: { type: "string", format: "date-time" },
            approvedBy: { type: "string", example: "admin-123" },
            removedAt: { type: "string", format: "date-time" },
            removedBy: { type: "string", example: "admin-123" }
          }
        },
        VehicleRatings: {
          type: "object",
          properties: {
            averageRating: { type: "number", example: 4.6 },
            totalReviews: { type: "number", example: 38 },
            ratingDistribution: {
              type: "object",
              properties: {
                five: { type: "number", example: 22 },
                four: { type: "number", example: 10 },
                three: { type: "number", example: 4 },
                two: { type: "number", example: 2 },
                one: { type: "number", example: 0 }
              }
            },
            lastUpdated: { type: "string", format: "date-time", nullable: true }
          },
          required: ["averageRating", "totalReviews"]
        },
        Vehicle: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6651d1b7b8f9c00012a1bcde" },
            ownerId: { type: "string", example: "user-123" },
            type: {
              type: "string",
              enum: ["sedan", "suv", "truck", "van", "coupe", "convertible", "hatchback", "wagon", "other"],
              example: "suv"
            },
            make: { type: "string", example: "Toyota" },
            model: { type: "string", example: "RAV4" },
            year: { type: "number", example: 2022 },
            pricing: { $ref: "#/components/schemas/VehiclePricing" },
            location: { $ref: "#/components/schemas/VehicleLocation" },
            status: { type: "string", enum: ["available", "unavailable", "maintenance"], example: "available" },
            moderation: { $ref: "#/components/schemas/VehicleModeration" },
            features: { type: "array", items: { type: "string" }, example: ["Bluetooth", "Backup camera"] },
            images: { type: "array", items: { $ref: "#/components/schemas/VehicleImage" } },
            availability: { type: "array", items: { $ref: "#/components/schemas/VehicleAvailability" } },
            ratings: { $ref: "#/components/schemas/VehicleRatings" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          },
          required: ["ownerId", "type", "make", "model", "year", "pricing"]
        },
        VehicleCreateRequest: {
          type: "object",
          properties: {
            ownerId: { type: "string", description: "Optional for owners; inferred from token.", example: "user-123" },
            type: { type: "string", example: "suv" },
            make: { type: "string", example: "Toyota" },
            model: { type: "string", example: "RAV4" },
            year: { type: "number", example: 2022 },
            pricing: { $ref: "#/components/schemas/VehiclePricing" },
            location: { $ref: "#/components/schemas/VehicleLocation" },
            features: { type: "array", items: { type: "string" }, example: ["Bluetooth", "Backup camera"] },
            availability: { type: "array", items: { $ref: "#/components/schemas/VehicleAvailability" } },
            images: {
              type: "array",
              description: "Optional image metadata (use file uploads for binaries).",
              items: { $ref: "#/components/schemas/VehicleImage" }
            }
          },
          required: ["type", "make", "model", "year", "pricing"]
        },
        VehicleUpdateRequest: {
          type: "object",
          properties: {
            type: { type: "string", example: "suv" },
            make: { type: "string", example: "Toyota" },
            model: { type: "string", example: "RAV4" },
            year: { type: "number", example: 2023 },
            pricing: { $ref: "#/components/schemas/VehiclePricing" },
            location: { $ref: "#/components/schemas/VehicleLocation" },
            status: { type: "string", enum: ["available", "unavailable", "maintenance"], example: "maintenance" },
            features: { type: "array", items: { type: "string" }, example: ["Heated seats"] },
            availability: { type: "array", items: { $ref: "#/components/schemas/VehicleAvailability" } },
            images: {
              type: "array",
              description: "Optional image metadata; new files can be uploaded via multipart images field.",
              items: { $ref: "#/components/schemas/VehicleImage" }
            }
          }
        },
        VehicleResponse: {
          type: "object",
          properties: {
            item: { $ref: "#/components/schemas/Vehicle" }
          }
        },
        VehicleListResponse: {
          type: "object",
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/Vehicle" } },
            pagination: {
              type: "object",
              properties: {
                totalItems: { type: "number", example: 120 },
                totalPages: { type: "number", example: 12 },
                currentPage: { type: "number", example: 1 },
                limit: { type: "number", example: 10 }
              }
            }
          }
        },
        VehicleRatingsResponse: {
          type: "object",
          properties: {
            item: { $ref: "#/components/schemas/VehicleRatings" }
          }
        },
        VehicleDeleteResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "Vehicle soft deleted successfully" },
            item: { $ref: "#/components/schemas/Vehicle" }
          }
        },
        AdminModerationRequest: {
          type: "object",
          properties: {
            reason: { type: "string", example: "Policy violation" },
            notes: { type: "string", example: "Missing documents" }
          }
        },
        AdminApproveRequest: {
          type: "object",
          properties: {
            notes: { type: "string", example: "Approved after review" }
          }
        },
        AdminApproveResponse: {
          type: "object",
          properties: {
            item: { $ref: "#/components/schemas/Vehicle" },
            searchVisibility: {
              type: "object",
              properties: {
                appearsInSearch: { type: "boolean", example: true }
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
      "/vehicles": {
        get: {
          tags: ["Vehicles"],
          summary: "List vehicles with filters",
          parameters: [
            { name: "lat", in: "query", schema: { type: "number" }, description: "Latitude for geo search" },
            { name: "lng", in: "query", schema: { type: "number" }, description: "Longitude for geo search" },
            { name: "radius", in: "query", schema: { type: "number" }, description: "Radius in kilometers" },
            { name: "minPrice", in: "query", schema: { type: "number" } },
            { name: "maxPrice", in: "query", schema: { type: "number" } },
            { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
            { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
            { name: "type", in: "query", schema: { type: "string" } },
            { name: "make", in: "query", schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "number", example: 1 } },
            { name: "limit", in: "query", schema: { type: "number", example: 10 } },
            { name: "sortBy", in: "query", schema: { type: "string", enum: ["newest", "price_asc", "price_desc"] } }
          ],
          responses: {
            200: {
              description: "Vehicle list",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/VehicleListResponse" }
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
          tags: ["Vehicles"],
          summary: "Create a vehicle listing",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/VehicleCreateRequest" },
                    {
                      type: "object",
                      properties: {
                        images: {
                          type: "array",
                          items: { type: "string", format: "binary" },
                          description: "Image files (up to 10)."
                        }
                      }
                    }
                  ]
                }
              },
              "application/json": {
                schema: { $ref: "#/components/schemas/VehicleCreateRequest" }
              }
            }
          },
          responses: {
            201: {
              description: "Vehicle created.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/VehicleResponse" }
                }
              }
            },
            400: {
              description: "Validation failed.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidationErrorResponse" }
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
              description: "Owner role required.",
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
      "/vehicles/ratings/top": {
        get: {
          tags: ["Ratings"],
          summary: "Get top rated vehicles",
          parameters: [
            { name: "limit", in: "query", schema: { type: "number", example: 10 } },
            { name: "minReviews", in: "query", schema: { type: "number", example: 5 } }
          ],
          responses: {
            200: {
              description: "Top rated vehicles",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      items: { type: "array", items: { $ref: "#/components/schemas/Vehicle" } }
                    }
                  }
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
      "/vehicles/admin/listings": {
        get: {
          tags: ["Admin"],
          summary: "List vehicles for admin moderation",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "number", example: 1 } },
            { name: "limit", in: "query", schema: { type: "number", example: 20 } },
            { name: "status", in: "query", schema: { type: "string", enum: ["available", "unavailable", "maintenance"] } },
            {
              name: "moderationStatus",
              in: "query",
              schema: { type: "string", enum: ["pending", "approved", "rejected", "removed"] }
            },
            { name: "ownerId", in: "query", schema: { type: "string" } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "createdFrom", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "createdTo", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "updatedFrom", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "updatedTo", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "sortBy", in: "query", schema: { type: "string", enum: ["updated", "created", "status", "moderation"] } }
          ],
          responses: {
            200: {
              description: "Admin vehicle list",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/VehicleListResponse" }
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
      "/vehicles/{id}": {
        get: {
          tags: ["Vehicles"],
          summary: "Get a vehicle by ID",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } }
          ],
          responses: {
            200: {
              description: "Vehicle details.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/VehicleResponse" }
                }
              }
            },
            404: {
              description: "Vehicle not found.",
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
        put: {
          tags: ["Vehicles"],
          summary: "Update a vehicle",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } }
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/VehicleUpdateRequest" },
                    {
                      type: "object",
                      properties: {
                        images: {
                          type: "array",
                          items: { type: "string", format: "binary" },
                          description: "Image files (up to 10)."
                        }
                      }
                    }
                  ]
                }
              },
              "application/json": {
                schema: { $ref: "#/components/schemas/VehicleUpdateRequest" }
              }
            }
          },
          responses: {
            200: {
              description: "Vehicle updated.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/VehicleResponse" }
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
              description: "Not authorized to update this vehicle.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            404: {
              description: "Vehicle not found.",
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
          tags: ["Vehicles"],
          summary: "Soft delete a vehicle",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } }
          ],
          responses: {
            200: {
              description: "Vehicle soft deleted.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/VehicleDeleteResponse" }
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
              description: "Not authorized to delete this vehicle.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            404: {
              description: "Vehicle not found.",
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
      "/vehicles/{id}/ratings": {
        get: {
          tags: ["Ratings"],
          summary: "Get ratings for a vehicle",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } }
          ],
          responses: {
            200: {
              description: "Vehicle ratings.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/VehicleRatingsResponse" }
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
              description: "Vehicle not found.",
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
      "/vehicles/admin/{id}/approve": {
        patch: {
          tags: ["Admin"],
          summary: "Approve a vehicle listing",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } }
          ],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminApproveRequest" }
              }
            }
          },
          responses: {
            200: {
              description: "Vehicle approved.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AdminApproveResponse" }
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
              description: "Vehicle not found.",
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
      "/vehicles/admin/{id}/remove": {
        patch: {
          tags: ["Admin"],
          summary: "Remove a vehicle listing",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } }
          ],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminModerationRequest" }
              }
            }
          },
          responses: {
            200: {
              description: "Vehicle removed.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/VehicleResponse" }
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
              description: "Vehicle not found.",
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
