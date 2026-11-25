import type { Metadata } from "next";
import { IDS_PROJETOS } from "@/lib/projeto";

export function generateStaticParams() {
  return IDS_PROJETOS.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Projeto ${id.slice(1)}` };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
