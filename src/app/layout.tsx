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
  metadataBase: new URL("https://lamamedellinbikefestsabaneta.azurewebsites.net"),
  title: "XIII Aniversario L.A.M.A. Medellín & L.A.M.A. Bike Fest 2026 🇨🇴",
  description:
    "¡El rugir de motores más grande de América! Únete a delegaciones de 26 países en Sabaneta. Gran Caravana, Parrilla Mixta y conciertos en vivo con Sergio Vargas, Binomio de Oro y más. ¡No te quedes por fuera, asegura tu cupo aquí! 🏁🎸",
  openGraph: {
    title: "XIII Aniversario L.A.M.A. Medellín & L.A.M.A. Bike Fest 2026 🇨🇴",
    description:
      "¡El rugir de motores más grande de América! Únete a delegaciones de 26 países en Sabaneta. Gran Caravana, Parrilla Mixta y conciertos en vivo con Sergio Vargas, Binomio de Oro y más. ¡No te quedes por fuera, asegura tu cupo aquí! 🏁🎸",
    url: "https://lamamedellinbikefestsabaneta.azurewebsites.net",
    siteName: "L.A.M.A. Bike Fest Sabaneta",
    images: [
      {
        url: "/images/Logotipo-LM-vertical-transp.png",
        width: 1200,
        height: 630,
        alt: "Logotipo Oficial XIII Aniversario L.A.M.A. Medellín",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XIII Aniversario L.A.M.A. Medellín & L.A.M.A. Bike Fest 2026 🇨🇴",
    description:
      "¡El rugir de motores más grande de América! Únete a delegaciones de 26 países en Sabaneta. Gran Caravana, Parrilla Mixta y conciertos en vivo con Sergio Vargas, Binomio de Oro y más. ¡No te quedes por fuera, asegura tu cupo aquí! 🏁🎸",
    images: ["/images/Logotipo-LM-vertical-transp.png"],
  },
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
