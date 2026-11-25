# Produto: Lupa (nome de trabalho)

## A ideia inicial (25/11/2026, 17h45)

> Uma app que compara o alcance e a eficiência dos 12 projetos com números limpos e meses comparáveis. Mostra o que a limpeza e os padrões escondidos mudam, simula para onde deve ir o próximo euro e audita cada ficheiro novo que os parceiros enviam. Assim, a gestora decide com números em que pode confiar.

Este parágrafo não muda até à entrega: o critério de desempate é «o projeto corresponde à ideia inicial?».

## Persona

**Helena Duarte**, gestora do programa de impacto social da empresa, em Lisboa. É um nome inventado, que não existe na base.

O que se sabe pelos dados:

- Gere 12 projetos em 12 países, cada um com um parceiro local.
- Gasta cerca de 20,7 M€ por ano (41,41 M€ em 2 anos).
- Coordena 3 000 voluntários da empresa, de 6 departamentos e 6 cidades: Berlim, Londres, Munique, Frankfurt, Porto e Lisboa.
- Recebe todos os meses 6 métricas de cada parceiro, recolhidas de 4 formas.
- Decide os planos de investimento: há 120 planos, dos quais 83 estão aprovados, em execução ou concluídos (10,34 M€).

**As perguntas que faz todos os meses**, nas palavras dela:

1. «Onde é que cada euro chega a mais gente?»
2. «O que se passa neste projeto?»
3. «Se eu mudar o investimento, quantas pessoas ganho?»
4. «Posso confiar nos números deste mês?»

**Uma história.** Em janeiro chegam os relatórios de dezembro, com recorde de beneficiários em todos os projetos. A Helena prepara-se para aprovar mais dinheiro para os projetos que parecem crescer. Mas dezembro engana: as atividades sobem 56% e os beneficiários 64% sem gastar mais um euro, até com as escolas fechadas. E o dinheiro novo já está a ir mais para os projetos menos eficientes: os 4 menos eficientes recebem 43% e os 4 mais eficientes 25%.

## O problema numa frase

A Helena decide para onde vai o dinheiro com relatórios que misturam formatos, escondem estornos e incham no fim do ano. Por isso, o investimento não segue a eficiência, e um beneficiário chega a custar 3 vezes mais num projeto do que noutro.

## Os três caminhos e a escolha

- **A. Cada euro, mais pessoas: escolhido.** Responde ao enunciado ponto por ponto e assenta nos achados.
- **B. A pessoa certa no projeto certo:** fica no roadmap. A alocação parece feita ao acaso, mas a ligação à eficiência não está provada.
- **C. Números em que se pode confiar:** entra no núcleo, como ecrã de confiança e como protótipo do auditor.

Detalhe em `docs/CAMINHOS.md`.

## Ecrãs (um por pergunta)

| # | Ecrã | Pergunta | O que mostra em grande | Detalhes, dobrados |
| --- | --- | --- | --- | --- |
| 1 | Portefólio | Onde é que cada euro chega a mais gente? | O ranking de eficiência e o gráfico de alcance contra eficiência | A unidade (por euro, por hora de voluntariado, por jovem formado) e o interruptor «meses comparáveis», ligado por omissão |
| 2 | Projeto | O que se passa neste projeto? | O custo por beneficiário e a evolução mês a mês | Despesa e estornos; horas; métricas; avisos (fim de ano, P99); o porquê (custo por atividade, coordenação, competência certa) |
| 3 | Simulador | Se eu mudar o investimento, quantas pessoas ganho? | Os beneficiários a mais por ano | Mover dinheiro entre projetos, os pressupostos à vista (custo marginal, parte movida) e os três cenários |
| 4 | Confiança nos dados | Posso confiar nos números deste mês? | A nota genérica (A) ao lado da nota real | A limpeza, os 4 padrões e o protótipo do auditor |

## KPI: beneficiários a mais por ano, com o mesmo investimento aprovado

**A conta:** passar o investimento aprovado dos 4 projetos menos eficientes (P01, P02, P05 e P12) para os 4 mais eficientes (P07, P11, P10 e P06), repartido por igual. O custo de cada beneficiário é o de janeiro a outubro, sem o pico de fim de ano. O valor em euros é o custo médio desses meses (2 450,89 €) vezes os beneficiários a mais.

| Cenário | Pressupostos | Beneficiários a mais por ano | Valor equivalente por ano |
| --- | --- | ---: | ---: |
| Prudente | Move-se metade; um beneficiário a mais custa +20% | 113 | 0,28 M€ |
| Provável | Move-se tudo; um beneficiário a mais custa +20% | 227 | 0,56 M€ |
| Otimista | Move-se tudo; custa o mesmo que a média | 458 | 1,12 M€ |

**Ponto de equilíbrio:** a mudança compensa enquanto um beneficiário a mais nos projetos que recebem custar menos de 1,49 vezes o custo médio deles.

**Limite:** os parceiros do P07 e do P10 têm a menor capacidade operacional (36). O simulador mostra-o.

## Implementado, protótipo e roadmap

- **Implementado** (dados reais, com gabaritos):
  - os ecrãs 1 a 3;
  - o ecrã 4 com a nota de qualidade, a limpeza e os 4 padrões.
- **Protótipo** (com a etiqueta «Protótipo»): o auditor do ficheiro do mês.
  - Carrega-se um CSV, por exemplo `public/demo/atividades-P07.csv`.
  - O auditor verifica as datas, os dias 28 a 31, os domingos, os picos, os estornos, os duplicados, as referências e as grafias.
  - No fim prepara a mensagem de correção ao parceiro, por email.
- **Roadmap:**
  - Hoje: comparar, simular e auditar.
  - A seguir:
    - uma proposta de distribuição do investimento que respeita a capacidade de cada parceiro;
    - a auditoria automática todos os meses.
  - Depois:
    - escolher os voluntários pela competência;
    - ligação aos sistemas de despesas;
    - o custo real de um beneficiário a mais, com mais anos de dados.

## Divisão do trabalho

- **Dan:** os dados, as funções de `lib/`, os gabaritos, o simulador e o auditor; no pitch, a história dos dados.
- **Ana:** o esboço, os ecrãs, os estados, o telemóvel e os slides; no pitch, a demo.

## Fora do âmbito

- Previsões mês a mês: os recursos não explicam o impacto de um mês para o outro (`docs/RELACOES.md`).
- O campo «resultado» das atividades, porque não traz informação.
- A métrica `voluntarios_ativos`, porque não bate com as alocações.
