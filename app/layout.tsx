import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Lupa", template: "%s · Lupa" },
  description:
    "Compara o alcance e a eficiência dos 12 projetos com números limpos e meses comparáveis.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
