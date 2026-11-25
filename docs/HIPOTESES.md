# Hipóteses: Desafio 05 (Impacto social)

Escritas antes das contas e testadas com `scripts/analise.py` sobre os dados limpos (regras em `docs/PERFIL.md`). Período: janeiro de 2024 a dezembro de 2025; data de referência: 27/12/2025. Cada resultado traz o número e o denominador.

**Unidade de impacto:** «beneficiários» é a soma dos valores mensais da métrica `beneficiarios`. Se as mesmas pessoas se repetirem de mês para mês, o total conta pessoas-mês (pergunta 7 em `docs/REQUISITOS.md`).

**Base:** despesa líquida de 41,41 M€, 18 878 beneficiários e 643 152 horas de voluntariado (sem o P99). Em média, cada beneficiário custa 2 193,66 €.

## Resumo

| # | Hipótese | Resultado |
| --- | --- | --- |
| H1 | Impacto total e eficiência dão rankings diferentes | **Confirmada:** os maiores são os menos eficientes |
| H2 | Limpar os dados muda o ranking | **Confirmada:** 9 de 12 projetos mudam de posição |
| H3 | Mais horas de voluntariado dão mais impacto | **Inconclusiva:** os registos de 2025 parecem incompletos |
| H4 | O investimento aprovado vai para os mais eficientes | **Rejeitada:** vai mais para os menos eficientes |
| H5 | Os voluntários são alocados pela competência | **Rejeitada:** só 43,4% das alocações |
| H6 | Algum projeto foge ao orçamento | **Rejeitada:** todos gastam 89–91% |

## H1. Impacto total e eficiência

- **A pergunta da gestora:** os projetos que chegam a mais gente são os que usam melhor o dinheiro?
- **Hipótese:** o ranking por total de beneficiários é diferente do ranking por custo por beneficiário.
- **Conta:** por projeto, a soma de `beneficiarios` (unidade normalizada, 24 meses) e a despesa líquida (com os estornos). Depois, o custo por beneficiário, a razão entre o maior e o menor, e o Spearman entre o total e os beneficiários por euro.
- **Critério:** confirma-se se a razão for de pelo menos 2 e o Spearman ficar abaixo de 0,5.
- **Resultado: confirmada.**
  - O custo por beneficiário vai de 1 312,84 € (P07, Senegal) a 3 908,58 € (P01, Brasil): 2,98 vezes mais.
  - Spearman = −0,68 (p = 0,015, n = 12): quanto maior o projeto, menos eficiente.
  - Ranking por total: P01, P10, P05, P12, P02, P08, P03, P09, P04, P07, P06, P11.
  - Ranking por eficiência: P07, P11, P10, P06, P03, P04, P08, P09, P12, P02, P05, P01.
  - O P01 é o primeiro no total e o último na eficiência: tem 38,5% da despesa e chega a 21,6% dos beneficiários.
  - Sem o P01, a diferença baixa para 1,51 vezes e o Spearman para −0,58 (p = 0,060).

## H2. A limpeza muda a conclusão

- **A pergunta da gestora:** posso confiar no ranking sem limpar os dados?
- **Hipótese:** limpar as datas e as unidades muda a posição de pelo menos 2 projetos no custo por beneficiário.
- **Conta:** o ranking com um leitor de datas estrito (só AAAA-MM-DD) e a unidade escrita à letra, contra o ranking com os dados limpos.
- **Critério:** confirma-se se pelo menos 2 projetos mudarem de posição.
- **Resultado: confirmada.**
  - O leitor estrito perde 20,5% da despesa (8,50 M€ de 41,41 M€).
  - Mudam de posição 9 de 12 projetos; o Spearman entre os dois rankings é 0,93.
  - O custo por beneficiário fica subestimado entre 3,6% (P01) e 20,0% (P04 e P08).
  - As pontas não mudam: o P07 continua em primeiro e o P01 em último.
  - Ignorar os estornos muda o custo em 2,6%, em média, e não muda nenhuma posição.

## H3. Horas de voluntariado e impacto

- **A pergunta da gestora:** mais horas de voluntariado dão mais impacto?
- **Hipótese:** onde há mais horas de voluntariado há mais beneficiários, entre projetos e mês a mês.
- **Conta:**
  - Entre projetos: o Spearman entre as horas realizadas (alocações válidas) e os beneficiários.
  - Dentro de cada projeto: as horas de cada alocação, repartidas pelos dias, contra os beneficiários do mês, em desvios à média do projeto.
- **Critério:** confirma-se se o Spearman for de pelo menos 0,5 entre projetos e de pelo menos 0,3 mês a mês.
- **Resultado: inconclusiva.**
  - Entre projetos acompanham-se: Spearman = 1,00 (n = 12).
  - Mês a mês, o sinal inverte: Spearman = −0,52 (p < 0,001, n = 270 meses de projeto).
  - As horas registadas caem de 558 442 em 2024 para 84 710 em 2025 (−85%). No mesmo período, os beneficiários sobem de 8 444 para 10 434 (+24%) e os voluntários ativos que os projetos reportam ficam em cerca de 64 por mês.
  - As alocações iniciadas também caem, de 4 937 em 2024 para 520 em 2025.
- **Leitura:** os registos de horas de 2025 parecem incompletos (pergunta 10 em `docs/REQUISITOS.md`).
- **A unidade muda a resposta.** O ranking por euro e o ranking por hora de voluntariado quase não se relacionam (Spearman 0,11). O P10 é o terceiro por euro e o 11.º por hora. O P08 é o primeiro por hora e o sétimo por euro.

## H4. O dinheiro novo segue a eficiência

- **A pergunta da gestora:** o investimento novo vai para onde rende mais?
- **Hipótese:** os planos de investimento aprovados concentram-se nos projetos mais eficientes.
- **Conta:** a soma de `valor_previsto` dos planos aprovados, em execução ou concluídos, por projeto. Depois, o Spearman com os beneficiários por euro e a quota dos 4 projetos mais eficientes e dos 4 menos eficientes.
- **Critério:** confirma-se se o Spearman for de pelo menos 0,5 e os 4 mais eficientes receberem mais de um terço.
- **Resultado: rejeitada.**
  - Entram 83 de 120 planos, no valor de 10,34 M€.
  - Spearman = −0,34 (p = 0,29).
  - Os 4 mais eficientes (P07, P11, P10 e P06) recebem 25,1% (2,60 M€ de 10,34 M€).
  - Os 4 menos eficientes (P01, P05, P02 e P12) recebem 42,9% (4,43 M€).
  - Nos planos de ampliação, os 4 menos eficientes recebem 35,0% (0,94 M€ de 2,69 M€).
  - O P10, o terceiro mais eficiente, é o que tem menos investimento: 0,24 M€, e nenhum plano de ampliação.
- **E se:** passar os 4,43 M€ dos 4 menos eficientes para os 4 mais eficientes, ao custo médio de cada um, daria mais 953 beneficiários (+5,0% dos 18 878 dos 24 meses).
  - Pressuposto: o custo de um beneficiário a mais é igual ao custo médio.
  - Limite: os parceiros do P07 e do P10 têm a menor capacidade operacional (36).

## H5. A pessoa certa no projeto certo

- **A pergunta da gestora:** estou a pôr as pessoas certas nos projetos certos?
- **Hipótese:** a maioria das alocações junta um voluntário com competência na área do projeto.
- **Conta:** a percentagem de alocações válidas em que as competências do voluntário incluem a `area_foco` do projeto.
- **Critério:** confirma-se se for de pelo menos 50%.
- **Resultado: rejeitada.**
  - Só 43,4% das alocações (2 367 de 5 457) juntam a competência certa ao projeto.
  - Os projetos dividem-se em dois grupos. P04, P06, P07, P09 e P11 têm entre 67% e 73%; os outros 7 têm entre 34% e 38%.
  - Os projetos com mais competências certas tendem a ser mais eficientes: Spearman 0,53 (p = 0,075). É um sinal, não uma prova.
  - Há 832 dos 3 000 voluntários (27,7%) que nunca foram alocados.
  - 86,3% dos voluntários têm pelo menos uma competência numa das áreas dos projetos.

## H6. A despesa e o orçamento

- **A pergunta da gestora:** os projetos gastam o que estava orçamentado?
- **Hipótese:** pelo menos um projeto afasta-se mais de 25% do orçamento nos dois anos.
- **Conta:** a despesa líquida a dividir pelo dobro de `orcamento_anual`.
- **Critério:** confirma-se se algum projeto ficar abaixo de 75% ou acima de 125%.
- **Resultado: rejeitada.**
  - Todos os projetos ficam entre 89% e 91%.
  - Em todos, 2024 fica entre 78% e 81% e 2025 entre 98% e 101%.
- **Leitura:** o problema não é o controlo do orçamento. É o que cada euro compra.

## Outros sinais

- **Coordenação:** nos projetos menos eficientes, as reuniões pesam mais face às horas de atividade (Spearman −0,78, p = 0,003). O P01 tem 0,050 horas de reunião por hora de atividade; o P11, 0,017.
- **Capacidade do parceiro:** não se relaciona com a eficiência (Spearman −0,14, p = 0,67).
- **Taxa de conclusão:** não se relaciona com a eficiência (Spearman 0,31, p = 0,32).
- **Outras unidades:** o custo por beneficiário dá rankings parecidos com o custo por jovem formado (Spearman 0,77) e com o custo por hora de formação (0,74).

## O achado

O dinheiro novo não segue a eficiência. Os 4 projetos menos eficientes recebem 43% do investimento aprovado e os 4 mais eficientes recebem 25%. Um beneficiário custa 2,98 vezes mais no projeto mais caro do que no mais barato.
