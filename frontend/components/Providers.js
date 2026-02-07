"use client";

import { StoreProvider } from "@/lib/store";
import Shell from "./Shell";

// Envuelve toda la app con el store + shell de layout
export default function Providers({ children }) {
  return (
    <StoreProvider>
      <Shell>{children}</Shell>
    </StoreProvider>
  );
}
