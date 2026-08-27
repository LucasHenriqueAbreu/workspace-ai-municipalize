# Documento de Requisitos do Produto (PRD)

## Visão geral

As suítes completas de testes da plataforma Municipalize ainda falham por problemas preexistentes fora da funcionalidade em desenvolvimento. O levantamento inicial aponta 53 arquivos de teste do frontend e 7 testes do backend relacionados a autenticação e autorização. Essas falhas reduzem a confiança nas entregas, impedem uma validação integral antes da publicação e dificultam distinguir regressões novas de defeitos já conhecidos.

Esta iniciativa estabiliza essas suítes para as equipes de desenvolvimento, QA e operação da plataforma. O valor entregue é uma linha de base confiável: as verificações completas dos projetos afetados devem concluir sem falhas, mantendo os comportamentos corretos de autenticação, autorização e isolamento por tenant.

## Objetivos

- Fazer com que a execução completa da suíte do `municipalize-app` seja aprovada, incluindo os 53 arquivos inicialmente identificados como falhos.
- Fazer com que a execução completa da suíte do `ms-main` seja aprovada, incluindo os 7 testes inicialmente identificados de autenticação e autorização.
- Impedir que a aprovação seja obtida mascarando a falha por meio de exclusão, desativação ou redução indevida de cobertura dos testes afetados.
- Preservar os controles de autenticação, autorização, vínculo e isolamento entre tenants nos fluxos corrigidos.
- Produzir evidências reproduzíveis das execuções completas aprovadas para que uma regressão futura possa ser identificada com clareza.

Critérios de sucesso e métricas:

- 0 testes falhos na execução completa aplicável do frontend.
- 0 testes falhos na execução completa aplicável do backend.
- 100% dos 53 arquivos de teste do frontend e dos 7 testes de backend inicialmente mapeados executados e aprovados, ou reclassificados com justificativa verificável caso o levantamento inicial contenha duplicidade ou classificação incorreta.
- 0 novos desvios conhecidos de autorização ou de isolamento por tenant introduzidos pela estabilização.

## Histórias de usuário

- US1: Como pessoa desenvolvedora do frontend, quero executar a suíte completa e obter um resultado confiável para detectar regressões causadas por minhas alterações.
- US2: Como pessoa desenvolvedora do backend, quero que os testes de autenticação e autorização reflitam os contratos vigentes para validar com segurança o acesso a recursos municipais.
- US3: Como pessoa responsável por QA, quero evidências de que os testes antes falhos foram executados e aprovados para liberar uma funcionalidade sem esconder riscos preexistentes.
- US4: Como pessoa responsável pela plataforma, quero que as correções mantenham a separação de tenants e as permissões esperadas para evitar acesso indevido a dados ou operações.
- US5: Como pessoa mantenedora, quero diferenciar uma falha de infraestrutura, uma falha preexistente e uma regressão nova para que a investigação e a correção sejam direcionadas corretamente.

## Principais funcionalidades

### Linha de base e classificação das falhas

Estabelece um inventário verificável das falhas que impedem as suítes completas, relacionando cada item ao projeto responsável e à sua causa. Isso evita atribuir à funcionalidade em validação defeitos que já estavam presentes.

- RF1: O produto deve registrar os 53 arquivos de teste do frontend e os 7 testes de backend inicialmente apontados, com seu resultado antes e depois da estabilização.
- RF2: O produto deve distinguir, para cada ocorrência, falha de código, contrato de autenticação/autorização, ambiente ou classificação incorreta do levantamento inicial.
- RF3: Qualquer reclassificação do quantitativo inicial deve ser justificada por evidência reproduzível, sem ocultar uma falha executável.

### Estabilização da suíte de frontend

Corrige os problemas preexistentes que fazem os testes do `municipalize-app` falharem, preservando os comportamentos esperados pela aplicação e por suas integrações existentes.

- RF4: A suíte completa aplicável do frontend deve executar todos os arquivos de teste abrangidos e concluir aprovada.
- RF5: Os testes corrigidos devem continuar verificando o comportamento observável relevante, sem serem removidos, desativados ou enfraquecidos apenas para obter aprovação.
- RF6: Quando a falha depender de contrato de outro projeto ativo, a correção deve preservar a compatibilidade dos consumidores afetados.

### Estabilização de autenticação e autorização no backend

Corrige os 7 testes de backend relacionados a autenticação e autorização para que representem os contratos de acesso vigentes e comprovem tanto os acessos permitidos quanto as recusas esperadas.

- RF7: A suíte completa aplicável do `ms-main` deve executar e aprovar os 7 testes inicialmente identificados.
- RF8: Os cenários corrigidos devem continuar validando que uma identidade autenticada não obtém acesso sem a autorização, o vínculo ou o contexto de tenant exigidos.
- RF9: Os cenários corrigidos devem continuar validando o acesso permitido a usuários autorizados, conforme as regras vigentes do domínio.

### Evidências de qualidade

Torna o resultado da estabilização auditável e útil para as próximas validações de funcionalidades.

- RF10: O produto deve disponibilizar o resultado das execuções completas aplicáveis, incluindo comandos utilizados, data, projeto e resultado por grupo de falhas inicialmente mapeado.
- RF11: Falhas que não possam ser reproduzidas ou corrigidas no escopo devem ser explicitadas com impacto, evidência e ação necessária; elas não podem ser reportadas como aprovação da suíte completa.

## Critérios de aceitação

- CA-01 (US1, RF1, RF4): Dado o ambiente de testes aplicável do `municipalize-app`, quando a suíte completa for executada, então ela deve terminar com sucesso e sem falhas nos 53 arquivos inicialmente mapeados.
- CA-02 (US2, RF1, RF7): Dado o ambiente de testes aplicável do `ms-main`, quando a suíte completa for executada, então ela deve terminar com sucesso e sem falhas nos 7 testes inicialmente mapeados de autenticação e autorização.
- CA-03 (US3, RF2, RF3, RF10): Dado o levantamento inicial de falhas, quando a estabilização for concluída, então cada um dos 60 itens iniciais deve possuir resultado final aprovado ou justificativa verificável de reclassificação.
- CA-04 (US3, RF5): Dado um teste inicialmente falho, quando sua correção for entregue, então o teste deve permanecer executável e deve manter uma asserção sobre o comportamento relevante; ele não pode ser simplesmente ignorado, removido ou marcado como pendente para produzir aprovação.
- CA-05 (US4, RF8): Dado um usuário autenticado sem a permissão, vínculo ou tenant exigido, quando tentar executar uma operação protegida coberta pelos testes corrigidos, então o acesso deve ser recusado.
- CA-06 (US4, RF9): Dado um usuário autenticado e autorizado no tenant correto, quando executar uma operação protegida coberta pelos testes corrigidos, então o acesso deve ser permitido conforme a regra de negócio vigente.
- CA-07 (US5, RF11): Dado qualquer falha remanescente durante a execução completa, quando ela impedir a aprovação, então o relatório deve registrá-la como bloqueio com o comando, impacto e ação necessária, sem atribuir aprovação à suíte.

## Experiência do usuário

Os usuários diretos são pessoas desenvolvedoras, QA e mantenedoras da plataforma; o benefício para usuários municipais é indireto, por meio de entregas mais confiáveis. A jornada começa com a execução das suítes completas, passa pela identificação objetiva de uma falha e termina com um resultado aprovado ou com um bloqueio explicitamente documentado.

Não há nova interface de produto prevista. A experiência de quem mantém o sistema deve oferecer resultados de teste claros, rastreáveis e acionáveis, distinguindo a área responsável pela falha sem expor tokens, cookies, dados pessoais ou dados municipais. As evidências devem ser legíveis e usar dados sintéticos ou anonimizados quando necessário.

## Restrições técnicas de alto nível

- Os projetos ativos envolvidos são `municipalize-app` e `ms-main`; seus contratos existentes são a fonte de verdade para os comportamentos corrigidos.
- `municipalize-chat-api` e `municipalize-mcp` são legados e não devem receber mudanças nem ser reintroduzidos como dependências.
- A estabilização deve preservar os contratos de autenticação com Keycloak e as regras de autorização, vínculo, propriedade e tenant aplicáveis.
- Testes e correções não podem permitir acesso entre tenants nem usar identificadores fornecidos pelo cliente como prova de autorização.
- As verificações devem usar os scripts e condições de execução definidos pelos projetos afetados, com evidências que não exponham credenciais ou dados sensíveis.
- Alterações entre projetos, se necessárias, devem manter contratos compatíveis e validar os consumidores afetados.

## Fora do escopo

- Implementar novas funcionalidades de negócio, telas ou fluxos municipais não necessários para corrigir as falhas mapeadas.
- Alterar regras de autorização, papéis, vínculos ou isolamento por tenant como forma de fazer os testes passarem, salvo quando houver evidência de que o contrato vigente foi implementado incorretamente.
- Desativar, excluir ou transformar em pendentes os testes afetados para obter aprovação artificial.
- Corrigir falhas de projetos legados ou migrar responsabilidades entre os projetos ativos.
- Resolver falhas não relacionadas ao conjunto de 53 arquivos do frontend e 7 testes de backend, exceto quando forem uma causa direta e indispensável para aprovar as suítes completas.
