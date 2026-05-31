# Auth Domain Analysis and Improvements

This document outlines the current state of the authentication domain and proposes improvements to achieve a more complete and robust authentication system, aligned with the responsibilities of the `auth-agent`.

## Current Strengths

*   **Authentication (Login/Register):** Basic user registration and login flows are implemented.
*   **JWT & Refresh Tokens:** Access tokens and refresh tokens are generated, managed (stored, refreshed, rotated), and validated. Refresh token rotation is a good security practice.
*   **Password Hashing:** Uses `bcryptjs` for secure password storage.
*   **OTP for Verification:** One-Time Passwords are used for initial account verification via email or SMS.
*   **Account Lock System:** Basic account lockout is implemented after multiple failed login attempts.
*   **Logout:** Server-side logout by invalidating refresh tokens.
*   **Password Reset Flow:** A complete password reset flow is implemented in `domains/recovery`.

## Identified Gaps and Proposed Improvements

### 1. Granular Authorization (Role-Based Access Control - RBAC)

*   **Current State:** Authentication middleware primarily verifies user identity; it does not enforce granular permissions based on roles or attributes.
*   **Missing:** A structured mechanism to define user roles (e.g., `admin`, `user`, `editor`) and associate specific permissions with these roles. Middleware to check if an authenticated user has the necessary permissions to access a particular route or perform an action.
*   **Proposal:**
    *   Modify the `User` model to include a `role` field (e.g., `String` with default 'user', or an array of roles).
    *   Create a new middleware (`authorizeMiddleware`) that takes required roles/permissions as arguments and grants/denies access.

### 2. Multi-Factor Authentication (MFA / 2FA) - (Lower Priority for now)

*   **Current State:** OTPs are used for initial account verification only.
*   **Missing:** An optional, user-configurable 2FA system where a second factor (e.g., OTP via app/SMS) is required *after* successful password login.
*   **Proposal:**
    *   Add fields to the `User` model to track 2FA status (e.g., `is2FAEnabled`, `twoFAType`, `twoFASecret`).
    *   Implement endpoints for enabling/disabling 2FA, generating/verifying 2FA codes during login.

### 3. JWT Access Token Revocation / Blacklisting

*   **Current State:** Access tokens expire naturally (15m). Logout only revokes refresh tokens. Active access tokens cannot be immediately invalidated by the server.
*   **Missing:** A mechanism to forcefully invalidate active access tokens before their natural expiry (ee.g., in case of a security breach, user ban, or password change).
*   **Proposal:**
    *   Consider implementing a Redis-backed blacklist for invalidated access tokens. This would require checking each incoming access token against the blacklist. This adds complexity and latency but provides immediate revocation.

### 4. Enhanced Security Logging and Alerting

*   **Current State:** Basic console error logging.
*   **Missing:** More comprehensive logging of security-sensitive events (failed logins, password changes, account lockouts, token refreshes, etc.) with proper alert mechanisms.
*   **Proposal:**
    *   Integrate with a robust logging solution (e.g., Winston, Pino) configured to send alerts for suspicious activities.

## Planned Features

### Social Login (Google OAuth)

*   **Goal:** Allow users to authenticate using their existing Google accounts.
*   **Implementation Steps:**
    1.  **Extend User Model:** Add `googleId` field to `src/domains/users/models/user.models.js`.
    2.  **Environment Variables:** Configure Google OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
    3.  **Install Passport.js & Strategy:** Integrate `passport` and `passport-google-oauth20`.
    4.  **Passport Configuration:** Set up Google Strategy in `src/config/passport.js`.
    5.  **Auth Routes:** Add routes for Google login initiation and callback in `src/domains/auth/routes/auth.routes.js`.
    6.  **Auth Controllers:** Handle OAuth flow in `src/domains/auth/controllers/auth.controllers.js`.
    7.  **Auth Services:** Implement user handling (find/create) from Google profile in `src/domains/auth/services/auth.services.js`.

## Next Steps (Prioritized)

1.  **Implement Social Login (Google OAuth):** As per user request.
2.  **Implement Granular Authorization (RBAC):** Essential for controlling access to resources and defining different user roles.
3.  **Evaluate JWT Access Token Revocation:** Determine if the added complexity of a blacklist is necessary based on application security requirements.
