# RVM Routine — Controle de Hábitos

## Sobre o Projeto

O **RVM Routine** é um aplicativo mobile desenvolvido em **React Native (Expo)** com backend em **Node.js/Express** e **MySQL**.  
O objetivo do sistema é ajudar usuários a **criarem, acompanharem e concluírem hábitos** do dia a dia, com registro diário, categorias e em breve notificações.

Projeto desenvolvido como parte da disciplina **Tech Academy 7**, com foco em **Clean Code, POO e boas práticas**.

---

## Tecnologias Utilizadas

### **Frontend (Mobile)**

- [React Native (Expo)](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Navigation](https://reactnavigation.org/)
- [Axios](https://axios-http.com/)
- [React Hook Form](https://react-hook-form.com/)

### **Backend**

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Sequelize ORM](https://sequelize.org/)
- [MySQL](https://www.mysql.com/)
- [JWT (JSON Web Token)](https://jwt.io/)
- [Zod](https://zod.dev/)

---

## Funcionalidades

- Cadastro e login de usuários
- Autenticação com JWT
- Edição de usuário (restrita ao próprio usuário)
- CRUD completo de hábitos
- Marcar e desmarcar hábitos como concluídos (com registros diários)
- Agrupamento entre "A Fazer" e "Concluídos Hoje"
- Organização de código com **Clean Code e POO**

---

## Estrutura de Pastas

### **Backend**

```md
backend/
├── src/
│ ├── config/
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ ├── utils/
│ ├── app.ts
│ └── index.ts
```

### **Frontend**

```md
frontend/
├── src/
│ ├── telas/
│ ├── components/
│ ├── api/
│ ├── navigation/
│ └── services/
```

---

## Variáveis de Ambiente

### **Backend (.env)**

```env
NODE_ENV=development
PORT=3001

DB_OFICIAL=controle_habitos
DB_USER=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=3306

FRONT_URL=http://localhost:5173
JWT_SECRET=umsegredoseguro
JWT_EXPIRES=1d
```

### **Frontend (.env)**

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

---

## Como Rodar o Projeto

### Backend

```bash
cd backend
npm install
npm run dev
```

Servidor disponível em: http://localhost:3001

### Frontend (Expo)

```bash
cd frontend
npm install
npx expo start
```

Rodar no celular com Expo Go (QR Code)

---

## Rotas da API

### Usuários

- POST /api/users/register → Criar usuário
- POST /api/users/login → Login
- GET /api/users/:id → Buscar usuário
- PUT /api/users/:id → Atualizar usuário (autenticado)
- DELETE /api/users/:id → Deletar conta

### Hábitos

- POST /api/habits → Criar hábito
- GET /api/habits → Listar hábitos do usuário
- PUT /api/habits/:id → Atualizar hábito
- DELETE /api/habits/:id → Deletar hábito

### Registros de Hábitos

- POST /api/habits/:habitId/records → Criar/atualizar registro diário
- GET /api/habits/:habitId/records?date=YYYY-MM-DD → Listar registros
- DELETE /api/habits/:habitId/records?date=YYYY-MM-DD → Remover registro

---

## Autores

- Rodrigo Oliveira
- Mariana Salmaza
- Vanderléia Ribeiro

---

## Licença

Projeto desenvolvido para fins acadêmicos na Tech Academy 7.
