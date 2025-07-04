# RealTalk API

This package contains the backend API for the RealTalk application. It is built with [NestJS](https://nestjs.com/), a progressive [Node.js](https://nodejs.org/) framework for building efficient, reliable and scalable server-side applications.

## Architecture

The API is built using a modular architecture, with each feature area (e.g., users, conversations, messages) encapsulated in its own module. It uses [GraphQL](https://graphql.org/) for querying and mutating data, and [Prisma](https://www.prisma.io/) as the ORM for interacting with the database.

### Modules

- **Auth:** Handles user authentication and authorization using [Clerk](https://clerk.com/).
- **Users:** Manages user-related operations.
- **Conversations:** Manages conversations and their participants.
- **Messages:** Handles real-time messaging using WebSockets.
- **Prisma:** Provides a reusable Prisma service for database access.

## Getting Started

1.  Navigate to the `packages/api` directory.
2.  Install dependencies: `pnpm install`
3.  Set up your `.env` file based on `.env.dist`.
4.  Run database migrations: `pnpm prisma:migrate:dev`
5.  Start the development server: `pnpm start:dev`

The API will be running at `http://localhost:3001`.

## Testing

- **Unit tests:** `pnpm test`
- **End-to-end tests:** `pnpm test:e2e`