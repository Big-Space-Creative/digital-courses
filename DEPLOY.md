# Deploy na VPS

A cada push na `main`, o GitHub Actions (`.github/workflows/deploy.yml`) roda os testes do backend e publica três imagens no GHCR, cada uma com duas tags:

| Imagem | Tags |
| --- | --- |
| `ghcr.io/big-space-creative/digital-courses/backend` | `latest`, `<sha do commit>` |
| `ghcr.io/big-space-creative/digital-courses/nginx` | `latest`, `<sha do commit>` |
| `ghcr.io/big-space-creative/digital-courses/frontend` | `latest`, `<sha do commit>` |

O deploy na VPS (Docker Swarm + Traefik, rede externa `network_swarm_public`) é feito com `scripts/deploy.sh`.

## Primeira configuração na VPS

```bash
git clone https://github.com/Big-Space-Creative/digital-courses.git /root/digital-courses
cd /root/digital-courses
cp .env.production.example .env      # preencha os valores de produção
chmod +x scripts/deploy.sh
```

Login no GHCR (as imagens são privadas). Crie um Personal Access Token com o escopo `read:packages` e:

- faça login uma vez: `docker login ghcr.io -u <usuario-github>` (cole o token como senha), **ou**
- preencha `GHCR_USER` e `GHCR_TOKEN` no `.env` para o script fazer o login a cada deploy.

## Deploy

```bash
cd /root/digital-courses
./scripts/deploy.sh          # última versão (:latest) — faz git pull antes
```

## Voltar para uma versão anterior

Use o SHA completo do commit desejado (ex.: `git log origin/main`) ou o da página do run no GitHub Actions:

```bash
./scripts/deploy.sh 19375d543d3fa2134e005081dc91cdea92c74f08
```

## Conferir

```bash
docker stack services digital-courses
docker service logs -f digital-courses_frontend
docker service logs -f digital-courses_app
```

Migrations, quando houver mudança de banco:

```bash
docker exec -it $(docker ps -q -f name=digital-courses_app) php artisan migrate --force
```

## Deploy automático (opcional)

O job `deploy` do workflow fica desligado por padrão. Para ligá-lo:

1. Em *Settings → Secrets and variables → Actions*, crie os secrets `VPS_HOST`, `VPS_USERNAME` e `VPS_SSH_KEY` (chave privada cuja pública está em `~/.ssh/authorized_keys` da VPS). `VPS_PASSWORD` e `VPS_PORT` são opcionais.
2. Crie a variável `VPS_AUTO_DEPLOY` = `true` (e `VPS_PROJECT_PATH`, se a pasta não for `/root/digital-courses`).

Com isso, cada push na `main` publica as imagens e executa `scripts/deploy.sh <sha>` na VPS.
