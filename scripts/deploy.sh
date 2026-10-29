#!/usr/bin/env bash
# Deploy da stack digital-courses na VPS (Docker Swarm + imagens do GHCR).
#
# Uso (na VPS, dentro da pasta do repositório):
#   ./scripts/deploy.sh            # publica a última versão (:latest)
#   ./scripts/deploy.sh <sha>      # publica/volta para uma versão específica
#
# Pré-requisitos: ver DEPLOY.md (arquivo .env na raiz e login no ghcr.io).
set -euo pipefail

STACK_NAME="${STACK_NAME:-digital-courses}"
COMPOSE_FILE="docker-compose.stack.yml"
ENV_FILE="${ENV_FILE:-.env}"

cd "$(dirname "$0")/.."

export IMAGE_TAG="${1:-latest}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERRO: $ENV_FILE não encontrado na raiz do repositório (copie de .env.production.example)." >&2
  exit 1
fi

# docker stack deploy não lê .env sozinho: exporta as variáveis para a interpolação do compose.
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ "$IMAGE_TAG" == "latest" ]]; then
  echo "→ Atualizando o repositório (compose e scripts)…"
  git pull --ff-only origin main
fi

if [[ -n "${GHCR_TOKEN:-}" ]]; then
  echo "→ Autenticando no ghcr.io…"
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "${GHCR_USER:?defina GHCR_USER}" --password-stdin
fi

echo "→ Publicando a stack '$STACK_NAME' com a tag '$IMAGE_TAG'…"
docker stack deploy --with-registry-auth -c "$COMPOSE_FILE" "$STACK_NAME"

echo "→ Serviços:"
docker stack services "$STACK_NAME"
