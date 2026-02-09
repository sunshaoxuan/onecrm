# OneCRM Backend Requirement List

This document tracks all backend requirements identified during the frontend functional framework implementation.

## 1. Authentication & User Profile
- **GET /api/user/me**: Returns current logged-in user information.
- **POST /api/auth/login**: Standard login endpoint.

## 2. Customer Management
- **GET /api/customers**: List all customers with basic info (id, code, name).
- **GET /api/customers/{id}**: Get detailed information for a specific customer.
- **Search Query Support**: `GET /api/customers?q=keyword` for filtering.

## 3. Storage Policy
- All customer data should be stored in a Schema-less NoSQL format (JSON).
- Support for recursive organization nodes.
