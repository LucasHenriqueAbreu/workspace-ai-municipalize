# Documento de Requisitos do Produto (PRD)

## Visão geral

O Chat Municipalize precisa deixar de acumular responsabilidades de interface,
conversa, execução do agente, catálogo de modelos e controle de consumo. Hoje a
API de Chat preserva conversas e mensagens próprias, chama diretamente o
`agent-runtime`, registra tokens e custo em USD e decide disponibilidade. Em
paralelo, o Mastra existe como piloto local com memória, contexto de conversa e
adaptação de tools, sem ser ainda o harness efetivo do Chat do produto. Essa
duplicidade torna incerto quem é a fonte de verdade da conversa e permite que
as regras da assistente sejam aplicadas de maneira diferente entre os caminhos.

Esta iniciativa consolida o Mastra como harness do agente Municipalize e define
fronteiras de responsabilidade explícitas no monólito modular NestJS. O módulo
de Chat será a borda autenticada entre o frontend e o harness, responsável pelo
contrato HTTP/SSE e pela transmissão dos resultados. O harness Mastra será dono
da conversa, da memória, da execução do agente, da coordenação das tools e das
instruções operacionais. O módulo de ferramentas continuará dono das operações
municipais que o harness adapta para o modelo. Catálogo de modelos e governança de consumo serão capacidades
separadas, com políticas para cliente/Câmara e usuário autenticado. O resultado
é uma experiência de Chat compatível para os usuários, com regras previsíveis,
auditáveis e seguras.

## Objetivos

- Fazer com que 100% das mensagens produtivas do Chat sejam executadas pelo
  harness Mastra, mantendo os contratos HTTP e SSE já consumidos pelo frontend.
- Estabelecer uma única fonte de verdade para a conversa, o histórico, a
  memória e o contexto de entidades do agente; após a migração, nenhuma
  conversa ativa deve exigir sincronização entre persistências concorrentes.
- Fazer com que 100% das decisões de disponibilidade, reserva/autorização de
  uso e registro de consumo monetário sejam tomadas por uma capacidade de
  governança de consumo independente do módulo de Chat.
- Preservar o isolamento em 100% das execuções por Câmara/cliente, ambiente,
  usuário autenticado, função e propriedade da conversa; contexto ausente,
  divergente ou não autorizado deve impedir a execução.
- Disponibilizar uma política de instruções única e classificável para o
  agente, aplicada tanto pelo Chat produtivo quanto por ambientes de validação
  Mastra, sem instruções de segurança ou negócio duplicadas em prompts soltos.
- Concluir com lint, typecheck, build, testes aplicáveis e cobertura mínima de
  80% aprovados, sem regressão nos contratos públicos do Chat.

## Histórias de usuário

- US1: Como usuário autenticado de uma Câmara, quero continuar conversando com
  a Gracy pelo frontend e recebendo a resposta em streaming para usar o agente
  sem mudança inesperada na experiência.
- US2: Como usuário autenticado, quero retomar uma conversa e suas entidades em
  foco para que o agente continue o trabalho no meu contexto, sem perder
  histórico nem acessar informações de outra Câmara ou usuário.
- US3: Como administrador do produto, quero que a disponibilidade do agente e
  o consumo em USD sejam controlados por Câmara e usuário para aplicar o
  orçamento contratado e as alocações de cada função.
- US4: Como responsável pela operação, quero consultar o consumo por Câmara,
  usuário, modelo e período para acompanhar custo, limites e decisões de
  bloqueio com dados confiáveis.
- US5: Como responsável pelo produto, quero regras explícitas sobre o que a
  Gracy pode responder, quando deve usar uma ferramenta e como deve solicitar
  confirmação para que o comportamento seja institucional, previsível e seguro.
- US6: Como desenvolvedor da Admin API, quero que cada módulo tenha um propósito
  único e uma API interna mínima para evoluir Chat, Mastra, modelos, consumo e
  tools sem replicar regras ou criar acoplamentos indevidos.
- US7: Como equipe de IA, quero usar o mesmo harness Mastra nos fluxos de
  produto e de validação para que um comportamento comprovado no Studio não
  seja diferente daquele entregue ao usuário final.

## Principais funcionalidades

### Chat como borda de produto e streaming

O Chat será a única interface do frontend para iniciar ou continuar uma
interação com a Gracy. Ele recebe a requisição autenticada, valida seu formato,
propaga cancelamento, entrega eventos compatíveis em HTTP/SSE e mapeia erros
para o contrato público. Ele não decide a resposta do modelo, não mantém uma
memória concorrente da conversa e não contém regras de ferramenta, orçamento ou
persona do agente.

- RF1: O sistema deve manter as rotas, métodos, payloads, status, headers e
  eventos HTTP/SSE vigentes do Chat enquanto passa a encaminhar a execução ao
  harness Mastra.
- RF2: O sistema deve propagar para o harness somente o contexto autenticado e
  necessário da requisição, incluindo cliente/Câmara, ambiente, usuário,
  conversa solicitada, mensagem, modelo selecionado e sinal de cancelamento.
- RF3: O Chat deve transmitir ao frontend os eventos do harness em formato
  compatível, incluindo criação/identificação da conversa, deltas, tools
  utilizadas, mutações observáveis, uso, conclusão e erro.
- RF4: O Chat não deve possuir nova fonte de verdade para mensagens, memória,
  contexto de entidades, decisões do agente ou histórico da conversa após a
  migração.
- RF5: O Chat deve continuar recusando requisições sem bearer token e deve
  devolver erros no envelope público vigente, sem expor tokens, prompts, dados
  municipais ou detalhes internos do harness.

### Harness Mastra como dono da conversa e do agente

O Mastra passa a ser o harness de produção do agente Municipalize. Ele recebe a
identidade já verificada no limite apropriado, recupera ou cria a conversa do
usuário, mantém memória e contexto de entidades, compõe instruções aprovadas,
coordena o modelo e adapta as tools municipais para ele, produzindo os eventos da execução. O Mastra Studio
continua como ambiente de validação dessa mesma capacidade, não como uma
experiência paralela com comportamento próprio.

- RF6: O sistema deve executar as mensagens do Chat por um único fluxo de
  harness Mastra, compartilhado com o ambiente de validação sempre que o caso
  de uso for equivalente.
- RF7: O harness deve criar, recuperar, listar, renomear e encerrar conversas
  apenas no contexto autorizado de cliente/Câmara, ambiente e usuário.
- RF8: O harness deve manter para cada conversa o histórico e o contexto
  municipal mínimo necessário para resolver referências como entidade em foco,
  sem persistir credenciais, tokens ou dados desnecessários.
- RF9: O harness deve registrar para o modelo somente as tools habilitadas no
  catálogo interno Municipalize e delegar a execução a esse catálogo, respeitando
  suas políticas de disponibilidade, autorização e confirmação.
- RF10: Operações que modificam dados devem requerer confirmação explícita do
  usuário controlada pelo runtime/harness antes da execução; uma confirmação não
  pode ser reutilizada fora da conversa, da ação e do contexto autorizado.
- RF11: O harness deve encerrar ou cancelar chamadas ao modelo e às tools quando
  o cliente desconectar ou o limite de tempo aplicável for atingido.

### Catálogo de modelos de IA

O catálogo de modelos é a capacidade que apresenta e resolve modelos elegíveis
para a Municipalize. Ele informa características necessárias à experiência do
agente, como suporte a tools, streaming e limites de contexto, e sua
classificação comercial. Ele não autoriza consumo, não executa conversas e não
calcula saldos por usuário.

- RF12: O sistema deve disponibilizar somente modelos habilitados e compatíveis
  com as capacidades obrigatórias do agente Municipalize, especialmente uso de
  tools e streaming quando solicitados.
- RF13: Cada modelo elegível deve expor identificador, nome de apresentação,
  provedor, limites conhecidos, capacidades e classificação `free`, `paid` ou
  `unknown` de forma consistente para os consumidores autorizados.
- RF14: A seleção de modelo ausente, indisponível ou incompatível deve falhar de
  forma explícita antes de iniciar uma execução ou consumir orçamento.
- RF15: O catálogo de modelos não deve ser a fonte de verdade de uso mensal,
  saldo, alocação por função, custo efetivamente cobrado ou autorização de uma
  mensagem.

### Governança e registro de consumo de IA

Uma capacidade própria de governança de consumo deve autorizar o início de uma
execução e registrar seu uso final. Ela considera a configuração comercial da
Câmara, o orçamento em USD, a função e a alocação do usuário e os dados de uso
devolvidos pelo provedor/harness. O Chat e o Mastra a consomem por uma API
interna, sem duplicar cálculos ou gravar seus próprios saldos.

- RF16: Antes de iniciar uma execução, o sistema deve avaliar a configuração de
  IA da Câmara, o orçamento disponível em USD, a função do usuário, sua
  alocação aplicável e seu consumo mensal para permitir ou recusar o uso.
- RF17: Ao concluir uma execução, inclusive quando usar tools ou streaming, o
  sistema deve registrar uma única ocorrência de consumo com Câmara, usuário,
  conversa, modelo, provedor, tokens de entrada e saída, total de tokens e
  custo em USD quando informado pelo provedor.
- RF17.1: O registro e a atualização dos saldos devem ser realizados somente
  pela capacidade de governança de consumo. O harness deve lhe fornecer o
  resultado final autorizado da execução, e o Chat não deve gravar consumo ou
  manter cálculos próprios.
- RF18: O sistema deve manter saldos e relatórios de consumo por Câmara e por
  usuário, agregados por período mensal, com detalhamento suficiente para
  auditoria por modelo, provedor e conversa.
- RF19: Quando o custo em USD não estiver disponível ou for inválido, o sistema
  deve aplicar uma política explícita e segura de medição/autorização, sem
  apresentar custo presumido como valor efetivamente cobrado nem permitir que a
  ausência do valor contorne um limite monetário.
- RF20: O consumo não pode ser registrado duas vezes por reenvio, reconexão do
  stream, repetição de evento ou nova tentativa de persistência; falhas de
  registro devem ser observáveis e tratadas conforme uma política explícita.
- RF21: As consultas de disponibilidade e de uso atuais devem continuar
  disponíveis ao frontend e aos administradores com resultado compatível,
  refletindo a fonte de verdade de governança de consumo.

### Política explícita de instruções e regras do agente

As instruções da Gracy devem deixar de ser um único arquivo que mistura persona,
escopo, segurança, regras de tool e detalhes de campos. A política será
classificada por propósito e montada pelo harness de modo consistente. Nenhuma
instrução textual substitui a autorização, validação de schema, confirmação ou
regra de negócio aplicada em código e no `ms-main`.

- RF22: O sistema deve manter uma política de experiência do agente com a
  identidade da Gracy, tom institucional, escopo de atendimento, formato de
  resposta e comportamento para informações indisponíveis.
- RF23: O sistema deve manter regras transversais de segurança e operação do
  agente, incluindo isolamento por tenant, não inventar identificadores, uso
  exclusivo de tools autorizadas, não exposição de segredos e confirmação antes
  de mutações.
- RF24: O sistema deve manter orientações específicas de cada domínio ou tool,
  descrevendo dados necessários, sequência operacional e termos de negócio sem
  duplicar a validação ou a autorização definitiva do backend.
- RF25: O sistema deve fornecer ao harness contexto dinâmico mínimo, autorizado
  e rastreável de usuário, Câmara, ambiente, conversa e entidades em foco, sem
  permitir que conteúdo enviado pelo cliente se torne prova de autorização.
- RF26: O mesmo conjunto aprovado de políticas aplicável a um caso de uso deve
  ser utilizado no Chat produtivo e no Mastra Studio; divergências deliberadas
  de ambiente devem ser declaradas e testadas.
- RF27: As políticas e instruções devem ter proprietário funcional, finalidade
  e versão identificáveis, permitindo revisar uma alteração e verificar quais
  execuções a utilizaram, sem registrar o texto de prompts privados em logs.

### Fronteiras modulares e migração segura

A refatoração deve confirmar o princípio de responsabilidade única também para
módulos: cada capacidade é dona de suas decisões, dados e integrações. A
migração não pode criar um segundo produto de Chat nem interromper conversas em
andamento sem tratamento explícito.

- RF28: O módulo de Chat deve depender apenas de contratos públicos mínimos do
  harness e da governança de consumo que forem necessários para atender o
  frontend; ele não deve acessar diretamente memória Mastra, catálogo de tools,
  persistência de consumo ou fornecedor de modelo.
- RF29: O módulo do harness Mastra deve consumir tools, modelos e governança por
  APIs internas dos módulos proprietários, sem recriar catálogo, regras de
  negócio municipal, autenticação ou cálculo de orçamento.
- RF30: O módulo de ferramentas deve continuar sendo dono de schemas,
  disponibilidade, risco, confirmação e execução autorizada das operações
  municipais; o harness apenas as adapta ao protocolo do modelo e coordena seu
  uso.
- RF31: A migração deve preservar ou migrar conversas e uso existentes com uma
  estratégia segura, idempotente e reversível, sem perda de propriedade,
  isolamento, histórico ou totais já registrados.
- RF32: Nenhum módulo deve chamar rotas HTTP da própria Admin API para colaborar
  internamente, e a mudança não deve criar microserviços, reativar MCP ou
  restaurar os repositórios legados.
- RF32.1: A memória, as threads e demais dados persistidos pelo Mastra devem
  usar a conexão MongoDB e o banco de dados da própria Admin API, em collections
  exclusivas do Mastra e sob ownership do módulo de harness; não deve haver uma
  base MongoDB separada, conexão paralela ou credencial exclusiva para Mastra.
- RF33: Após o harness Mastra atender os fluxos produtivos equivalentes do Chat,
  o sistema deve retirar o módulo `agent-runtime`, seus adapters diretos de
  LiteLLM, regras duplicadas, loop de tools, configurações e testes exclusivos,
  sem remover capacidades ainda necessárias que tenham sido migradas para seus
  módulos proprietários.

## Critérios de aceitação

- CA-01 (US1, RF1-RF5): Dado o frontend atual autenticado, quando envia ou
  transmite uma mensagem, então recebe os mesmos contratos HTTP/SSE esperados e
  a resposta é produzida pelo harness Mastra.
- CA-02 (US2, RF6-RF8): Dado o proprietário de uma conversa, quando ele a
  retoma no mesmo cliente/Câmara e ambiente, então o harness recupera seu
  histórico e contexto necessário; outro usuário ou Câmara não pode acessá-los.
- CA-03 (US1, RF9-RF11): Dada uma operação de leitura ou mutação, quando o
  harness usa uma tool, então somente uma tool habilitada é usada no contexto
  autorizado e uma mutação só é executada após confirmação válida e única.
- CA-04 (US3, RF12-RF15): Dado um modelo solicitado, quando ele é selecionado,
  então o sistema aceita apenas modelo elegível para a capacidade requerida e
  não atribui ao catálogo a decisão de orçamento ou consumo do usuário.
- CA-05 (US3, RF16): Dado um usuário com função, alocação e orçamento válidos,
  quando inicia uma mensagem, então a governança autoriza o uso; se qualquer
  condição estiver ausente, inválida ou esgotada, a execução é recusada antes de
  chamar o modelo.
- CA-06 (US4, RF17-RF18): Dada uma execução concluída, quando o provedor retorna
  uso, então existe uma única ocorrência auditável e os agregados por Câmara e
  usuário refletem tokens e custo em USD, com modelo e provedor identificados.
- CA-07 (US4, RF19-RF21): Dado custo ausente, stream reconectado, repetição de
  evento ou falha de persistência, quando o consumo é processado, então a
  política definida é aplicada sem contornar limite em USD, duplicar cobrança ou
  retornar totais inconsistentes nas consultas existentes.
- CA-08 (US5, RF22-RF27): Dada uma mensagem dentro ou fora do escopo, uma
  referência a entidade ou uma ação sensível, quando o agente responde, então
  ele aplica a política aprovada correspondente e não expõe segredos, IDs
  técnicos desnecessários ou regras inventadas.
- CA-09 (US5, RF26): Dado um caso de uso equivalente executado pelo Chat e pelo
  Mastra Studio, quando ambos usam o mesmo usuário, Câmara, modelo e tools,
  então recebem a mesma política de instruções e obedecem às mesmas proteções.
- CA-10 (US6, RF28-RF30): Dado o grafo de módulos final, quando se inspecionam
  as dependências públicas, então Chat, harness, modelos, governança de consumo
  e tools colaboram somente pelas APIs de seus proprietários, sem acesso direto
  à persistência ou regras internas de outro módulo.
- CA-11 (US6, RF31-RF32): Dadas conversas e registros de uso anteriores, quando
  a migração é aplicada ou repetida, então dados preservados permanecem do
  proprietário correto, totais não duplicam e os fluxos internos não dependem
  de HTTP próprio, MCP ou repositórios legados.
- CA-12 (US2, RF32.1): Dada uma conversa executada pelo harness Mastra, quando
  sua memória ou thread é persistida, então os dados usam o MongoDB da Admin API
  em collection exclusiva, continuam isolados por contexto autorizado e não
  dependem de banco ou credencial Mastra separados.
- CA-13 (US6, RF33): Dado que o Chat produtivo já usa o harness Mastra, quando
  a migração é concluída, então não existe import, provider, configuração ou
  fluxo produtivo dependente do `agent-runtime`.
- CA-14 (objetivos): Dada a implementação concluída, quando são executados
  lint, typecheck, testes aplicáveis, cobertura e build, então todos passam e a
  cobertura mínima obrigatória de 80% é atendida.

## Experiência do usuário

O usuário final continua usando as telas atuais do Municipalize. Ele envia uma
mensagem, vê a resposta em streaming, recebe confirmação clara antes de uma
ação que modifica dados e pode continuar a conversa sem conhecer Mastra,
LiteLLM, tokens, IDs internos ou a divisão entre módulos. Quando a IA não está
disponível para sua função ou Câmara, o frontend recebe o motivo compatível para
orientar o usuário sem revelar orçamento, credenciais ou dados de terceiros.

A Gracy se comunica em português do Brasil, com linguagem clara, institucional
e objetiva. Ela responde somente a partir de orientações aprovadas, contexto
autorizado e ferramentas disponíveis. Pode fazer no máximo uma pergunta objetiva
quando houver ambiguidade material. Fora do escopo ou sem informação confiável,
informa que o dado não está disponível no escopo do Municipalize. Essas regras
de experiência devem ser aplicadas pelo harness, não por lógica de apresentação
do frontend.

Para administradores, as consultas existentes de disponibilidade e consumo
continuam mostrando o total da Câmara e o uso individual de forma compatível,
agora com medição monetária em USD confiável. O Mastra Studio permanece uma
ferramenta de validação controlada, que demonstra o mesmo comportamento do
harness; não é uma nova interface de produção.

## Restrições técnicas de alto nível

- O escopo pertence exclusivamente ao repositório `municipalize-admin-app` e
  deve preservar o monólito modular NestJS. A TechSpec definirá a organização
  final dos módulos, contratos, adapters e sequência de migração.
- O Mastra é o harness do agente e a fonte de verdade da conversa após a
  migração. A Admin API NestJS continua sendo o processo que compõe módulos,
  autenticação, rotas públicas e integrações; não deve haver um serviço de Chat
  ou agente separado por padrão.
- Os contratos HTTP e SSE ativos do `municipalize-app` devem ser compatíveis
  durante toda a migração. Mudanças públicas exigem iniciativa própria,
  estratégia de compatibilidade e validação dos consumidores.
- A identidade Keycloak, autorização concreta no backend da Câmara, isolamento
  por cliente, ambiente, usuário, função e propriedade de conversa são
  requisitos não negociáveis. Prompt ou memória nunca substituem essas
  validações.
- O custo em USD deve representar valor retornado ou definido por fonte
  comercial confiável; não pode ser inferido silenciosamente a partir de tokens
  sem política explícita. Registros de uso devem ser idempotentes e auditáveis.
- A store do Mastra deve usar a conexão MongoDB e o banco já operados pela Admin
  API, mas suas collections devem ter responsabilidade, índices, retenção e
  controles de acesso explícitos. Ela não pode acessar diretamente collections
  de conversa, uso ou configuração pertencentes a outros módulos.
- LiteLLM, Mastra, backend Municipalize e demais dependências externas devem
  ter timeout, cancelamento quando suportado, erros seguros e logs sem tokens,
  prompts privados, headers, corpos sensíveis ou dados pessoais desnecessários.
- A migração de dados deve preservar collections e informações existentes até
  que a equivalência seja comprovada; qualquer mudança incompatível exige plano
  de coexistência, migração e rollback na TechSpec.
- O catálogo interno de tools, suas políticas e o gateway do `ms-main` seguem
  como fontes de verdade operacionais conforme o PRD de remoção de MCP e
  organização de ferramentas. Não se deve recriar essa capacidade no Mastra.

## Fora do escopo

- Alterar telas, navegação, acessibilidade visual ou contratos públicos do
  `municipalize-app`, exceto adaptações futuras autorizadas explicitamente para
  manter compatibilidade.
- Criar novas regras municipais, permissões, entidades ou APIs no `ms-main`, ou
  transferir para a Admin API a validação definitiva de negócio e autorização.
- Criar novas tools municipais ou modificar sua semântica funcional; esta
  iniciativa apenas integra o catálogo vigente ao harness definido.
- Manter compatibilidade permanente com o `agent-runtime` depois de o harness
  Mastra assumir os fluxos produtivos equivalentes; a convivência temporária é
  apenas um meio seguro de migração.
- Reativar, executar, publicar ou tornar dependentes os repositórios legados
  `municipalize-chat-api` e `municipalize-mcp`, ou expor MCP a clientes externos.
- Tornar o Mastra Studio uma interface de produção voltada ao usuário final.
- Definir detalhes de implementação como nomes de pastas, classes, providers,
  schemas de banco, rotas internas, adaptadores, versões de dependência, ordem
  de commits ou estratégia detalhada de rollout; esses itens pertencem à
  TechSpec.
- Alterar preços comerciais, contratos, percentuais de alocação de função ou
  regras administrativas que definem orçamento; o escopo é aplicar e registrar
  corretamente as políticas existentes e suas futuras fontes autorizadas.
