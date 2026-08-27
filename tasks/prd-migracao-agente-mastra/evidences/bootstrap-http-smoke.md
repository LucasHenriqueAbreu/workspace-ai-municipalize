# Evidência — smoke HTTP do Mastra Studio

Data da execução: 2026-08-26.

Com Mongo local isolado e configuração sintética de QA, `node
dist/scripts/mastra-development.js` iniciou o processo e emitiu o evento
`mastra_studio_ready`.

- `GET /`: 200, `text/html`;
- `GET /health`: 200, `{"success":true}`;
- asset estático do Studio: 200;
- `GET /api/agents` sem identidade de QA válida: 502 com envelope seguro
  `studio_dependency_unavailable`.

A última resposta é esperada neste ambiente: não havia Keycloak, backend de
Câmara, LiteLLM nem bearer de usuário de QA válidos. Não foi registrada URL
privada, token ou credencial.
