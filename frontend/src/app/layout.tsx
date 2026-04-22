import type { Metadata } from "next";
import { GovBar, LayoutProvider, UiProvider } from "@uigovpe/components";
import "./globals.css";

export const metadata: Metadata = {
  title: "Desafio Dev Jr - Liga Digital",
  description: "Sistema de Backoffice com UI-GovPE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <LayoutProvider template="backoffice" breakpoint={1024}>
          <UiProvider>
            <GovBar />
            {children}
          </UiProvider>
        </LayoutProvider>
      </body>
    </html>
  );
}
