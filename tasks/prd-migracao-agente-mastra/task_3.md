# Tarefa 3.0: Storage, resourceId e ciclo de vida das conversas

## Visão geral

Integrar a memória persistente do Mastra ao MongoDB já configurado e implementar
o ownership das conversas por `resourceId` derivado no servidor. A tarefa entrega
threads isoladas por ambiente, Câmara e usuário, working memory thread-scoped,
listagem, reabertura, título determinístico e remoção sem acessar as collections
do Chat.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: ownership de storage, APIs de lifecycle,
  limites entre Mastra e Chat e composição do adapter Mongo.
- `nestjs-oop-design-patterns`: invariantes de thread/resource, value contracts,
  título e colaboração entre factory e lifecycle.
- `nestjs-features-performance`: índices, limites, persistência, isolamento,
  lifecycle de clients e testes de integração com MongoDB.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md`, todas
as rules globais e todas as rules locais da Admin API. Aplicam-se ownership por
feature, driver Mongo oficial, collections próprias, índices conforme consultas,
isolamento por cliente/ambiente/usuário, validação de `unknown`, imutabilidade,
limites de memória e ausência de acesso ao storage interno do Chat. Não haverá
Mongoose, ORM novo, migração destrutiva ou compartilhamento de collections.
</rules>

<requirements>

- RF7: criar e persistir conversa para o contexto autorizado.
- RF8: associar à conversa o contexto estruturado das entidades usadas.
- RF9: recuperar histórico e contexto ao reabrir pelo mesmo proprietário.
- RF10: listar somente threads do `resourceId` derivado.
- RF11: remover a conversa do proprietário e impedir sua recuperação posterior.
- RF12: salvar título baseado na primeira mensagem, sem renomeá-lo em mensagens
  posteriores.
- O `resourceId` deve incluir ambiente, Câmara e usuário, e nunca ser recebido
  do Studio.
- O `threadId` deve ser validado junto com o `resourceId` antes de toda leitura,
  escrita, geração ou remoção.
- A working memory deve conter arrays thread-scoped para projetos, emendas,
  instituições e orçamento, além de outras entidades e evidências limitadas.
- O storage Mastra deve usar namespace/collections próprios e fechar seus
  recursos corretamente.
</requirements>

## Subtarefas

- [x] 3.1 Configurar `MongoDBStore` com a conexão existente, banco configurado e
  namespace próprio, verificando índices pelo adapter.
- [x] 3.2 Implementar `MastraResourceIdFactory` com derivação determinística e
  testes negativos para ambiente, Câmara e usuário diferentes.
- [x] 3.3 Definir e validar `MastraConversationContext`, incluindo inicialização
  vazia, merge previsível, limites e sanitização de referências.
- [x] 3.4 Implementar `MastraThreadLifecycleService` para criar, localizar,
  listar, renomear automaticamente e remover threads pelo Memory API.
- [x] 3.5 Garantir ownership em todas as operações e traduzir thread ausente ou
  pertencente a outro recurso para `studio_thread_not_found`, sem escrita.
- [x] 3.6 Provar recriação do contexto Mastra, continuidade da memória e limpeza
  de artefatos associados conforme a API do adapter.

## Detalhes de implementação

Consultar `techspec.md`, principalmente `Arquitetura do sistema`, `Design de
implementação > Principais interfaces`, `Modelos de dados > MunicipalizeMastraThread`
e `MastraConversationContext`, além das decisões sobre `resourceId`, working
memory thread-scoped, storage separado do Chat e título determinístico. Não
alterar `chat_conversations`, `chat_messages` ou documentos de Chat.

## Critérios de aceitação relacionados

- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-10

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-01 — gera `resourceId` determinístico por ambiente, Câmara e usuário
- [x] TU-03 — inicializa working memory thread-scoped vazia
- [x] TU-05 — gera título estável a partir da primeira mensagem
- [x] TU-08 — nega thread cujo `resourceId` não coincide com a execução

### Testes de integração (se aplicável)

- [ ] TI-01 — persiste e recupera thread e mensagens no `MongoDBStore`
- [ ] TI-02 — lista threads somente pelo recurso derivado
- [ ] TI-03 — remove thread e sua memória associada
- [ ] TI-04 — passa título da primeira mensagem à thread Mastra

## Arquivos relevantes

- `municipalize-admin-app/src/modules/mastra-studio/**`
- `municipalize-admin-app/src/database/database.module.ts`
- `municipalize-admin-app/src/database/mongo-client.provider.ts`
- `municipalize-admin-app/src/modules/chat/core/infrastructure/database/mongo/chat/**`
- `municipalize-admin-app/tests/config/load-mongo-database-development-environment.spec.ts`
- `municipalize-admin-app/tests/modules/mastra-studio/**`
