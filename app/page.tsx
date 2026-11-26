import { MapaAcoes } from "@/components/mapa/mapa-acoes";
import { COLUMNS, PageHeader } from "@/components/shell/page-header";
import { PONTOS_EXEMPLO } from "@/lib/mapa-exemplo";

export default function InicioPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Como está o impacto"
        intro="O mapa das ações, por agora com pontos de exemplo. Clique num ponto para ver o nome e o IIS."
      />
      <div className={COLUMNS}>
        <MapaAcoes pontos={PONTOS_EXEMPLO} />
        <aside className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>
            A cor de cada ponto vem com os dados: aqui, verde a partir de 60,
            âmbar a partir de 40 e vermelho abaixo.
          </p>
        </aside>
      </div>
    </div>
  );
}
