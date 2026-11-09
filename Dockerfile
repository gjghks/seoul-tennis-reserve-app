# syntax=docker/dockerfile:1
# Self-hosted production image (Oracle Cloud ARM). Build context must contain .env.production
# (NEXT_PUBLIC_* values are inlined at build time; server secrets come from env_file at runtime).
FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM node:24-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 BUILD_STANDALONE=1 STRICT_CSP=1 NODE_OPTIONS=--max-old-space-size=3072
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN groupadd -r app && useradd -r -g app app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
# Next's standalone output copies loaded .env* files into the bundle; runtime values come from
# compose env_file, so drop them to keep secrets out of the final image layers.
RUN rm -f /app/.env /app/.env.production /app/.env.local
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
