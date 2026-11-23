# syntax=docker/dockerfile:1

# ---- deps: install everything once (bun lockfile) ----
FROM node:22-alpine AS deps
WORKDIR /app
# Bun's musl build, copied from its official image (npm's bun package fails on Alpine).
COPY --from=oven/bun:1.2.13-alpine /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- builder: next build -> .next/standalone ----
FROM deps AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN bun run build

# ---- migrator: applies db/schema.ts to the database, once per deploy ----
FROM deps AS migrator
COPY drizzle.config.ts ./
COPY db ./db
CMD ["bunx", "drizzle-kit", "push"]

# ---- runner: small production image ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public
USER app
EXPOSE 3000
CMD ["node", "server.js"]
