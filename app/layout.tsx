import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";
import "leaflet/dist/leaflet.css";

import { Providers } from "@/components/providers";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Pitly — СТО та запчастини по Україні",
  description: "Pitly допомагає знайти СТО та магазини автозапчастин по містах України. Подайте заявку на ремонт чи підбір деталей онлайн.",
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  manifest: "/images/icons/site.webmanifest",
  icons: {
    icon: [
      { url: "/images/icons/favicon.ico", sizes: "32x32" },
      { url: "/images/icons/favicon-96x96.png", sizes: "96x96" },
      { url: "/images/icons/favicon.svg", type: "image/svg+xml" }
    ],
    apple: "/images/icons/apple-touch-icon.png",
    shortcut: "/images/icons/favicon.ico",
    other: [
      { rel: "mask-icon", url: "/images/icons/favicon.svg", color: "#111827" },
      { rel: "manifest", url: "/images/icons/site.webmanifest" }
    ]
  },
  openGraph: {
    title: "Pitly",
    description: "Каталог СТО та магазинів автозапчастин по Україні",
    url: process.env.SITE_URL || "http://localhost:3000",
    siteName: "Pitly",
    locale: "uk_UA",
    type: "website"
  }
};

export const viewport = {
  themeColor: "#111827"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className={`${manrope.variable} bg-neutral-50 text-neutral-900 transition-colors`}>
        <Providers>
          <Header />
          <main className="min-h-screen bg-transparent pb-16 pt-8">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
