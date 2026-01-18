import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import { Cinzel, Inter } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata = {
  title: "URSUS · North American Bears",
  description: "A living 3D habitat powered by real wildlife observations.",
  openGraph: {
    title: "URSUS · North American Bears",
    description: "Explore North American bears in a living 3D habitat.",
    url: "https://bear-habitat-3d.vercel.app/",
    siteName: "URSUS",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "URSUS · North American Bears",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "URSUS · North American Bears",
    description: "Explore North American bears in a living 3D habitat.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable}`}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
