# Requisitos: Hackathon 24 h, Desafio 05 (Impacto social)

Fonte: o enunciado da organização (Hackathon.html) e os dados do `impacto.zip`. O que não está escrito no enunciado vai para as perguntas, no fim.

## Requisitos

| # | Requisito (palavras do enunciado) | Obrigatório ou extra | Como se verifica | Onde | Peso na avaliação |
| --- | --- | --- | --- | --- | --- |
| 1 | «Desenvolvam uma solução para comparar o alcance e a eficiência dos projetos.» | Obrigatório | À mão: demo com os 12 projetos lado a lado | App, ecrã de comparação | Adequação ao problema; Análise de dados |
| 2 | «Relacionem despesas, horas de voluntariado e métricas de impacto por projeto.» | Obrigatório | Gabaritos: funções de `lib/` contra os valores calculados em Python | `lib/`, ecrã do projeto | Análise de dados |
| 3 | «Distingam impacto total de eficiência» | Obrigatório | Gabaritos e à mão: o total e a eficiência aparecem separados, com os dois rankings | Ecrã de comparação | Análise de dados; Adequação |
| 4 | «comparem medidas com unidades compatíveis» | Obrigatório | Teste: nenhuma conta soma unidades diferentes; as unidades ficam normalizadas | `lib/`, `docs/SPEC.md` | Análise de dados |
| 5 | «Validem referências, datas, duplicados e estornos antes de tirar conclusões.» | Obrigatório | Script de validação e gabaritos dos contadores (datas, estornos, duplicados, referências) | `scripts/`, ecrã de qualidade dos dados | Análise de dados (qualidade dos dados) |
| 6 | «Tens 24 horas para desenvolver uma solução enquadrada no tema.» | Obrigatório | À mão: todos os commits entre 25/11 às 14h e o fim da prova | Repositório `impacto-social` | Regra |
| 7 | «Suporte visual: Ideia ou solução inicial + trabalho implementado» | Obrigatório | À mão: slides com a ideia e a demo do que está implementado | Slides, app publicada | Apresentação: suporte; Complexidade técnica |
| 8 | «Duração: 5 minutos» | Obrigatório | Ensaio cronometrado | Guião | Apresentação: exposição |
| 9 | «Quem apresenta: Todos os elementos do grupo» | Obrigatório | Guião com as falas dos dois e os tempos | Guião | Apresentação: exposição (divisão dos temas e do tempo) |
| 10 | «Línguas: Inglês ou português» | Obrigatório (escolher uma) | À mão | App e slides | — |
| 11 | «Todos os membros do grupo devem participar nas diferentes fases da solução.» | Obrigatório | À mão: tarefas e commits dos dois em cada fase | Repositório, quadro de tarefas | Trabalho de equipa |
| 12 | «Complexidade técnica da solução»: «relativamente ao tempo disponível» | Critério | À mão | App | Técnico 01 |
| 13 | «Qualidade da UX/UI»: «Facilidade para concluir as tarefas», «Aspeto gráfico», «Coesão entre os componentes» | Critério | `npm run capturas` a 390 e 1440 px e um teste de tarefas com alguém de fora | App | Técnico 02 |
| 14 | «Criatividade da solução»: «melhorar soluções semelhantes», «formas novas e mais otimizadas de executar tarefas» | Critério | À mão: no pitch, comparar com a forma atual (folha de cálculo ou relatório) | Slides | Técnico 03 |
| 15 | «Análise de dados»: «Relevância e qualidade dos dados», «analisar e interpretar», «fundamentar a solução» | Critério | `docs/HIPOTESES.md` com resultados; cada número no ecrã com gabarito | `docs/`, app | Técnico 05 |
| 16 | «Fator desempate: O projeto corresponde à ideia inicial?» | Extra (desempate) | À mão: a ideia inicial escrita e datada em `docs/PRODUCT.md` e mostrada no pitch | `docs/PRODUCT.md`, slides | Desempate |
| 17 | «Cada grupo dispõe de um plafond de 15 minutos por dia com cada formador.» | Recurso | À mão: usar para validar o esboço e as dúvidas dos dados | — | — |
| 18 | «O making-of da Hackathon será filmado.» | Informação | — | — | — |

## 1. Critérios de avaliação

- **Técnicos (5):** complexidade técnica, qualidade da UX/UI, criatividade, adequação ao problema e análise de dados.
- **Comportamentais (3):** exposição, suporte e trabalho de equipa.
- **Desempate:** o projeto corresponde à ideia inicial.
- **Pesos:** o enunciado não os dá (pergunta 2).

## 2. Entregáveis e horas

- **Início:** 25/11 às 14h.
- **Duração:** 24 horas, por isso o fim previsto é 26/11 às 14h (pergunta 1).
- **Pitch:** no fim das 24 horas, com 5 minutos, apresentado pelos dois, em português ou inglês. O suporte visual tem de mostrar a ideia inicial e o trabalho implementado.
- **Falta no enunciado:** a forma de entregar o código, a app e os slides (pergunta 1).
- **Plano do kit:** se o fim for às 14h, todas as horas passam 1 hora para a frente. A decisão fica às 16h, o site no ar às 20h e o código congelado às 11h.

## 3. Perguntas para a organização

**Regras**

1. A que horas é a entrega e o pitch, e o que se entrega (o link do repositório, a app, os slides)?
2. Qual é o peso de cada critério?
3. Pode usar-se um template nosso, só com estrutura e sem nada do desafio, criado antes das 14h?
4. Pode usar-se IA no desenvolvimento?
5. A stack é livre? A app tem de estar publicada e de ser mostrada ao vivo?
6. No protótipo, podemos usar dados públicos de fora e dados simulados, com etiqueta?

**Dados (para os 15 minutos com o formador)**

7. Os beneficiários de cada mês são pessoas novas ou podem repetir-se? A resposta decide se se podem somar os meses.
8. As 738 despesas negativas são estornos, que se abatem ao projeto?
9. As 301 alocações do projeto P99, que não existe na tabela de projetos, são um projeto encerrado ou um erro?
10. As horas de voluntariado de 2025 estão completas? Caem 85% face a 2024, enquanto os beneficiários sobem 24%.
11. As `horas_disponiveis` de cada voluntário são por ano ou por mês?
12. Nos projetos, os `objetivos` não batem com a `area_foco`: P01, por exemplo, é de educação e tem como objetivo a saúde preventiva. Qual dos dois vale?
