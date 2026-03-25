import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ComputeLearn",
  description:
    "Interactive training platform for computer mastery, software engineering, and safe AI-assisted workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
