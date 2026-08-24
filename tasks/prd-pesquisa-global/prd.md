# Documento de Requisitos do Produto (PRD)

## Visão geral

A Pesquisa Global oferecerá aos usuários autenticados do Municipalize uma única entrada para localizar rapidamente tanto dados municipais quanto telas e funcionalidades do sistema. A experiência será semelhante à pesquisa de um marketplace: resultados aparecem durante a digitação, são agrupados por categoria, deixam claro por que correspondem ao termo e podem ser percorridos e selecionados pelo teclado. A seleção de um dado abrirá seus detalhes autorizados em um Drawer oficial do Zard UI sobre a tela atual, sem alterar a URL; resultados de telas e funcionalidades continuarão levando à rota autorizada correspondente.

A funcionalidade abrangerá o `ms-main`, responsável exclusivamente pela pesquisa resumida de dados persistidos do tenant atual e pelas consultas autorizadas por identificador, e o `municipalize-app`, responsável pela pesquisa local de navegação, pelo cache efêmero das respostas resumidas e pela apresentação no Command e no Drawer do Zard UI. O escopo inicial de dados será composto por usuários, projetos, emendas, vereadores e instituições. O acesso à pesquisa e aos detalhes será oferecido a todos os usuários autenticados, sem ampliar as permissões que cada perfil já possui sobre telas ou registros.

## Objetivos

- Reduzir para uma única interação a descoberta de dados, telas e funcionalidades acessíveis ao usuário, sem que ele precise conhecer previamente o módulo de destino.
- Garantir que 100% das pesquisas por dados persistidos usem um único endpoint global e no máximo uma requisição ativa por termo normalizado.
- Garantir que 100% dos resultados de dados tragam o tipo, o identificador do registro e somente as informações resumidas necessárias para reconhecer o item e solicitar seus detalhes.
- Garantir que 100% dos resultados autorizados dos cinco tipos iniciais abram o detalhe vigente e autorizado em um Drawer unificado, sem navegação de rota ou alteração da URL.
- Garantir que toda abertura ou reabertura de um detalhe execute uma nova consulta autorizada por identificador, sem tratar o resumo da pesquisa ou seu cache como fonte do detalhe.
- Entregar resultados locais de navegação antes da resposta de rede e iniciar a pesquisa de dados somente a partir de três caracteres normalizados.
- Atender 100% das repetições de uma consulta remota idêntica feitas no mesmo contexto em até cinco minutos pelo cache do navegador, sem nova requisição ao backend nem nova consulta ao banco.
- Exibir no estado inicial do Command até as cinco consultas recentes distintas ainda válidas no cache, permitindo retomá-las sem nova requisição.
- Limitar cada página da pesquisa de dados a 20 registros e informar total, distribuição por tipo e existência de mais resultados.
- Fazer com que, no conjunto de consultas de aceitação, correspondências nos campos principais da própria entidade apareçam antes de correspondências obtidas somente por relacionamento, que o código SAPL exato priorize a emenda correspondente e que as correspondências textuais esperadas apareçam entre os cinco primeiros resultados elegíveis.
- Manter o tempo de resposta do endpoint em até 500 ms no percentil 95, desconsiderando o debounce e considerando volume representativo, índices atualizados e ambiente de teste compatível com produção.
- Impedir integralmente vazamentos entre tenants, municípios, instituições ou perfis, incluindo nos resultados, totais e contagens por tipo.
- Garantir que nenhum resultado exponha CPF, token, documento pessoal, credencial, campo interno ou outro dado desnecessário à identificação e à navegação.
- Atender WCAG 2.1 nível AA, incluindo operação completa por teclado, foco visível, nomes acessíveis, anúncios de estado e experiência responsiva.
- Manter cobertura automatizada mínima de 80% para o código novo ou alterado nos critérios adotados por cada projeto, além de lint, testes e builds aprovados.

## Histórias de usuário

- US1: Como usuário autenticado, quero pesquisar dados e funcionalidades em um único lugar e abrir diretamente os detalhes de um dado para chegar rapidamente ao que preciso sem percorrer vários menus.
- US2: Como usuário que conhece o código SAPL de uma emenda, quero localizar a própria emenda e, quando relevante, seus projetos e instituições relacionados, sem que identificadores internos sejam tratados como códigos conhecidos por mim.
- US3: Como usuário que não conhece o nome exato de uma tela, quero pesquisar por intenções como cadastrar, consultar, editar ou acompanhar para descobrir a funcionalidade adequada.
- US4: Como usuário com permissões restritas, quero ver somente telas e registros que posso acessar para não receber atalhos inválidos nem indícios de dados protegidos.
- US5: Como administrador, quero localizar usuários e demais recursos autorizados do tenant atual sem receber DTOs completos ou informações sensíveis.
- US6: Como usuário de teclado, quero abrir a pesquisa por atalho, percorrer grupos, selecionar com Enter e fechar com Esc para concluir o fluxo sem usar o mouse.
- US7: Como usuário em dispositivo pequeno, quero uma pesquisa legível e operável sem perda de conteúdo ou de controles essenciais.
- US8: Como usuário diante de uma falha temporária, quero continuar vendo resultados locais e poder tentar novamente a pesquisa de dados.
- US9: Como mantenedor do produto, quero adicionar novas categorias de dados ou navegação sem reescrever a experiência global nem criar endpoints paralelos.
- US10: Como usuário que repete uma pesquisa recente, quero receber o mesmo resultado imediatamente para não aguardar uma nova consulta desnecessária ao banco.
- US11: Como usuário que seleciona um dado, quero ver informações completas e atuais em um painel consistente para compreender o registro sem perder o contexto da tela em que estou.
- US12: Como mantenedor do produto, quero um ponto único de abertura de detalhes que reutilize os componentes e consultas por identificador existentes para incluir novas entidades sem duplicar a experiência.
- US13: Como usuário que reabre a Pesquisa Global, quero ver e retomar minhas consultas recentes ainda disponíveis para repetir uma busca sem redigitar o termo nem aguardar uma nova consulta.

## Principais funcionalidades

### Entrada global e experiência de pesquisa

- RF1: O componente da Pesquisa Global deve pertencer ao cabeçalho principal do `private-layout`, com acionador visível e acessível em diferentes tamanhos de tela e disponibilidade em toda a área autenticada atendida por esse layout.
- RF2: A pesquisa deve abrir pelo clique no acionador visual, por `Ctrl + K` no Windows e Linux e por `Cmd + K` no macOS, sem interferir indevidamente em atalhos nativos de campos editáveis.
- RF3: A interface deve usar o Command oficial já instalado do Zard UI, incluindo campo, lista, grupos e opções selecionáveis, e deve ser o ponto único do frontend para executar a Pesquisa Global.
- RF4: O termo digitado deve atualizar imediatamente os resultados locais de navegação.
- RF5: A pesquisa de dados deve ocorrer após debounce entre 250 e 350 milissegundos, com referência de 300 milissegundos, somente quando o termo normalizado possuir ao menos três caracteres.
- RF6: Uma mudança de termo deve cancelar a requisição anterior, e consultas idênticas não devem gerar requisições simultâneas ou repetidas enquanto houver uma resposta válida em cache.
- RF7: A experiência deve possuir estados explícitos de início com consultas recentes quando existirem, digitação abaixo do mínimo, carregamento, resultados, nenhum resultado, erro recuperável e tentativa novamente.
- RF8: A falha da fonte remota não deve impedir a apresentação dos resultados locais disponíveis.
- RF9: Os resultados devem ser agrupados, no mínimo, em Telas e funcionalidades, Usuários, Projetos, Emendas, Vereadores e Instituições, omitindo grupos sem itens quando isso melhorar a leitura.
- RF10: A apresentação deve possuir limite controlado por grupo e nunca ultrapassar os 20 registros retornados na página remota; a distribuição final do limite visual deverá preservar a ordem de relevância de cada fonte.
- RF11: Cada resultado deve indicar seu tipo, título e contexto mínimo suficiente para diferenciá-lo, destacando de forma acessível o campo próprio ou o relacionamento que justificou a correspondência quando disponível, sem exibir o identificador interno como se fosse um código de negócio nem carregar o registro completo.
- RF12: O usuário deve poder navegar por setas, selecionar com Enter, fechar com Esc e reabrir a pesquisa com o campo de entrada limpo e as consultas recentes válidas preservadas. A seleção de resultado deve fechar o Command e, conforme a origem, abrir o detalhe do dado ou navegar para a tela ou funcionalidade escolhida.

### Pesquisa global de dados

- RF13: O backend deve disponibilizar um único ponto autenticado de pesquisa global para todos os tipos de dados suportados.
- RF14: O frontend deve fazer somente uma chamada ao endpoint global por termo estável, sem chamar endpoints individuais, listagens existentes ou carregar registros completos para filtragem local.
- RF15: A entrada remota deve aceitar termo, conjunto opcional de tipos, página, limite máximo de 20 registros e o contexto de tenant resolvido e validado pela infraestrutura atual.
- RF16: A resposta deve informar termo normalizado, resultados genéricos ordenados, total encontrado, contagem autorizada por tipo, página atual, tamanho da página, total de páginas e existência de mais resultados.
- RF17: Os tipos iniciais obrigatórios serão usuário, projeto, emenda, vereador e instituição; uma pesquisa sem filtro de tipo deve consultar simultaneamente todos os tipos aos quais o usuário possui acesso e pode misturá-los na mesma resposta.
- RF18: O resultado de dados deve conter somente uma representação comum e resumida: identificador do registro, origem, tipo, grupo, título, texto secundário opcional, descrição curta opcional, ícone, pontuação de relevância, justificativa opcional da correspondência e metadados mínimos controlados necessários à identificação visual.
- RF19: O contrato não deve retornar entidades, DTOs completos ou metadados sem tipagem; origem, tipo, metadados e possibilidades de destino devem formar conjuntos controlados e extensíveis.
- RF20: O backend não deve conhecer rotas, componentes ou detalhes de interface Angular. Para resultados de dados, deve fornecer o tipo e o identificador do recurso; o frontend deve definir centralmente o detalhe autorizado correspondente.
- RF21: Cada tipo inicial deve possuir um detalhe canônico que possa ser aberto no Drawer unificado. Quando o componente de detalhe ainda não existir, ele deverá ser criado antes de o tipo ser disponibilizado na Pesquisa Global; não haverá fallback para uma listagem.

### Cobertura e correspondência dos dados

- RF22: Usuários devem ser localizáveis por seus campos principais autorizados, como nome completo e e-mail. O identificador interno deve ser retornado somente para abrir o detalhe e não deve participar da correspondência. Usuários gerais devem manter a restrição equivalente à listagem administrativa vigente.
- RF23: Projetos devem ser localizáveis por seus próprios campos principais, como nome e campos descritivos reais úteis à identificação, considerando os campos já cobertos pelo índice full-text de `projeto` antes de qualquer ampliação. O identificador interno não deve participar da correspondência.
- RF24: Emendas devem ser localizáveis diretamente por código SAPL e justificativa. Identificação pública de autoria, projeto, instituição ou outros vínculos autorizados pode produzir correspondência complementar por relacionamento. Não devem ser inventados título, objeto ou número inexistentes no modelo atual, e o identificador interno não deve participar da correspondência.
- RF25: Vereadores devem ser localizáveis por seus campos principais autorizados, como nome completo do usuário associado e dados públicos do partido, incluindo nome, sigla e número, respeitando status e mandato vigentes. CPF, telefones e outros dados privados não serão pesquisados nem retornados; o identificador interno será retornado somente para abrir o detalhe e não participará da correspondência. O modelo atual não possui campo de nome parlamentar e ele não deve ser simulado.
- RF26: Instituições devem ser localizáveis como tipo de primeira classe por seus campos principais autorizados, incluindo nome, nome fantasia, e-mail e CNPJ. O identificador interno deve ser retornado somente para abrir o detalhe e não deve participar da correspondência; as regras vigentes de visibilidade da listagem de instituições devem ser preservadas.
- RF27: A pesquisa deve aceitar múltiplos termos e tratar diferenças de maiúsculas, minúsculas, acentuação e formatação sem alterar o significado do código SAPL, do CNPJ ou dos campos textuais pesquisáveis.
- RF28: A ordem de relevância deve priorizar, nesta sequência: correspondência exata em campo principal da própria entidade, incluindo o código SAPL da emenda; início de valor em campo principal; correspondência full-text direta com maior pontuação do banco; correspondência parcial direta estritamente necessária; e correspondência obtida somente por relacionamento. Uma consulta pode retornar tipos misturados, como a emenda identificada pelo SAPL e seus projetos ou instituições relacionados, mas nenhum resultado obtido somente por relacionamento deve superar uma correspondência direta.
- RF29: A pontuação calculada pelo backend deve permanecer a fonte de verdade para ordenar dados de tipos distintos e para ordenar os itens dentro de cada grupo. O frontend pode organizar a apresentação em grupos, mas não recalcular nem substituir a relevância da fonte remota.
- RF30: O mecanismo deve partir do padrão vigente de SQL Server Full-Text Search: catálogo compartilhado, idioma português 1046, atualização automática, ausência de stoplist e busca por prefixo de múltiplos termos. As diferenças atuais de normalização e acentuação devem ser comprovadas por testes de banco, não presumidas.
- RF31: A indisponibilidade do recurso Full-Text Search ou a falha de criação/atualização dos índices deve ser detectável e não pode degradar silenciosamente para uma pesquisa ampla e insegura.

### Catálogo local de telas e funcionalidades

- RF32: O frontend deve manter um catálogo central pesquisável com identificador único, nome, descrição curta, palavras-chave e sinônimos, ícone, rota, permissões e grupo ou módulo.
- RF33: O catálogo deve derivar nome, ícone, rota, grupo e regras de acesso das configurações de rotas e menus existentes sempre que essas fontes forem consistentes, acrescentando apenas descrições e termos de intenção que não existam nelas.
- RF34: Divergências atuais entre metadados de rotas e `PRIVATE_ROUTE_CONFIGS` não podem ser propagadas para a pesquisa; a fonte canônica e a estratégia de compatibilidade deverão ser definidas antes da implementação.
- RF35: A pesquisa local deve ser insensível a maiúsculas, minúsculas e acentos e considerar nome, descrição, módulo, palavras-chave e sinônimos.
- RF36: O catálogo deve associar intenções de cadastrar, criar, consultar, listar, editar, revisar, acompanhar e configurar aos destinos efetivamente disponíveis.
- RF37: Somente itens aprovados pela mesma política de papéis e funções usada na navegação devem aparecer. Ocultar um item no Command não substitui o guard da rota.
- RF38: Os itens locais devem ser convertidos para o mesmo modelo de apresentação dos dados, com origem de navegação, sem envio do catálogo ao backend.

### Segurança, privacidade e isolamento

- RF39: A pesquisa deve exigir usuário autenticado e aplicar autorização por tipo e por registro antes de compor resultados e contagens.
- RF40: O contexto de tenant deve ser obtido dos mecanismos autenticados e dos headers já adotados pela plataforma, validado no backend e aplicado a todas as consultas. Um identificador fornecido pelo cliente não deve ser aceito isoladamente como prova de acesso.
- RF41: Resultados, totais, contagens por tipo, trechos e metadados devem ser calculados somente sobre o universo autorizado, sem revelar sequer a existência de registros de outro tenant, município, instituição ou vínculo.
- RF42: Registros removidos, inativos ou arquivados devem seguir exatamente as políticas de visibilidade dos fluxos canônicos correspondentes.
- RF43: A pesquisa não deve retornar CPF, documentos pessoais, tokens de senha, identificadores do Keycloak, credenciais, contatos privados, valores internos desnecessários ou campos completos de entidades.
- RF44: A seleção de um resultado deve passar pelas verificações normais de acesso aplicáveis ao destino; nem a navegação local nem a abertura do Drawer podem contornar guards ou validações do backend.

### Extensibilidade e qualidade

- RF45: A inclusão futura de uma entidade deve exigir a adição de um tipo controlado, sua estratégia de consulta e seu mapeamento genérico, sem criar novo endpoint nem alterar consumidores existentes de forma incompatível.
- RF46: A inclusão de uma tela ou funcionalidade deve ocorrer na fonte central do catálogo ou nos metadados canônicos dos quais ele deriva, sem listas paralelas dentro do componente.
- RF47: Estado síncrono da interface deve usar Signals e estado derivado deve usar `computed`; RxJS deve ser reservado ao debounce, deduplicação, cancelamento e integração HTTP.
- RF48: Os componentes novos devem usar `ChangeDetectionStrategy.OnPush`, tipagem estrita, contratos imutáveis e componentes Zard/tokens de tema existentes.
- RF49: O backend deve manter uma única operação global e um contrato de repository próprio da pesquisa, sem reutilizar resources ou endpoints individuais para montar a resposta.
- RF50: A funcionalidade deve possuir testes unitários, de integração, de contrato HTTP, de persistência em SQL Server e de interface, incluindo a abertura de detalhes e o cache no navegador, conforme o risco de cada camada.

### Detalhes unificados no Drawer

- RF51: A seleção de um resultado de dado deve fechar o Command e abrir um único Drawer oficial do Zard UI sobre a tela atual, sem navegar para outra rota nem alterar a URL. Resultados locais de telas e funcionalidades permanecem sujeitos à navegação normal.
- RF52: Um componente central de detalhe deve receber somente o tipo controlado e o identificador do registro, escolher a configuração da entidade e executar o caso de uso `GetById` correspondente por meio de um `resource` do Angular.
- RF53: Cada abertura, reabertura ou troca de tipo ou identificador no Drawer deve buscar novamente o detalhe autorizado. O resumo retornado pela Pesquisa Global e o cache de pesquisas não podem substituir essa consulta completa.
- RF54: Os componentes de detalhe e casos de uso `GetById` existentes devem ser reutilizados. Os ausentes para usuário, projeto, emenda, vereador ou instituição devem ser criados somente na extensão necessária para que todos os tipos iniciais apresentem seus detalhes no mesmo contêiner.
- RF55: O Drawer deve apresentar estados acessíveis de carregamento, sucesso, registro não encontrado, acesso negado e erro recuperável com nova tentativa, preservando fechamento, foco e retorno ao Command ou à tela de origem.
- RF56: O detalhe deve exibir um botão “Ações” reservado para evolução futura. Nesta entrega, ele deve permanecer sem opções e sem executar navegações, comandos ou mutações, comunicando de forma acessível que ainda não há ações disponíveis.
- RF57: A consulta e a apresentação do detalhe devem reaplicar autenticação, tenant e autorização vigentes. Um item encontrado anteriormente não constitui prova de acesso ao seu detalhe.

### Cache de pesquisas no navegador

- RF58: O frontend deve manter em memória, por aba ativa, um cache das respostas remotas concluídas com sucesso, inclusive respostas vazias, por cinco minutos a partir do recebimento.
- RF59: A chave do cache deve distinguir termo normalizado, tipos solicitados, página, limite, usuário autenticado, tenant e contexto de autorização, impedindo o reaproveitamento entre contextos diferentes.
- RF60: Uma consulta idêntica com entrada válida em cache deve ser atendida imediatamente sem chamada HTTP, processamento no backend ou nova consulta ao banco; solicitações idênticas simultâneas devem compartilhar a mesma execução em andamento.
- RF61: Entradas expiradas devem ser descartadas antes do uso. Requisições canceladas, respostas com erro e falhas de autorização não devem ser armazenadas; uma tentativa novamente após erro deve realizar nova consulta.
- RF62: O cache deve ser integralmente limpo em logout, troca de usuário, tenant ou contexto de autorização. Ele não deve sobreviver ao recarregamento da página nem ser persistido em `localStorage`, `sessionStorage`, IndexedDB ou mecanismo equivalente.
- RF63: O cache deve possuir no máximo 50 chaves de consulta por aba, removendo entradas antigas quando o limite for atingido, sem crescimento ilimitado de memória.
- RF64: Consultas `GetById` usadas pelo Drawer ficam explicitamente fora do cache da Pesquisa Global e devem buscar o estado vigente do registro em toda abertura.
- RF65: Ao abrir o Command sem termo, o frontend deve listar no máximo as cinco consultas distintas usadas mais recentemente e que ainda possuam resposta válida no cache, da mais recente para a mais antiga. Selecionar uma consulta recente deve restaurar seu termo e apresentar os resultados armazenados sem nova chamada; entradas expiradas, removidas ou pertencentes a outro contexto não devem aparecer.

## Critérios de aceitação

- CA-01 (US1, RF1-RF3): Dado um usuário autenticado no `private-layout`, quando ele aciona o controle localizado no cabeçalho principal, então o Command oficial do Zard UI é aberto com foco no campo de entrada.
- CA-02 (US6, RF2, RF12): Dado o layout privado em Windows/Linux ou macOS, quando o usuário pressiona respectivamente `Ctrl + K` ou `Cmd + K`, então a pesquisa abre; setas alteram a opção ativa, Enter seleciona e Esc fecha.
- CA-03 (US3, RF4, RF32-RF36): Dado um termo de intenção como “cadastrar vereador”, quando ele é digitado, então o catálogo encontra o destino autorizado correspondente mesmo sem correspondência literal com o título da tela.
- CA-04 (US4, RF33, RF37, RF44): Dado um usuário sem a função ou papel exigido por uma rota, quando ele pesquisa seus termos, então a rota não aparece e o acesso direto continua bloqueado pelo guard.
- CA-05 (US1, RF5): Dado um termo com um ou dois caracteres normalizados, quando o usuário digita, então a busca local funciona e nenhuma chamada de dados é feita; ao atingir três caracteres, uma chamada remota é elegível após o debounce.
- CA-06 (US1, RF5-RF6, RF14): Dada uma sequência rápida de digitação sem resposta válida em cache, quando o debounce termina, então somente a última consulta produz uma chamada ativa ao único endpoint global, as anteriores são canceladas e consultas simultâneas idênticas não duplicam requisições.
- CA-07 (US1, RF9, RF17, RF38): Dado um termo que corresponde a navegação e a mais de um tipo de dado, quando as duas fontes respondem, então os resultados aparecem no mesmo Command, com modelo visual uniforme e grupos distintos.
- CA-08 (US8, RF7-RF8): Dado que o backend falha, quando existem resultados locais, então eles continuam disponíveis, o erro remoto é informado sem bloquear a interação e uma ação de tentar novamente é oferecida.
- CA-09 (US1, RF7): Dado um termo válido sem correspondências em nenhuma fonte, quando a pesquisa termina, então é exibido um estado único e claro de nenhum resultado.
- CA-10 (US6, RF12): Dado um resultado selecionado, quando seu destino é acionado, então o Command fecha e o termo, resultados, seleção, erro e carregamento são limpos, independentemente de o destino ser uma rota local ou o Drawer de um dado.
- CA-11 (US7, RF1, RF7, RF11): Dado um viewport pequeno suportado pela aplicação, quando a pesquisa é aberta e recebe resultados, então nenhum controle essencial fica inacessível, a lista permanece rolável e textos longos não rompem o layout.
- CA-12 (US6, RF3, RF11-RF12): Dado o uso por teclado ou tecnologia assistiva, quando o conteúdo muda, então foco, opção selecionada, quantidade de resultados, carregamento, vazio e erro são comunicados de forma compatível com WCAG 2.1 AA.
- CA-13 (US1, US5, RF13-RF19): Dada uma pesquisa sem filtro de tipo, quando o endpoint responde, então a lista contém representações genéricas e resumidas de todos os tipos autorizados, cada uma com tipo e identificador, sem DTOs completos diferentes por entidade.
- CA-14 (US1, RF15-RF16): Dada uma consulta com página e tipos opcionais, quando o endpoint responde, então termo normalizado, até 20 resultados, total, contagem por tipo, metadados de paginação e indicador de mais resultados são coerentes entre si.
- CA-15 (US9, RF13-RF14, RF45, RF49): Dada a inspeção do contrato e do tráfego, então existe somente um endpoint de dados e nenhuma montagem da pesquisa por chamadas a listagens ou resources individuais.
- CA-16 (US2, RF24, RF28-RF29): Dado o código SAPL exato de uma emenda autorizada, quando ele é pesquisado, então a emenda correspondente é priorizada como correspondência direta, enquanto projetos e instituições autorizados relacionados podem aparecer depois dela com a origem relacional identificada.
- CA-17 (US1, RF27-RF30): Dados termos com acentos, caixa diferente, prefixos ou múltiplas palavras, quando pesquisados contra registros equivalentes, então as correspondências esperadas são encontradas e ordenadas pela relevância calculada no banco.
- CA-18 (US1-US2, RF22-RF29): Dadas correspondências direta exata, direta por início, direta por full-text e somente por relacionamento para o mesmo termo, inclusive entre tipos distintos, quando o endpoint responde, então a ordem segue a prioridade definida, resultados relacionais não superam correspondências diretas e o frontend preserva essa relevância ao organizar os grupos.
- CA-19 (US5, RF22): Dado um usuário sem permissão para a listagem geral de usuários, quando pesquisa um nome ou e-mail, então resultados gerais de usuário e sua contagem não são revelados.
- CA-20 (US4, RF39-RF42): Dados dois tenants com registros semelhantes, quando um usuário autenticado em um tenant pesquisa, então nenhum item, total, contagem, trecho ou metadado do outro tenant aparece.
- CA-21 (US4, RF39-RF42): Dado um registro inacessível por vínculo, instituição, município, estado de arquivamento ou inativação, quando o usuário pesquisa, então ele segue a mesma visibilidade do fluxo canônico e não altera contagens autorizadas.
- CA-22 (US5, RF18-RF19, RF43): Dada qualquer resposta de pesquisa, quando seu contrato é inspecionado, então não contém CPF, documento pessoal, token, identificador do Keycloak, credencial, telefone privado ou entidade completa.
- CA-23 (US1, US11, RF20-RF21, RF44): Dado um resultado autorizado de cada tipo suportado, quando selecionado, então o frontend usa o mapeamento central de tipo e identificador para abrir seu detalhe canônico no tenant atual, sem fallback para uma listagem.
- CA-24 (US1, RF22-RF26): Dado um conjunto de registros de usuário, projeto, emenda, vereador e instituição preparado para aceitação, quando uma Pesquisa Global é executada, então os cinco tipos são retornados de acordo com seus campos principais reais e sem usar identificadores internos como termos de correspondência.
- CA-25 (US1, RF31): Dado um banco sem suporte full-text ou com índice incompatível, quando migrations ou inicialização aplicável são validadas, então a falha é identificável e não há fallback silencioso para leitura ampla de tabelas.
- CA-26 (US9, RF30-RF31, RF50): Dado um SQL Server de integração no estado anterior às novas migrations, quando elas são aplicadas, então catálogo e índices válidos são criados ou preservados, os dados existentes permanecem íntegros e as consultas por prefixo, múltiplos termos, caixa e acento produzem resultados comprovados no banco real.
- CA-27 (US1-US2, US4, RF13-RF31, RF39-RF43, RF50): A suíte do backend cobre pesquisa simultânea dos cinco tipos, contrato genérico, campos principais, código SAPL, CNPJ, relevância direta e relacional, mistura de tipos, full-text, múltiplos termos, filtro por tipo, paginação, limites, termos inválidos ou curtos, isolamento, permissão, ausência de dados sensíveis, contagens e nenhum resultado.
- CA-28 (US1, US3, US6, US8, US10-US13, RF1-RF12, RF32-RF38, RF50-RF65): A suíte do frontend cobre acionador no cabeçalho do `private-layout`, abertura por clique e atalhos, uso real do Command e do Drawer, catálogo e permissões, debounce, chamada única, cancelamento, cache, consultas recentes, combinação, agrupamento, todos os estados, teclado, abertura do detalhe, fechamento e limpeza.
- CA-29 (US7, US11, RF48, RF50, RF55-RF56): Os testes de interface e o QA validam responsividade, navegação somente por teclado, foco entre Command, Drawer e tela de origem, nomes acessíveis e verificações automatizadas de acessibilidade sem violações críticas ou sérias relacionadas à funcionalidade.
- CA-30 (US9, US12-US13, RF45-RF65): Ao concluir a implementação, testes afetados e completos, cobertura aplicável, lint, verificação de tipos, `verify`, packages e builds definidos pelos dois projetos passam sem TODOs, mocks ou dados simulados fora dos testes.
- CA-31 (US1, US11, RF51): Dado um resultado de dado selecionado por mouse, toque ou Enter, quando a seleção é concluída, então o Command fecha, a URL permanece inalterada e o Drawer oficial do Zard UI abre sobre a tela atual.
- CA-32 (US11, RF52-RF53, RF64): Dado um resultado de dado selecionado, quando o Drawer abre, então seu tipo e identificador acionam o caso de uso `GetById` correspondente e o detalhe não é inferido nem montado a partir do resumo da pesquisa.
- CA-33 (US11, RF53, RF64): Dado um mesmo resultado aberto, fechado e aberto novamente, quando o tráfego é inspecionado, então cada abertura realiza uma nova consulta autorizada por identificador, mesmo que a pesquisa resumida tenha sido atendida pelo cache.
- CA-34 (US11-US12, RF21, RF54): Dado um resultado autorizado de usuário, projeto, emenda, vereador ou instituição, quando selecionado, então todos os cinco tipos exibem um componente de detalhe no Drawer, reutilizando os componentes existentes quando disponíveis e sem redirecionar para listagens.
- CA-35 (US8, US11, RF55, RF57): Dado que o registro foi removido, tornou-se inacessível ou a consulta falhou depois da pesquisa, quando o Drawer tenta carregá-lo, então apresenta o estado específico sem revelar dados protegidos e oferece fechamento ou nova tentativa quando aplicável.
- CA-36 (US11, RF56): Dado um detalhe carregado, quando seu cabeçalho ou área de comandos é exibido, então o botão “Ações” está visível, comunica que ainda não há ações disponíveis e não executa navegação, comando ou mutação.
- CA-37 (US10, RF58-RF60): Dada uma resposta remota concluída com sucesso, quando a mesma consulta é repetida no mesmo contexto em até cinco minutos, então os resultados são apresentados a partir do cache e nenhuma chamada HTTP nem consulta ao banco é executada.
- CA-38 (US4, US10, RF59, RF62): Dada uma entrada em cache, quando ocorre logout ou troca de usuário, tenant ou contexto de autorização, então a entrada deixa de ser elegível e a pesquisa seguinte não recebe dados do contexto anterior.
- CA-39 (US8, US10, RF58, RF61-RF63): Dadas entradas expiradas, mais de 50 chaves, uma resposta com erro ou o recarregamento da página, quando uma consulta é repetida, então entradas inválidas ou antigas não são usadas, falhas não são armazenadas e o cache não cresce nem persiste além dos limites definidos.
- CA-40 (US3, RF12, RF51): Dado um resultado local de tela ou funcionalidade, quando selecionado, então ele continua navegando para sua rota autorizada em vez de abrir o Drawer de dados.
- CA-41 (US10, US13, RF7, RF12, RF58-RF65): Dado que existem consultas distintas ainda válidas no cache, quando o usuário abre o Command sem digitar um termo, então até as cinco mais recentes aparecem em ordem decrescente de uso; ao selecionar uma delas, o termo e os resultados são restaurados sem chamada HTTP, enquanto consultas expiradas ou de outro contexto não são exibidas.

## Experiência do usuário

O componente e seu acionador ficarão no cabeçalho principal do `private-layout` e deverão comunicar o atalho de teclado sem ocupar espaço excessivo em telas pequenas. Um clique no acionador ou o atalho correspondente abrirá o mesmo Command do Zard, com foco direto no campo de pesquisa. Antes da digitação, o Command apresentará até cinco consultas recentes ainda válidas no cache; quando não houver nenhuma, apresentará uma orientação curta, sem disparar carga ampla de dados.

A primeira resposta será sempre local: telas e funcionalidades autorizadas serão filtradas durante a digitação. A partir de três caracteres normalizados, o frontend consultará primeiro o cache em memória. Uma resposta válida aparecerá imediatamente; na ausência dela, o estado remoto mudará para carregamento e, após aproximadamente 300 milissegundos sem novas alterações, fará uma única consulta. Resultados locais continuarão interativos enquanto os dados carregam. A chegada da resposta remota acrescentará os grupos de dados sem deslocamentos que façam o usuário perder a seleção atual de forma imprevisível.

Uma resposta resumida poderá permanecer visível pelo prazo máximo de cinco minutos do cache. As consultas válidas serão ordenadas pelo uso mais recente, e selecionar uma delas preencherá novamente o termo e seus resultados. Essa janela de atualização não se aplica ao Drawer: mesmo quando o item veio do cache, sua seleção consultará novamente o registro e mostrará o estado vigente ou a indisponibilidade correspondente.

Cada item exibirá título, tipo e contexto mínimo. O identificador interno permanecerá no contrato apenas para abrir o detalhe e não precisará ser exibido nem poderá ser apresentado como código conhecido pelo usuário. O código SAPL e as informações que justificam uma correspondência direta ou relacional deverão ser perceptíveis, com destaque que não dependa somente de cor. Grupos vazios poderão ser omitidos, e a lista terá rolagem dentro de um painel adequado ao viewport. A pontuação numérica de relevância não precisa ser mostrada ao usuário, mas sua ordem deve ser preservada.

Mouse, toque e teclado devem produzir o mesmo destino. Enter selecionará a opção ativa; Esc fechará a pesquisa; a seleção limpará o estado. Um item local navegará normalmente. Um item de dado manterá a URL, fechará o Command e abrirá o Drawer, que iniciará uma nova busca do registro completo por identificador. Em erro remoto, uma mensagem acionável e a tentativa novamente aparecerão sem apagar resultados locais. Em ausência total de resultados, a interface explicará o estado sem sugerir que dados protegidos existem.

O Drawer oferecerá a mesma estrutura visual para usuários, projetos, emendas, vereadores e instituições, reutilizando o conteúdo de detalhe já disponível e acrescentando o que faltar. Durante a consulta completa, ele apresentará carregamento; em seguida, mostrará os dados autorizados ou um estado claro de não encontrado, acesso negado ou erro com nova tentativa. Um botão “Ações” permanecerá visível como preparação para a evolução do produto, mas comunicará que nenhuma ação está disponível nesta versão. Ao fechar o Drawer, o foco retornará de forma previsível ao ponto de origem ainda disponível.

## Restrições técnicas de alto nível

- O artefato é coordenado na raiz do workspace por abranger mais de um projeto; `ms-main` será o único responsável pela pesquisa de dados persistidos, enquanto `municipalize-app` será responsável pelo catálogo local, integração HTTP, apresentação e navegação.
- O banco continuará sendo SQL Server com Flyway. Não serão introduzidos Elasticsearch, Meilisearch ou serviços externos de indexação.
- A estratégia deve reutilizar e evoluir o padrão das migrations `V1.0.144__create_fulltext_projeto.sql`, `V1.0.145__create_fulltext_usuario_instituicao.sql` e da normalização vigente, sem editar migrations já aplicadas.
- A análise do estado atual identificou catálogo `CatalogoBusca`, idioma 1046, `CHANGE_TRACKING = AUTO`, `STOPLIST = OFF`, busca por prefixos combinados com `AND` e normalização auxiliar por `Latin1_General_100_CI_AI`. A consulta atual usa `CONTAINS`, não retorna ranking e não comprova por testes de integração a sensibilidade a acentos do catálogo; a solução deverá fechar essas lacunas.
- Os índices existentes já cobrem `projeto`, `usuario` e `instituicao`; novos índices só poderão ser criados após confirmar cobertura, chaves únicas, campos reais, custo de atualização e compatibilidade em todos os datasources de tenant.
- O isolamento principal ocorre pelo tenant/datasource resolvido a partir do contexto da requisição. Toda consulta, count e trecho da pesquisa deve permanecer no datasource correto e aplicar ainda as restrições de vínculo, instituição e recurso necessárias.
- O endpoint deve exigir autenticação e autorização no backend. Guards, catálogo e ocultação no frontend são camadas adicionais, não fontes únicas de segurança.
- A API deve usar tipos controlados e respostas genéricas; `any`, arrays de `Object`, mapas sem contrato e serialização de entidades são proibidos.
- O frontend deve usar Angular 22, componentes standalone, Signals, `computed`, `ChangeDetectionStrategy.OnPush`, RxJS somente para o fluxo assíncrono necessário, Tailwind CSS v4 e tokens semânticos existentes.
- O componente da Pesquisa Global deve ser integrado ao cabeçalho principal do `private-layout`; páginas e features não devem criar acionadores, Commands ou fluxos paralelos de pesquisa global.
- O Command do Zard já instalado é a fonte de verdade da API de interface. Sua composição real usa `z-command`, `z-command-input`, `z-command-list`, `z-command-option-group` e `z-command-option`, com seleção emitida pelo componente e navegação nativa por teclado.
- O detalhe unificado deve usar o Drawer oficial do Zard UI, adicionado pelo fluxo suportado do `zard-cli`, e não um overlay ou painel recriado manualmente. O projeto possui atualmente o Sheet, mas o Drawer ainda deverá ser incorporado na implementação.
- O frontend deve possuir um único componente contêiner de detalhes para a Pesquisa Global. Ele receberá o tipo e o identificador, usará um `resource` do Angular para acionar o caso de uso `GetById` específico e comporá o componente de detalhe correspondente; acesso HTTP direto no componente continua proibido.
- Componentes de detalhe e casos de uso por identificador existentes são a fonte de verdade e devem ser reutilizados. Ausências devem ser preenchidas sem duplicar regras ou substituir detalhes completos por DTOs resumidos da pesquisa.
- O cache da Pesquisa Global será efêmero, em memória e limitado a cada aba, com TTL de cinco minutos e no máximo 50 chaves. Cache persistente no navegador, cache compartilhado entre usuários ou tenants e cache das consultas de detalhe não são permitidos nesta versão.
- As configurações `privateRoutes` e `PRIVATE_ROUTE_CONFIGS` possuem metadados e regras parcialmente duplicados. A implementação não deve criar uma terceira fonte divergente; a TechSpec deverá definir a consolidação ou derivação segura.
- O desempenho será validado com dados e índices representativos. A meta de 500 ms no p95 e o cache no navegador não autorizam cache compartilhado entre tenants, redução de verificações de autorização nem uso do resumo como detalhe completo.
- Testes de persistência e migrations devem executar contra SQL Server com Full-Text Search real. Mocks não são evidência suficiente de ranking, tokenização, prefixos, acentos ou índices.
- As validações obrigatórias seguirão os comandos e gates de cada projeto. Testes de navegador no QA devem usar a ferramenta disponível sem presumir a existência de um projeto Playwright central na raiz.

## Fora do escopo

- Pesquisa de documentos, contratos, secretarias, municípios ou outras entidades persistidas além de usuários, projetos, emendas, vereadores e instituições nesta primeira versão.
- Inclusão de nome parlamentar no cadastro de vereador, pois o modelo ativo atual não possui esse campo.
- Pesquisa de telas e funcionalidades pelo backend ou envio do catálogo de navegação para a API.
- Criação de um endpoint por entidade, reutilização de endpoints de listagem para compor resultados ou filtragem local de dados persistidos.
- Alteração das regras de acesso existentes para conceder novos privilégios; a pesquisa apenas refletirá o que o usuário já pode acessar.
- Exposição de conteúdo completo, documentos anexos ou busca dentro de arquivos nesta versão.
- Histórico persistente de pesquisas, sincronização de consultas recentes entre abas ou dispositivos, sugestões baseadas em popularidade, analytics, aprendizado de ranking ou personalização por usuário. A lista efêmera derivada do cache da aba permanece no escopo.
- Busca pública sem autenticação e pesquisa no painel administrativo global fora do contexto de tenant.
- Ações de criação ou edição executadas diretamente dentro do Command; resultados locais continuarão navegando para a funcionalidade autorizada, e resultados de dados apenas abrirão seus detalhes.
- Implementação, habilitação ou validação das ações futuras do Drawer; nesta versão, o botão “Ações” é apenas uma reserva visual sem comandos disponíveis.
- Navegação para listagens ou mudança da URL ao selecionar um resultado de dado; os detalhes serão abertos sobre a tela atual.
- Cache persistente, offline, compartilhado entre abas, usuários, tenants ou servidores, bem como cache ou pré-carregamento das consultas `GetById` do Drawer.
- Introdução de infraestrutura externa de busca ou de cache compartilhado que possa misturar dados de tenants.
