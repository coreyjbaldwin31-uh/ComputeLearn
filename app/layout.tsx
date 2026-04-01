import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ComputeLearn",
  description:
    "Interactive training platform for computer mastery, software engineering, and safe AI-assisted workflows.",
  openGraph: {
    title: "ComputeLearn",
    description:
      "Hands-on software engineering training — from computer basics to independent delivery.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ComputeLearn",
    description:
      "Hands-on software engineering training — from computer basics to independent delivery.",
  },
  other: {
    "theme-color": "#0d6b57",
    "apple-mobile-web-app-capable": "yes",
  },
};

/* Inline script to apply the saved theme before first paint, preventing FOUC. */
const themeScript = `(function(){try{var t=localStorage.getItem("computelearn-theme");if(t){var v=JSON.parse(t);if(v==="dark")document.documentElement.setAttribute("data-theme","dark")}}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
