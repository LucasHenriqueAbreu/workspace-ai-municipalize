# Evidência — cobertura

Data da execução: 2026-08-26.

`npm test -- --coverage` executou 87 arquivos e 279 testes com sucesso, mas o
processo terminou com falha no gate global de 80%:

- statements/lines: 59,8%;
- branches: 72,0%;
- functions: 70,4%.

O mesmo gate global já estava abaixo da meta antes das correções realizadas
durante este QA. Os limiares e exclusões não foram alterados.
