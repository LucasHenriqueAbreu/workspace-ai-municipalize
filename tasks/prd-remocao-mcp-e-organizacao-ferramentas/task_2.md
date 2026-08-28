# Tarefa 2.0: Extrair o BackendGatewayModule

## Visão geral

Consolidar a fronteira de acesso ao `ms-main` em um módulo interno que resolva
o backend exclusivamente pelo cliente e ambiente autorizados, aplique as
proteções de rede e controle o ciclo de vida das chamadas externas.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: definir ownership do gateway, sua API
  pública mínima e a dependência acíclica com `CustomersModule`.
- `nestjs-oop-design-patterns`: separar resolver, política de URL, cliente e
  mapeamento de respostas sem criar abstrações cerimoniais.
- `nestjs-features-performance`: tratar SSRF, timeout, cancelamento, erros
  seguros, redaction e ausência de retry automático.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md` e todas
as rules globais e locais. Aplicam-se ownership por feature, exports mínimos,
injeção por construtor, tipos estritos, validação de dados externos, HTTPS,
bloqueio de rede privada, timeout limitado, `AbortSignal`, logs sem segredos e
testes isolados. Não há desvio planejado.
</rules>

<requirements>

- RF10, RF12, RF13 e RF14.
- O destino efetivo deve vir do cadastro de `CustomersModule` e do ambiente
  ativo; URL recebida de consumidor não pode participar da seleção.
- A fronteira deve validar HTTPS, host/rede privada, DNS, redirects e
  credenciais na URL, além de limitar backend a 15 segundos e tool a 60
  segundos conforme a TechSpec.
- Cancelamento deve ser propagado e falhas de timeout, rede ou resposta
  inválida devem ser traduzidas para erro interno seguro, sem retry automático.
</requirements>

## Subtarefas

- [x] 2.1 Criar `BackendGatewayModule` como composition root e exportar somente
  o gateway/resolver consumido pela identidade e pelas tools.
- [x] 2.2 Mover e adaptar a resolução por cliente/ambiente e os tipos externos
  para as camadas de aplicação e infraestrutura do novo módulo.
- [x] 2.3 Mover a política de URL, DNS, HTTPS, redirects e bloqueios de rede
  privada para a fronteira do gateway.
- [x] 2.4 Implementar headers autorizados, timeout composto, cancelamento,
  classificação de falhas e redaction de logs.
- [x] 2.5 Verificar que nenhum consumidor acessa cliente HTTP ou persistência
  interna diretamente.

## Detalhes de implementação

Consultar `techspec.md`, seções **Arquitetura do sistema**, **Principais
interfaces**, **Pontos de integração**, **Monitoramento e observabilidade** e
**Riscos conhecidos**. A API pública deve corresponder a `BackendGateway.request`
e não deve expor `Collection`, URL fornecida pelo consumidor, headers brutos ou
tipos do fornecedor.

## Critérios de aceitação relacionados

- CA-05
- CA-06

## Testes da tarefa

### Testes de unidade

- [x] TU-06 — seleciona somente backend cadastrado e seguro.
- [x] TU-07 — compõe timeout e cancelamento.

### Testes de integração

- [x] TI-03 — propaga cancelamento e traduz falha da tool.

### Testes E2E

- Não aplicável nesta tarefa; a execução real será validada na tarefa 8.

## Arquivos relevantes

- `municipalize-admin-app/src/modules/mcp/integrations/**`
- `municipalize-admin-app/src/modules/customers/customers.module.ts`
- `municipalize-admin-app/src/modules/backend-gateway/backend-gateway.module.ts`
- `municipalize-admin-app/src/modules/backend-gateway/application/**`
- `municipalize-admin-app/src/modules/backend-gateway/infrastructure/**`
- `municipalize-admin-app/tests/modules/mcp/safe-backend-url.policy.spec.ts`
- `municipalize-admin-app/tests/modules/mcp/backend-security.spec.ts`
- `municipalize-admin-app/tests/modules/mcp/municipalize-http-client.spec.ts`
- `municipalize-admin-app/tests/modules/backend-gateway/**`
