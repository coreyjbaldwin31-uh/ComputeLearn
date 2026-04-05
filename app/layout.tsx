import type { Metadata } from "next";
import SessionProvider from "@/components/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ComputeLearn — Hands-on Software Engineering Training",
    template: "%s | ComputeLearn",
  },
  description:
    "Master software engineering through guided, hands-on labs. Progress from computer basics to independent delivery with evidence-based competency tracking.",
  keywords: [
    "software engineering training",
    "learn to code",
    "hands-on coding",
    "terminal training",
    "git training",
    "competency tracking",
    "computer science education",
  ],
  openGraph: {
    title: "ComputeLearn — Hands-on Software Engineering Training",
    description:
      "Master software engineering through guided labs. From computer basics to independent delivery.",
    type: "website",
    siteName: "ComputeLearn",
  },
  twitter: {
    card: "summary_large_image",
    title: "ComputeLearn — Hands-on Software Engineering Training",
    description:
      "Master software engineering through guided labs. From computer basics to independent delivery.",
  },
  other: {
    "theme-color": "#0d6b57",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
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
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
