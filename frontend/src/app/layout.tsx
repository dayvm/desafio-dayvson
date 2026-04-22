import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GovBar, LayoutProvider, UiProvider } from "@uigovpe/components";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Desafio Dev Jr - Dayvson M.",
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
