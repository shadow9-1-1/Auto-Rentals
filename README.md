# Auto Rentals

Scalable microservices-based Auto Rentals platform for a Software Architecture course project.

## Tech Stack
- Backend: Express.js (Node.js)
- Frontend: Next.js + Tailwind CSS
- Database: MongoDB
- Caching: Redis
- Message Broker: Apache Kafka
- Payment Gateway: Stripe
- Notification Service: Mailtrap
- Authentication: JWT + Google OAuth2
- Containerization & Deployment: Docker + Docker Compose
- Monitoring: Prometheus + Grafana
- Centralized Logging: OpenSearch

## Architecture Overview
- Independent backend services, each running as a microservice/server
- Synchronous REST APIs and asynchronous Kafka events
- API Gateway for routing, authentication, rate limiting, and validation
- Clean architecture principles for service boundaries and domain isolation

## Repository Structure
```
services/          # Backend microservices
frontend/          # Next.js application
infrastructure/    # Docker, Compose, monitoring, logging, and deployment config
docs/              # Architecture, ADRs, and course documentation
```

## Microservices (Planned)
- API Gateway
- Auth Service
- Vehicle Service
- Booking Service
- Payment Service
- Notification Service
- Review Service
- Admin Service

## Core Features (Planned)
- User authentication & RBAC
- Vehicle listing CRUD
- Search & filtering
- Booking system
- Stripe payments
- Email notifications
- Reviews & ratings
- Admin dashboard
- Real-time availability updates

## Non-Functional Requirements
- Scalability
- Resilience (retries + circuit breakers)
- Security
- Observability
- Containerized deployment
- Clean architecture principles

