# Backup e Restauração — PostgreSQL (Digital Courses)

Corrige o achado crítico de ausência de backup/DR (Roteiro de Conformidade e Segurança - R1).

> O banco de produção é **externo** ao stack do Swarm (acessado via `DB_HOST`). O backup roda no host da VPS, não dentro de um container do app.

## Pré-requisitos no host

- `postgresql-client` (fornece `pg_dump`/`pg_restore`) — **mesma major version** do servidor.
- `awscli` (apenas se for enviar off-site para S3/MinIO).
- `gnupg` (apenas se for cifrar — **recomendado** para cópias off-site).

## Agendamento (cron diário às 03:00 UTC)

Carregue as variáveis do `.env` de produção e chame o script:

```cron
0 3 * * *  set -a && . /root/digital-courses/.env && set +a && \
           BACKUP_GPG_RECIPIENT="backup@bigspacecreative.com.br" \
           /root/digital-courses/scripts/backup-postgres.sh >> /var/log/dc-backup.log 2>&1
```

Torne o script executável uma vez: `chmod +x scripts/backup-postgres.sh`.

## Restauração (TESTAR periodicamente — backup não testado não é backup)

1. Baixe o backup mais recente (se estiver no S3):
   ```bash
   aws s3 cp "s3://$AWS_BUCKET/backups/dc-<db>-<timestamp>.dump.gpg" .
   ```
2. Decifre (se cifrado):
   ```bash
   gpg --output restore.dump --decrypt dc-<db>-<timestamp>.dump.gpg
   ```
3. Restaure em um banco **de teste** primeiro (nunca direto em produção):
   ```bash
   createdb -h "$DB_HOST" -U "$DB_USERNAME" digital_courses_restore_test
   pg_restore -h "$DB_HOST" -U "$DB_USERNAME" \
     --dbname=digital_courses_restore_test --no-owner --clean --if-exists \
     restore.dump
   ```
4. Valide contagens de linhas das tabelas principais (`users`, `orders`, `enrollments`) e descarte o banco de teste.

## Metas (definir e documentar)

| Parâmetro | Sugestão inicial |
|-----------|------------------|
| **RPO** (perda máxima aceitável) | ≤ 24h (backup diário) |
| **RTO** (tempo máximo de recuperação) | ≤ 4h |
| Retenção local | 14 dias (`BACKUP_RETENTION_DAYS`) |
| Teste de restauração | Mensal, registrado |

> ⚠️ Sem `BACKUP_GPG_RECIPIENT`, o dump vai **sem cifra** — não envie off-site assim, pois conteria PII (e-mails, IPs, histórico).
