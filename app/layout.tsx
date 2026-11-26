import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { FolhaLupa } from "./conversa-lupa";
import { NavegacaoApp, NavegacaoSemRota } from "./navegacao";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Início · Lupa", template: "%s · Lupa" },
  description:
    "O impacto social das 12 ações: alcance, eficiência e onde fazer mais.",
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT" className={cn("font-sans", geist.variable)}>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <a
          href="#conteudo"
          className="sr-only rounded-lg bg-card px-4 py-3 font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          Saltar para o conteúdo
        </a>
        <header>
          {/* usePathname suspende nas rotas com params desconhecidos no build (/acoes/[id]) */}
          <Suspense fallback={<NavegacaoSemRota />}>
            <NavegacaoApp />
          </Suspense>
        </header>
        <div className="xl:pl-64">
          <main
            id="conteudo"
            className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-10"
          >
            {children}
          </main>
        </div>
        <FolhaLupa />
      </body>
    </html>
  );
}
