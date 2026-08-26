# Evidências do QA

As três capturas PNG desta pasta foram geradas por Chromium standalone com
fixtures sintéticas. Elas comprovam a UI, mas não equivalem a evidências de um
tenant real.

A ferramenta de navegador integrada continua sem navegador conectado:

```text
agent.browsers.list() -> []
```

O projeto Playwright foi preparado e instalado em `e2e/`. A validação integrada
continua dependendo de tenant, sessão e APIs compatíveis de QA. Este registro não
substitui as evidências integradas exigidas para aprovação.
