# Resumo das tarefas de implementação de refatoração do harness Chat e governança de IA

## Tarefas

- [x] 1.0 Caracterização de contratos, grafo e fundação da migração
- [x] 2.0 Catálogo e elegibilidade de modelos
- [x] 3.0 Governança de consumo, reserva e liquidação
- [x] 4.0 Guidance versionado e adaptação segura de tools
- [x] 5.0 Agent Harness Mastra e ownership de conversas
- [x] 6.0 Chat como borda HTTP/SSE do harness
- [x] 7.0 Backfill, coexistência e migração idempotente de dados
- [x] 8.0 Paridade do Mastra Studio e confirmação entre módulos
- [ ] 9.0 Gates operacionais e validação integrada
- [ ] 10.0 Cutover e retirada definitiva do legado

## Dependências

1. A tarefa 1.0 estabelece o baseline e os testes de caracterização.
2. As tarefas 2.0, 3.0 e 4.0 evoluem as capacidades proprietárias em paralelo
   conceitualmente, mas devem estar prontas antes do harness produtivo.
3. A tarefa 5.0 depende das tarefas 1.0, 2.0, 3.0 e 4.0.
4. A tarefa 6.0 depende da tarefa 5.0 e conecta o contrato público existente.
5. A tarefa 7.0 depende das stores do harness e da governança das tarefas 3.0
   e 5.0.
6. A tarefa 8.0 depende das tarefas 4.0, 5.0 e 6.0.
7. A tarefa 9.0 depende das tarefas 2.0 a 8.0 e executa os gates antes da
   remoção irreversível.
8. A tarefa 10.0 depende da aprovação da tarefa 9.0, do backfill validado e da
   janela de rollback.

## Rastreabilidade

| Critérios | Tarefas principais |
| --- | --- |
| CA-01 | 6.0, 9.0 |
| CA-02 | 5.0, 9.0 |
| CA-03 | 4.0, 6.0, 9.0 |
| CA-04 | 2.0, 9.0 |
| CA-05 | 3.0, 9.0 |
| CA-06 | 3.0, 9.0 |
| CA-07 | 3.0, 9.0 |
| CA-08 | 4.0, 8.0 |
| CA-09 | 8.0 |
| CA-10 | 8.0, 10.0 |
| CA-11 | 7.0, 10.0 |
| CA-12 | 5.0, 9.0 |
| CA-13 | 10.0 |
| CA-14 | 1.0, 10.0 |

Os casos `TU-01` a `TU-10`, `TI-01` a `TI-08` e `E2E-01` a `E2E-06` estão
distribuídos nos arquivos das tarefas conforme a fronteira que cada caso
valida. A implementação deve consultar o [PRD](prd.md) e a
[TechSpec](techspec.md) como fontes de verdade.
