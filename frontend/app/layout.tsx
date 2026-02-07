import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FacelessAI",
  description: "De una idea a un video casi listo en minutos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
