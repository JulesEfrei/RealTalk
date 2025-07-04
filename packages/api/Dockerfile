# Development Stage
FROM node:22.17.0-alpine3.21 AS development

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY ./packages/api .

COPY packages/api/package.json pnpm-lock.yaml ./
RUN pnpm install 

# Build Stage
FROM development AS build

WORKDIR /app

COPY ./packages/api .
COPY --from=development /app/node_modules ./node_modules

RUN pnpm run build

# Production Stage
FROM node:22.17.0-alpine3.21 AS production

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY packages/api/package.json pnpm-lock.yaml ./
RUN pnpm install

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/generated ./generated

COPY .env .

EXPOSE 3000

CMD ["node", "dist/main"]
