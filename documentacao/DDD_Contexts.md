# DDD - Context Map - RVM Routine

Este documento descreve a visão de Domínios e Bounded Contexts aplicados à arquitetura de microsserviços do sistema **RVM Routine**.

---

# 1. Bounded Contexts

## **1. Identity & Access (Auth Service)**

Responsável por:

- Cadastro de usuários
- Login e autenticação JWT
- Autorização e papéis (USER / ADMIN)
- Hash de senha e políticas de segurança

Upstream de:

- Habits Management
- Habit Records

---

## **2. Habits Management (Habits Service)**

Responsável por:

- Criação, edição e exclusão de hábitos
- Definição de frequência e recorrência
- Validação do dono do hábito

Fornece dados para:

- Habit Records (habitId, frequência)
- Notifications (gatilhos de lembrete)

---

## **3. Habit Records (Records Service)**

Responsável por:

- Registrar as conclusões diárias dos hábitos
- Histórico de progresso do usuário
- Cálculo simples de métricas

Downstream de:

- Identity & Access (userId)
- Habits Management (habitId)

---

## **4. Notifications (futuro)**

Responsável por:

- Envio de notificações e lembretes
- Ações disparadas por eventos de hábitos concluídos ou não concluídos

Downstream de:

- Habits Management
- Habit Records

---

# 2. Relações entre Contextos (Context Map)

## **Identity & Access → Habits Management**

- _Customer-Supplier_
- Habits depende da identidade fornecida pelo Auth Service.

## **Habits Management → Habit Records**

- _Published Language_
- Habit Records depende do modelo de Habit (`habitId`, `userId`).

## **Habits Management → Notifications (futuro)**

- _Event Publisher_
- Gatilhos de lembrete vêm das configurações de hábitos.

## **Habit Records → Notifications (futuro)**

- _Event Publisher_
- Pode gerar eventos como “usuário não concluiu hábito X hoje”.

---

# 3. Context Map - Representação Visual

               +---------------------------+
               | Identity & Access (Auth) |
               | - login, JWT, roles      |
               +-------------+-----------+
                             |
                             | upstream
                             v
        +---------------------------------------------+
        | Habits Management (Habits BC)              |
        | - criação / gestão de hábitos              |
        +----------------+---------------------------+
                         |
                         | publishes
                         v
               +---------------------------+
               | Habit Records             |
               | - histórico diário        |
               +-------------+-------------+
                             |
                             | events
                             v
               +---------------------------+
               | Notifications (futuro)    |
               | - lembretes               |
               +---------------------------+

---

# 4. Entidades, Value Objects e Aggregates

## **Entities**

- User
- Habit
- Record

## **Value Objects**

- HabitName (min 3, max 50 caracteres)
- DailyCompletionDate

## **Aggregate**

- **HabitAggregate**
  - Habit (root)
  - registros de realização (Records)

---

# 5. Conclusão

O Context Map reflete com precisão a arquitetura distribuída do RVM Routine, mostrando dependências, fronteiras e responsabilidades entre os microsserviços.
