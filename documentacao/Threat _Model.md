# Threat Model - Fluxo de Login

## 1. Diagrama Simplificado do Fluxo (DFD)

```pgsql

[Usuário]
    | (email/senha)
    v
[API /auth/login]
    |-- valida credenciais
    |-- verifica hash da senha
    |-- gera JWT assinado
    v
[Resposta: JWT]
    |-- Token enviado para o cliente
    v
[Cliente envia JWT em rotas protegidas]

```

### Trust Boundaries:

- Entrada externa → API pública
- API → Banco de dados
- API → Módulo de autenticação

## 2. Ameaças Identificadas

T1 - Brute Force / Credential Stuffing
Ataques automatizados tentando adivinhar senha.

T2 - Replay Attack
Uso repetido de uma mesma requisição/token capturado.

T3 - Token Manipulation
Tentativa de alterar payload/assinatura do JWT.

T4 - Session Fixation
Atacante tenta forçar o usuário a usar um token controlado.

T5 - MITM (Man-in-the-middle)
Interceptação do tráfego se não houver HTTPS.

T6 - User Enumeration
Mensagens diferentes para “usuário não existe” vs “senha incorreta”.

T7 - SQL Injection no Login
Se ausência de ORM/validação permitisse injeção maliciosa.

T8 - Acesso sem Autorização
Requisição com token expirado, inválido ou ausente.

## 3. Mitigações Aplicadas

M1 - Hash seguro de senhas (bcrypt)

- Mitiga: T1, T3, T6
- Senhas nunca armazenadas em texto.

M2 - Mensagem de erro padronizada (“Credenciais inválidas”)

- Mitiga: T6 - User Enumeration

M3 - JWT assinado com segredo forte + expiração curta

- Mitiga: T2, T3, T4, T8

M4 - Verificação obrigatória de token em rotas protegidas

- Mitiga: T8

M5 - Owner Check (usuário só acessa seus próprios dados)

- Mitiga: T8 (autorização)

M6 - HTTPS obrigatório no ambiente de produção

- Mitiga: T5

M7 - Rate Limit + Account Lockout simples (5 tentativas)

- Mitiga: T1 - brute force

M8 - Proteção contra Replay (expiração curta + timestamp)

- Mitiga: T2

M9 - ORM + validação de entrada

- Mitiga: T7 - SQL Injection

M10 - Rotação de token após login (opcional, recomendado)

- Mitiga: T4 - Session Fixation

## 4. Conclusão

O modelo de ameaças cobre o fluxo de login com foco em ataques comuns
(brute force, MITM, replay, enumeração e manipulação do token). As
mitigações aplicadas garantem segurança adequada ao contexto da
aplicação, mantendo o equilíbrio entre proteção, performance e
simplicidade.
