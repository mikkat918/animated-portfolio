# Universal Project Development Workflow

## Objective
Complete the user's requested project by inspecting the current repository,
planning the implementation, making focused changes, integrating all layers,
testing the result, and performing an independent review.

## Phase 1 — Inspect
- Read AGENTS.md and relevant project documentation.
- Inspect Git status before changing files.
- Identify the framework, application entry points, dependencies, frontend,
  backend, database, authentication, APIs, tests, and deployment configuration.
- Identify existing features, incomplete work, errors, and architectural constraints.
- Never assume that a mock service is a working backend.

## Phase 2 — Plan
- Convert the request into requirements and acceptance criteria.
- Identify dependencies and risky changes.
- Make a phased implementation plan.
- Delegate independent analysis to available specialist agents.
- Do not let multiple agents make conflicting changes to the same files.

## Phase 3 — Implement
- Reuse the project's existing architecture unless a justified change is needed.
- Build reusable, maintainable, responsive UI components.
- Implement backend behavior and validation when required.
- Connect real API and database services when credentials and access are available.
- Ensure forms, buttons, navigation, loading states, and error states work.
- Preserve existing user changes and unrelated functionality.

## Phase 4 — Verify API and Data Mapping
- Trace UI inputs to frontend models, API requests, backend handlers,
  database schemas, and returned responses.
- Verify routes, HTTP methods, headers, authentication, payloads, and response types.
- Check IDs, nullable values, enums, timestamps, relationships, and error responses.
- Verify authorization and resource ownership on the server.
- Never invent API endpoints, database fields, credentials, or test results.
- Clearly identify external integrations that could not be verified.

## Phase 5 — Security
- Do not hardcode secrets or expose environment variable values.
- Verify authentication, authorization, server-side validation, and data access policies.
- Review file uploads, sensitive data exposure, and dangerous database operations.
- Request approval before destructive operations, paid services, or deployment.

## Phase 6 — Test and Fix
- Inspect package scripts and existing test instructions.
- Run relevant tests, type checks, linting, and production builds.
- Reproduce bugs and fix confirmed root causes.
- Add regression tests for important fixes.
- Recheck affected API and database mappings.
- Never report a command as successful unless it actually passed.

## Phase 7 — Independent Review
- Ask the available read-only code reviewer to inspect the actual changes.
- Ask the security reviewer to inspect relevant security-sensitive changes.
- Ask the integration verifier to trace critical user journeys.
- Fix confirmed findings and rerun affected checks.
- Avoid unnecessary rewrites and unrelated changes.

## Phase 8 — Final Report
Report:
1. Features implemented.
2. Important files created or modified.
3. API and database integration status.
4. Tests, type checks, linting, and builds actually run.
5. Confirmed issues fixed.
6. Remaining issues and unverified integrations.
7. Environment variables and manual setup still required.
8. Acceptance criteria that remain incomplete.

## Rules
- Use available specialist agents when they materially improve the result.
- If an agent is unavailable, continue with the available tools and report the limitation.
- Do not claim that all agents ran unless they actually did.
- Do not claim complete functionality merely because the frontend renders.
- Do not commit, push, publish, or deploy without user authorization.
- Ask a focused question when a missing decision blocks safe implementation.
