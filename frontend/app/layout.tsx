import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { UiProvider, LayoutProvider, GovBar } from "@uigovpe/components";
import "./globals.css";

// Configuração da fonte Inter recomendada pelo DS
const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} antialiased`}>
        {/* GovBar OBRIGATÓRIA como primeiro elemento da interface */}
        <GovBar />

        {/* Providers globais do Design System */}
        <LayoutProvider template="backoffice" breakpoint={1024}>
          <UiProvider>
            {children}
          </UiProvider>
        </LayoutProvider>
      </body>
    </html>
  );
}