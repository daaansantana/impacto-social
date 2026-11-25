# Três caminhos: Desafio 05 (Impacto social)

Para quem: a gestora do programa, que decide para onde vão o dinheiro e os voluntários dos 12 projetos. A persona com fontes vem a seguir (prompt 4).

Os números vêm de `docs/HIPOTESES.md`.

## A. Cada euro, mais pessoas (recomendado)

- **O que resolve:** compara o alcance e a eficiência dos projetos com unidades compatíveis, depois de validar os dados (H1, H2 e H4). Responde aos três pontos do enunciado.
- **A ideia ousada:** a «carteira sugerida». A app propõe como distribuir o investimento aprovado para chegar a mais pessoas com o mesmo dinheiro, dentro da capacidade dos parceiros.
- **Implementado** (dados reais, com gabaritos):
  1. Portefólio: alcance contra eficiência nos 12 projetos, com a unidade à escolha (por euro, por hora de voluntariado, por jovem formado).
  2. Projeto: despesa líquida e estornos, horas, métricas e a evolução mês a mês.
  3. Confiança nos dados: o que foi limpo e quanto muda o resultado. Sem limpar, perde-se 20% da despesa e 9 de 12 projetos mudam de posição.
  4. Simulador «e se»: mover investimento entre projetos, com os pressupostos à vista.
- **Protótipo:** a carteira sugerida, com uma explicação curta para cada mudança, a aparecer como numa conversa com IA, através de demos sem IA real (`use-mock-run`). Leva a etiqueta «Protótipo».
- **Roadmap:**
  - Hoje: comparar, validar e simular.
  - A seguir: o custo real de um beneficiário a mais e metas por projeto.
  - Depois: ligação aos sistemas de despesas e às métricas dos parceiros, com avisos.
- **KPI:** até mais 953 beneficiários (+5%) com o mesmo dinheiro aprovado. Este é o cenário otimista; o prudente e o provável saem na decisão.
- **Custo:** cerca de 16 horas.
- **Risco:** médio. O pressuposto de que um beneficiário a mais custa o mesmo que a média é contestável, por isso entram os cenários e os pressupostos ficam à vista. O P01 pesa muito nos resultados.

## B. A pessoa certa no projeto certo

- **O que resolve:** só 43,4% das alocações têm a competência da área, e 27,7% dos voluntários nunca foram alocados (H5).
- **A ideia ousada:** um assistente de alocação. Para cada projeto, propõe voluntários com a competência certa, pede aprovação e prepara o convite.
- **Implementado:** um portefólio resumido, a equipa de cada projeto com a taxa de competência certa e a lista de voluntários disponíveis.
- **Protótipo:** o assistente, com aprovações (`use-mock-run` e `tool-approval-queue`) e o convite por email. A disponibilidade é simulada.
- **Roadmap:**
  - Hoje: alocar por competências.
  - A seguir: disponibilidade e preferências reais.
  - Depois: ligação aos recursos humanos.
- **Custo:** cerca de 18 horas.
- **Risco:** alto.
  - A ligação entre ter a competência certa e a eficiência não está provada (p = 0,075).
  - As horas de 2025 parecem incompletas, e 41% dos voluntários têm mais horas feitas do que o dobro das disponíveis.
  - O enunciado pede comparar projetos, não alocar pessoas.

## C. Números em que se pode confiar

- **O que resolve:** o ponto 3 do enunciado. Sem limpar, 20% da despesa desaparece, 9 de 12 projetos mudam de posição e 2025 parece incompleto (H2 e H3).
- **A ideia ousada:** o parceiro carrega o ficheiro do mês e a app valida-o na hora. Verifica as datas, as unidades, os estornos, as referências e os duplicados, e devolve uma nota com a mensagem de correção pronta. Mostra a escala: de 12 projetos para muitos.
- **Implementado:** a validação dos 10 ficheiros, com uma nota por tabela e por projeto, o ranking antes e depois da limpeza e uma comparação simples.
- **Protótipo:** carregar um CSV no browser (`drop-zone` e Dexie) e validá-lo.
- **Roadmap:**
  - Hoje: validar.
  - A seguir: regras por métrica.
  - Depois: validação contínua, com avisos aos parceiros.
- **Custo:** cerca de 15 horas.
- **Risco:** médio a alto. É forte na análise e na técnica, mas fraco a comparar alcance e eficiência, e tem menos história para o pitch.

## Recomendação

O caminho A, com o ecrã «Confiança nos dados» do C no núcleo, porque o ponto 3 do enunciado é obrigatório, e com o B no roadmap.

O A assenta no achado (H4: o dinheiro novo não segue a eficiência) e responde ao enunciado ponto por ponto. O protótipo fecha a história com um número: mais pessoas com o mesmo dinheiro.
