import type { Metadata } from "next";
import {
  Anonymous_Pro,
  Courier_Prime,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

const anonymousPro = Anonymous_Pro({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-title",
});

const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-card-body",
});

export const metadata: Metadata = {
  title: "TODO TCG",
  description: "Turn chores into collectible cards and actually finish them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexMono.variable} ${anonymousPro.variable} ${courierPrime.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
