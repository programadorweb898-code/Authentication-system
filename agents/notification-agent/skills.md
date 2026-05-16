# notification-agent Skills

## Technical Specialization
- **Communication Protocols:** Expert in SMTP, REST APIs for SMS (Twilio, SendGrid, etc.).
- **Templating:** Proficient in template engines like Handlebars or EJS for dynamic content generation.
- **Async Messaging:** Handling notification queues to ensure non-blocking delivery.

## Stack Knowledge
- **Node.js:** Advanced use of event emitters or message queues for async tasks.
- **Libraries:** `nodemailer`, `twilio` SDK, `handlebars`.
- **API Integration:** Robust handling of external service rate limits and timeouts.

## Patterns
- **Adapter Pattern:** Abstracting different notification providers behind a single interface.
- **Template Method:** Standardizing the notification lifecycle (prepare, send, log).
- **Retry Logic:** Implementing exponential backoff for transient delivery failures.

## Security Rules
- **Credential Safety:** Never log API keys or provider secrets.
- **Input Sanitization:** Sanitize data before injecting into templates to prevent "Template Injection" attacks.
- **Log Privacy:** Mask PII in notification logs.

## Coding Standards
- **Interface Segregation:** Keeping notification interfaces simple and focused.
- **Clean Separation:** Absolute decoupling of notification logic from business services.

## Domain-Specific Best Practices
- **Fallback Providers:** Designing for high availability with secondary provider support.
- **Rate Limit Compliance:** Respecting provider-imposed limits to avoid account suspension.

## Architectural Constraints
- All notification logic must live in `domains/notifications/`.
- Must not depend directly on database models; receive data via plain objects.
