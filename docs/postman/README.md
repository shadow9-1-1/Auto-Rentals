# Postman Testing Guide

This guide describes how to test the Auto Rentals API using Postman, including example requests and test scripts.

## Setup
1) Create a Postman environment named `auto-rentals`.
2) Add these variables:

- `baseUrl` = http://localhost:4000
- `authToken` = (leave empty for now)
- `vehicleId` = (leave empty for now)
- `bookingId` = (leave empty for now)
- `paymentId` = (leave empty for now)
- `reviewId` = (leave empty for now)

## Common Test Script (use in Tests tab)
This is a generic script you can reuse for most endpoints:

```
pm.test("status is 2xx", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201, 204]);
});

pm.test("response time < 1000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(1000);
});
```

## Authentication

### Register
- Method: POST
- URL: `{{baseUrl}}/auth/register`
- Body (JSON):
```
{
  "email": "demo.user@example.com",
  "password": "TestPassword123!"
}
```
- Tests:
```
pm.test("registered", function () {
  pm.expect(pm.response.code).to.equal(201);
});

var json = pm.response.json();
pm.environment.set("authToken", json.token);
```

### Login
- Method: POST
- URL: `{{baseUrl}}/auth/login`
- Body (JSON):
```
{
  "email": "demo.user@example.com",
  "password": "TestPassword123!"
}
```
- Tests:
```
pm.test("logged in", function () {
  pm.expect(pm.response.code).to.equal(200);
});

var json = pm.response.json();
pm.environment.set("authToken", json.token);
```

## Vehicles

### Create Vehicle
- Method: POST
- URL: `{{baseUrl}}/vehicles`
- Headers: `Authorization: Bearer {{authToken}}`
- Body (JSON):
```
{
  "ownerId": "user-1",
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "pricing": {
    "perDay": 55,
    "currency": "USD"
  },
  "location": {
    "city": "New York",
    "country": "US"
  }
}
```
- Tests:
```
pm.test("vehicle created", function () {
  pm.expect(pm.response.code).to.equal(201);
});

var json = pm.response.json();
pm.environment.set("vehicleId", json.item._id);
```

### List Vehicles
- Method: GET
- URL: `{{baseUrl}}/vehicles`
- Headers: `Authorization: Bearer {{authToken}}`
- Tests:
```
pm.test("vehicles listed", function () {
  pm.expect(pm.response.code).to.equal(200);
});
```

## Bookings

### Create Booking
- Method: POST
- URL: `{{baseUrl}}/bookings`
- Headers: `Authorization: Bearer {{authToken}}`
- Body (JSON):
```
{
  "renter": {
    "userId": "user-1",
    "fullName": "Demo User",
    "email": "demo.user@example.com"
  },
  "vehicle": {
    "vehicleId": "{{vehicleId}}",
    "make": "Toyota",
    "model": "Camry",
    "year": 2022
  },
  "startDate": "2026-06-01T10:00:00.000Z",
  "endDate": "2026-06-05T10:00:00.000Z",
  "pricing": {
    "totalAmount": 220,
    "currency": "USD"
  }
}
```
- Tests:
```
pm.test("booking created", function () {
  pm.expect(pm.response.code).to.equal(201);
});

var json = pm.response.json();
pm.environment.set("bookingId", json.item._id);
```

### List Bookings
- Method: GET
- URL: `{{baseUrl}}/bookings`
- Headers: `Authorization: Bearer {{authToken}}`

## Payments

### Create Payment Intent
- Method: POST
- URL: `{{baseUrl}}/payments/intent`
- Headers: `Authorization: Bearer {{authToken}}`
- Body (JSON):
```
{
  "bookingId": "{{bookingId}}",
  "userId": "user-1",
  "amount": 220,
  "currency": "USD"
}
```
- Tests:
```
pm.test("payment intent created", function () {
  pm.expect(pm.response.code).to.equal(201);
});

var json = pm.response.json();
pm.environment.set("paymentId", json.paymentId);
```

## Notifications

### Send Test Email
- Method: POST
- URL: `{{baseUrl}}/notifications/test`
- Headers: `Authorization: Bearer {{authToken}}`
- Body (JSON):
```
{
  "to": "demo.user@example.com",
  "subject": "Booking Confirmed",
  "text": "Your booking has been confirmed."
}
```
- Tests:
```
pm.test("notification sent", function () {
  pm.expect(pm.response.code).to.equal(200);
});
```

## Reviews

### Create Review
- Method: POST
- URL: `{{baseUrl}}/reviews`
- Headers: `Authorization: Bearer {{authToken}}`
- Body (JSON):
```
{
  "reviewer": {
    "userId": "user-1",
    "displayName": "Demo User"
  },
  "vehicleId": "{{vehicleId}}",
  "bookingId": "{{bookingId}}",
  "rating": 5,
  "title": "Great ride",
  "comment": "Clean car and smooth pickup."
}
```
- Tests:
```
pm.test("review created", function () {
  pm.expect(pm.response.code).to.equal(201);
});

var json = pm.response.json();
pm.environment.set("reviewId", json.item._id);
```

### List Reviews
- Method: GET
- URL: `{{baseUrl}}/reviews`
- Headers: `Authorization: Bearer {{authToken}}`

## Admin

### Admin Overview
- Method: GET
- URL: `{{baseUrl}}/admin/overview`
- Headers: `Authorization: Bearer {{authToken}}`
- Tests:
```
pm.test("admin overview", function () {
  pm.expect(pm.response.code).to.equal(200);
});
```

Note: The gateway requires a JWT for all routes except `/health` and `/auth`. Ensure `authToken` is set.
