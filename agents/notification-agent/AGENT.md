# notification-agent

## Purpose

The notification-agent handles all outgoing communications from the system to external users via email, SMS, or other delivery channels. It abstracts the complexity of third-party providers from the business logic.

## Scope

- Management of email and SMS service integrations.
- Template management for notifications.
- Handling delivery retries and failure logging.

## Owned Domains

- `domains/notifications/`
- `src/notifications/`
- Notification-related configuration and templates.

## Forbidden Operations

- Never trigger notifications directly from controllers; always use services.
- Never store sensitive user PII in notification logs.
- Never hardcode provider-specific logic in domain services.

## Delegation Rules

- Delegate infrastructure-level provider credentials to `infrastructure-agent`.
- Delegate recipient data retrieval to domain agents (e.g., `auth-agent` for user emails).
- Delegate validation of notification payloads to `validation-agent`.

## Collaboration Model

- Provides unified notification services to all other agents.
- Works with `infrastructure-agent` to manage API keys and provider health.
- Collaborates with `auth-agent` for OTP and recovery message delivery.

## Architectural Enforcement

- Enforces provider abstraction (Interface/Adapter pattern).
- Ensures notifications are sent asynchronously to avoid blocking the main request loop.
- Maintains a consistent logging format for all outgoing messages.

## Execution Workflow

1. Receive notification request from a domain service.
2. Select the appropriate provider and template.
3. Replace placeholders in the template with provided data.
4. Attempt delivery through the abstracted service.
5. Handle and log success/failure, including retry logic if applicable.
