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
  openGraph: {
    title: "Pitly",
    description: "Каталог СТО та магазинів автозапчастин по Україні",
    url: process.env.SITE_URL || "http://localhost:3000",
    siteName: "Pitly",
    locale: "uk_UA",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className={manrope.variable}>
        <Providers>
          <Header />
          <main className="min-h-screen bg-transparent pb-16 pt-8">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
