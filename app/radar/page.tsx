import { EstadoVazio } from "@/components/estados/estados";
import { COLUMNS, PageHeader } from "@/components/shell/page-header";

export default function RadarPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Onde abrir ou reforçar"
        intro="A necessidade de cada país e área, cruzada com a evidência das ações."
      />
      <div className={COLUMNS}>
        <EstadoVazio mensagem="O Radar ainda não tem dados. Aparece quando chegar o radar.json." />
      </div>
    </div>
  );
}
