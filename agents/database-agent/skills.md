# database-agent Skills

## Technical Specialization

- **NoSQL Expert:** Deep understanding of MongoDB document modeling and aggregation pipelines.
- **ORM/ODM:** Expert-level knowledge of `Mongoose`.
- **Query Optimization:** Proficient in `explain()` analysis and index optimization.

## Stack Knowledge

- **MongoDB:** Advanced schema design, sharding, and replication concepts.
- **Node.js:** Efficient use of streams and cursor-based processing for large datasets.
- **Mongoose:** Middlewares (hooks), virtuals, and population strategies.

## Patterns

- **Data Modeling:** Balancing normalization vs. embedding based on access patterns.
- **Repository Pattern:** Abstracting data access to keep services clean (as per `SDD.md`).
- **Transaction Management:** Implementing multi-document transactions where consistency is critical.

## Security Rules

- **Injection Prevention:** Ensuring all queries use Mongoose sanitization to prevent NoSQL injection.
- **Data Encryption:** Implementing at-rest encryption for sensitive fields (e.g., PII).
- **Access Control:** Ensuring least-privilege access at the database user level.

## Coding Standards

- **Schema Clarity:** Use descriptive field names and explicit types.
- **Consistency:** Maintain uniform naming conventions for collections and fields across all domains.

## Domain-Specific Best Practices

- **Indexing:** Always index fields used in `find`, `sort`, and `unique` constraints.
- **Lean Queries:** Use `.lean()` for read-only operations to improve performance.

## Architectural Constraints

- Models must reside strictly within `domains/*/models/`.
- No business logic in Mongoose hooks; hooks are for data integrity only.
