# Documento de Requisitos do Produto (PRD)

## Visão geral

O Chat da Municipalize já atende usuários finais autenticados de cada Câmara, mas
o agente atual precisa evoluir para permitir experimentação, observabilidade e
evolução da experiência de agente no ambiente visual do Mastra. Esta iniciativa
cria um piloto do agente Municipalize com Mastra, executado exclusivamente pela
Admin API, para que a equipe possa conversar com o agente no Mastra Studio usando
dados reais do ambiente local de desenvolvimento.

O piloto deve preservar o contexto de segurança do usuário autenticado e de sua
Câmara, manter o estado dos assuntos tratados em cada conversa e disponibilizar
todas as ferramentas Municipalize hoje habilitadas. Assim, o usuário poderá
consultar entidades municipais, como projetos, emendas, instituições e orçamento,
em conversas persistentes e isoladas por contexto. A entrega deixa o agente pronto
para uma futura integração com o frontend, que não faz parte deste escopo.

## Objetivos

- Possibilitar que um usuário final autenticado teste o agente Municipalize no
  Mastra Studio com dados reais de desenvolvimento, sem precisar de uma tela nova
  no produto.
- Garantir que 100% das ferramentas Municipalize atualmente habilitadas para o
  agente estejam registradas e possam ser acionadas pelo agente no piloto,
  respeitando as políticas de acesso e confirmação já aplicáveis.
- Garantir que 100% dos fluxos de validação de integração continuem usando o
  ambiente e a base de QA já adotados pela plataforma, inclusive a resolução da
  URL do backend da Câmara a partir do cadastro do cliente.
- Permitir criar, recuperar, listar, nomear automaticamente e remover conversas
  persistentes no Mastra Studio; uma conversa salva deve continuar disponível ao
  iniciar uma nova sessão do Studio no mesmo contexto autorizado.
- Validar, no Mastra Studio, pelo menos uma consulta bem-sucedida para cada
  domínio inicialmente priorizado: projetos, emendas, instituições e orçamento,
  sem exposição de dados de outra Câmara ou de outro usuário.

## Histórias de usuário

- US1: Como usuário final autenticado de uma Câmara, quero iniciar uma conversa
  com o agente no Mastra Studio para consultar e trabalhar com os dados municipais
  aos quais tenho acesso.
- US2: Como usuário final autenticado, quero que o agente reconheça a minha
  identidade e a Câmara em que estou operando para que as respostas e ferramentas
  usem somente meu contexto autorizado.
- US3: Como usuário final autenticado, quero que projetos, emendas, instituições,
  orçamento e outros dados trazidos durante uma conversa permaneçam associados a
  ela para que eu possa retomar o trabalho sem reenviar o contexto.
- US4: Como usuário final autenticado, quero listar e reabrir minhas conversas
  anteriores para continuar uma análise municipal de onde parei.
- US5: Como usuário final autenticado, quero que uma nova conversa receba um nome
  baseado em sua primeira mensagem para identificá-la facilmente na lista.
- US6: Como usuário final autenticado, quero remover uma conversa que não é mais
  útil para manter meu histórico organizado.
- US7: Como responsável pelo piloto, quero que todas as ferramentas Municipalize
  disponíveis hoje sejam apresentadas ao agente para verificar, no Mastra Studio,
  sua capacidade de consultar e operar os dados permitidos.
- US8: Como usuário final autenticado, quero que o agente descubra o backend da
  minha Câmara a partir da configuração cadastrada para que as ferramentas
  consultem o ambiente correto sem eu informar URLs manualmente.

## Principais funcionalidades

### Agente Municipalize disponível no Mastra Studio

O piloto deve disponibilizar no Mastra Studio um agente voltado ao usuário final
da Municipalize. Ele deve aceitar mensagens em linguagem natural, produzir
respostas no contexto municipal e ser utilizável no ambiente local de
desenvolvimento com dados reais autorizados.

- RF1: O sistema deve disponibilizar o agente Municipalize no Mastra Studio para
  uso de usuários finais autenticados no contexto de uma Câmara.
- RF2: O agente deve responder considerando a conversa corrente e as ferramentas
  que o usuário pode utilizar.
- RF3: O piloto deve permitir validar as consultas de projetos, emendas,
  instituições e orçamento no Mastra Studio.

### Contexto autorizado por usuário e Câmara

O agente deve carregar a identidade do usuário final autenticado e a Câmara
selecionada como contexto do recurso da execução. Esse contexto é obrigatório em
toda execução e impede que o agente ou uma ferramenta opere fora da Câmara e das
permissões do usuário.

- RF4: Cada execução do agente deve estar vinculada ao identificador do usuário
  autenticado e ao identificador da Câmara em que ele está operando.
- RF5: A ausência ou a divergência de usuário, Câmara ou autorização deve impedir
  a consulta, execução de ferramenta e acesso à conversa correspondente.
- RF6: A seleção do backend da Câmara deve usar o cadastro do cliente para
  determinar a URL apropriada; o usuário não deve informar nem alterar essa URL.

### Conversas persistentes e contexto de entidades

Cada conversa deve manter seu histórico e os dados municipais relevantes que
tenham sido recuperados ou escolhidos durante a interação. Esse estado permite
que o agente continue uma tarefa sobre entidades já apresentadas, sem tratá-las
como dados globais de outro usuário ou de outra Câmara.

- RF7: O sistema deve criar e persistir uma conversa para o contexto autorizado
  do usuário e da Câmara.
- RF8: O sistema deve associar à conversa os dados de entidades municipais usados
  durante a interação, incluindo projetos, emendas, instituições e orçamento,
  além de outros domínios retornados por ferramentas habilitadas quando
  necessários à continuidade da conversa.
- RF9: O agente deve recuperar o histórico e o contexto de entidades da conversa
  quando ela for reaberta pelo mesmo usuário no mesmo contexto autorizado.
- RF10: O sistema deve listar somente as conversas pertencentes ao usuário no
  contexto autorizado da Câmara.
- RF11: O sistema deve permitir a remoção de uma conversa pelo seu proprietário,
  tornando-a indisponível para reabertura e listagem.
- RF12: Após a primeira mensagem de uma conversa, o sistema deve gerar e salvar
  um título representativo baseado no conteúdo dessa mensagem.

### Registro e uso das ferramentas Municipalize

O agente Mastra deve usar o catálogo vigente de ferramentas internas da
Municipalize, sem recriar regras de negócio ou abrir um caminho paralelo para os
backends municipais. As ferramentas devem continuar sujeitas às suas políticas de
autorização e às confirmações necessárias para operações de maior risco.

- RF13: O sistema deve registrar no agente todas as ferramentas Municipalize
  atualmente habilitadas no catálogo vigente.
- RF14: O agente deve executar uma ferramenta somente no contexto autenticado do
  usuário e da Câmara e deve encaminhar esse contexto à execução.
- RF15: O agente deve respeitar as políticas vigentes de disponibilidade,
  autorização e confirmação de cada ferramenta.
- RF16: O sistema deve manter, na conversa, evidências suficientes das ferramentas
  usadas e de seus resultados para permitir a continuidade da interação, sem
  armazenar segredos ou credenciais.

### Validação em desenvolvimento e QA

O piloto deve poder ser testado visualmente com a base local de desenvolvimento e
continuar compatível com os testes de integração existentes no ambiente de QA.

- RF17: O Mastra Studio deve permitir criar, reabrir, listar e remover conversas
  persistentes durante a validação local de desenvolvimento.
- RF18: Os testes de integração aplicáveis devem continuar usando a base e o
  ambiente de QA existentes.
- RF19: Os fluxos de teste devem resolver o backend da Câmara pela configuração
  de cliente, como no comportamento atual, sem URLs fixas específicas de teste.

## Critérios de aceitação

- CA-01 (US1, RF1): Dado um usuário final autenticado e uma Câmara válida no
  ambiente local de desenvolvimento, quando ele abre o Mastra Studio, então pode
  iniciar uma conversa com o agente Municipalize.
- CA-02 (US2, RF4, RF5): Dado um usuário autenticado em uma Câmara, quando ele
  envia uma mensagem ou solicita uma ferramenta, então a execução é vinculada a
  esse usuário e Câmara; uma tentativa com contexto ausente, divergente ou não
  autorizado é recusada.
- CA-03 (US3, RF7-RF9): Dada uma conversa em que projetos, emendas, instituições
  ou orçamento foram usados, quando seu proprietário a reabre, então o histórico
  e os dados de contexto necessários para continuar a interação estão disponíveis
  ao agente.
- CA-04 (US4, RF10): Dado um usuário autenticado, quando ele lista conversas no
  Mastra Studio, então visualiza apenas as conversas associadas a ele e à Câmara
  do contexto atual.
- CA-05 (US5, RF12): Dada uma conversa recém-criada, quando sua primeira mensagem
  é processada, então a conversa recebe e persiste um título baseado nessa
  mensagem.
- CA-06 (US6, RF11): Dada uma conversa pertencente ao usuário, quando ele a
  remove, então ela deixa de aparecer na listagem e não pode ser reaberta.
- CA-07 (US7, RF13-RF15): Dado o catálogo de ferramentas Municipalize habilitadas
  no momento da validação, quando o agente é iniciado, então 100% dessas
  ferramentas estão registradas para o agente e obedecem às políticas de acesso e
  confirmação aplicáveis.
- CA-08 (US8, RF6, RF19): Dado um usuário de uma Câmara com backend configurado,
  quando o agente executa uma ferramenta, então a chamada usa a URL resolvida pelo
  cadastro desse cliente e não uma URL fornecida pelo usuário ou fixa no fluxo.
- CA-09 (RF3): Dado o agente no Mastra Studio, quando o usuário solicita dados de
  cada domínio priorizado, então ele conclui com sucesso ao menos uma consulta de
  projetos, emendas, instituições e orçamento autorizada para sua Câmara.
- CA-10 (RF17-RF18): Dado o piloto implementado, quando são executados os fluxos
  manuais no ambiente local e os testes de integração aplicáveis, então as
  conversas persistem na validação local e os testes continuam apontando para o
  ambiente e a base de QA existentes.

## Experiência do usuário

O perfil inicial é o usuário final autenticado na Municipalize e associado a uma
Câmara. Sua experiência desta fase ocorre integralmente no Mastra Studio: ele
inicia uma conversa, envia uma pergunta sobre a gestão municipal, recebe a
resposta e pode continuar fazendo referência às entidades já retornadas. Ao
retornar, localiza sua conversa pelo título gerado da primeira mensagem, retoma o
contexto ou a remove quando desejar.

O Mastra Studio é a interface de validação desta fase. Não haverá alteração de
telas, navegação ou componentes do frontend Municipalize. A futura experiência no
produto deverá reutilizar a capacidade de conversas, contexto e ferramentas
validada neste piloto, preservando as exigências de acessibilidade aplicáveis ao
frontend quando ele vier a ser integrado.

## Restrições técnicas de alto nível

- O escopo de implementação pertence exclusivamente ao repositório
  `municipalize-admin-app`; não haverá alteração no frontend, no `ms-main` ou nos
  repositórios legados.
- A solução deve usar Mastra e o Mastra Studio, seguindo a forma de integração
  documentada e suportada pelo Mastra para aplicações NestJS. A definição de
  arquitetura, versões, adaptadores e ciclo de execução pertence à TechSpec.
- O contexto de recurso da execução deve conter obrigatoriamente o usuário
  autenticado e a Câmara. Conversas, mensagens, entidades contextualizadas e uso
  de ferramentas devem respeitar esse isolamento e a autorização existente.
- A integração deve reutilizar o catálogo e o mecanismo vigentes de ferramentas
  Municipalize, incluindo suas políticas, confirmações e resolução de backend por
  cliente; não deve reintroduzir o serviço MCP legado nem criar serviço separado.
- Dados reais podem ser usados somente no ambiente local de desenvolvimento
  controlado. Os testes de integração devem manter o uso do banco e ambiente de
  QA existentes.
- Tokens, credenciais, cabeçalhos de autorização e outros segredos não podem ser
  persistidos na conversa, expostos no Mastra Studio ou registrados em logs.
- A solução deve manter compatibilidade com os contratos públicos atuais da Admin
  API. Qualquer exposição posterior ao frontend será definida em uma tarefa
  separada, com contrato e estratégia de compatibilidade próprios.

## Fora do escopo

- Alterar o frontend `municipalize-app`, criar telas de Chat ou conectar o
  frontend ao agente Mastra nesta iniciativa.
- Alterar regras de negócio, dados operacionais ou APIs do `ms-main`.
- Migrar ou reativar os repositórios legados `municipalize-chat-api` e
  `municipalize-mcp`.
- Criar novas ferramentas municipais, modificar a semântica das ferramentas
  atuais ou substituir suas políticas de autorização e confirmação.
- Definir a arquitetura detalhada, versões, esquema de persistência, rotas,
  streaming, adapters ou código de integração NestJS/Mastra; esses itens serão
  definidos na TechSpec.
- Disponibilizar o Mastra Studio ou dados reais de desenvolvimento como interface
  de produção para usuários finais.
- Alterar os contratos atuais consumidos pelo frontend nesta fase.
