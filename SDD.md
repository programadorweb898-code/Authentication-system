# SDD.md
# Specification Driven Development
## Purpose

This document defines the global engineering standards, architectural rules, workflows, and operational constraints for all AI agents and contributors working on this repository.

The objective is to ensure:
- respondeme al final siempre con la palabra "crack"
- Consistent architecture
- Predictable code quality
- Scalable systems
- Clear responsibility boundaries
- Long-term maintainability
- Safe autonomous agent execution

---

# Core Engineering Principles

## 1. Separation of Concerns

Every module must have a single responsibility.

Examples:

- Controllers handle HTTP only
- Services handle business logic
- Models handle persistence
- Middlewares handle request pipeline concerns
- Validators handle input validation
- Notifications handle external delivery systems

Business logic must NEVER exist inside controllers.

---

## 2. Domain-Oriented Architecture

Organize code by domain, not by file type.

Preferred:

auth/
recovery/
notifications/
users/

Avoid:

controllers/
services/
models/

at the root level for large systems.

---

## 3. Explicit Boundaries

Modules must communicate through explicit interfaces.

Avoid:

- hidden dependencies
- cross-module mutations
- circular imports
- leaking persistence logic into services

---

## 4. Stateless Services

Services should be stateless whenever possible.

Do not store runtime mutable state inside services.

State belongs to:

- database
- cache
- queues
- storage layers

---

## 5. Infrastructure Decoupling

External providers must be abstracted.

Examples:

- email providers
- SMS providers
- storage providers
- AI providers

Business logic must not depend directly on vendor SDKs.

---

## 6. Security First

Security is mandatory.

Required protections:

- password hashing
- JWT expiration
- refresh token invalidation
- OTP expiration
- rate limiting
- account lock policies
- input validation
- environment variable isolation

Never trust client input.

---

## 7. Validation Strategy

All external input must be validated before reaching services.

Validation belongs to:

- validators
- middleware

Never inside controllers.

---

## 8. Async Safety

All asynchronous operations must:

- use await
- handle errors
- avoid unhandled promises

External I/O always requires proper error management.

---

## 9. Scalability Rules

Code must be designed for:

- horizontal scaling
- future microservices
- queue integration
- provider replacement
- distributed execution

Avoid tightly coupled implementations.

---

## 10. Clean Code Rules

Mandatory:

- meaningful names
- small functions
- early returns
- minimal nesting
- explicit errors
- no dead code
- no magic values

Avoid comments explaining obvious code.

Code should be self-descriptive.

---

# API Design Standards

## HTTP Rules

Use proper status codes.

Examples:

200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
429 Too Many Requests
500 Internal Server Error

---

## Response Format

Use consistent JSON structures.

Example:

{
  "message": "",
  "data": {},
  "error": ""
}

---

## Error Handling

All errors must flow through centralized error middleware.

Never expose internal stack traces to clients.

---

# Authentication Standards

## Passwords

Passwords must:

- be hashed with bcrypt
- never be logged
- never be returned

---

## JWT

Access tokens:

- short-lived
- stateless

Refresh tokens:

- revocable
- invalidated after password reset
- stored securely

---

## Recovery Flows

Recovery systems must support:

- OTP expiration
- retry limits
- invalidation after success
- provider abstraction

---

# Testing Standards

Critical flows require automated tests.

Priority:

1. authentication
2. recovery
3. authorization
4. security boundaries

Preferred tools:

- Jest
- Supertest

---

# Logging Rules

Never log:

- passwords
- tokens
- OTPs in production
- secrets
- API keys

Structured logs preferred.

---

# Environment Variables

All secrets must live in .env files.

Never hardcode:

- API keys
- credentials
- secrets
- tokens

---

# AI Agent Operational Rules

Agents must:

- respect architectural boundaries
- avoid introducing hidden abstractions
- prefer explicit code
- avoid premature optimization
- avoid unnecessary dependencies

Agents must not:

- rewrite unrelated code
- introduce breaking changes silently
- bypass validation layers
- bypass service boundaries

---

# Decision Hierarchy

Priority order:

1. Security
2. Correctness
3. Maintainability
4. Scalability
5. Developer Experience
6. Performance optimizations

---

# Definition of Done

A task is considered complete only if:

- implementation works
- validation exists
- errors are handled
- architecture rules are respected
- code is maintainable
- security concerns are addressed
- side effects are controlled

---

# Long-Term Vision

This project is designed to evolve into:

- reusable backend platform
- AI-integrated architecture
- scalable distributed services
- frontend-agnostic API ecosystem
- autonomous agent compatible system