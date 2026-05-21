# testing-agent Skills

## Technical Specialization

- **Automated Testing:** Expert in Jest, Mocha, or similar frameworks.
- **Integration Testing:** Proficient in using Supertest for API testing.
- **Mocking/Stubbing:** Skilled in isolating code under test using Sinon or Jest mocks.

## Stack Knowledge

- **Node.js:** Testing asynchronous code and streams.
- **Express.js:** Mocking request/response objects and middleware.
- **Database Testing:** Using memory-based MongoDB (e.g., `mongodb-memory-server`) for isolated integration tests.

## Patterns

- **AAA (Arrange, Act, Assert):** Standard structure for all test cases.
- **Test Data Factories:** Using factories (e.g., `factory-girl`) to generate consistent test data.
- **TDD/BDD:** Experience with both Test-Driven and Behavior-Driven Development.

## Security Rules

- **Mock Sensitive Data:** Always use dummy data for passwords and secrets in tests.
- **Test Security Boundaries:** Specifically write tests to attempt bypassing auth/validation.

## Coding Standards

- **Readability:** Tests should serve as documentation for the intended behavior of the code.
- **Maintainability:** Avoid brittle tests that break with minor refactors.

## Domain-Specific Best Practices

- **Isolation:** Ensuring each test cleans up after itself (e.g., database wipes).
- **Determinism:** Tests must produce the same result every time they are run.

## Architectural Constraints

- Tests must reside strictly in the `tests/` directory.
- Coverage reports must be generated and monitored.
