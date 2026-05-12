const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

const port = process.env.PAYMENT_SERVICE_PORT || process.env.PORT || 4004;
const baseUrl = process.env.PAYMENT_SERVICE_URL || `http://localhost:${port}`;

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Payment Service API",
      version: "1.0.0",
      description: "Payment processing service for the Auto Rentals platform."
    },
    servers: [{ url: baseUrl }],
    tags: [
      { name: "Health", description: "Service health checks" },
      { name: "Payments", description: "Checkout and payment records" },
      { name: "Webhooks", description: "Stripe webhooks" }
    ],
    components: {
      schemas: {
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            service: { type: "string", example: "payment-service" }
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
        CheckoutRequest: {
          type: "object",
          properties: {
            bookingId: { type: "string", example: "booking-001" },
            userId: { type: "string", example: "user-123" },
            amount: { type: "number", example: 420 },
            currency: { type: "string", example: "USD" }
          },
          required: ["bookingId", "userId", "amount"]
        },
        CheckoutResponse: {
          type: "object",
          properties: {
            paymentId: { type: "string", example: "6651d1b7b8f9c00012a1bcd0" },
            url: { type: "string", format: "uri", example: "https://checkout.stripe.com/c/pay/cs_test_123" }
          },
          required: ["paymentId", "url"]
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
      "/payments/checkout": {
        post: {
          tags: ["Payments"],
          summary: "Create Stripe checkout session",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CheckoutRequest" }
              }
            }
          },
          responses: {
            201: {
              description: "Checkout session created.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CheckoutResponse" }
                }
              }
            },
            400: {
              description: "Missing bookingId, userId, or amount.",
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
      "/payments/webhook": {
        post: {
          tags: ["Webhooks"],
          summary: "Stripe webhook handler",
          description: "Consumes Stripe events. Requires raw JSON body and Stripe-Signature header.",
          parameters: [
            {
              name: "Stripe-Signature",
              in: "header",
              required: true,
              schema: { type: "string" }
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object" }
              }
            }
          },
          responses: {
            200: {
              description: "Webhook processed." 
            },
            400: {
              description: "Webhook signature verification failed.",
              content: {
                "text/plain": {
                  schema: { type: "string", example: "Webhook Error: Invalid signature" }
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
