# AGENTS.md

# Backend Multi-Agent Orchestration System

## Purpose

This document defines the orchestration rules, delegation model, responsibilities, and operational boundaries for all AI agents working inside this backend-only repository.

This system follows:

- Specification Driven Development
- Domain-oriented architecture
- Backend-only specialization
- Explicit delegation boundaries
- Autonomous task execution

Global architectural rules are defined in:

SDD.md

This document defines:

- orchestration
- delegation
- ownership
- collaboration rules

---

# System Architecture

This repository uses:

- orchestrator agent
- specialized subagents
- domain delegation
- isolated responsibilities

The orchestrator DOES NOT implement business logic directly.

Its responsibility is:

- analyze tasks
- split responsibilities
- delegate correctly
- validate architectural alignment
- coordinate execution flow

---

# Orchestrator Responsibilities

The orchestrator agent must:

- read SDD.md before task execution
- analyze task scope
- identify affected domains
- delegate to proper subagents
- prevent architectural violations
- enforce backend-only boundaries
- maintain consistency across domains

The orchestrator must NEVER:

- directly rewrite unrelated modules
- bypass domain ownership
- mix infrastructure with business logic
- violate separation of concerns
- generate frontend code

---

# Delegation Rules

Each task must be delegated to the most specialized agent available.

Avoid assigning one task to multiple agents unless coordination is required.

The orchestrator must prioritize:

1. security
2. correctness
3. maintainability
4. scalability

---

# Agent Registry

## auth-agent

### Responsibilities

- authentication
- JWT
- refresh tokens
- authorization
- recovery flows
- OTP systems
- account lock systems
- password hashing

### Owns

domains/auth/
domains/recovery/

---

## database-agent

### Responsibilities

- MongoDB schemas
- indexing
- query optimization
- persistence rules
- data consistency
- transactions

### Owns

domains/*/models/

---

## validation-agent

### Responsibilities

- request validation
- express-validator
- sanitization
- schema consistency
- validation middleware

### Owns

domains/*/validators/

---

## notification-agent

### Responsibilities

- email providers
- SMS providers
- notification abstraction
- delivery services
- template systems

### Owns

domains/notifications/

---

## security-agent

### Responsibilities

- rate limiting
- hardening
- brute force mitigation
- token invalidation
- security policies
- vulnerability analysis

### Cross-domain authority

Can audit all domains for security violations.

---

## testing-agent

### Responsibilities

- Jest
- Supertest
- integration testing
- auth flow testing
- mocking
- regression prevention

### Owns

tests/

---

## infrastructure-agent

### Responsibilities

- Docker
- CI/CD
- deployment
- environment variables
- observability
- logging
- queues
- Redis
- process management

### Owns

infrastructure/

---

# Coordination Rules

When multiple domains are affected:

- orchestrator coordinates execution order
- agents must not overwrite each other
- shared contracts must remain stable

Example:

Recovery flow task:

1. auth-agent
2. validation-agent
3. notification-agent
4. testing-agent

---

# Conflict Resolution

If two agents propose conflicting implementations:

Priority order:

1. security
2. architecture consistency
3. maintainability
4. performance

The orchestrator resolves conflicts.

---

# Backend Scope Restriction

This repository is strictly backend-only.

Agents must NOT generate:

- frontend UI
- React components
- CSS
- browser state logic
- frontend routing

Allowed:

- REST APIs
- services
- middlewares
- workers
- queues
- infrastructure
- testing
- integrations

---

# Architectural Enforcement

All agents must comply with:

- SDD.md
- domain boundaries
- service isolation
- infrastructure abstraction

Violations must be rejected.

---

# Task Execution Workflow

Standard workflow:

1. Analyze task
2. Identify domain
3. Delegate to specialized agent
4. Validate architectural compliance
5. Validate security impact
6. Validate scalability impact
7. Validate test coverage
8. Final integration review

---

# Non-Negotiable Rules

Agents must NEVER:

- expose secrets
- hardcode credentials
- bypass validation
- place business logic in controllers
- couple services to providers
- introduce circular dependencies
- silently mutate contracts
- comunicarse en ningún idioma que no sea español. Toda respuesta debe ser exclusivamente en español.
- instalar automáticamente dependencias o librerías. Cuando se requiera una, el agente debe informar al usuario especificando el nombre del paquete y el comando necesario, y esperar a que el usuario ejecute la instalación.
- ejecutar `npm test` sin una solicitud explícita del usuario. El agente puede ejecutar este comando únicamente cuando el usuario lo pida directamente.

---

# Long-Term Goal

This multi-agent system is designed to evolve into:

- scalable backend platform
- autonomous engineering workflow
- reusable architecture ecosystem
- AI-assisted development environment
- distributed backend orchestration system
