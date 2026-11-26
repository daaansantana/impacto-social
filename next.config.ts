import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // os ecrãs antigos levam aos novos: a Confiança a Como medimos, o Projeto à Ação
  async redirects() {
    return [
      { source: "/confianca", destination: "/como-medimos", permanent: false },
      // o ecrã Projeto passou para a Ação
      { source: "/projetos/:id", destination: "/acoes/:id", permanent: false },
      // o Simulador saiu do cabeçalho: leva ao Radar (o código fica, por agora)
      { source: "/simulador", destination: "/radar", permanent: false },
    ];
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
