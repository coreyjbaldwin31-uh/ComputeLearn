"use client";

import { curriculum } from "@/data/curriculum";
import { useRef, useState } from "react";
import styles from "./roster-management.module.css";

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
        <p role="status" aria-live="polite" className={styles.message}>
          {message}
        </p>
      )}

      <form onSubmit={handleAdd} className={styles.formRow}>
        <label className={styles.fieldLabel}>
          <span className={styles.fieldLabelText}>Student Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@example.com"
            required
            className={styles.fieldInput}
          />
        </label>
        <label className={styles.fieldLabel}>
          <span className={styles.fieldLabelText}>Course</span>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className={styles.fieldInput}
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
          className={`${styles.primaryButton} ${loading ? styles.buttonDisabled : ""}`}
        >
          Add Student
        </button>
      </form>

      <div className={styles.importRow}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          aria-label="Select CSV file to import enrollments"
          className={styles.fileInput}
        />
        <button
          type="button"
          onClick={handleCSVImport}
          disabled={loading}
          className={`${styles.secondaryButton} ${loading ? styles.buttonDisabled : ""}`}
        >
          Import CSV
        </button>
      </div>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <caption className="sr-only">Student enrollment roster</caption>
          <thead>
            <tr className={styles.tableHeadRow}>
              <th scope="col" className={styles.cell}>
                Name
              </th>
              <th scope="col" className={styles.cell}>
                Email
              </th>
              <th scope="col" className={styles.cell}>
                Course
              </th>
              <th scope="col" className={styles.cell}>
                Enrolled
              </th>
              <th scope="col" className={styles.cell}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id} className={styles.tableRow}>
                <td className={styles.cell}>{enrollment.userName ?? "—"}</td>
                <td className={`${styles.cell} ${styles.mutedCell}`}>
                  {enrollment.userEmail ?? "—"}
                </td>
                <td className={styles.cell}>
                  {allCourses.find((c) => c.id === enrollment.courseId)
                    ?.title ?? enrollment.courseId}
                </td>
                <td className={`${styles.cell} ${styles.mutedCell}`}>
                  {new Date(enrollment.createdAt).toLocaleDateString()}
                </td>
                <td className={styles.cell}>
                  <button
                    type="button"
                    onClick={() => handleRemove(enrollment.id)}
                    disabled={loading}
                    aria-label={`Remove ${enrollment.userName ?? enrollment.userEmail ?? "student"} from roster`}
                    className={`${styles.removeButton} ${loading ? styles.buttonDisabled : ""}`}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {enrollments.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.emptyCell}>
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
