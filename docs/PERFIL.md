# Perfil dos dados: Desafio 05 (Impacto social)

Gerado por `scripts/perfil_rapido.py` e `scripts/analise.py` sobre o `impacto.zip`. Os números abaixo saem desses scripts.

## Resumo

- **Ficheiros:** 10 tabelas, cada uma em CSV (separador `;`, vírgula decimal) e em JSON. Os dois formatos têm os mesmos ids e os mesmos valores, por isso usa-se o JSON.
- **Período:** janeiro de 2024 a dezembro de 2025 (24 meses).
- **Data de referência:** 27/12/2025, o último registo de despesa, atividade ou evento. Nunca a data de hoje.
- **Ligações:** `id_projeto` liga 7 tabelas a `projetos`; `id_voluntario` liga as alocações e as competências a `voluntarios`; `parceiro_local_id` liga `projetos` a `parceiros_locais`.

| Tabela | Linhas | O que é |
| --- | ---: | --- |
| `projetos` | 12 | País, região, área de foco, ano de início, orçamento anual, parceiro, objetivos e estado |
| `parceiros_locais` | 12 | Um parceiro por projeto: especialidade, histórico e capacidade operacional (36 a 98) |
| `voluntarios` | 3 000 | Departamento, anos de experiência, horas disponíveis e cidade base |
| `voluntarios_skills` | 5 968 | Competências (9 tipos), 1 a várias por voluntário |
| `alocacoes_voluntarios` | 5 758 | Voluntário num projeto: datas, papel, horas feitas e estado |
| `atividades_projeto` | 29 061 | Atividade: data, tipo (18), participantes, horas, recurso e resultado |
| `coordenacao_eventos` | 600 | Reuniões de coordenação: tipo, horas e participantes |
| `despesas_projeto` | 18 000 | Despesa: data, categoria (7), valor e descrição |
| `metricas_impacto` | 1 728 | 6 métricas × 12 projetos × 24 meses, com unidade e método de recolha |
| `planos_investimento` | 120 | Planos: tipo, valor previsto e estado |

## Armadilhas e regra de limpeza

| # | Armadilha | Quanto | Regra |
| --- | --- | --- | --- |
| 1 | Datas em dois formatos em `despesas_projeto` | 3 591 de 18 000 (20,0%) em DD/MM/AAAA | Ler os dois formatos. Um leitor só de AAAA-MM-DD perde 20,5% da despesa (8,50 M€ de 41,41 M€) |
| 2 | Estornos: despesas negativas | 738 de 18 000 (4,1%); 1,14 M€ de 42,55 M€ brutos | Abater ao projeto: a despesa líquida é de 41,41 M€. Só 7 dos 738 têm uma despesa positiva de igual valor, por isso não se emparelham |
| 3 | Atividades duplicadas (mesmo id e mesmo conteúdo) | 541 de 29 061 (1,9%) | Remover; ficam 28 520 |
| 4 | Referência a um projeto que não existe | 301 alocações (5,2%) para P99; 34 898 horas | Fora das contas por projeto; mostradas à parte |
| 5 | Unidade dos beneficiários escrita de 4 formas | 19 linhas: «Beneficiários» 8, «beneficiario» 7, «beneficiaries» 4 | Normalizar para `beneficiarios` |
| 6 | Categorias com maiúsculas diferentes | `resultado_atividade` («Resultado regular» e «resultado regular»); `descricao_curta` («Material pedagogico») | Comparar em minúsculas e sem acentos |
| 7 | Atividades sem resultado | 8 883 de 28 520 (31,1%): 5 508 vazias e 3 375 «sem registo» | Contar como «sem resultado»; não tirar conclusões do resultado |
| 8 | Objetivos que não batem com a área | Ex.: P01 é de educação com o objetivo «ampliar cobertura de saude preventiva» | Usar `area_foco`; os objetivos ficam só como texto |
| 9 | Métricas com unidades diferentes | Beneficiários, jovens, horas, oficinas, voluntários e uma percentagem | Nunca somar entre métricas. A taxa de conclusão é uma média; os voluntários ativos são um recurso, não impacto |
| 10 | Horas de voluntariado de 2025 | 558 442 h em 2024 e 84 710 h em 2025 (−85%), com os beneficiários a subir 24% | Os registos de 2025 parecem incompletos. A eficiência por hora usa os 24 meses, com aviso |
| 11 | Horas feitas acima das disponíveis | 892 de 2 168 voluntários (41,1%) com mais do dobro das horas disponíveis | Perguntar se `horas_disponiveis` é por ano; não usar como limite |
| 12 | Alocações sem data de fim | 3 | Usar a data de referência como fim |
| 13 | Pico de fim de ano | Em novembro e dezembro, as atividades sobem 56% e os beneficiários 64%, sem mais despesa | Comparar meses comparáveis; ver `docs/ANOMALIAS.md` |
| 14 | Nenhum registo depois do dia 27 | 0 de 47 781 registos nos dias 28 a 31 (atividades, despesas, reuniões e planos) | Analisar por mês; uma média por dia divide por 27 |
| 15 | Datas sem semana de trabalho | 14,1% das aulas e 14,3% das despesas são a um domingo | Não fazer análises por dia da semana |
| 16 | Voluntários ativos reportados contra os registados | Métrica entre 52 e 81 por mês em todos os projetos; nas alocações, de 113 a 779 voluntários por projeto | A métrica `voluntarios_ativos` fica de fora das contas |

## Dicionário: as colunas que contam

- **`metricas_impacto.valor`:** valor do mês, não acumulado (nenhum dos 12 projetos cresce sempre). Tem casas decimais, mesmo nas contagens.
- **`despesas_projeto.valor`:** euros; negativo é um estorno.
- **`alocacoes_voluntarios.horas_realizadas`:** horas de uma alocação, de 60 a 216; os estados são concluída (5 738), em curso (12) e interrompida (8).
- **`projetos.orcamento_anual`:** euros por ano, de 0,48 M€ (P11) a 9,0 M€ (P01).
- **`parceiros_locais.capacidade_operacional`:** de 36 a 98; não se sabe a unidade (é um índice?).
- **`voluntarios.departamento_lufthansa`:** os voluntários vêm de 6 departamentos de uma empresa.
