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
    tags: [{ name: "Health", description: "Service health checks" }],
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
      }
    }
  },
  apis: [path.join(__dirname, "..", "routes", "*.js")]
};

module.exports = swaggerJsdoc(options);
