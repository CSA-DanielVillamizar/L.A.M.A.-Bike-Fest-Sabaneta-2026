import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import type { Metadata } from "next";
import { Montserrat, Roboto_Condensed } from "next/font/google";
import "./globals.css";

const headingFont = Montserrat({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const bodyFont = Roboto_Condensed({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "XII Aniversario L.A.M.A. Medellín y L.A.M.A. Bike Fest Sabaneta 2026",
  description:
    "Landing page oficial del L.A.M.A. Bike Fest Sabaneta 2026: adrenalina, hermandad y motos de alta gama.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${headingFont.variable} ${bodyFont.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full text-zinc-100">
        <Navbar />
        <main className="flex min-h-screen flex-col pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
