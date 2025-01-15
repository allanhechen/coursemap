FROM node:20.17-alpine3.20 AS base

FROM base AS deps

# Copied from next.js Dockerfile template
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat g++ make py3-pip
WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm i

FROM base AS builder
WORKDIR /app

# Add building ENV
ENV DEPLOYMENT_TYPE=docker
ENV POSTGRES_PASSWORD=password
ENV POSTGRES_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/postgres

COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Copy special files
COPY next.config.mjs.docker next.config.mjs

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]