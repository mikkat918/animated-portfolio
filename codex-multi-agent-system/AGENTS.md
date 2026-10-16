# Codex Multi-Agent Development Rules

## 1. Inspect Before Editing
- Inspect the repository, Git status, source files, dependencies, and tests before changing code.
- Understand the existing framework, architecture, naming conventions, and entry points.
- Preserve existing functionality and unrelated user changes.
- Never overwrite or delete code without understanding its purpose.

## 2. Planning and Coordination
- Convert the user's request into requirements and acceptance criteria.
- Create a practical implementation plan and track progress.
- Delegate independent tasks to specialized agents when useful.
- Give every agent a clear scope and verification criteria.
- Avoid assigning multiple agents conflicting write access to the same files.
- Integrate agent results and resolve conflicts before finalizing.

## 3. Frontend
- Follow the existing framework and architecture.
- Build reusable components and consistent design tokens.
- Support mobile, tablet, and desktop layouts.
- Implement loading, empty, success, and error states.
- Ensure every visible interactive control has its intended behavior.
- Avoid fake functionality, dead buttons, and unnecessary duplicate code.

## 4. Backend
- Validate untrusted input on the server.
- Implement authentication, authorization, and resource ownership checks.
- Use consistent API responses and appropriate HTTP status codes.
- Handle failures without exposing secrets or internal details.
- Never claim a backend feature works when only a frontend mock exists.

## 5. Database and Data Mapping
- Verify schemas, relationships, constraints, and migrations.
- Map frontend models, API payloads, backend types, and database columns explicitly.
- Check IDs, nullable fields, enums, timestamps, numeric values, and nested objects.
- Protect existing data and review destructive migrations before execution.
- Verify database permissions and row-level security where applicable.

## 6. API Integration
- Verify endpoint URLs, HTTP methods, headers, authentication, request payloads, and response schemas.
- Use documented APIs and SDK methods; never invent endpoints.
- Centralize API error handling where appropriate.
- Handle network failures, timeouts, unauthorized responses, and malformed data.
- Test integrations against real services when access is available.
- Report integrations that remain unverified.

## 7. Security
- Never hardcode secrets, passwords, or private API keys.
- Keep secret-bearing environment files out of version control.
- Enforce permissions on the server, not just in the frontend.
- Check for injection, insecure file uploads, broken access control, and sensitive data exposure.
- Request approval before destructive production operations, paid services, or external deployment.

## 8. Code Quality
- Follow existing formatting, typing, linting, and naming conventions.
- Prefer readable solutions over unnecessary abstractions.
- Avoid unrelated refactors and unnecessary dependencies.
- Update documentation when setup or behavior changes.

## 9. Testing and Bug Fixing
- Inspect available scripts before running tests.
- Add or update tests appropriate to the project.
- Reproduce bugs and fix root causes where practical.
- Run relevant tests after changes.
- Run type checks, linting, and production builds when available.
- Never claim a test passed unless it actually completed successfully.

## 10. Independent Code Review
- Review the actual diff for correctness, security, maintainability, and regressions.
- Prioritize real bugs over subjective preferences.
- Fix confirmed findings and rerun relevant checks.
- A successful build alone does not prove correctness.

## 11. Git Safety
- Inspect Git status before editing.
- Never discard, reset, or overwrite unrelated user changes.
- Do not commit, push, publish, or deploy without authorization.

## 12. Definition of Done
- Check all requirements and acceptance criteria.
- Verify frontend, backend, database, and API work as applicable.
- Run available tests, type checks, linting, and builds.
- Resolve critical review findings or document blockers.
- Document setup requirements and remaining limitations.

## 13. Final Report
Always report:
1. What was implemented.
2. Important files changed.
3. API and database integration status.
4. Tests and build commands actually run and their results.
5. Known issues and unverified behavior.
6. Required user actions.

Never claim a feature is complete, secure, deployed, or tested without evidence.
