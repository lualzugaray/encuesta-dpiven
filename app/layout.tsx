import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Encuesta — Deborah Piven Remax Unico",
  description: "Contanos tu experiencia con nuestros servicios",
  icons: { icon: "/7.png" },
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
