# Runbook Simplificado - Sistema Indisponível

## Detecção
- Alerta: API response time > 5s

## Ação Imediata
1. Verificar status no host/paas (ex: Railway)
2. Checar métricas no dashboard (Grafana/Prometheus)
3. Se necessário, executar rollback para última versão estável

## Investigação
1. Logs de erro últimos 30min
2. Verificar deploys recentes
3. Monitorar uso de recursos (CPU/Mem)

## Resolução
- Corrigir bug, deploy fix, documentar incidente
