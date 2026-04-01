import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "1rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: 0 }}>404</h1>
      <p style={{ color: "var(--muted)", maxWidth: 420 }}>
        This page doesn&apos;t exist. Head back to the training platform to
        continue learning.
      </p>
      <Link
        href="/"
        style={{
          padding: "10px 20px",
          borderRadius: "999px",
          background: "var(--accent, #0d6b57)",
          color: "#f7f4ee",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Back to ComputeLearn
      </Link>
    </main>
  );
}
