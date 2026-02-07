import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Celeste",
  description: "Editor-first faceless video pipeline",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
