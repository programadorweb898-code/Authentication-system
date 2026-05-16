# validation-agent Skills

## Technical Specialization
- **Input Validation:** Expert in `express-validator` and schema-based validation.
- **Sanitization:** Proficient in preventing XSS, SQL/NoSQL injection through input cleaning.
- **Type Safety:** Ensuring runtime data types match expected interfaces.

## Stack Knowledge
- **Express.js:** Deep understanding of middleware chaining and error propagation.
- **JavaScript/TypeScript:** Advanced regex and string manipulation for complex validation rules.
- **Libraries:** `express-validator`, `validator.js`.

## Patterns
- **Middleware Pattern:** Implementing validation as a discrete step in the request pipeline.
- **Schema Reuse:** Creating modular validation fragments that can be composed across different routes.
- **Fail-Fast:** Ensuring invalid requests are rejected as early as possible.

## Security Rules
- **Safe Defaults:** Deny by default; only allow explicitly validated fields.
- **PII Protection:** Ensuring sensitive data (like passwords) is handled correctly during validation logging.
- **Injection Mitigation:** Mandatory sanitization for all string inputs.

## Coding Standards
- **Declarative Code:** Preferring schema definitions over imperative validation logic.
- **Error Consistency:** Using a standard structure for validation error responses.

## Domain-Specific Best Practices
- **Custom Validators:** Implementing reusable custom validation logic for domain-specific formats (e.g., UUIDs, specific phone formats).
- **Body/Query/Params Isolation:** Validating each part of the request independently.

## Architectural Constraints
- Validators must remain stateless.
- No direct database calls from within validators; use services if cross-reference is needed, though discouraged.
