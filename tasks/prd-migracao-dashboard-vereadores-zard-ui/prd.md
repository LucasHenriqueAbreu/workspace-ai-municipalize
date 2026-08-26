# Documento de Requisitos do Produto (PRD)

## Visão geral

Este documento define a migração visual do dashboard público de emendas e da listagem pública de vereadores do Municipalize para os padrões de interface do Zard UI. A mudança busca tornar as duas experiências visualmente consistentes com o design system do produto, substituindo apresentações artesanais por composições adequadas de cards, charts, tabelas, abas, badges, tooltips, skeletons e estados de feedback já disponibilizados pelo Zard.

A reformulação é direcionada a todos os usuários dessas áreas, incluindo cidadãos, vereadores, assessores e administradores. Ela deve preservar integralmente as informações, os agrupamentos, os controles, as permissões e as ações atualmente exibidos, sem alterar regras de negócio, contratos de API ou resultados numéricos.

## Objetivos

- Migrar 100% dos elementos visuais das duas áreas em escopo que possuem equivalente no Zard UI para componentes ou composições oficiais do design system.
- Preservar 100% das informações, valores, rótulos relevantes, agrupamentos, filtros, alternâncias, ações e restrições de acesso existentes antes da migração.
- Garantir que as duas experiências funcionem sem rolagem horizontal da página a partir de 360 px de largura, admitindo rolagem interna apenas em componentes cuja natureza exija isso.
- Garantir apresentação completa e legível nos temas claro e escuro, sem perda de contraste, distinção de séries ou hierarquia visual.
- Atender aos critérios aplicáveis da WCAG 2.1 nível AA, sem violações críticas em auditoria automatizada e com todos os controles operáveis por teclado e identificáveis por tecnologia assistiva.
- Cobrir 100% das duas telas com estados coerentes de carregamento, vazio e erro e oferecer nova tentativa sempre que o carregamento puder ser repetido pelo usuário.
- Manter a interpretação dos indicadores e gráficos disponível sem depender exclusivamente de cor, hover ou dispositivo apontador.

## Histórias de usuário

- US1: Como cidadão, quero consultar o panorama geral das emendas em uma interface clara e consistente para compreender como os recursos municipais estão distribuídos.
- US2: Como cidadão, quero visualizar os vereadores e seus indicadores de atuação para identificar partido, funções, mandato, quantidade e valor das emendas e acessar o perfil detalhado.
- US3: Como vereador ou assessor, quero alternar entre as visões de origem e destino e consultar os detalhamentos por função para acompanhar corretamente a distribuição das emendas.
- US4: Como administrador, quero manter a ação autorizada de disparar o snapshot do dashboard e receber feedback sobre seu processamento sem expor essa ação aos demais perfis.
- US5: Como usuário, quero filtrar visualmente as séries apresentadas pelas legendas e alternar o agrupamento dos detalhamentos para focar nas informações relevantes para minha consulta.
- US6: Como usuário em dispositivo móvel, quero navegar, ler valores e operar todos os controles a partir de 360 px de largura sem perder informações ou funcionalidade.
- US7: Como usuário de teclado ou tecnologia assistiva, quero compreender e operar abas, botões, tooltips, expansões, gráficos e abertura de detalhes para realizar as mesmas consultas disponíveis visualmente.
- US8: Como usuário, quero receber estados claros de carregamento, ausência de dados e falha para entender a situação da consulta e tentar novamente quando aplicável.
- US9: Como usuário dos temas claro ou escuro, quero distinguir textos, controles, categorias e séries de dados com contraste adequado para interpretar o conteúdo com segurança.

## Principais funcionalidades

### 1. Estrutura visual padronizada

As duas áreas devem usar a linguagem visual e as composições do Zard UI para organizar títulos, seções, indicadores, conteúdo detalhado e feedback. A hierarquia da informação deve continuar adequada tanto para leitura panorâmica quanto para inspeção de detalhes.

- RF1: Apresentar seções, indicadores e agrupamentos por meio dos componentes Zard adequados, mantendo a ordem lógica e a identificação atual de cada conjunto de dados.
- RF2: Usar componentes Zard para cards, charts, tabelas ou listas de dados, abas, badges, botões, tooltips, accordions, sheets, skeletons, estados vazios e feedback sempre que houver equivalente oficial.
- RF3: Preservar a aparência e a legibilidade nos temas claro e escuro e em larguras de viewport a partir de 360 px.
- RF4: Não criar, duplicar ou modificar manualmente componentes internos do Zard; componentes oficiais ainda ausentes no projeto somente podem ser adicionados pelo CLI oficial do Zard.

### 2. Dashboard público de emendas

O dashboard deve continuar fornecendo o mesmo monitoramento geral, incluindo a informação de que os indicadores gerais desconsideram emendas com impedimento técnico.

- RF5: Preservar a agregação de vereadores, com data do snapshot, alternância entre destino e origem, legenda interativa, partido ou subtítulo, total financeiro, quantidade de emendas individuais, detalhamento por função e abertura do perfil público quando houver vereador associado.
- RF6: Preservar a agregação de bancadas, com data do snapshot, alternância entre destino e origem, legenda interativa, identificação da bancada, total financeiro, quantidade de emendas de bancada e detalhamento por função.
- RF7: Preservar a agregação de instituições beneficiadas, incluindo total geral, quantidades e valores de emendas individuais e de bancada e detalhamento expansível das subinstituições.
- RF8: Preservar os indicadores de resumo de total geral filtrado, aprovadas em plenário, protocoladas e em revisão contábil.
- RF9: Preservar as visualizações de totais por vereador, status, secretaria, instituição, função orçamentária e natureza da despesa, mantendo os mesmos dados e significados.
- RF10: Preservar o detalhamento com alternância entre agrupamentos por responsável, criador, vereador e bancada e seus respectivos valores, quantidades e desdobramentos aplicáveis.
- RF11: Preservar a seção de impedimentos técnicos separada dos indicadores gerais, incluindo data do snapshot, quantidade, valor total, código da emenda, responsável, instituição, valor, prévia do motivo e acesso ao detalhe quando disponível.
- RF12: Preservar a ação de disparar snapshot exclusivamente para administradores, incluindo indicação de processamento e retorno de sucesso ou falha.
- RF13: Manter a possibilidade de ocultar, reexibir e restaurar todas as séries controladas pelas legendas sem alterar os valores subjacentes.

### 3. Listagem pública de vereadores

A listagem deve continuar permitindo uma leitura comparativa da atuação parlamentar e o acesso ao perfil público detalhado de cada vereador.

- RF14: Exibir, para cada vereador, nome, imagem ou iniciais de contingência, partido ou subtítulo, descrição, situação de mandato e funções institucionais atualmente informadas.
- RF15: Preservar os indicadores de quantidade de emendas individuais e total destinado de cada vereador.
- RF16: Preservar a alternância entre destino e origem e o detalhamento das emendas por função de cada vereador.
- RF17: Manter o acesso ao perfil público detalhado pelo nome e pela ação associada ao card, sem alterar o conteúdo interno desse perfil nesta entrega.
- RF18: Exibir uma contingência identificável por iniciais quando a imagem do vereador estiver ausente ou falhar no carregamento.

### 4. Estados, interações e acessibilidade

Carregamentos e interações devem continuar compreensíveis independentemente de tamanho de tela, tema, uso de mouse ou percepção de cores.

- RF19: Apresentar estados de carregamento com skeletons coerentes com a estrutura final das duas telas.
- RF20: Apresentar estados vazios específicos para cada conjunto de dados sem resultados.
- RF21: Apresentar estados de erro com mensagem compreensível e ação de nova tentativa quando o recurso puder ser recarregado.
- RF22: Disponibilizar nos gráficos título, descrição, identificação das séries e valores acessíveis, incluindo alternativa não exclusivamente visual para os dados essenciais.
- RF23: Garantir foco visível, ordem de foco lógica, nomes acessíveis e operação por teclado para todos os controles interativos.
- RF24: Manter textos e valores legíveis sem cortes irreversíveis; quando houver abreviação visual, o conteúdo completo deve permanecer acessível.

## Critérios de aceitação

- CA-01 (RF1–RF4): Dadas as duas telas migradas, quando seus elementos visuais forem inventariados, então todo elemento com equivalente oficial deve usar um componente ou uma composição Zard e nenhum componente do design system deve ter sido criado ou alterado manualmente.
- CA-02 (RF4): Dado que um componente oficial necessário não esteja presente no projeto, quando ele for incorporado, então sua origem deve ser o CLI oficial do Zard, sem cópia manual, reimplementação ou instalação por uma fonte paralela.
- CA-03 (RF5–RF13): Dado o mesmo tenant e o mesmo snapshot, quando o dashboard anterior e o migrado forem comparados, então todas as seções, datas, rótulos, valores, quantidades, agrupamentos, legendas e detalhamentos exibidos devem ser equivalentes.
- CA-04 (RF5, RF6, RF13, RF16): Dada uma visão com alternância de fluxo ou legenda interativa, quando o usuário alternar entre origem e destino, ocultar uma série ou restaurar todas, então a apresentação deve refletir a seleção sem misturar fluxos nem alterar os dados originais.
- CA-05 (RF7): Dada uma instituição com subinstituições, quando o usuário expandir o detalhamento, então deve visualizar os mesmos nomes, totais gerais, quantidades e valores individuais e de bancada existentes antes da migração.
- CA-06 (RF8–RF10): Dado um conjunto de dados carregado, quando o usuário consultar os resumos, gráficos e agrupamentos detalhados, então deve encontrar todos os indicadores atuais com valores consistentes entre as diferentes representações.
- CA-07 (RF11): Dado um snapshot com impedimentos técnicos, quando a seção correspondente for exibida, então a quantidade, o valor total e os dados de cada emenda impedida devem permanecer separados dos indicadores gerais e o detalhe do motivo deve continuar acessível quando disponível.
- CA-08 (RF12): Dado um administrador autenticado, quando acessar o dashboard e disparar o snapshot, então a ação deve indicar processamento e retornar feedback de sucesso ou falha; dado outro perfil, a ação não deve ser exibida.
- CA-09 (RF14–RF18): Dados os mesmos vereadores retornados atualmente, quando a listagem migrada for carregada, então cada card deve preservar identidade, partido, descrição, badges institucionais, quantidade de emendas, total destinado e detalhamento por função.
- CA-10 (RF17): Dado um vereador com identificador válido, quando o usuário acionar o nome ou a ação de abertura, então o mesmo perfil público detalhado deve ser aberto; dado um vereador sem identificador, a ação deve permanecer indisponível.
- CA-11 (RF18): Dado um vereador sem imagem ou cuja imagem falhe, quando o card for exibido, então uma contingência com iniciais identificáveis deve ocupar o espaço sem quebrar o layout.
- CA-12 (RF19–RF21): Dado um recurso em carregamento, vazio ou com erro, quando esse estado ocorrer, então a tela deve apresentar respectivamente skeleton compatível, mensagem vazia contextual ou mensagem de erro com nova tentativa quando aplicável.
- CA-13 (RF3, RF24): Dada qualquer largura de viewport a partir de 360 px, quando as duas telas forem percorridas, então nenhum dado ou controle deve ficar inacessível e a página não deve apresentar rolagem horizontal global.
- CA-14 (RF3): Dados os temas claro e escuro, quando as duas telas forem visualizadas em cada tema, então textos, bordas, estados, controles e séries de gráficos devem manter contraste e distinção suficientes, sem conteúdo ilegível.
- CA-15 (RF22, RF23): Dado um usuário de teclado ou tecnologia assistiva, quando navegar por todos os controles e visualizações, então deve conseguir identificar, focar e acionar as interações e acessar os dados essenciais dos gráficos sem depender exclusivamente de cor, hover ou mouse.
- CA-16 (RF1–RF24): Dado o conjunto de rotas, permissões, APIs e dados anterior à migração, quando a entrega for validada, então não deve existir alteração observável de regra de negócio, contrato, disponibilidade de ação ou resultado numérico.

## Experiência do usuário

O cidadão deve chegar ao dashboard e reconhecer imediatamente o panorama geral, percorrendo primeiro os agrupamentos em destaque e os indicadores resumidos e depois os gráficos e detalhamentos. Cards e seções devem ter títulos, descrições e hierarquia visual consistentes. Abas de origem e destino, legendas e expansões devem comunicar claramente o estado selecionado e produzir feedback imediato.

Na listagem de vereadores, cada parlamentar deve ser apresentado como uma unidade comparável, com identidade, vínculos, papéis e indicadores fáceis de localizar. A abertura do perfil deve continuar disponível por ações com nomes acessíveis. Em dispositivos menores, o conteúdo deve ser reorganizado em coluna sem remover dados, e controles largos devem permanecer operáveis.

As experiências devem:

- usar componentes, variantes e composições do Zard em vez de reproduzir sua aparência com marcação artesanal;
- preservar a identidade visual baseada nos tokens semânticos existentes e o suporte nativo a tema escuro;
- apresentar foco visível, navegação por teclado, ordem semântica de títulos e nomes acessíveis;
- fornecer descrições, legendas e valores suficientes para interpretar charts e indicadores sem depender somente das cores;
- usar tooltips para explicações complementares sem ocultar informação essencial exclusivamente no hover;
- manter feedback textual durante carregamentos, falhas, estados vazios e ações administrativas;
- manter valores monetários, quantidades e datas no formato atualmente esperado pelos usuários.

## Restrições técnicas de alto nível

- O escopo de produto está restrito ao dashboard em `municipalize-app/src/app/presenter/features/tenant/public/dashboard/` e à listagem `municipalize-app/src/app/presenter/features/tenant/public/councillors/councillors-public.component.html`, incluindo os componentes de apresentação diretamente usados por essas telas quando necessários à migração.
- A entrega deve permanecer no `municipalize-app`, que utiliza Angular, Tailwind CSS e Zard UI, sem transferir responsabilidades para outros projetos do ecossistema.
- Os componentes oficiais do Zard já instalados devem ser reutilizados. Qualquer componente oficial ausente somente pode ser incorporado pelo CLI do Zard conforme a configuração existente do projeto.
- Não é permitido criar, duplicar ou editar manualmente componentes na área compartilhada do design system Zard para atender a esta entrega.
- Devem ser preservados os contratos atuais das APIs, os casos de uso, as rotas, a autenticação, a autorização e o isolamento por tenant.
- A apresentação deve usar os tokens semânticos existentes do produto, sem introduzir cores globais ou tokens de tema novos.
- A experiência deve atender aos critérios aplicáveis da WCAG 2.1 AA e funcionar nos temas claro e escuro e em viewports a partir de 360 px.
- A migração não pode alterar a origem, o cálculo, a filtragem ou a interpretação dos dados exibidos.

## Fora do escopo

- Criar novos indicadores, gráficos, filtros, agrupamentos, informações ou ações que não existam nas duas experiências atuais.
- Alterar regras de negócio, cálculos, status, contratos de API, endpoints, persistência ou modelos de dados.
- Alterar rotas, autenticação, autorização, papéis de usuário ou regras de isolamento entre tenants.
- Reformular o conteúdo interno do perfil público detalhado do vereador; somente sua abertura a partir das telas em escopo deve ser preservada.
- Criar componentes próprios dentro do design system Zard, copiar código de componentes oficiais, editar manualmente componentes instalados ou recriar suas funcionalidades com HTML e estilos paralelos.
- Introduzir um novo design system, uma biblioteca concorrente de componentes ou uma nova biblioteca de visualização fora do padrão Zard adotado.
- Modificar os projetos `ms-main`, `municipalize-admin-app` ou os repositórios legados.
- Redesenhar outras telas do portal público ou outras áreas autenticadas do Municipalize.
