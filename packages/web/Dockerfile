# Development Stage
FROM node:22.17.0-alpine3.21 AS development

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY ./packages/web .

COPY packages/web/package.json pnpm-lock.yaml ./
RUN pnpm install

# Build Stage
FROM development AS build

WORKDIR /app

COPY ./packages/web .
COPY .env ./
COPY --from=development /app/node_modules ./node_modules

RUN pnpm run build

# Production Stage
FROM node:22.17.0-alpine3.21 AS production

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY packages/web/package.json pnpm-lock.yaml ./
RUN pnpm install --prod 

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

COPY .env .

EXPOSE 3000

CMD ["pnpm", "start"]
