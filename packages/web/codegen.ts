import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: [
    // Try to use the local schema file first if it exists
    { "./schema.graphql": { skipGraphQLImport: true } },
    // Fall back to the remote endpoint if the local file doesn't exist
    process.env.NEXT_PUBLIC_GRAPHQL_URI_SSR || "http://localhost:3000/graphql"
  ],
  documents: ["src/**/*.tsx", "src/**/*.ts"],
  generates: {
    "./src/lib/gql/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
