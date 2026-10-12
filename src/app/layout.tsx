import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Plus Jakarta Sans (SIL Open Font License), self-hosted so builds work offline.
const jakarta = localFont({
  src: "./fonts/PlusJakartaSans-Variable.woff2",
  variable: "--font-jakarta",
  weight: "200 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Barangay Baesa E-Services",
    template: "%s · Barangay Baesa E-Services",
  },
  description: "Residents portal for Barangay Baesa e-services: document requests, community reports, appointments and announcements.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
