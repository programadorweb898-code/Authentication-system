# auth-agent Skills

## Technical Specialization
- **Authentication Protocols:** Expert in JWT (Json Web Tokens), OAuth2, and session-based auth.
- **Security Primitives:** Deep knowledge of `bcryptjs` for hashing and `crypto` for secure token generation.
- **Identity Management:** Managing user lifecycles, account locking, and multi-factor authentication (MFA) logic.

## Stack Knowledge
- **Node.js:** Advanced asynchronous patterns for handling high-concurrency auth requests.
- **Express.js:** Middleware design for authentication and role-based access control (RBAC).
- **Libraries:** `jsonwebtoken`, `passport`, `bcryptjs`.

## Patterns
- **Stateless Auth:** Implementing JWT-based authentication without server-side session state.
- **Refresh Token Rotation:** Implementing secure refresh token strategies to mitigate token theft.
- **Service-Oriented Logic:** Keeping all auth logic in specialized services, keeping controllers thin.

## Security Rules
- **Password Safety:** Never log passwords, even in debug mode.
- **Token Handling:** Always use `HttpOnly` and `Secure` flags if tokens are sent via cookies (though primarily API-focused).
- **Entropy:** Ensure high entropy for OTPs and recovery tokens.

## Coding Standards
- **Clean Architecture:** Strict adherence to the Service/Controller split defined in `SDD.md`.
- **Error Handling:** Use centralized error handling for auth failures (401 Unauthorized, 403 Forbidden).

## Domain-Specific Best Practices
- **OTP Expiration:** Always implement short-lived TTL for sensitive tokens.
- **Account Protection:** Implement exponential backoff or locking mechanisms for failed attempts (coordinated with `security-agent`).

## Architectural Constraints
- No direct database access; must use models defined/validated by `database-agent`.
- No inline validation; must use middlewares provided by `validation-agent`.
