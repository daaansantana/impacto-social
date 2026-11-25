# Plano v2: a Lupa centrada no impacto social

Escrito a 25/11/2026, às 22h45, depois da mentoria com o professor. Junta o que ele disse, o que já temos e o que falta fazer até à entrega, com os prompts para o Dan e para a Ana.

## 1. O que mudou depois da mentoria

| Antes | Agora |
| --- | --- |
| KPI: beneficiários a mais com o mesmo dinheiro | **KPI: o impacto social para as pessoas.** O dinheiro é uma consequência e aparece como contexto |
| Ranking por euro | **Índice de Impacto Social (IIS)**, com dimensões da literatura e pesos que a Helena pode mudar |
| Análises de voluntários (horas de 2025, competência certa, reportados contra registados) | **Saem.** O professor disse que são um falso positivo |
| «Sinais de risco», «fraude» | **«Pontos de atenção» e «a confirmar com o parceiro»**, numa linguagem de políticas públicas: a Lupa informa e quem julga é a Helena |
| Só o que já aconteceu | **O que aconteceu, o que está a acontecer e onde abrir projetos novos**, num radar de oportunidades com dados do mundo |
| Painel com números | **Uma interface amiga:** leituras em frases, uma lista com filtros, mapa, e o detalhe só quando se pede |

**O que se mantém:**
- o achado da sazonalidade (fim de ano, a data, o mês), que o professor confirmou;
- a limpeza dos dados;
- os testes que comparam cada número com contas feitas à parte (gabaritos);
- o auditor, em protótipo.

**Países.** Os dados têm 12 países: 5 em África (Quénia, Gana, Senegal, Uganda e Moçambique), 3 na América do Sul (Brasil, Peru e Colômbia), 3 na Ásia (Índia, Bangladesh e Filipinas) e 1 na Europa (Portugal).
- A decisão por omissão: analisamos só estes 12, a base é facto e não entram países de fora. A região passa a ser um filtro.
- Se o professor quis dizer «só África e América do Sul», basta pôr esse filtro por omissão; não muda nada no resto.

## 2. Como medimos o impacto social

### 2.1 As 5 dimensões do impacto (Impact Frontiers, antes Impact Management Project)

O impacto lê-se em cinco perguntas: **o quê**, **quem**, **quanto** (escala, profundidade e duração), **contributo** e **risco**. É a norma usada no mundo do investimento de impacto e no catálogo IRIS+.

**O Índice de Impacto Social (IIS) da Lupa**, de 0 a 100 por ação:

| Dimensão | Pergunta | Como se mede com os nossos dados | Peso por omissão |
| --- | --- | --- | ---: |
| **Quem: necessidade** | As pessoas a quem chegamos precisam mesmo? | Um indicador do Banco Mundial para a área do projeto, no país do projeto (tabela 2.3), em percentil entre os 12 países | 25 |
| **Quanto: escala** | A quantas pessoas chegamos? | Beneficiários por mês, só em meses comparáveis (janeiro a outubro), em percentil | 25 |
| **Quanto: profundidade** | Quanto muda para cada pessoa? | Média dos percentis da taxa de conclusão, dos jovens formados por 100 beneficiários e das horas de formação por beneficiário | 30 |
| **Quanto: duração** | O impacto mantém-se? | Crescimento dos beneficiários de 2024 para 2025, de janeiro a outubro, em percentil | 20 |
| **Contributo** | O que teria acontecido sem nós? | Ainda não se pode medir: precisa de uma linha de base ou de um grupo de comparação. Fica no roadmap, com peso 0 | 0 |
| **Risco: confiança na medição** | Qual é a probabilidade de o impacto não ser o que parece? | Os pontos de atenção da ação (2.4). Não entra na conta: aparece como uma faixa de confiança alta, média ou baixa | — |
| *Custo por pessoa* (opcional) | Quanto custa cada pessoa alcançada? | Custo por beneficiário em meses comparáveis, em percentil invertido. O dinheiro é consequência, por isso pesa 0 por omissão | 0 |

**A conta:** IIS = Σ (peso × percentil) ÷ Σ pesos.

**Os pesos ajustam-se** em «Como medimos», com quatro predefinições:

| Predefinição | Necessidade | Escala | Profundidade | Duração |
| --- | ---: | ---: | ---: | ---: |
| Equilibrado | 25 | 25 | 30 | 20 |
| Chegar a mais pessoas | 15 | 50 | 20 | 15 |
| Mudar mais cada vida | 20 | 10 | 55 | 15 |
| Onde é mais preciso | 50 | 15 | 20 | 15 |

O ecrã diz sempre: «Índice nosso, inspirado nas 5 dimensões do impacto. Os pesos são uma escolha, e pode mudá-los.»

### 2.2 O diagnóstico da ação: a saúde da ação

São as lentes da OCDE (Comité de Ajuda ao Desenvolvimento): relevância, coerência, eficácia, eficiência, impacto e sustentabilidade. Cada uma tem três leituras, **forte**, **a acompanhar** ou **a rever**, sempre com uma frase a explicar.

| Lente | Com os nossos dados |
| --- | --- |
| Relevância | Necessidade do contexto, e se o objetivo bate com a área (6 projetos não batem) |
| Eficácia | Profundidade e tendência |
| Eficiência | Custo por pessoa face às outras ações, ajustado ao nível de preços do país |
| Impacto | O IIS |
| Sustentabilidade | Parceiro (histórico e capacidade) e duração |
| Coerência | Roadmap: as políticas e os outros atores no país |

### 2.3 A necessidade, com dados do mundo (Banco Mundial, World Development Indicators)

| Área do projeto | Indicador | Código | A necessidade é maior quando |
| --- | --- | --- | --- |
| Educação | Pobreza de aprendizagem (crianças que aos 10 anos não leem um texto simples) | `SE.LPV.PRIM` | o valor sobe |
| Formação | Jovens que não estudam, não trabalham e não estão em formação (NEET) | `SL.UEM.NEET.ZS` | o valor sobe |
| Saúde | Índice de cobertura dos serviços de saúde | `SH.UHC.SRVS.CV.XD` | o valor desce |
| Tecnologia e comunicação | Pessoas que usam a internet (%) | `IT.NET.USER.ZS` | o valor desce |
| Logística | Pobreza extrema (a linha internacional do Banco Mundial em vigor) | `SI.POV.DDAY` | o valor sobe |
| Todas, como contexto | Conclusão do ensino primário; desemprego jovem; nível de preços; população | `SE.PRM.CMPT.ZS`, `SL.UEM.1524.ZS`, `PA.NUS.PPPC.RF`, `SP.POP.TOTL` | — |

**Regras:**
- Usa-se o valor mais recente de cada país e mostra-se sempre o ano e a fonte.
- Se um país não tiver o indicador, o ecrã diz «sem dado» e a dimensão sai da conta só para essa ação.

### 2.4 Pontos de atenção: a linguagem certa

Nada de «fraude», «suspeito» ou «fantasma». A Lupa mostra a diferença e propõe o que confirmar. A decisão é da Helena.

Os pontos comuns a todas as ações (o fim de ano e o dia 27) aparecem uma vez, em Como medimos. Em cada ação aparecem só os pontos próprios dessa ação.

| Ponto | Como se escreve |
| --- | --- |
| Pico de fim de ano | «Em novembro e dezembro, os beneficiários sobem 57% face a janeiro–outubro, sem aumento de custos. Vale confirmar com o parceiro como foram registados.» |
| Dias 28 a 31 | «Não há registos depois do dia 27. Confirmar o calendário de fecho do mês.» |
| Estornos sem referência | «Há 62 correções de despesa sem referência à despesa original. Pedir a referência.» (o número muda por ação) |
| Custo por atividade fora do padrão | «Cada atividade custa 13,7 vezes mais do que na outra ação de educação (P07), com o mesmo número de participantes. A diferença de preços entre os países não chega para o explicar. Pedir o detalhe das maiores despesas.» |
| Objetivo e área não batem | «O objetivo declarado é a saúde preventiva, mas a área é a educação. Confirmar qual vale para medir o impacto.» |

**O que pedir ao parceiro**, para cada ação: o perfil dos participantes (idade, género, situação), as listas de presenças com identificadores anónimos, uma avaliação antes e depois numa amostra, a referência da despesa original em cada correção e o calendário de fecho.

## 3. A Lupa v2: os ecrãs

| # | Ecrã | Para que serve | O que se vê primeiro | O que se abre a pedido |
| --- | --- | --- | --- | --- |
| 1 | **Início** | Como está o impacto | O IIS do portefólio, 3 leituras em frases, o mapa com as 12 ações e «Precisa de atenção» (até 3) | Cada leitura leva à ação ou ao ponto |
| 2 | **Ações** | Ver e comparar | Uma lista de cartões: nome, país, área, IIS, saúde e confiança | Filtros (região, país, área, saúde, confiança) e ordenação (IIS, escala, profundidade, necessidade) |
| 3 | **Ação** | Perceber uma ação | Resumo (o quê, onde, formato, público), IIS e as 4 dimensões, saúde da ação | Evolução em meses comparáveis (fim de ano assinalado), pontos de atenção, o que pedir ao parceiro, o que aprendemos |
| 4 | **Radar** | Onde abrir ou reforçar | Mapa por área (cor = necessidade), quadrante necessidade × evidência, lista «Onde faria mais diferença» | **Novo projeto** (protótipo): país, área, formato e orçamento → alcance estimado, necessidade, confiança e uma leitura: avançar, pilotar ou rever o desenho |
| 5 | **Como medimos** | Confiar e ajustar | Pesos e predefinições do IIS, as definições e as fontes | Confiança nos dados (limpeza, sazonalidade, dia 27) e o auditor (protótipo) |

**O quadrante do Radar**, por país e área:

| | Evidência alta | Evidência baixa |
| --- | --- | --- |
| **Necessidade alta** | Reforçar | Repensar ou apoiar |
| **Necessidade baixa** | Manter | Reavaliar |

A evidência é o IIS médio das ações dessa área. Onde não há ação, é a média da mesma área noutros países, marcada como «estimado».

**O que sai:** o simulador financeiro (passa para o roadmap, como cenários de investimento), a unidade «por hora de voluntariado», a competência certa e o padrão dos voluntários.

## 4. Implementado, protótipo e roadmap

| Camada | O quê |
| --- | --- |
| **Implementado** | Início, Ações, Ação, o Radar (mapa, quadrante e lista) e Como medimos, com o IIS e o diagnóstico testados. Leituras feitas por regras, a partir das funções de `lib/`. A confiança nos dados |
| **Protótipo** («Protótipo») | Novo projeto no Radar. «Pergunte à Lupa»: uma conversa com respostas guiadas (`use-mock-run`), que usa as funções de `lib/` como ferramentas. O auditor do ficheiro do mês |
| **Roadmap** | A seguir: um IA real (AI SDK) com as funções como ferramentas; o contributo com uma linha de base; uma avaliação antes e depois. Depois: cenários de investimento; a coerência com as políticas do país; mais regiões; áreas novas configuráveis |

## 5. Horário e divisão

| Hora | Dan (dados e lógica) | Ana (interface) |
| --- | --- | --- |
| 22h45–23h | Lê o plano; prompt D0 | Clona o repositório; lê o plano |
| 23h–00h30 | D1 (limpeza), D2 (dados do mundo), D3 (impacto) | A1 (mapcn e navegação), A2 (Início com dados de exemplo) |
| 00h30–02h | D4 (funções e testes), D5 (Radar) | A3 (Ações), A4 (Ação), A5 (Radar) |
| 02h–02h30 | Juntos: I1 (integrar, verificar, publicar) | Juntos |
| 02h30–07h | Dormir | Dormir |
| 07h–09h30 | D6 (Pergunte à Lupa) e correções | A6 (Como medimos) e slides |
| 09h30–10h30 | Juntos: I2 (ronda de verificação) | Juntos |
| 10h30–11h | Código congelado | Código congelado |
| 11h–13h | Guião, 2 ensaios cronometrados, entrega | Guião, 2 ensaios cronometrados, entrega |

**Regras para trabalharem em paralelo:**
- Cada pessoa trabalha no seu ramo (`dan/...` e `ana/...`). Merge no main só com `npm run verificar` verde.
- Os tipos e os nomes dos ficheiros de dados da secção 6 são o contrato. A Ana usa dados de exemplo com esses tipos até as funções do Dan chegarem.
- A Ana faz commits com a conta dela, porque o trabalho de equipa conta na avaliação.

## 6. O contrato: dados e tipos

```ts
// public/data/contexto.json — dados do mundo, um por país (D2)
type Contexto = {
  pais: string; iso3: string; regiao: "África" | "América do Sul" | "Ásia" | "Europa"
  lat: number; lng: number
  indicadores: Record<string, { valor: number | null; ano: number | null; fonte: string }>
}

// public/data/impacto.json — uma linha por ação (D3)
type ImpactoAcao = {
  projeto: string
  necessidade: { indicador: string; valor: number | null; ano: number | null; percentil: number | null }
  escala: { beneficiariosPorMes: number; percentil: number }
  profundidade: { taxaConclusao: number; jovensPor100: number; horasFormacaoPorBenef: number; percentil: number }
  duracao: { crescimento: number; percentil: number }
  custoPorPessoa: { valor: number; percentilInvertido: number }
  confianca: "alta" | "média" | "baixa"
  pontos: { id: string; texto: string }[]
  saude: Record<"relevancia" | "eficacia" | "eficiencia" | "impacto" | "sustentabilidade",
                { nivel: "forte" | "a acompanhar" | "a rever"; frase: string }>
}

// public/data/radar.json — uma linha por país e área (D5)
type RadarCelula = {
  pais: string; area: string; necessidadePercentil: number | null
  evidencia: number | null; estimado: boolean
  quadrante: "Reforçar" | "Repensar ou apoiar" | "Manter" | "Reavaliar"
}
```

**As funções de `lib/`:**

| Função | Ecrã |
| --- | --- |
| `iis(acao, pesos)` | 1–5 |
| `rankingIIS(acoes, pesos)` | 1, 2 |
| `filtrarAcoes(acoes, filtros)` | 2 |
| `leituras(acoes, meses, pesos)` (3 frases, por regras) | 1 |
| `precisaAtencao(acoes)` | 1 |
| `quadrante(celulas, filtroArea)` | 4 |
| `novoProjeto({ pais, area, formato, orcamento })` (protótipo) | 4 |
| `PREDEFINICOES` | 5 |

Cada uma tem um gabarito calculado em Python em `scripts/gabaritos.json`.

## 7. Prompts do Dan (Claude Code, ramo `dan/impacto`)

**D0: plano e limpeza de rumo**
```
Copia ~/Downloads/lupa-fix/PLANO-V2.md para docs/PLANO-V2.md. No docs/PRODUCT.md, acrescenta no fim uma secção «Evolução depois da mentoria (25/11, 22h30)» que resume a secção 1 do plano, sem mexer na ideia inicial datada. Commit e push, para a Ana poder ler o plano.
```

**D1: tirar as análises de voluntários e acertar a linguagem**
```
Lê docs/PLANO-V2.md, secções 1 e 2.4. Num ramo dan/impacto, um commit por passo:
1. Tira da app a unidade «por hora de voluntariado», a «competência certa» do Porquê, o padrão 4 (voluntários reportados contra registados) do ecrã Confiança e os avisos das horas de 2025. Tira também os testes que só testavam essas partes. No commit, escreve o motivo: «falso positivo indicado na mentoria».
2. Em toda a app, troca «estornos» por «correções de despesa» e qualquer tom de suspeita pelos textos da tabela 2.4.
npm run verificar.
```

**D2: dados do mundo (usa as skills data-analysis e exploratory-data-analysis)**
```
Lê docs/PLANO-V2.md, secções 2.3 e 6. Escreve scripts/contexto.py:
- Para os 12 países do projeto (BRA, KEN, IND, PRT, GHA, PER, SEN, BGD, COL, PHL, UGA, MOZ), descarrega da API do Banco Mundial os indicadores SE.LPV.PRIM, SL.UEM.NEET.ZS, SH.UHC.SRVS.CV.XD, IT.NET.USER.ZS, SI.POV.DDAY, SE.PRM.CMPT.ZS, SL.UEM.1524.ZS, PA.NUS.PPPC.RF e SP.POP.TOTL. Usa https://api.worldbank.org/v2/country/<ISO3;...>/indicator/<código>?format=json&mrv=10&per_page=500 e fica com o valor não nulo mais recente de cada país, com o ano.
- Guarda as respostas em bruto em data/raw/contexto/ e escreve public/data/contexto.json com o tipo Contexto: região, latitude e longitude da capital, e a fonte «Banco Mundial, WDI» em cada indicador.
- Faz o perfil com a skill exploratory-data-analysis: vazios por país e indicador, e anos antigos (mais de 5 anos).
Não inventes valores: o que faltar fica null. Mostra-me a tabela país × indicador com os anos. Commit.
```

**D3: o Índice de Impacto Social**
```
Lê docs/PLANO-V2.md, secção 2. Escreve scripts/impacto.py (pandas), que lê data/raw/json, public/data/mensal.json e public/data/contexto.json e escreve public/data/impacto.json com o tipo ImpactoAcao.
- Necessidade: o indicador da área (tabela 2.3), com o sentido certo, em percentil entre os 12.
- Escala, profundidade, duração e custo por pessoa: como na tabela 2.1, sempre em meses comparáveis (janeiro a outubro).
- Confiança e pontos de atenção: as regras e os textos da tabela 2.4. Os pontos comuns a todas as ações (o fim de ano e o dia 27) aparecem uma vez em Como medimos e não contam para a confiança. Contam só os pontos próprios da ação: a subida de fim de ano acima da mediana do portefólio, o custo por atividade mais de 2 vezes a mediana da área (depois de ajustar ao nível de preços), o objetivo que não bate com a área e as correções de despesa acima da mediana. Confiança alta = 0 pontos próprios; média = 1; baixa = 2 ou mais.
- Saúde: as lentes da tabela 2.2, cada uma com um nível e uma frase.
- Acrescenta a scripts/gabaritos.json os IIS das 12 ações nas 4 predefinições e o ranking de cada uma.
Usa a skill data-analysis para verificar as distribuições. Mostra-me a tabela das 12 ações (IIS equilibrado e as 4 dimensões) e as 3 maiores surpresas. Commit.
```

**D4: funções e testes**
```
Lê docs/PLANO-V2.md, secção 6. Em lib/, com testes contra scripts/gabaritos.json: iis, rankingIIS, filtrarAcoes, leituras (3 frases por regras: a ação com mais impacto, a que precisa de atenção e o padrão de fim de ano), precisaAtencao e PREDEFINICOES. Se um gabarito falhar, não mudes o valor esperado: para e diz-me. Um commit por função. npm run verificar.
```

**D5: o Radar**
```
Lê docs/PLANO-V2.md, secções 3 e 6. Acrescenta ao scripts/impacto.py o public/data/radar.json (país × área):
- a necessidade em percentil;
- a evidência: o IIS médio das ações dessa área nesse país, ou da mesma área noutros países com estimado = true;
- o quadrante, com corte nos percentis 50.
Depois:
- lib/quadrante e lib/novoProjeto. O novoProjeto é um protótipo: o alcance é o orçamento ÷ o custo por pessoa da área, ajustado ao nível de preços do país; a leitura é avançar, pilotar ou rever, com o motivo.
- Gabaritos e testes. Commit. Merge no main com npm run verificar verde.
```

**D6, de manhã: Pergunte à Lupa (protótipo)**
```
Protótipo com a etiqueta «Protótipo»: «Pergunte à Lupa», um painel de conversa no Início com 4 perguntas sugeridas (por exemplo, «Que ação tem mais impacto em África?» ou «Onde abrir um projeto de formação?»).
- Usa o hooks/use-mock-run do setup do professor (copia-o de ~/Downloads ou do repositório ledevmacedo/main-base-setup).
- As respostas são montadas com as funções de lib/, com os passos de ferramenta à vista: iis, quadrante e leituras.
- Sem chave de API.
No roadmap do ecrã: «Com uma chave, o AI SDK chama estas mesmas funções.» Commit.
```

## 8. Prompts da Ana (Claude Code, com a conta dela, ramo `ana/interface`)

**A0: preparar**
```
gh repo clone daaansantana/impacto-social e npm ci. Lê docs/PLANO-V2.md (todo), docs/PRODUCT.md e AGENTS.md. Usa as skills de .claude/skills: shadcn, ui-ux-pro-max, ui-skills-root e vercel-react-best-practices. Diz-me em 5 linhas o que vais construir.
```

**A1: mapa e navegação**
```
Num ramo ana/interface:
1. Instala o mapcn (componentes de mapa sobre MapLibre, no estilo shadcn). Segue as instruções de mapcn.dev/docs/installation: npx shadcn@latest add <o registry que lá estiver>. Diz-me antes que dependências entram e porquê.
2. A navegação nova: Início, Ações, Radar e Como medimos. O ecrã da Ação abre a partir de Ações. Usa o PageHeader e as COLUMNS que já existem.
3. Um componente MapaAcoes que recebe props (pontos com latitude, longitude, nome, IIS e cor) e mostra os marcadores com popup. Sem chave de API.
npm run verificar. Commit.
```

**A2: Início**
```
Ecrã Início, segundo a secção 3 do PLANO-V2, com dados de exemplo tipados como ImpactoAcao e Contexto (secção 6) até as funções do Dan chegarem:
- Em cima, em grande: o IIS do portefólio, com uma frase.
- 3 leituras em cartões, cada uma com um link.
- O MapaAcoes com as 12 ações (a cor é o IIS).
- «Precisa de atenção», com até 3 ações.
Pouco texto, nada de painel denso: a regra é «a resposta em grande, o detalhe a pedido». Estados a carregar, erro e vazio. Vê o ecrã a 390 e a 1440 px. Commit.
```

**A3: Ações**
```
Ecrã Ações:
- Uma lista de cartões, com nome, país, área, o IIS (barra de 0 a 100), a saúde (3 cores com texto) e a confiança.
- Filtros: região, país, área, saúde e confiança. Ordenação por IIS, escala, profundidade ou necessidade.
- Os filtros ficam no URL (para se poder partilhar).
- Num ecrã estreito, os filtros abrem numa folha (sheet).
Commit.
```

**A4: Ação**
```
Ecrã Ação (/acoes/[id]), segundo a secção 3:
1. Resumo: o quê (os 3 tipos de atividade), onde (país, região e mini-mapa), formato e público. Se faltar o perfil dos participantes, diz «Sem dado: pedir ao parceiro».
2. O IIS, com as 4 dimensões em barras e uma frase por dimensão; a fonte e o ano da necessidade.
3. A saúde da ação: as 5 lentes, cada uma com um nível e uma frase.
4. Dobrados:
   - a evolução em meses comparáveis, com novembro e dezembro marcados;
   - os pontos de atenção (textos da tabela 2.4);
   - «O que pedir ao parceiro», com um botão de email;
   - «O que aprendemos».
Commit.
```

**A5: Radar**
```
Ecrã Radar:
- Um seletor de área.
- O mapa com os 12 países, em que a cor é a necessidade da área e o tamanho é a evidência.
- O quadrante necessidade × evidência, com 4 zonas e um texto curto em cada uma; os pontos estimados ficam a tracejado com a palavra «estimado».
- A lista «Onde faria mais diferença».
- Um painel «Novo projeto», com a etiqueta «Protótipo»: um formulário (país, área, formato, orçamento) e o resultado de lib/novoProjeto.
Liga às funções do Dan quando chegarem. Commit, e merge no main com npm run verificar verde.
```

**A6, de manhã: Como medimos e slides**
```
Ecrã Como medimos:
- As 4 predefinições e 4 réguas de pesos, com o ranking ao vivo.
- As definições das dimensões e as fontes (Impact Frontiers, OCDE e Banco Mundial).
- Por baixo, a confiança nos dados e o auditor (já existem: move-os para aqui).
- O texto «Índice nosso, inspirado nas 5 dimensões do impacto».
Commit. Depois, os 9 slides a partir do guião (docs/APRESENTACAO.md).
```

## 9. Prompts para os dois

**I1, às 2h: integrar e publicar**
```
Faz merge de dan/impacto e de ana/interface no main. Liga os ecrãs da Ana às funções do Dan e tira os dados de exemplo. npm run verificar. Vê os 5 ecrãs a 390 e a 1440 px, com a consola limpa. Push (a Vercel publica sozinha). Diz-me o link e o que falhou.
```

**I2, às 9h30: ronda de verificação, sem alterar ficheiros**
```
Ronda de verificação sem alterar ficheiros:
1. npm run verificar.
2. Compara a app com docs/REQUISITOS.md, linha a linha, e com a secção 1 do docs/PLANO-V2.md (o que o professor pediu): o impacto social como KPI, sem análises de voluntários, linguagem sem acusações, os países da base, uma interface amiga.
3. Procura números sem fonte e frases que os dados não sustentem.
Devolve uma lista curta, por ordem de risco.
```

## 10. O que muda no pitch

1. **A persona:** a Helena precisa de saber se as ações mudam a vida das pessoas, não só quanto custam.
2. **O achado (o professor confirmou):** o fim de ano sobe cerca de 55% em todas as regiões e em todos os tipos de atividade, sem custo, até com as escolas fechadas. Por isso comparamos meses comparáveis.
3. **Como medimos:** as 5 dimensões do impacto e as lentes da OCDE, com pesos que a Helena escolhe.
4. **A demo:** Início → uma ação → Radar → Novo projeto (protótipo).
5. **O roadmap:** a IA real, o contributo com uma linha de base, a avaliação antes e depois e as áreas novas.

## Fontes

- Impact Frontiers, as 5 dimensões do impacto: https://impactfrontiers.org/norms/five-dimensions-of-impact/
- IRIS+ e as 5 dimensões (GIIN): https://pdf.usaid.gov/pdf_docs/PA00W77T.pdf
- OCDE, critérios de avaliação: https://www.oecd.org/en/publications/applying-evaluation-criteria-thoughtfully_543e84ed-en.html
- Banco Mundial, pobreza de aprendizagem: https://www.worldbank.org/en/topic/education/brief/what-is-learning-poverty
- Banco Mundial, NEET: https://databank.worldbank.org/metadataglossary/world-development-indicators/series/SL.UEM.NEET.ZS
- mapcn: https://github.com/anmolsaini16/mapcn
