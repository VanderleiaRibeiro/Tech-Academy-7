## ADR-001: Escolha da Arquitetura — Monólito Modular (Modulith)

## Status

Aceito

## 1. Contexto

O produto MVR Routine é uma aplicação mobile para gestão de hábitos, que envolve três áreas funcionais bem definidas:

Auth → autenticação, cadastro e gestão de usuários

Habits → criação e gerenciamento dos hábitos do usuário

Records → registro das execuções diárias dos hábitos

Durante o desenvolvimento, observou-se que:

- cada domínio tem responsabilidade clara e separada;
- cada parte evolui em ritmos diferentes;
- operações como login, registro de hábito e geração de registros possuem cargas distintas;
- o time precisava testar, reiniciar e desenvolver partes de forma isolada;
- havia a necessidade de independência de banco de dados por domínio.

Além disso:

- O Docker Compose já orquestrava múltiplos containers.
- O Nginx funcionaria naturalmente como API Gateway.
- O front (React Native) consome endpoints isolados para cada domínio.

### Requisitos não funcionais importantes:

- mantenibilidade;
- capacidade de evolução incremental;
- organização clara por domínios (bounded contexts);
- performance adequada para um volume inicial moderado.

## 2. Decisão

Optamos por uma Arquitetura de Microsserviços, dividindo o backend em três serviços independentes:

### 1. Auth Service

Responsável por:

- cadastro e login
- hash e validação de senhas
- geração de JWT
- validação de permissões e perfis de usuário
  Banco exclusivo: auth-db

---

### 2. Habits Service

Responsável por:

- criação de hábitos
- edição e exclusão
- listagem
- regras de frequência

  Banco exclusivo: habits-db

---

### 3. Records Service

Responsável por:

- registrar conclusão dos hábitos
- listar histórico
- gerar análises simples

  Banco exclusivo: records-db

---

### 4. API Gateway (Nginx)

- centraliza o tráfego externo
- roteia as requisições para o serviço correto
- permite escalabilidade por serviço
- facilita autenticação global

---

### Comunicação

- Comunicação HTTP REST entre o frontend e o Nginx
- Comunicação direta REST entre serviços, quando necessário
- Cada serviço é isolado e pode ser reiniciado sozinho sem derrubar o sistema

## 3. Consequências

### Consequências Positivas

- Isolamento total de cada domínio, reduzindo impacto de falhas.
- Escalabilidade independente: é possível escalar Records sem precisar escalar Auth.
- Ciclo de deploy separado por serviço.
- Manutenção mais fácil: bugs são isolados ao serviço responsável.
- Bancos independentes, evitando conflitos e acoplamentos acidentais.
- Observabilidade refinada: métricas por serviço.
- Alinhamento natural com o domínio do negócio (DDD).

### Consequências Negativas

- Arquitetura mais complexa que um monólito.
- Requer orquestração via Docker Compose.
- Rede interna entre serviços pode introduzir latência.
- Aumenta a necessidade de logs centralizados e tracing distribuído.
- Exige pipeline de deploy capaz de lidar com múltiplos serviços.

## 4. Decisão Final

Manter o backend estruturado em três microsserviços independentes, com Nginx como API Gateway e Docker Compose como orquestrador.
