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
  metadataBase: new URL("https://bear-habitat-3d.vercel.app"),

  title: "URSUS · North American Bears",
  description: "A living 3D habitat powered by real wildlife observations.",

  openGraph: {
    title: "URSUS · North American Bears",
    description:
      "Explore black bears, grizzlies, polar bears, and Kodiak bears with interactive maps and real observation data.",
    url: "https://bear-habitat-3d.vercel.app/",
    siteName: "URSUS",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "URSUS — North American Bears",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "URSUS · North American Bears",
    description:
      "Interactive 3D habitat maps and species profiles for North American bears.",
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
