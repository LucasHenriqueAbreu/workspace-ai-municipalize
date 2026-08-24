# Regras de documentação

## Idioma e clareza

Escreva a documentação do workspace em português do Brasil. Use nomes técnicos
do código e das ferramentas sem traduções artificiais. Prefira instruções
executáveis, frases diretas e caminhos relativos ao arquivo que contém o link.

## Informação verificável

Não documente comandos, portas, variáveis, dependências ou comportamentos por
suposição. Confirme essas informações no código, nos scripts, na configuração ou
no log de inicialização. Quando algo depender do ambiente, declare como
confirmá-lo em vez de apresentar um valor variável como absoluto.

## Comandos

Todo comando deve indicar o diretório em que deve ser executado ou aparecer em
uma seção cujo contexto deixe isso inequívoco. Não misture comandos de projetos
independentes como se compartilhassem dependências ou lock files.

Explique pré-requisitos, efeito esperado, sinal de prontidão e forma de
encerramento quando documentar a inicialização de serviços.

## Manutenção

Atualize o `AGENTS.md` local quando uma mudança alterar:

- comandos de instalação, desenvolvimento, teste ou build;
- portas, URLs ou health checks;
- variáveis de ambiente obrigatórias;
- dependências como banco, Keycloak ou LiteLLM;
- ordem de inicialização ou encerramento;
- arquitetura, responsabilidade ou contrato entre projetos.

Evite duplicar detalhes específicos em regras globais. Faça a regra global
apontar para a fonte local e mantenha nela somente o comportamento comum de
orquestração.

## Links e exemplos

Verifique se links relativos resolvem a partir do arquivo que os declara.
Exemplos não podem conter segredos reais nem recomendar práticas diferentes das
regras do projeto.
