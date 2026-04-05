# Data Handling Policy

This document describes how ComputeLearn collects, stores, accesses, retains, and deletes learner data. It supports FERPA compliance for institutional deployments.

## 1. Data Collected

| Data Category        | What Is Stored                                          | Source                  |
| -------------------- | ------------------------------------------------------- | ----------------------- |
| Identity             | Name, email, profile image                              | Google OAuth            |
| Authentication       | OAuth tokens, session tokens                            | Auth.js / NextAuth      |
| Enrollment           | Course ID, role (student/instructor/TA)                 | Instructor action       |
| Lesson Progress      | Current step, completion status, notes, reflection text | Student interaction     |
| Submissions          | Submission content, status, feedback, grades            | Student + instructor    |
| Lab Attempts         | Template ID, attempt number, files (JSON), pass/fail    | Student interaction     |
| Competency Snapshots | Domain, level (numeric)                                 | System computation      |
| LTI Grade Syncs      | Lesson ID, grade, sync status                           | LTI integration         |
| Audit Logs           | Action, resource, IP, timestamp, details                | System-generated        |
| Local Cache          | Progress mirror in localStorage (browser only)          | Client-side persistence |

## 2. Data Storage

- **Primary store:** PostgreSQL database (see `prisma/schema.prisma` for the full schema).
- **Client cache:** Browser `localStorage` holds a progress mirror for offline resilience. This data never leaves the browser unless synced back to the server.
- **File storage:** No user-uploaded files are stored outside the database `files` JSON column in `LabAttempt`.
- **Backups:** Database backups are managed at the infrastructure level. Backup retention should match the data retention policy below.

## 3. Access Controls

| Role       | Access Scope                                                              |
| ---------- | ------------------------------------------------------------------------- |
| Student    | Own progress, own submissions, own lab attempts, own competency snapshots |
| Instructor | All enrolled student data within their courses, gradebook export, reviews |
| TA         | Same as Instructor                                                        |
| Admin      | All data (requires direct database access; no admin UI in V1)             |

Access is enforced at the API route level. Every authenticated request checks `session.user.id` and `session.user.role` before returning data. See `lib/auth-helpers.ts` for the `requireAuth()` and `requireRole()` utilities.

## 4. Data Retention

| State    | Retention Period                                    |
| -------- | --------------------------------------------------- |
| Active   | Indefinite while the account is active              |
| Archived | 7 years after the user's last authenticated session |
| Deleted  | Removed within 30 days of a deletion request        |

Audit logs are retained for 7 years regardless of account state to satisfy compliance record-keeping.

## 5. Data Deletion Procedure

### Student-initiated deletion

A student can request full account deletion via `DELETE /api/account/delete`. This will:

1. Delete all `Progress` records for the user.
2. Delete all `Submission` records for the user.
3. Delete all `LabAttempt` records for the user.
4. Delete all `CompetencySnapshot` records for the user.
5. Delete all `Enrollment` records for the user.
6. Delete all `LtiGradeSync` records for the user.
7. Delete the `User` record (cascades to `Account` and `Session`).
8. Log an `ACCOUNT_DELETE` audit event (the audit log retains the user ID but no PII).

The student should also clear their browser `localStorage` to remove the client-side cache.

### Instructor-initiated archive

Instructors can remove students from enrollments, which restricts future data access but does not delete historical records. Full deletion requires the student to initiate or an admin to process.

### Admin deletion

An administrator with database access can execute the same deletion sequence manually. All deletions should be logged.

## 6. Third-Party Data Sharing

| Third Party    | Data Shared              | Purpose               |
| -------------- | ------------------------ | --------------------- |
| Google (OAuth) | Email for authentication | Identity verification |
| Sentry         | Error traces, no PII     | Error monitoring      |

**No learner data is sold or shared with third parties for marketing or advertising.**

PII is excluded from Sentry via `sendDefaultPii: false` in the Sentry server configuration.

## 7. Incident Response for Data Breaches

In the event of a suspected data breach:

1. **Contain** — Immediately revoke compromised credentials, rotate secrets (`AUTH_SECRET`, database passwords), and isolate affected systems.
2. **Assess** — Determine the scope: which data was exposed, how many users are affected, and the attack vector.
3. **Notify** — Notify affected users within 72 hours. For FERPA-covered institutions, notify the institution's FERPA compliance officer.
4. **Remediate** — Patch the vulnerability, review audit logs for unauthorized access, and deploy fixes.
5. **Document** — Record the incident details, timeline, impact, and remediation steps in a post-incident report.
6. **Review** — Conduct a post-incident review within 7 days to identify process improvements.

See also: `docs/incident-response-runbook.md` for operational procedures.
