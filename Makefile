SHELL := /bin/bash

.PHONY: dev-up dev-down prod-up prod-down api-prisma-migrate-dev api-prisma-generate api-prisma-seed web-codegen

# Development Environment
dev-up:
	docker compose -f compose.yml up --build -d
	$(MAKE) api-prisma-migrate-dev
	$(MAKE) api-prisma-generate
	$(MAKE) web-codegen

dev-down:
	docker compose -f compose.yml down

# Production Environment
prod-up:
	docker compose -f compose.prod.yml up --build -d
	$(MAKE) api-prisma-migrate-deploy
	$(MAKE) api-prisma-generate

prod-down:
	docker compose -f compose.prod.yml down

# API Commands
api-prisma-migrate-dev:
	docker compose -f compose.yml exec api pnpm run prisma:migrate:dev

api-prisma-migrate-deploy:
	docker compose -f compose.prod.yml exec api pnpm run prisma:migrate:deploy

api-prisma-generate:
	docker compose -f compose.yml exec api pnpm run prisma:generate

api-prisma-seed:
	docker compose -f compose.yml exec api pnpm run prisma:db:seed

# Web Commands
web-codegen:
	docker compose -f compose.yml exec web pnpm run codegen
