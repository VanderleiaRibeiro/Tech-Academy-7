# C4 – Nível 2: Diagrama de Containers — Arquitetura em Microsserviços

Sistema: **RVM Routine**

## 1. Containers Principais

### **1.1 Mobile App (React Native / Expo)**

- Interface utilizada pelo usuário final.
- Controla toda a navegação do app.
- Armazena o token JWT no AsyncStorage.
- Opera com cache local para funcionamento offline.
- Consome os serviços através do API Gateway (Nginx).
- Envia requisições autenticadas aos microsserviços.

---

### **1.2 API Gateway (Nginx)**

- Exposto publicamente (HTTPS).
- Centraliza todas as requisições externas.
- Roteia as chamadas para os serviços internos:
  - `/auth/*` → Auth Service
  - `/habits/*` → Habits Service
  - `/records/*` → Records Service
- Registra logs de acesso.
- Pode aplicar rate limiting simples.

---

### **1.3 Auth Service (Node.js + Express)**

Responsável por:

- Cadastro e login.
- Validação de credenciais.
- Hash de senhas com bcrypt.
- Geração e verificação de tokens JWT.
- Regras de autorização (RBAC).
- Política de segurança por usuário.

Comunicação:

- **Auth DB (MySQL)** – persistência de usuários.
- API Gateway – ponto de entrada externo.

Principais endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

---

### **1.4 Habits Service (Node.js + Express)**

Responsável por:

- CRUD de hábitos.
- Regras de frequência/recorrência.
- Validação do dono do hábito.
- Exposição de listas filtradas.

Comunicação:

- **Habits DB (MySQL)** – persistência dos hábitos.
- JWT validado pelo Auth Service via API Gateway.

Principais endpoints:

- `POST /habits`
- `GET /habits`
- `PUT /habits/:id`
- `DELETE /habits/:id`

---

### **1.5 Records Service (Node.js + Express)**

Responsável por:

- Registrar conclusões diárias dos hábitos.
- Gerar métricas simples.
- Consultar histórico do usuário.

Comunicação:

- **Records DB (MySQL)** – persistência de registros.
- Dados do usuário/hábito validados em serviços upstream.

Principais endpoints:

- `POST /records`
- `GET /records?date=...`

---

### **1.6 Bancos de Dados (MySQL)**

Cada domínio possui persistência isolada:

- **Auth DB**

  - Tabela `users`

- **Habits DB**

  - Tabela `habits`

- **Records DB**
  - Tabela `records`

Garantia de:

- Isolamento entre domínios.
- Independência de deploy.
- Escalabilidade separada.

---

### **1.7 Storage de Imagens (File System / Bucket)**

- Armazena fotos de perfis enviadas pelo usuário.
- Integrado especialmente ao Auth Service.
- URLs públicas fornecidas pela API.

---

### **1.8 Observabilidade (Logs e Métricas)**

- Recebe logs estruturados (JSON) de todos os microsserviços.
- Armazena:
  - `api_response_time_p95`
  - `error_rate`
  - `service_request_count`
  - `habit_completion_rate`
- Integrações possíveis:
  - Grafana
  - Prometheus
  - Logtail / Datadog / Loki

---

## 2. Interações entre Containers

| Origem            | Destino             | Ação                                        |
| ----------------- | ------------------- | ------------------------------------------- |
| Mobile App        | Nginx (API Gateway) | Envia requisições HTTP autenticadas via JWT |
| Mobile App        | AsyncStorage        | Armazena tokens e dados offline             |
| Gateway           | Auth Service        | Roteia chamadas relacionadas a autenticação |
| Gateway           | Habits Service      | Roteia operações de gestão de hábitos       |
| Gateway           | Records Service     | Roteia operações de registro de atividades  |
| Auth Service      | Auth DB             | Persistência de usuários                    |
| Habits Service    | Habits DB           | Persistência de hábitos                     |
| Records Service   | Records DB          | Persistência dos registros diários          |
| Auth Service      | File Storage        | Upload e leitura de fotos                   |
| Todos os serviços | Observabilidade     | Envio de logs e métricas                    |

---

## 3. Visão Geral do Nível de Containers (Resumo Visual)

                      +------------------------+
                      |      Mobile App       |
                      |  React Native / Expo  |
                      +-----------+-----------+
                                  |
                           HTTPS + JWT
                                  v
                      +------------------------+
                      |      API Gateway      |
                      |         Nginx         |
                      +-----+-----------+-----+
                            |           |
                  ----------+           +----------
                  |                                |
        +-----------------------+        +-----------------------+
        |     Auth Service      |        |    Habits Service     |
        |   Node.js + Express   |        |   Node.js + Express   |
        +-----------+-----------+        +-----------+-----------+
                    |                                |
                    v                                v
        +-----------------------+        +-----------------------+
        |       Auth DB         |        |      Habits DB        |
        |         MySQL         |        |         MySQL         |
        +-----------------------+        +-----------------------+

                      +------------------------+
                      |    Records Service     |
                      |   Node.js + Express    |
                      +-----------+------------+
                                  |
                                  v
                      +------------------------+
                      |      Records DB        |
                      |         MySQL          |
                      +------------------------+
