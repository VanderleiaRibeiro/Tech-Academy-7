# Resilience & Observability

## Estratégias de Resiliência

- Retry com backoff para falhas temporárias.
- Timeouts para evitar requisições presas.
- Circuit Breaker para proteger módulos caso falhem.
- Fallbacks em operações não críticas.
- Bulkhead para isolar módulos (ex.: Notifications não derrubar Habits).
- Cache Local + Sync assíncrono para cenários de rede instável.

## Observability - métricas e logs

### Métricas (simples)

- api_response_time_p95
- error_rate
- habit_completion_rate
- db_pool_usage

### Logs (JSON)

- auth_attempts
- habit_operations
- error_stack_traces
- sempre com trace_id

### Traces

- login → carregar hábitos → marcar hábito
- db_query_trace
- sync_background_jobs_trace
