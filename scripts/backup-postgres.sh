#!/usr/bin/env bash
#
# backup-postgres.sh — Backup diário do PostgreSQL do Digital Courses
#
# Corrige o achado CRÍTICO de ausência de backup/DR.
#

# O banco em produção é EXTERNO ao stack do Swarm (acessado via DB_HOST), por isso
# este script usa as mesmas variáveis de ambiente do serviço `app`
# (DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD).
#
# O que faz:
#   1. pg_dump comprimido (custom format) do banco
#   2. (opcional) cifra o dump com GPG se BACKUP_GPG_RECIPIENT estiver definido
#   3. (opcional) envia para o S3/MinIO (AWS_BUCKET) sob o prefixo backups/
#   4. remove backups locais mais antigos que BACKUP_RETENTION_DAYS
#
# Uso (cron, todo dia às 03:00):
#   0 3 * * *  /caminho/scripts/backup-postgres.sh >> /var/log/dc-backup.log 2>&1
#
# Variáveis de ambiente esperadas (carregue do .env de produção antes de chamar):
#   DB_HOST DB_PORT DB_DATABASE DB_USERNAME DB_PASSWORD
#   BACKUP_DIR            (padrão: /var/backups/digital-courses)
#   BACKUP_RETENTION_DAYS (padrão: 14)
#   BACKUP_GPG_RECIPIENT  (opcional: id/email da chave pública para cifrar)
#   AWS_BUCKET            (opcional: se definido, envia off-site)
#   AWS_ENDPOINT          (opcional: para MinIO/S3 compatível)
#
set -euo pipefail

# ── Configuração ────────────────────────────────────────────────────────────
DB_HOST="${DB_HOST:?DB_HOST não definido}"
DB_PORT="${DB_PORT:-5432}"
DB_DATABASE="${DB_DATABASE:?DB_DATABASE não definido}"
DB_USERNAME="${DB_USERNAME:?DB_USERNAME não definido}"
DB_PASSWORD="${DB_PASSWORD:?DB_PASSWORD não definido}"

BACKUP_DIR="${BACKUP_DIR:-/var/backups/digital-courses}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BASENAME="dc-${DB_DATABASE}-${TIMESTAMP}.dump"
DUMP_PATH="${BACKUP_DIR}/${BASENAME}"

mkdir -p "${BACKUP_DIR}"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }

# ── 1. Dump ─────────────────────────────────────────────────────────────────
# Formato custom (-Fc): comprimido e restaurável seletivamente com pg_restore.
log "Iniciando pg_dump de ${DB_DATABASE}@${DB_HOST}:${DB_PORT}"
PGPASSWORD="${DB_PASSWORD}" pg_dump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USERNAME}" \
  --dbname="${DB_DATABASE}" \
  --format=custom \
  --no-owner \
  --file="${DUMP_PATH}"
log "Dump gerado: ${DUMP_PATH} ($(du -h "${DUMP_PATH}" | cut -f1))"

UPLOAD_PATH="${DUMP_PATH}"

# ── 2. Cifragem opcional (recomendado para off-site) ────────────────────────
if [[ -n "${BACKUP_GPG_RECIPIENT:-}" ]]; then
  log "Cifrando backup para ${BACKUP_GPG_RECIPIENT}"
  gpg --batch --yes --trust-model always \
      --recipient "${BACKUP_GPG_RECIPIENT}" \
      --output "${DUMP_PATH}.gpg" \
      --encrypt "${DUMP_PATH}"
  rm -f "${DUMP_PATH}"
  UPLOAD_PATH="${DUMP_PATH}.gpg"
  log "Backup cifrado: ${UPLOAD_PATH}"
else
  log "AVISO: BACKUP_GPG_RECIPIENT não definido — backup NÃO cifrado. Defina-o antes de enviar off-site."
fi

# ── 3. Envio off-site (S3/MinIO) ────────────────────────────────────────────
if [[ -n "${AWS_BUCKET:-}" ]]; then
  ENDPOINT_ARG=()
  if [[ -n "${AWS_ENDPOINT:-}" ]]; then
    ENDPOINT_ARG=(--endpoint-url "${AWS_ENDPOINT}")
  fi
  log "Enviando para s3://${AWS_BUCKET}/backups/"
  aws "${ENDPOINT_ARG[@]}" s3 cp "${UPLOAD_PATH}" "s3://${AWS_BUCKET}/backups/$(basename "${UPLOAD_PATH}")"
  log "Upload concluído."
else
  log "AVISO: AWS_BUCKET não definido — backup mantido apenas localmente (sem cópia off-site)."
fi

# ── 4. Retenção ─────────────────────────────────────────────────────────────
log "Removendo backups locais com mais de ${BACKUP_RETENTION_DAYS} dias"
find "${BACKUP_DIR}" -type f \( -name 'dc-*.dump' -o -name 'dc-*.dump.gpg' \) \
  -mtime "+${BACKUP_RETENTION_DAYS}" -print -delete || true

log "Backup finalizado com sucesso."
