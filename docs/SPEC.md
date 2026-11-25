# SPEC: Lupa

O contrato técnico da app. Os números vêm de `scripts/agregar.py` e são verificados por `scripts/gabaritos.json`.

## 1. Dados

- **Em bruto:** `data/raw/json/*.json` e `data/raw/csv/*.csv`, do `impacto.zip`. A app nunca os lê; as IAs também não.
- **Resumidos, para a app:** `public/data/projetos.json`, `mensal.json`, `planos.json` e `qualidade.json`, com cerca de 150 KB no total.
- **Para voltar a gerar:** `python3 scripts/agregar.py data/raw/json data/raw/csv .` (precisa de pandas e numpy).
- **Data de referência:** 27/12/2025, em `lib/dates.ts`. Nunca `new Date()`.

### Regras de limpeza

Já aplicadas pelo `agregar.py`; o detalhe está em `docs/PERFIL.md`.

1. **Datas:** lêem-se os formatos AAAA-MM-DD e DD/MM/AAAA.
2. **Despesa:** é líquida, com os estornos (valores negativos) abatidos ao projeto.
3. **Atividades:** as duplicadas (mesmo id e mesmo conteúdo) saem.
4. **Alocações:** as do P99, um projeto que não existe, saem das contas por projeto.
5. **Unidades e grafias:** os beneficiários ficam todos com a unidade `beneficiarios`; os tipos de atividade sem espaços a mais.
6. **Horas de voluntariado:** cada alocação é repartida pelos dias entre o início e o fim. Sem data de fim, termina na data de referência.
7. **Fim de ano:** novembro e dezembro ficam marcados com `fimDeAno = true`. «Meses comparáveis» quer dizer janeiro a outubro.
8. **Fora das contas:** o resultado das atividades e a métrica `voluntarios_ativos` (ver `docs/RELACOES.md` e `docs/ANOMALIAS.md`).

## 2. Ficheiros de `public/data`

**`mensal.json`:** 288 linhas, uma por projeto e por mês.

```ts
type Mes = {
  projeto: string; mes: string; fimDeAno: boolean        // mes = "AAAA-MM"
  despesa: number; estornos: number                      // euros; despesa líquida; estornos ≥ 0
  atividades: number; participantes: number; horasAtividade: number
  horasVoluntariado: number; voluntariosRegistados: number
  beneficiarios: number; jovensFormados: number; horasFormacao: number; oficinas: number
  taxaConclusao: number                                  // percentagem: média, nunca soma
  voluntariosReportados: number                          // métrica dos parceiros: só para o aviso
  reunioes: number; horasReuniao: number
}
```

**`projetos.json`:** 12 linhas.

```ts
type Projeto = {
  id: string; nome: string; pais: string; regiao: string; area: string; anoInicio: number
  orcamentoAnual: number; estado: "ativo" | "em_avaliacao"; objetivos: string
  parceiro: { id: string; especialidade: string; historico: string; capacidade: number }
  voluntariosDistintos: number; competenciaCerta: number  // % de alocações com a competência da área
  investimentoAprovado: number; investimentoProposto: number
}
```

**`planos.json`:** 120 linhas.

```ts
type Plano = { id: string; projeto: string; data: string; tipo: string; valor: number; estado: string; descricao: string }
```

**`qualidade.json`:**

```ts
type Qualidade = {
  referencia: string
  limpeza: { id: string; titulo: string; quantidade: number; de: number; regra: string }[]
  anomalias: { id: "fimDeAno" | "dia27" | "semana" | "voluntarios"; titulo: string; texto: string; numeros: object }[]
  notaGenerica: { ferramenta: string; resultado: string }
  scorecard: { dimensao: string; nota: 1 | 2 | 3 | 4 | 5; evidencia: string }[]
}
```

## 3. Funções de `lib/`

Funções puras: recebem dados e devolvem dados, sem a data de hoje. A coluna «Gabarito» diz onde está o valor esperado em `scripts/gabaritos.json`.

| Função | Entrada | Saída | Ecrã | Gabarito |
| --- | --- | --- | --- | --- |
| `filtrarMeses(meses, comparaveis)` | `Mes[]`, `boolean` | `Mes[]` sem novembro e dezembro, quando `comparaveis` | 1, 2 | — |
| `eficiencia(meses, unidade, comparaveis)` | `unidade`: `"euro"`, `"hora"` ou `"jovem"` | `{ projeto, valor, posicao }[]`, com a posição 1 para o melhor | 1 | `eficiencia.{todos\|comparaveis}.{euro\|hora\|jovem}` |
| `totais(meses, comparaveis)` | — | `{ despesa, beneficiarios, horasVoluntariado, custoPorBeneficiario }` | 1 | `eficiencia.*.totais` |
| `serieProjeto(meses, id)` | — | `Mes[]` do projeto, por ordem de mês | 2 | — |
| `fimDeAno(meses)` | — | médias mensais de janeiro a outubro e de novembro e dezembro: atividades, beneficiários, despesa, custo por beneficiário | 2, 4 | `fimDeAno` |
| `simular({ custos, investimento, de, para, fracao, fator })` | os custos de `eficiencia(..., "euro", true)` e o `investimentoAprovado` | `{ movido, perdidos, ganhos, saldo, saldoPorAno, valorEquivalentePorAno }` | 3 | `simulacao.cenarios.*` |
| `fatorDeEquilibrio(...)` | o cenário otimista | `ganhos / perdidos` (1,49) | 3 | `simulacao.fatorDeEquilibrio` |
| `auditar(linhas)` | as linhas de um CSV (texto) | `ResultadoAuditoria` | 4 (protótipo) | `auditor.{atividades-P07.csv\|despesas-P07.csv}` |
| `mensagemParceiro(resultado, projeto)` | — | o texto do email ao parceiro | 4 (protótipo) | — |

### As contas

- **Por euro:** Σ despesa ÷ Σ beneficiários. Menos é melhor.
- **Por hora:** Σ beneficiários ÷ Σ horas de voluntariado × 1000. Mais é melhor.
- **Por jovem:** Σ despesa ÷ Σ jovens formados. Menos é melhor.

### O simulador

- **Quem dá e quem recebe:** dão os 4 piores por euro em meses comparáveis (P01, P02, P05 e P12); recebem os 4 melhores (P07, P11, P10 e P06), em partes iguais.
- **Perdidos:** Σ (investimento × fração) ÷ custo de quem dá.
- **Ganhos:** Σ (total movido ÷ 4) ÷ (custo de quem recebe × fator).
- **Por ano:** saldo ÷ 2, porque os planos cobrem 2 anos. O valor equivalente é o saldo por ano × 2 450,89 €.
- **Cenários:**

  | Cenário | Fração | Fator |
  | --- | ---: | ---: |
  | Prudente | 0,5 | 1,2 |
  | Provável | 1,0 | 1,2 |
  | Otimista | 1,0 | 1,0 |

## 4. O auditor (protótipo)

Recebe as linhas de um CSV, lidas com Papa Parse (`header: true`, `delimiter: ";"`, `skipEmptyLines: true`), com todos os valores como texto. Devolve:

- **`linhas`:** o número de linhas.
- **`datas`:** `{ iso, ddmm, outro }`. A coluna de data é a primeira que existir de `data`, `data_inicio` e `periodo`.
- **`dias28a31`:** quantas datas caem num dia de 28 a 31. **`diaMaximo`:** o maior dia do mês encontrado.
- **`domingo`:** a percentagem de datas a um domingo, com 2 casas decimais.
- **`picos`:** os meses (`AAAA-MM`) com pelo menos 1,3 vezes a mediana das contagens mensais. A mediana conta só os meses presentes; com um número par de meses, é a média dos dois do meio. Vêm por ordem crescente.
- **`negativos`:** só se houver a coluna `valor`. Para ler o número, `1.234,56` passa a 1234.56 e `12,5` a 12.5.
- **`idsRepetidos`:** o número de linhas cujo `id` aparece mais de uma vez.
- **`linhasIguais`:** o total de linhas menos o número de linhas diferentes.
- **`refsInvalidas`:** as linhas cujo `id_projeto` não está entre P01 e P12.
- **`grafias`:** para cada coluna, pela ordem do ficheiro, juntam-se os valores que só diferem nos acentos, nas maiúsculas ou nos espaços.
  - Ficam de fora `id`, as colunas `id_*`, `data`, `valor` e as colunas com mais de 40 valores diferentes.
  - Devolve `{ coluna, variantes }` para cada grupo com mais de uma variante, com as variantes por ordem alfabética.
- **`vazios`:** por coluna, os valores vazios depois de tirar os espaços. Só entram as colunas com pelo menos um.

Ficheiros de demonstração: `public/demo/atividades-P07.csv` e `public/demo/despesas-P07.csv`. São dados reais do P07, com os problemas originais.

## 5. Gabaritos

- **O teste:** `scripts/gabaritos.test.ts` lê `scripts/gabaritos.json` e compara com as funções de `lib/`, com uma tolerância de 0,01. As posições e as listas têm de ser iguais.
- **Os valores esperados:** são calculados a partir dos dados em bruto, por um caminho diferente do da app.
- **Se um gabarito falhar:** não se muda o valor esperado nem se reescreve a função até bater. Para-se e regista-se.

## 6. Ecrãs e arquitetura

- **Caminho dos dados:** `public/data` → `services/` → `store/` → `hooks/` → `lib/` → `components/` (só recebem props).
- **Ecrãs:** cada um tem `PageHeader` e `COLUMNS` e os estados a carregar, erro e vazio.
- **Números:** em pt-PT (`Intl.NumberFormat("pt-PT")`), com euros, percentagens e 0 a 2 casas decimais.
- **Etiquetas:**
  - «Meses comparáveis (jan–out)» quando o interruptor está ligado.
  - «Protótipo» no auditor.
  - «Pressupostos» sempre visíveis no simulador.
