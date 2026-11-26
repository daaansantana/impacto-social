# Lupa

A Lupa mostra o impacto social das 12 ações de um programa: a quantas pessoas chega cada uma, quanto muda na vida delas e a que custo, com números limpos e meses comparáveis. Cruza esses resultados com a necessidade de cada país e aponta onde vale a pena reforçar ou abrir uma ação.

**A app:** https://impacto-social-psi.vercel.app

## Os ecrãs

| Ecrã | Rota | O que mostra |
| --- | --- | --- |
| Início | `/` | Os beneficiários por mês, três leituras, as 12 ações no mapa e o que confirmar com os parceiros. |
| Ações | `/acoes` | As 12 ações em cartões, com o índice de impacto social, a saúde e a confiança nos números. Filtros e ordenação. |
| Ação | `/acoes/P11`, por exemplo | Uma ação em detalhe: o resumo, o índice e as suas dimensões, os recursos, a saúde, a evolução mês a mês e o que pedir ao parceiro. |
| Radar | `/radar` | Onde abrir ou reforçar: a necessidade de cada país numa área, cruzada com a evidência das ações dessa área. |
| Como medimos | `/como-medimos` | O índice e os pesos, que se podem mudar, o ranking que daí sai e a confiança nos dados. |

## Os protótipos

Estão marcados com «Protótipo» no ecrã.

- **Pergunte à Lupa**, na barra lateral e no Início: quatro perguntas sugeridas. As respostas são guiadas e saem das mesmas funções que o resto da app usa.
- **Novo projeto**, no Radar: escolhe-se o país, a área, o formato e o orçamento. A Lupa estima os beneficiários e diz se deve avançar, pilotar, rever ou confirmar a necessidade, e porquê.
- **O auditor do ficheiro do mês**, em Como medimos: verifica no browser o CSV que um parceiro envia e prepara o email de correção. O ficheiro não sai do computador.

## Como correr

Precisa do Node 20 ou mais recente.

```sh
npm ci              # instala as dependências
npm run dev         # abre a app em http://localhost:3000
npm run verificar   # Biome, TypeScript, testes e build
npm run gabaritos   # compara as contas de lib/ com scripts/gabaritos.json
```

## De onde vêm os dados

- **O desafio:** as 10 tabelas do `impacto.zip` estão em `data/raw/json` e `data/raw/csv`. A app não as lê. Os scripts em Python de `scripts/` limpam-nas e resumem-nas em `public/data`, que é o que a app carrega. As regras de limpeza estão em `docs/SPEC.md` e `docs/PERFIL.md`.
- **O Banco Mundial:** os indicadores de desenvolvimento (WDI) dos 12 países medem a necessidade em cada área e os preços de cada país. O `scripts/contexto.py` descarrega-os para `data/raw/contexto` e escreve `public/data/contexto.json`.

A data de referência dos dados é 27/12/2025.

## Documentos

| Ficheiro | O que tem |
| --- | --- |
| [`docs/PRODUCT.md`](docs/PRODUCT.md) | O produto: a persona, as perguntas, o indicador principal e o que é protótipo. |
| [`docs/SPEC.md`](docs/SPEC.md) | O contrato técnico: os dados, as regras de limpeza, as funções e os valores esperados. |
| [`docs/REQUISITOS.md`](docs/REQUISITOS.md) | Os requisitos do desafio e as perguntas em aberto. |
| [`docs/PERFIL.md`](docs/PERFIL.md) | O perfil dos dados e o que a limpeza corrige. |
| [`docs/RELACOES.md`](docs/RELACOES.md) | As relações entre as 10 tabelas. |
| [`docs/HIPOTESES.md`](docs/HIPOTESES.md) | As hipóteses e o resultado de cada uma, sobre os dados limpos. |
| [`docs/ANOMALIAS.md`](docs/ANOMALIAS.md) | Os padrões escondidos nos dados: o fim de ano, o dia 27 e os domingos. |
| [`docs/CAMINHOS.md`](docs/CAMINHOS.md) | Os três caminhos que se consideraram e o escolhido. |
| [`docs/PLANO-V2.md`](docs/PLANO-V2.md) | A segunda versão, centrada no impacto social: o índice, o radar e a interface. |
| [`docs/APRESENTACAO.md`](docs/APRESENTACAO.md) | O guião da apresentação. |
| [`docs/capturas/`](docs/capturas) | Os ecrãs a 1440 e a 390 px. |

## A equipa

Ana Carlos e Danillo Santana.
