import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deborah Piven — Remax Unico",
  description: "Fue un privilegio acompañarte. Me regalás dos minutos para contarme tu experiencia?",
  icons: { icon: "/7.png" },
  openGraph: {
    title: "Deborah Piven — Remax Unico",
    description: "Fue un privilegio acompañarte. Me regalás dos minutos para contarme tu experiencia?",
    images: [{ url: "/7.png", width: 800, height: 800 }],
    locale: "es_UY",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
