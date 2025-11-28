# ADR-002: Banco de Dados Relacional - Escolha por MySQL

## Status

Aceito

## Contexto

A aplicação lida com informações críticas como usuários, hábitos, conclusões diárias e histórico de desempenho. Esses dados exigem consistência forte e integridade referencial.

### Requisitos que motivam o uso de um banco relacional:

- suporte a transações ACID (especialmente para criação de hábitos e seus registros);
- relacionamentos claros entre tabelas (User → Habits → Records);
- histórico de registros diários sem perda de integridade;
- necessidade de migrations estruturadas;
- integração direta com ORM (Sequelize);
- baixo custo de operação e fácil manutenção pelo time.

## Decisão

Optamos por utilizar MySQL devido a:

- experiência prévia do time;
- excelente suporte do Sequelize (drivers maduros e comunidade ampla);
- performance adequada para cargas OLTP típicas;
- ampla compatibilidade com serviços cloud de baixo custo;
- curva de aprendizado reduzida.

### Comparação com alternativas

PostgreSQL oferece mais funcionalidades (extensões, JSONB mais robusto, tipos avançados), porém:

- não são necessárias para o estágio atual do produto;
- aumentariam a complexidade de aprendizado no time;
- não trariam ganhos significativos considerando o domínio.

## Consequências

### Positivas

- Schema relacional sólido e de fácil manutenção.
- Migrations integradas ao Sequelize.
- Ferramentas maduras de backup e replicação.
- Performance estável para o volume previsto.
- Baixa curva de aprendizado para a equipe.

### Negativas

- PostgreSQL oferece recursos avançados que o MySQL não tem.
- Pode exigir tuning em cenários de alto volume.
- Risco de migração futura caso a aplicação demande recursos ausentes no MySQL.
