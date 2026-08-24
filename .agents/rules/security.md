# Regras de segurança

## Segredos e configuração

Nunca coloque senhas, tokens, chaves privadas, credenciais ou strings de conexão
reais no código, documentação, testes, comandos ou logs. Use variáveis de
ambiente e mantenha arquivos `.env` fora do controle de versão.

Um `.env.example` pode ser versionado somente com nomes de variáveis e valores
fictícios seguros. Não leia ou imprima valores sensíveis sem necessidade
explícita para a tarefa. Ao diagnosticar configuração, verifique a presença e o
formato sem revelar o conteúdo.

## Autenticação e autorização

Preserve os contratos de autenticação com Keycloak e as regras de autorização
de cada API. Autenticação não prova permissão sobre um recurso. Toda operação
sensível deve validar usuário, papel, vínculo, propriedade e tenant aplicáveis.

Não aceite identificadores fornecidos pelo cliente como prova suficiente de
acesso. O contexto autenticado deve limitar leituras e escritas.

## Isolamento por tenant

Toda mudança de consulta, cache, evento, job, stream ou persistência deve manter
o isolamento entre tenants. Inclua testes negativos que comprovem que um tenant
não acessa nem altera dados de outro quando o comportamento for afetado.

## Logs e evidências

Não registre tokens, cookies, cabeçalhos de autorização, prompts privados,
documentos completos ou dados pessoais desnecessários. Mascare informações
sensíveis em screenshots, traces, vídeos, relatórios de QA e mensagens de erro.

Estados de autenticação do Playwright e artefatos equivalentes devem permanecer
ignorados pelo Git. Evidências versionadas precisam usar dados sintéticos ou
anonimizados.

## Dependências externas

Defina timeout, tratamento de falha e cancelamento para chamadas externas.
Nunca envie credenciais ou dados municipais a um serviço novo sem decisão
explícita e validação do contrato de segurança.
