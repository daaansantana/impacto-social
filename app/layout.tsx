import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Portefólio · Lupa", template: "%s · Lupa" },
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
          <div className="mx-auto flex max-w-6xl items-baseline gap-3 px-4 py-4 lg:px-10">
            <span className="text-lg font-bold">Lupa</span>
            <span className="text-sm text-muted-foreground">
              Os 12 projetos, com números limpos
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-10">
          {children}
        </main>
      </body>
    </html>
  );
}
