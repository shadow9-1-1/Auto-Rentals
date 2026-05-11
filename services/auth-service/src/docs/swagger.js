const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

const port = process.env.AUTH_SERVICE_PORT || process.env.PORT || 4001;
const baseUrl = process.env.AUTH_SERVICE_URL || `http://localhost:${port}`;

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Auth Service API",
      version: "1.0.0",
      description: "Authentication and authorization service for the Auto Rentals platform."
    },
    servers: [{ url: baseUrl }],
    tags: [
      { name: "Health", description: "Service health checks" },
      { name: "Auth", description: "Authentication endpoints" },
      { name: "OAuth", description: "Third-party OAuth flows" }
    ],
    components: {
      schemas: {
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            service: { type: "string", example: "auth-service" }
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
        RegisterRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email", example: "renter@example.com" },
            password: { type: "string", format: "password", minLength: 8, example: "StrongPass123" }
          },
          required: ["email", "password"]
        },
        LoginRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email", example: "renter@example.com" },
            password: { type: "string", format: "password", minLength: 8, example: "StrongPass123" }
          },
          required: ["email", "password"]
        },
        RefreshRequest: {
          type: "object",
          properties: {
            refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" }
          },
          required: ["refreshToken"]
        },
        LogoutRequest: {
          type: "object",
          properties: {
            refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" }
          },
          required: ["refreshToken"]
        },
        AuthUser: {
          type: "object",
          properties: {
            id: { type: "string", example: "64f8b9d7cfe2a1b2c3d4e5f6" },
            email: { type: "string", format: "email", example: "renter@example.com" },
            role: { type: "string", example: "renter" },
            roles: { type: "array", items: { type: "string" }, example: ["renter"] }
          },
          required: ["id", "email", "role", "roles"]
        },
        AuthResponse: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/AuthUser" },
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" },
            accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" },
            refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" }
          },
          required: ["user", "token", "accessToken", "refreshToken"]
        },
        LogoutResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "logged out" }
          },
          required: ["status"]
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
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" }
              }
            }
          },
          responses: {
            201: {
              description: "User registered successfully.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" }
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
            409: {
              description: "Email already registered.",
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
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Authenticate a user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" }
              }
            }
          },
          responses: {
            200: {
              description: "Login successful.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" }
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
              description: "Invalid credentials.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            403: {
              description: "Account is disabled.",
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
      "/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RefreshRequest" }
              }
            }
          },
          responses: {
            200: {
              description: "Token refreshed.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" }
                }
              }
            },
            400: {
              description: "Refresh token is required.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            401: {
              description: "Invalid or expired refresh token.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            403: {
              description: "Account is disabled.",
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
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Revoke refresh token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LogoutRequest" }
              }
            }
          },
          responses: {
            200: {
              description: "Logged out.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/LogoutResponse" }
                }
              }
            },
            400: {
              description: "Refresh token is required.",
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
      "/auth/google": {
        get: {
          tags: ["OAuth"],
          summary: "Start Google OAuth flow",
          responses: {
            302: {
              description: "Redirect to Google for authentication.",
              headers: {
                Location: {
                  description: "Google OAuth authorization URL.",
                  schema: { type: "string", format: "uri" }
                }
              }
            }
          }
        }
      },
      "/auth/google/callback": {
        get: {
          tags: ["OAuth"],
          summary: "Handle Google OAuth callback",
          responses: {
            200: {
              description: "Google authentication successful.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" }
                }
              }
            },
            302: {
              description: "Redirected to failure endpoint when authentication fails."
            },
            401: {
              description: "Google authentication failed.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/auth/google/failure": {
        get: {
          tags: ["OAuth"],
          summary: "Google OAuth failure response",
          responses: {
            401: {
              description: "Google authentication failed.",
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
