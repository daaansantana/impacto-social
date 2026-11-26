import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { NavegacaoApp, NavegacaoSemRota } from "./navegacao";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Início · Lupa", template: "%s · Lupa" },
  description:
    "Compara o alcance e a eficiência dos 12 projetos com números limpos e meses comparáveis.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT" className={cn("font-sans", geist.variable)}>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <header className="border-b">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 lg:px-10">
            <div className="flex items-baseline gap-3">
              <span className="text-lg font-bold">Lupa</span>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                O impacto social das 12 ações
              </span>
            </div>
            {/* usePathname suspende nas rotas com params desconhecidos no build (/acoes/[id]) */}
            <Suspense fallback={<NavegacaoSemRota />}>
              <NavegacaoApp />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-10">
          {children}
        </main>
      </body>
    </html>
  );
}
