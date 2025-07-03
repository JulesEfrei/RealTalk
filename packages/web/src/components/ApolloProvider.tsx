"use client";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3000/graphql",
  cache: new InMemoryCache(),
});

export default function ApolloProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
