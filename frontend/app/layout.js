import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Celeste",
  description: "Video faceless pipeline — de una idea a un video casi listo",
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
