# RealTalk Web

This package contains the frontend for the RealTalk application. It is built with [Next.js](https://nextjs.org/), a popular [React](https://reactjs.org/) framework for building server-side rendered and static web applications.

## Architecture

The frontend is built with a component-based architecture. It uses [Apollo Client](https://www.apollographql.com/docs/react/) for managing GraphQL data and state. [Tailwind CSS](https://tailwindcss.com/) is used for styling, with a set of reusable UI components.

### Key Features

- **Real-time updates:** Uses GraphQL subscriptions to receive real-time updates for messages and conversations.
- **Authentication:** Integrates with the backend API's [Clerk](https://clerk.com/) authentication.
- **Component Library:** A set of reusable UI components built with [Radix UI](https://www.radix-ui.com/) and styled with Tailwind CSS.

## Getting Started

1.  Navigate to the `packages/web` directory.
2.  Install dependencies: `pnpm install`
3.  Set up your `.env` file based on the root `.env.dist`.
4.  Start the development server: `pnpm dev`

The application will be running at `http://localhost:3000`.

## Code Generation

This project uses [GraphQL Code Generator](https://www.graphql-code-generator.com/) to generate TypeScript types from the GraphQL schema. To run the code generation, use the following command:

```sh
pnpm codegen
```