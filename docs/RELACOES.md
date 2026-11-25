# Relações entre as 10 tabelas

Como se fez: com as duas skills de análise de dados (`data-analysis` e `exploratory-data-analysis`, do repositório JPeetz/agent-skills).

- **Fases:** perfil → limpeza → auditoria de qualidade com nota por dimensão → relações entre variáveis → causa raiz → relatório.
- **Regras estatísticas das skills:** cada resultado traz o efeito, o n e o p, e há correção para testes múltiplos (Benjamini-Hochberg, «q»).
- **Scripts:** `perfil_rapido.py`, `analise.py`, `anomalias.py`, `cruzamentos.py` e o validador da skill (`validate_dataset.py`).
- **Período:** janeiro a outubro de cada ano, salvo indicação em contrário, por causa do pico de fim de ano (`docs/ANOMALIAS.md`).

## 1. A validação genérica não chega

O validador da skill dá nota A às 10 tabelas, de 94,8 a 100. Não vê as datas em dois formatos, os estornos, o projeto que não existe, o pico de fim de ano nem o corte ao dia 27.

A nota de qualidade da skill `exploratory-data-analysis`, com as nossas regras e os cruzamentos entre tabelas, dá isto (de 1 a 5):

| Dimensão | Nota | Evidência |
| --- | :---: | --- |
| Completude | 3 | 8 883 de 28 520 atividades sem resultado (31,1%, acima do limite crítico de 20% da skill); 2 088 de 18 000 despesas sem descrição |
| Consistência | 2 | 3 591 despesas com data DD/MM/AAAA; 19 unidades escritas de outra forma; maiúsculas misturadas; um tipo de atividade com um espaço no início; objetivos que não batem com a área |
| Unicidade | 4 | 541 atividades duplicadas (1,9%) |
| Atualidade | 2 | Nenhum registo depois do dia 27 (0 de 47 781); os voluntários ativos nos registos caem até 50 em dezembro de 2025 |
| Exatidão | 2 | Pico de fim de ano sem mais despesa; aulas com as escolas fechadas; domingos iguais a segundas; uma reunião de 25,23 horas num só dia; voluntários reportados diferentes dos registados |
| Integridade | 3 | 301 alocações (5,2%) para o projeto P99, que não existe |

## 2. O que anda com a eficiência (entre projetos)

Eficiência = beneficiários por milhão de euros, de janeiro a outubro (n = 12 projetos, Spearman).

**Resistem à correção (q < 0,05):**

| Variável | Tabelas cruzadas | ρ | q |
| --- | --- | ---: | ---: |
| Horas de reunião por hora de atividade | coordenação × atividades | −0,79 | 0,041 |
| Orçamento anual | projetos | −0,76 | 0,041 |
| Custo por atividade | despesas × atividades | −0,76 | 0,041 |
| Valor dos estornos | despesas | −0,73 | 0,046 |
| Horas de voluntariado | alocações | −0,73 | 0,046 |

**Leitura:** os projetos grandes, com atividades caras e muita coordenação, chegam a menos gente por euro.

**Um sinal que não resiste à correção:** a percentagem de alocações com a competência certa (voluntários × competências × projetos) tem ρ = +0,64 (p = 0,026; q = 0,10).

**Sem relação (|ρ| ≤ 0,35):** a capacidade e o histórico do parceiro, a experiência dos voluntários, as alocações interrompidas, o resultado das atividades, as categorias de despesa, os voluntários reportados, o estado do projeto e a idade do projeto.

## 3. Mês a mês, dentro de cada projeto

n = 240 meses de projeto, de janeiro a outubro, depois de tirar o nível de cada projeto em cada ano.

- **Os beneficiários não acompanham os recursos:** nem a despesa (ρ = 0,04), nem as atividades (−0,06), nem as horas de voluntariado (−0,11), com p ≥ 0,08.
- **As métricas de impacto não se mexem juntas:** a correlação dos beneficiários com os jovens formados, as oficinas, as horas de formação e a taxa de conclusão é sempre de |ρ| ≤ 0,06.
- **Antes de tirar a tendência:** a despesa parecia subir com os beneficiários (ρ = 0,36). Era só a subida de 2024 para 2025, comum aos dois.
- **Leitura:** a relação entre recursos e impacto só aparece entre projetos e entre anos, não de mês para mês. A app compara projetos e períodos, e não promete causa e efeito mensal.

## 4. Atividades (n = 28 520)

- **O resultado não depende de nada:** nem do recurso usado (V de Cramér = 0,014; p = 0,13), nem do tipo de atividade (V = 0,028; p = 0,052), nem do projeto (V = 0,017; p = 0,85).
- **Os participantes por atividade são iguais em todos os tipos** (Kruskal-Wallis, p = 0,45) e em todos os resultados (entre 36,6 e 37,5).
- **Leitura:** o campo «resultado» não traz informação. Não entra nas conclusões.

## 5. Voluntários (n = 5 457 alocações)

- **A língua não conta:** quem vive em Lisboa ou no Porto vai para países lusófonos em 35,7% das alocações; os outros, em 35,5% (V = 0,002).
- **A cidade e o departamento quase não contam** para o projeto (V ≈ 0,05).
- **A experiência não conta:** não se relaciona com as horas feitas (ρ = −0,001) nem com o papel (p = 0,59).
- **A competência também não:** só 43,4% das alocações têm a competência da área do projeto.
- **Leitura:** a distribuição dos voluntários parece feita ao acaso. Isto entra no roadmap da app (escolher voluntários pela competência).

## 6. Planos de investimento contra o que aconteceu depois

Para cada plano concluído ou em execução, comparámos os beneficiários dos 3 meses antes e dos 3 meses depois, sem novembro e dezembro.

| Tipo de plano | Variação | Planos |
| --- | ---: | ---: |
| Otimização de despesas | +18,2% | 11 |
| Ampliação | +11,8% | 7 |
| Realocação | +6,3% | 11 |
| Reforço da formação | +6,2% | 13 |
| Tendência de base (todos os meses) | +6,3% | — |

**Leitura:** não se vê um efeito claro dos planos. As amostras são pequenas e isto não foi testado.

## 7. Estornos

Não se relacionam com as atividades nem com os beneficiários de mês para mês (|ρ| ≤ 0,03). Estão espalhados por todos os projetos e meses.

## O que isto dá à app

- **Portefólio:** compara projetos e períodos, e não meses soltos.
- **Projeto:** um bloco «porquê» com os dois sinais fortes, o custo por atividade e o peso da coordenação.
- **Confiança nos dados:** a nota genérica (A) ao lado da nota real (de 2 a 4), que é a melhor prova do valor do auditor.
- **Roadmap:** escolher os voluntários pela competência, porque a alocação parece feita ao acaso.
