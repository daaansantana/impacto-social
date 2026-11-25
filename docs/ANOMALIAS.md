# Anomalias: o padrão escondido nos dados

Procura feita com `scripts/anomalias.py` sobre as 10 tabelas. Verificou-se o tempo (por mês, dia da semana e dia do mês), os feriados de cada país, os valores e as ligações entre tabelas. As fontes de fora estão no fim.

## Resumo

| # | Anomalia | Onde aparece | Prova | Força |
| --- | --- | --- | --- | --- |
| 1 | **Pico de fim de ano:** em novembro e dezembro, as atividades sobem 56% e os beneficiários 64%, sem mais despesa | Atividades e métricas, nos 12 projetos e nos 2 anos | O custo por beneficiário cai 42,6% nesses meses | Forte |
| 2 | **O mês acaba no dia 27:** não há nenhum registo nos dias 28, 29, 30 ou 31 | Atividades, despesas, coordenação e planos | 0 de 47 781 registos, quando o esperado eram cerca de 5 400 | Forte |
| 3 | **O domingo vale o mesmo que a segunda:** as datas não seguem a semana de trabalho | Todas as tabelas com datas | 14,1% das aulas e 14,3% das despesas são a um domingo | Forte |
| 4 | **Os voluntários reportados não batem com os registados** | Métricas contra alocações | Os registos caem de 2 084 voluntários ativos para 50; o reportado fica estável | Forte |

## 1. Pico de fim de ano

**O que se vê**

- **Atividades por mês (sem duplicados):** 1 087 de janeiro a outubro e 1 693 em novembro e dezembro, nos dois anos (+56%).
- **Beneficiários por mês:** 711 de janeiro a outubro e 1 164 em novembro e dezembro (+64%); em 2024, de 631 para 1 065 (+69%), e em 2025, de 791 para 1 262 (+60%).
- **Em todos os projetos:** as atividades sobem entre 1,38 e 1,75 vezes e os beneficiários entre 1,37 e 1,83 vezes. Sobem também todos os 18 tipos de atividade, entre 1,38 e 1,72 vezes.
- **O que não sobe:** a despesa (novembro e dezembro têm 15,8% da despesa, para 2 meses em 12, ou seja, 16,7%), as horas de voluntariado, as reuniões, nem os participantes e as horas por atividade (37 e 5,5, iguais ao resto do ano).
- **Não são cópias:** as atividades a mais não repetem registos de outros meses (0,0% com um registo gémeo).
- **O efeito na eficiência:** um beneficiário custa 2 451 € de janeiro a outubro e 1 408 € em novembro e dezembro (−42,6%).

**Teste com fontes de fora: os calendários escolares**

As atividades escolares (aula, apoio ao estudo e oficina educativa) só existem em três projetos: P01 (Brasil), P07 (Senegal) e P10 (Filipinas). Sobem 56%, 51% e 67% em novembro e dezembro. Mas, nessa altura, há escolas fechadas:

- **Filipinas:** pausa a meio do ano de 25 a 29 de novembro de 2024 e férias de Natal a partir de 21 de dezembro de 2024. Em 2025, as férias de Natal foram de 20 de dezembro a 4 de janeiro.
- **Brasil** (rede estadual de São Paulo, no Sudeste): o ano letivo terminou a 17 de dezembro de 2024 e a 12 de dezembro de 2025. As férias de verão vão até fevereiro.

Mais aulas quando as escolas fecham não é um efeito natural da época. A leitura mais provável é que os relatórios de fim de ano estejam inflacionados, ou que o registo seja feito de outra forma no fim do ano (pergunta 1).

**O que muda nas conclusões**

- **O ranking aguenta:** sem novembro e dezembro, 6 projetos trocam de lugar com o vizinho, mas o Spearman é 0,98. Os 4 primeiros e o último ficam iguais.
- **Os valores absolutos não aguentam:** qualquer média que misture meses fica mais otimista do que o resto do ano.
- **Regra:** comparar meses comparáveis. Mostrar janeiro a outubro como referência e assinalar novembro e dezembro.

## 2. O mês acaba no dia 27

- **O que se vê:** atividades (29 061), despesas (18 000), reuniões (600) e planos (120) nunca caem num dia 28, 29, 30 ou 31. O último registo da base é a 27/12/2025.
- **O esperado:** os dias 28 a 31 são 83 dos 731 dias (11,4%), por isso deviam ter cerca de 5 400 registos. Têm 0.
- **A exceção:** as datas de início e de fim das alocações chegam ao dia 31.
- **Duas leituras possíveis:**
  - Os dados são cortados todos os meses ao dia 27, e falta cerca de 11% de cada mês.
  - Os dias 28 a 31 são lançados no mês seguinte (pergunta 2).
- **Regra:** analisar por mês, nunca por dia; uma média por dia divide por 27. Se faltar o fim do mês, a despesa fica cerca de 11% abaixo da real, enquanto as métricas, que são mensais, ficam completas.

## 3. O domingo vale o mesmo que a segunda

- **O que se vê:** em todas as tabelas, 28 a 30% dos registos caem ao fim de semana, a mesma proporção que dariam datas ao acaso (28,6%). Ao domingo há 14,1% das aulas, 14,3% das despesas e 13,3% das reuniões.
- **Porque é estranho:** aulas e reuniões de equipa ao domingo tantas vezes como à segunda não é um padrão real de trabalho.
- **Regra:** a data de cada registo vale para o mês, não para o dia. Não se fazem análises por dia da semana.

## 4. Voluntários reportados contra voluntários registados

- **Nas alocações:** os voluntários ativos caem todos os meses, de 2 084 em janeiro de 2024 para 50 em dezembro de 2025. O início das alocações segue o mesmo caminho: 2 196 em janeiro de 2024 e 0 em dezembro de 2025.
- **Na métrica `voluntarios_ativos`:** a soma dos 12 projetos fica entre cerca de 600 e 1 000 por mês, sem tendência; foi de 919 em janeiro de 2024 e de 865 em dezembro de 2025. A exceção é setembro de 2025, com 347.
- **Por projeto:** a métrica dá entre 52 e 81 por mês em todos os projetos, mas os projetos têm entre 113 (P11) e 779 (P01) voluntários diferentes alocados. A métrica não acompanha a dimensão do projeto.
- **Regra:** as horas de voluntariado vêm das alocações, com aviso para 2025. A métrica `voluntarios_ativos` fica de fora das contas (pergunta 3).

## Testado e descartado

- **Feriados nacionais** (calendários dos 12 países, da biblioteca `holidays`): os registos caem em feriados na mesma proporção que nos outros dias.
- **Lei de Benford:** não se aplica, porque os valores de cada projeto vivem num intervalo estreito.
- **Valores redondos:** 1 em 17 262.
- **Valores acumulados abaixo de limiares de aprovação** (5, 10, 15 e 20 mil euros): não há.
- **Pagamentos duplicados:** 5 pares com o mesmo valor, projeto e categoria, o que fica dentro do que o acaso dá.
- **Estornos:** espalhados por projeto, categoria e mês; não espelham despesas de outros projetos (50 em 738).
- **Voluntários em dois projetos ao mesmo tempo:** 0. O máximo é de 4,1 horas por dia.
- **Método de recolha:** há 3 diferenças com p < 0,05 em 18 testes, mas nenhuma resiste à correção para testes múltiplos.

**Pequenas falhas a registar no `docs/SPEC.md`**

- Uma reunião com 25,23 horas num só dia (P01, 02/12/2024).
- O tipo de atividade « producao_material» tem um espaço no início em todas as 750 linhas.
- 94 mentores e formadores têm 0 anos de experiência.
- A estrutura é demasiado regular: todos os projetos têm 1 500 despesas, 3 tipos de atividade e 144 linhas de métricas.

## O que isto dá à app (caminho A)

- **Implementado:** um interruptor «meses comparáveis» no Portefólio, com janeiro a outubro como referência, e no ecrã «Confiança nos dados» os quatro achados com o número de cada um.
- **Protótipo (ideia ousada):** um auditor de dados. Cada ficheiro novo passa por quatro verificações: picos mensais com z-score, dias do mês em falta, a distribuição pelos dias da semana e o cruzamento do que é reportado com o que está registado. O auditor teria encontrado sozinho estes quatro padrões, e isso dá uma boa frase para o pitch.

## Perguntas para o formador

1. Em novembro e dezembro, as atividades e os beneficiários sobem cerca de 60%, sem mais despesa e com as escolas fechadas no Brasil e nas Filipinas. É uma campanha real ou um efeito dos relatórios de fim de ano?
2. Não há registos depois do dia 27 de cada mês. Os dias 28 a 31 faltam ou passam para o mês seguinte?
3. A métrica `voluntarios_ativos` vem de onde, se não bate com as alocações?

## Fontes externas

- Calendários de feriados: biblioteca Python `holidays` (versão 0.109), para BR, KE, IN, PT, GH, PE, SN, BD, CO, PH, UG e MZ.
- Filipinas, ano letivo 2024–2025: https://news.abs-cbn.com/news/2024/7/15/deped-releases-guidelines-for-school-year-2024-2025-1824
- Filipinas, Natal de 2025: https://www.philstar.com/headlines/2025/12/16/2494598/christmas-break-december-20-january-4-deped/amp/
- Brasil (São Paulo), 2024: https://www.gazetasp.com.br/estado/educacao-sp-define-para-15-de-fevereiro-inicio-do-ano-letivo-de-2024/1131384
- Brasil (São Paulo), 2025: https://abcdoabc.com.br/ferias-na-rede-estadual-de-sp/
