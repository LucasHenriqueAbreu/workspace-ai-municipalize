# Tarefa 3.0: Extrair o ExecutionIdentityModule

## Visão geral

Transformar a autenticação e a confirmação do usuário municipal em uma
capacidade explícita de identidade autorizada, independente do transporte MCP.
O resultado será um contexto imutável, validado e limitado ao cliente, ambiente,
usuário e backend resolvidos.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: estabelecer o ownership da identidade e a
  dependência pública com `BackendGatewayModule`.
- `nestjs-oop-design-patterns`: separar validação de token, mapeamento de claims,
  confirmação de usuário e construção do contexto.
- `nestjs-features-performance`: preservar autenticação, autorização,
  isolamento, configuração tipada, redaction e classificação de falhas.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md` e todas
as rules globais e locais. Aplicam-se validação nas fronteiras, contexto
explícito, isolamento por cliente/ambiente/usuário, ausência de fallback que
amplie acesso, injeção por construtor, tipos `unknown` para dados externos e
logs sem bearer ou dados pessoais. Não há desvio planejado.
</rules>

<requirements>

- RF8, RF9, RF10 e RF11.
- Validar bearer Keycloak, issuer, audience, algoritmo RS256, expiração,
  `notBefore`, JWKS e mapeamento de claims conforme a configuração vigente.
- Confirmar usuário e vínculos funcionais no backend da Câmara antes de
  produzir o contexto para uma tool.
- Recusar token ausente, inválido ou expirado, claims incompatíveis, usuário
  não confirmado, vínculo inválido, cliente divergente e contexto incompleto.
- Manter credenciais somente em memória durante a execução e impedir sua
  persistência, exposição em resultados ou gravação em logs.
</requirements>

## Subtarefas

- [x] 3.1 Criar `ExecutionIdentityModule` e exportar somente
  `ExecutionIdentityService`.
- [x] 3.2 Migrar loader, readers e tokens para configuração neutra, removendo
  `MCP_*` da API interna de identidade.
- [x] 3.3 Adaptar validação JWKS/Keycloak e o mapeamento de claims para entrada
  explícita de bearer e cliente.
- [x] 3.4 Migrar confirmação de usuário/vínculos, contexto imutável e auditoria
  segura, sem `Request`, `AuthInfo`, `_meta`, URI ou AsyncLocalStorage.
- [x] 3.5 Verificar a recusa de divergências de cliente, ambiente e destino
  antes de qualquer handler ou chamada municipal.

## Detalhes de implementação

Consultar `techspec.md`, seções **Arquitetura do sistema**, **Principais
interfaces**, **Modelos de dados**, **Pontos de integração** e **Riscos
conhecidos**. A API deve corresponder a `ExecutionIdentity.resolve` e produzir
`AuthenticatedToolExecution`; a seleção de backend permanece responsabilidade
do gateway.

## Critérios de aceitação relacionados

- CA-04
- CA-05

## Testes da tarefa

### Testes de unidade

- [x] TU-05 — rejeita bearer e contexto inválidos.

### Testes de integração

- [x] TI-04 — rejeita identidade ou cliente divergente durante execução.

### Testes E2E

- Não aplicável nesta tarefa; o fluxo real será validado na tarefa 8.

## Arquivos relevantes

- `municipalize-admin-app/src/modules/mcp/auth/**`
- `municipalize-admin-app/src/modules/mcp/context/**`
- `municipalize-admin-app/src/config/load-mcp-environment.ts`
- `municipalize-admin-app/src/config/mcp-environment-readers.ts`
- `municipalize-admin-app/src/modules/execution-identity/execution-identity.module.ts`
- `municipalize-admin-app/src/modules/execution-identity/application/**`
- `municipalize-admin-app/src/modules/execution-identity/domain/**`
- `municipalize-admin-app/src/modules/execution-identity/infrastructure/**`
- `municipalize-admin-app/tests/config/load-mcp-environment.spec.ts`
- `municipalize-admin-app/tests/modules/mcp/keycloak-jwt-validation.service.spec.ts`
- `municipalize-admin-app/tests/modules/mcp/request-authentication.service.spec.ts`
- `municipalize-admin-app/tests/modules/execution-identity/**`
