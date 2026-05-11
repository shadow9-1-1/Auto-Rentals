const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

const port = process.env.API_GATEWAY_PORT || process.env.PORT || 4000;
const baseUrl = process.env.API_GATEWAY_URL || `http://localhost:${port}`;

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API Gateway",
      version: "1.0.0",
      description: "Gateway for routing requests to Auto Rentals services."
    },
    servers: [{ url: baseUrl }],
    tags: [{ name: "Health", description: "Gateway health checks" }],
    components: {
      schemas: {
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            service: { type: "string", example: "api-gateway" }
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
              description: "Gateway is healthy.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthResponse" }
                }
              }
            },
            500: {
              description: "Gateway unhealthy.",
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
