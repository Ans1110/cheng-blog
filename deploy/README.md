# Deploying cheng-blog

Every push to `main` runs the checks, builds two images to GHCR and redeploys the VPS:

```
push to main
  CI: lint · typecheck · next build
  build: ghcr.io/<owner>/cheng-blog          (app, target "runner")
         ghcr.io/<owner>/cheng-blog-migrate  (drizzle-kit push, target "migrator")
  deploy (ssh to VPS, /opt/cheng-blog):
    copy docker-compose.yml + Caddyfile
    pull images → start mysql → apply schema (5 min timeout)
    restart app + caddy → wait for /api/health
```

If the schema step or the health check fails, the job fails and the previous
app container keeps serving. PRs only run the checks (`ci.yml`).

## One-time setup

### 1. VPS

Any Linux box with Docker and the compose plugin (Ubuntu 24.04 shown):

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"          # log out and back in
sudo mkdir -p /opt/cheng-blog && sudo chown "$USER" /opt/cheng-blog
```

Open ports 80 and 443 in the firewall.

### 2. DNS

Point an `A` record for your domain at the VPS IP. Caddy fetches the HTTPS
certificate on first start; the admin login cookie is `secure` in production,
so the site must be served over HTTPS.

### 3. Server `.env`

Copy `deploy/.env.example` to `/opt/cheng-blog/.env` and fill it in:

```bash
openssl rand -hex 32   # for COOKIE_SECRET
```

`DATABASE_HOST` is set by compose (`mysql`); don't put it in `.env`.

### 4. Deploy key

Create a key only for deploys and authorise it on the VPS:

```bash
ssh-keygen -t ed25519 -f cheng-blog-deploy -N ""
ssh-copy-id -i cheng-blog-deploy.pub <user>@<vps-ip>
```

### 5. GitHub settings

**Settings → Environments → New environment →** `pizza-cheng`, then add secrets:

| Secret        | Value                                    |
|---------------|------------------------------------------|
| `VPS_HOST`    | VPS IP or hostname                       |
| `VPS_USER`    | the SSH user from step 4                 |
| `VPS_SSH_KEY` | contents of the private `cheng-blog-deploy` file |
| `VPS_PORT`    | optional, defaults to 22                 |

The environment also lets you require a manual approval before each deploy.

## Day-to-day

```bash
cd /opt/cheng-blog
docker compose logs -f app          # app logs
docker compose ps                   # what's running
docker compose exec mysql sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' > backup.sql
```

Redeploy without a new commit: **Actions → Deploy → Run workflow**.

Roll back to an earlier build (images are tagged with the commit SHA):

```bash
cd /opt/cheng-blog
IMAGE_TAG=<old-commit-sha> docker compose up -d app
```

Schema changes are applied with `drizzle-kit push`, not reversible migrations,
so a rollback across a schema change may need the database fixed by hand.
