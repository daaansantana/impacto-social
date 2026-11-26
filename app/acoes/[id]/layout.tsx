import type { Metadata } from "next";
import { IDS_PROJETOS } from "@/lib/projeto";

export function generateStaticParams() {
  return IDS_PROJETOS.map((id) => ({ id }));
}

// Estático: ler os params em generateMetadata() bloqueava o prerender da metadata
// («Next.js encountered URL data in generateMetadata()»). O nome da ação fica no cabeçalho da página.
export const metadata: Metadata = { title: "Detalhe da ação" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
