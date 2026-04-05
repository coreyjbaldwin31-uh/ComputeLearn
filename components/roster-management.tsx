"use client";

import { useState, useRef } from "react";
import { curriculum } from "@/data/curriculum";

type EnrollmentRow = {
  id: string;
  userId: string;
  courseId: string;
  role: string;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
};

const allCourses = curriculum.phases.flatMap((phase) =>
  phase.courses.map((c) => ({ id: c.id, title: c.title })),
);

export function RosterManagement({
  initialEnrollments,
}: {
  initialEnrollments: EnrollmentRow[];
}) {
  const [enrollments, setEnrollments] =
    useState<EnrollmentRow[]>(initialEnrollments);
  const [email, setEmail] = useState("");
  const [courseId, setCourseId] = useState(allCourses[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !courseId) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/instructor/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), courseId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Failed to add student");
      } else {
        setEnrollments((prev) => [
          {
            id: data.enrollment.id,
            userId: data.enrollment.userId,
            courseId: data.enrollment.courseId,
            role: data.enrollment.role,
            createdAt: data.enrollment.createdAt,
            userName: data.enrollment.user?.name ?? null,
            userEmail: data.enrollment.user?.email ?? email.trim(),
          },
          ...prev,
        ]);
        setEmail("");
        setMessage("Student enrolled successfully");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(enrollmentId: string) {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(
        `/api/instructor/enrollments?id=${encodeURIComponent(enrollmentId)}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
        setMessage("Enrollment removed");
      } else {
        const data = await res.json();
        setMessage(data.error ?? "Failed to remove enrollment");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCSVImport() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setLoading(true);
    setMessage(null);

    try {
      const text = await file.text();
      const res = await fetch("/api/instructor/enrollments/import", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: text,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(
          `Imported ${data.success} enrollments.${data.errors?.length ? ` ${data.errors.length} errors.` : ""}`,
        );
        // Refresh the full list
        const refreshRes = await fetch("/api/instructor/enrollments");
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setEnrollments(
            refreshData.enrollments.map(
              (e: {
                id: string;
                userId: string;
                courseId: string;
                role: string;
                createdAt: string;
                user?: { name?: string; email?: string };
              }) => ({
                id: e.id,
                userId: e.userId,
                courseId: e.courseId,
                role: e.role,
                createdAt: e.createdAt,
                userName: e.user?.name ?? null,
                userEmail: e.user?.email ?? null,
              }),
            ),
          );
        }
      } else {
        setMessage(data.error ?? "Import failed");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      {message && (
        <p
          role="status"
          aria-live="polite"
          style={{
            padding: "8px 12px",
            marginBottom: "16px",
            borderRadius: "var(--radius-sm)",
            background: "var(--accent-soft)",
            color: "var(--accent-strong)",
          }}
        >
          {message}
        </p>
      )}

      <form
        onSubmit={handleAdd}
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "flex-end",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            Student Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@example.com"
            required
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "var(--surface-strong)",
              color: "var(--text)",
            }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            Course
          </span>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "var(--surface-strong)",
              color: "var(--text)",
            }}
          >
            {allCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 20px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          Add Student
        </button>
      </form>

      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          aria-label="Select CSV file to import enrollments"
          style={{ fontSize: "0.9rem" }}
        />
        <button
          type="button"
          onClick={handleCSVImport}
          disabled={loading}
          style={{
            padding: "8px 20px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            background: "var(--surface-strong)",
            color: "var(--text)",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          Import CSV
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <caption className="sr-only">Student enrollment roster</caption>
          <thead>
            <tr
              style={{
                borderBottom: "2px solid var(--border)",
                textAlign: "left",
              }}
            >
              <th scope="col" style={{ padding: "8px 12px" }}>Name</th>
              <th scope="col" style={{ padding: "8px 12px" }}>Email</th>
              <th scope="col" style={{ padding: "8px 12px" }}>Course</th>
              <th scope="col" style={{ padding: "8px 12px" }}>Enrolled</th>
              <th scope="col" style={{ padding: "8px 12px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr
                key={enrollment.id}
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <td style={{ padding: "8px 12px" }}>
                  {enrollment.userName ?? "—"}
                </td>
                <td style={{ padding: "8px 12px", color: "var(--muted)" }}>
                  {enrollment.userEmail ?? "—"}
                </td>
                <td style={{ padding: "8px 12px" }}>
                  {allCourses.find((c) => c.id === enrollment.courseId)
                    ?.title ?? enrollment.courseId}
                </td>
                <td style={{ padding: "8px 12px", color: "var(--muted)" }}>
                  {new Date(enrollment.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "8px 12px" }}>
                  <button
                    type="button"
                    onClick={() => handleRemove(enrollment.id)}
                    disabled={loading}
                    aria-label={`Remove ${enrollment.userName ?? enrollment.userEmail ?? "student"} from roster`}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--error)",
                      background: "transparent",
                      color: "var(--error)",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {enrollments.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "24px 12px",
                    textAlign: "center",
                    color: "var(--muted)",
                  }}
                >
                  No enrollments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
