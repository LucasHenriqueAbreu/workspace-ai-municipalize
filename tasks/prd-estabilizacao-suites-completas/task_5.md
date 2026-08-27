# Tarefa 5.0: Corrigir os testes backend de autenticação, autorização e tenant

## Visão geral

Reescrever os testes backend identificados no inventário para que sejam independentes e comprovem os contratos vigentes de autenticação, papel, vínculo, propriedade e tenant. A tarefa cobre os fluxos de autenticação e recursos protegidos sem desabilitar a autorização como solução de teste.

<skills>
### Conformidade com skills

- `executar-task`: aplicável à implementação incremental desta entrega.
- Não há skill local específica do `ms-main`; seguir o `AGENTS.md` e as rules Java/Quarkus/testes do projeto.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Aplicar as regras do `ms-main` para JUnit 5, Mockito, `@QuarkusTest`, REST Assured, cobertura mínima de 80%, isolamento por tenant e segurança. Cada teste prepara e limpa os próprios dados; não usar `@Order`, IDs fixos, chamadas entre métodos de teste, credenciais reais ou autorização global desabilitada nos cenários de segurança.
</rules>

<requirements>

- RF7: executar e aprovar os sete testes backend mapeados, ou reclassificá-los com prova.
- RF8: negar acesso a identidade sem papel, vínculo, propriedade ou tenant exigido.
- RF9: permitir acesso somente à identidade autorizada no tenant correto.
- RF11: manter bloqueios visíveis quando não for possível executar a validação.
</requirements>

## Subtarefas

- [ ] 5.1 Converter `AuthResourceIT` para requests compatíveis com o contrato atual de registro/login e fixtures isoladas.
- [ ] 5.2 Converter `CategoryResourceIT` para criar, consultar, atualizar e remover dados próprios, com identidade e tenant controlados.
- [ ] 5.3 Converter `PublicCouncillorProfileResourceIT` em cenários negativos de token ausente/inválido sem vazamento de conteúdo.
- [ ] 5.4 Implementar os cenários positivos de papel, vínculo e tenant corretos para cada recurso protegido inventariado.
- [ ] 5.5 Implementar os cenários negativos de tenant/vínculo divergente, sem expor existência ou dados de outro tenant.
- [ ] 5.6 Executar classes e métodos afetados individualmente antes de atualizar a linha de base.

## Detalhes de implementação

Seguir “Testes de autenticação, autorização e tenant do backend” e TI-02 a TI-06 da [TechSpec](techspec.md). `@RolesAllowed` e OIDC protegem a fronteira, mas a validação de vínculo, propriedade e tenant deve permanecer no serviço responsável. Mocks não podem substituir a política que o teste declara comprovar.

## Critérios de aceitação relacionados

- CA-02
- CA-05
- CA-06

## Testes da tarefa

### Testes de unidade

Não aplicável; a proteção é comprovada no runtime Quarkus pelos testes de integração abaixo. Testes de service já existentes devem ser atualizados se uma correção de produção comprovadamente necessária tocar a regra correspondente.

### Testes de integração

- [ ] TI-02 — Registro e login seguem o contrato de autenticação vigente
- [ ] TI-03 — Operações de categoria permitidas exigem identidade e tenant válidos
- [ ] TI-04 — Endpoints de perfil público recusam token ausente ou inválido
- [ ] TI-05 — Usuário autorizado no tenant correto acessa o recurso protegido
- [ ] TI-06 — Tenant ou vínculo divergente não vaza dados nem existência do recurso

### Testes E2E

Não aplicável.

## Arquivos relevantes

- `ms-main/src/test/java/br/com/municipalize/integration/AuthResourceIT.java`
- `ms-main/src/test/java/br/com/municipalize/integration/CategoryResourceIT.java`
- `ms-main/src/test/java/br/com/municipalize/integration/PublicCouncillorProfileResourceIT.java`
- demais `src/test/java/**/*.java` classificados entre os sete itens no inventário
- `ms-main/src/main/java/br/com/municipalize/rest/AuthResource.java`
- `ms-main/src/main/java/br/com/municipalize/rest/CategoryResource.java`
- `ms-main/src/main/java/br/com/municipalize/rest/PublicCouncillorProfileResource.java`
- `ms-main/src/main/java/br/com/municipalize/service/AuthService.java`
- componentes de tenant e autorização chamados pelos recursos afetados
