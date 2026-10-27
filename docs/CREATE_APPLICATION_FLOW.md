# LaunchPad OS — Create Application Workflow Architecture & Resolution

**Document Version:** 1.0.0  
**Domain:** Applications Service & Frontend Wizard Engine  
**Status:** Stabilized & Verified  

---

## 1. Request Lifecycle Overview

The Create Application workflow is the primary mechanism for provisioning multi-tenant, modular enterprise applications on LaunchPad OS.

```
┌────────────────────────────────────────────────────────┐
│ 1. Frontend Form Wizard (Step 1 - 6)                  │
│    (Name, Industry, Mode, Template, Modules, Branding) │
└──────────────────────────┬─────────────────────────────┘
                           │ User clicks "Create Application"
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. Frontend Validation & Duplicate Submission Guard    │
│    - Validates name.trim() is non-empty                │
│    - Validates selectedModuleIds.length > 0            │
│    - Sets creating=true, disables submit button        │
└──────────────────────────┬─────────────────────────────┘
                           │ ApiClient.post('/applications', payload)
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. NestJS ApplicationsController (@Post)               │
│    - JwtAuthGuard: Extracts & verifies Bearer JWT      │
│    - RolesGuard: Enforces SUPER_ADMIN/ORG_ADMIN/DEV    │
│    - ValidationPipe: Validates CreateApplicationDto    │
│      (Enums normalized via @Transform to uppercase)    │
└──────────────────────────┬─────────────────────────────┘
                           │ ApplicationsService.create(dto, currentUser)
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. ApplicationsService Business Logic                  │
│    - Tenant Authorization: Enforces organizationId     │
│    - Module Deduplication: Filters duplicate codes     │
│    - Dependency Graph Validation: Asserts requirements │
└──────────────────────────┬─────────────────────────────┘
                           │ prisma.$transaction(...)
                           ▼
┌────────────────────────────────────────────────────────┐
│ 5. PostgreSQL Transactional Persistence                │
│    - tx.application.create with nested modules create  │
│    - AuditLogsService.logAction: Records audit event   │
└──────────────────────────┬─────────────────────────────┘
                           │ Formatted Application Response (201 Created)
                           ▼
┌────────────────────────────────────────────────────────┐
│ 6. Frontend Response Handling                          │
│    - On Success: setCreating(false), navigate to       │
│      /applications/${created.id}                       │
│    - On Failure: setCreating(false), setCreationError, │
│      display actionable error message & retry option   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Root Cause Analysis of Previous Failures

### Issue 1: Indefinite Loading Spinner on "Create Application"
- **Symptom:** Clicking "Create Application" on Step 6 switched to Step 7 and left the spinner animating indefinitely.
- **Root Cause:** In `src/app/(dashboard)/applications/create/page.tsx`, `triggerCreation` lacked error boundary handling and retry states. Whenever `applicationService.createApplication()` threw an error (such as a 401 Unauthorized due to an expired/missing JWT, or a 400 Bad Request due to DTO validation failures), the promise rejection was unhandled. `setCreating(false)` was never executed, trapping the UI in the loading state.
- **Fix:** 
  1. Wrapped the entire creation lifecycle in a comprehensive `try / catch / finally` block.
  2. Maintained an explicit `creationError` state rendered with an alert and "Try Again" / "Back to Review" controls.
  3. Added an in-flight check (`if (creating) return;`) and disabled the submit button with a spinner to prevent duplicate submissions.

### Issue 2: Silent Masking of Database Failures with Client-Side Fallback
- **Symptom:** Applications appeared to succeed in local memory but were never persisted to PostgreSQL.
- **Root Cause:** In `src/services/applicationService.ts`, the catch block caught backend API failures and silently constructed an in-memory `fallbackApp`, masking the underlying HTTP 400/401/500 errors.
- **Fix:** Removed the silent fallback from `createApplication()`. The service now re-throws API errors so that true server failures are visibly surfaced to the user.

### Issue 3: DTO Validation & Enum Case Incompatibility
- **Symptom:** Backend returned HTTP 400 Bad Request on submission with `{ message: ["mode must be one of the following values: STANDALONE, INTEGRATION_HUB"] }`.
- **Root Cause:** Frontend sent lowercase mode values (`'standalone'`), but `AppMode` enum in Prisma requires uppercase (`STANDALONE`). Furthermore, `modules` was typed as `string[]` while the frontend passed rich module configuration objects.
- **Fix:** 
  1. Added `@Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value)` to both `mode` and `status` in `CreateApplicationDto` and `UpdateApplicationDto`.
  2. Broadened `modules` in `CreateApplicationDto` to accept both string arrays and structured `AppModuleItem` objects.

### Issue 4: Missing Dependency Validation & Duplicate Prevention
- **Symptom:** Selecting modules with unfulfilled dependencies or duplicate codes caused corrupted application configurations.
- **Fix:** 
  1. Implemented deduplication by module `code`, `name`, and `id` in `ApplicationsService.create()`.
  2. Implemented dependency verification: loops through each module's `dependencies` and confirms all required dependent modules are included. If any dependency is absent, throws `BadRequestException`.

### Issue 5: Post-Creation Navigation
- **Symptom:** Users remained stranded on the wizard page after submission.
- **Fix:** Upon successful persistence, the wizard immediately halts loading and triggers `router.push('/applications/' + created.id)`, routing the authenticated user directly to their application's management interface.

---

## 3. Verified Validation Matrix

| Test Case | Scenario | Expected Outcome | Verified Result |
| :--- | :--- | :--- | :--- |
| **Empty App Name** | User submits with name `'   '` | 400 Bad Request: "Application name is required and cannot be empty." | **PASS** (Unit test verified) |
| **Missing Org ID** | Request has empty `organizationId` | 400 Bad Request: "Authenticated user must belong to an organization." | **PASS** (Unit test verified) |
| **Missing Module Dependency** | Module requires 'Visitor Registration', but only 'Analytics Reports' selected | 400 Bad Request: "Module 'Analytics Reports' requires dependency 'Visitor Registration'..." | **PASS** (Unit test verified) |
| **Duplicate Modules** | Duplicate module names/codes passed in payload | Automatically deduplicated to unique modules before persistence | **PASS** (Unit test verified) |
| **Transactional Create** | Application + modules created | Created atomically via `prisma.$transaction` and audit logged | **PASS** (Unit test verified) |
| **Duplicate Submission** | Double-clicking submit button | Guarded by `creating` boolean check and disabled button | **PASS** (Frontend build verified) |
