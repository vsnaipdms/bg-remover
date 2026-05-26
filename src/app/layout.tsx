import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instant Background Remover – Free AI Tool | Remove BG Online",
  description:
    "Remove image backgrounds instantly with AI. Free online tool – no signup, no upload limits. Get transparent PNGs in seconds. The fastest background remover online.",
  keywords: [
    "background remover",
    "remove image background",
    "transparent PNG maker",
    "AI background remover online",
    "free bg remover",
    "remove background from image",
    "transparent background generator",
  ],
  openGraph: {
    title: "Instant Background Remover – Free AI Tool",
    description:
      "Remove image backgrounds instantly with AI. Get transparent PNGs in seconds. No signup required.",
    type: "website",
    siteName: "Instant Background Remover",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instant Background Remover – Free AI Tool",
    description:
      "Remove image backgrounds instantly with AI. No signup required.",
  },
  robots: "index, follow",
  metadataBase: new URL("https://bg-remover.vercel.app"),
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
}
