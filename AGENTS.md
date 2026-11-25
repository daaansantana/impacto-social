# Lupa

A app compara o alcance e a eficiência dos 12 projetos de impacto social. O produto está em `docs/PRODUCT.md` e o contrato técnico em `docs/SPEC.md`.

## Regras

- **Dados:** seguem `public/data` → `services/` → `store/` → `hooks/` → `lib/` → `components/`.
  - `lib/` só tem funções puras, sem a data de hoje: a data de referência está em `lib/dates.ts`.
  - Os componentes só recebem props.
  - `data/raw` não se abre: a app usa só `public/data`.
- **Arredondamentos:** nunca se fazem contas com valores já arredondados. Arredonda-se uma vez, no fim de cada conta, com ,5 para cima, só para comparar e para mostrar. Os ficheiros de `public/data` guardam os valores exatos; os gabaritos, os arredondados.
- **Gabaritos:** `npm run gabaritos` compara `lib/` com `scripts/gabaritos.json`. Se um gabarito falhar, não se muda o valor esperado: para e avisa.
- **Commits:** pequenos, em inglês, sem nada sobre o processo de trabalho.
- **Dependências:** uma nova só entra com o porquê, na mensagem do commit.
- **Notas pessoais:** `NOTAS.md` fica no `.gitignore`.
- **Antes de cada push:** `npm run verificar`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
