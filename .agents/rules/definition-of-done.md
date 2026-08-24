# Definition of Done global

## Tarefa de implementação

Uma tarefa somente pode ser marcada como concluída quando:

- todas as subtarefas foram implementadas;
- o comportamento produzido está coberto por testes automatizados aplicáveis;
- os testes afetados passam;
- lint, typecheck, build, cobertura e verificações locais exigidas passam;
- contratos e consumidores afetados foram verificados;
- migrations e alterações de dados possuem estratégia segura quando aplicáveis;
- documentação operacional afetada foi atualizada;
- processos e recursos temporários foram encerrados;
- limitações ou verificações não executadas foram informadas com o risco restante.

Use os comandos definidos no `AGENTS.md` do projeto. Uma validação bem-sucedida
em um repositório não substitui as validações dos outros projetos afetados.

## Funcionalidade

Uma funcionalidade do fluxo formal somente está concluída quando:

1. todas as tarefas estão concluídas;
2. todos os critérios de aceitação foram validados no QA;
3. defeitos encontrados no QA foram corrigidos e revalidados;
4. o relatório `qa.md` está aprovado e possui evidências aplicáveis;
5. o review final foi executado sobre o código após o QA;
6. o relatório `codereview.md` está aprovado.

O review é a última etapa. Não use um review anterior ao QA como aprovação do
código final quando o QA tiver produzido qualquer alteração.

## Bloqueios

Não declare sucesso quando uma verificação obrigatória não puder ser executada.
Registre o comando, o motivo, o impacto e a ação necessária. Falhas preexistentes
devem ser diferenciadas das causadas pela alteração, mas continuam visíveis no
relatório final.
