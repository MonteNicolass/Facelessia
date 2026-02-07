import "./globals.css";
import Shell from "@/components/Shell";

export const metadata = {
  title: "Celeste",
  description: "Video faceless pipeline — de una idea a un video casi listo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
