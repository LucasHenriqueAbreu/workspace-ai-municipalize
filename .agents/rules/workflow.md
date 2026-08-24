# Fluxo global de desenvolvimento

## Sequência obrigatória

Para novas funcionalidades ou mudanças relevantes, siga esta ordem:

1. `criar-prd`: documentar problema, escopo e critérios de aceitação.
2. `criar-techspec`: definir arquitetura, contratos, riscos e casos de teste.
3. `criar-tasks`: decompor a solução em entregas incrementais.
4. `executar-task`: implementar cada tarefa com seus testes.
5. `executar-qa`: validar critérios de aceitação, corrigir defeitos e registrar
   evidências.
6. `executar-review`: revisar por último o código final já validado pelo QA.

Não antecipe o review. Correções realizadas durante o QA fazem parte do código
que deve ser avaliado na revisão final.

## Artefatos

Salve os artefatos <critical>na raíz desse repositório principal, nunca nos projetos filhos<critical>:

```text
tasks/prd-[slug]/
├── prd.md
├── techspec.md
├── tasks.md
├── task_1.md
├── qa.md
├── codereview.md
└── evidences/
```

O PRD é a fonte de verdade para requisitos e critérios de aceitação. A TechSpec
é a fonte de verdade para decisões técnicas e casos de teste. Os arquivos de
tarefa registram o escopo incremental e seu estado.

## Rastreabilidade

Todo critério de aceitação deve estar associado a uma ou mais tarefas e a casos
de teste. Use os identificadores `CA-*`, `TU-*`, `TI-*` e `E2E-*` de forma
consistente do PRD ao relatório final.

Não marque tarefas como concluídas sem implementação e testes aplicáveis. Não
aprove o QA com critérios sem evidência. Não aprove o review com testes
aplicáveis falhando ou sem conferir o código produzido durante o QA.

## Mudanças pequenas

Correções pontuais podem dispensar a criação de todo o conjunto de artefatos
quando o usuário não solicitar o fluxo formal. Mesmo nesses casos, respeite as
rules, implemente testes de regressão e execute as verificações do projeto.
