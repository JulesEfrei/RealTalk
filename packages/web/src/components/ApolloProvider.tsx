"use client";

import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";

const client = new ApolloClient({
  link: createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || "http://localhost:3000/graphql",
    credentials: "include",
  }),
  cache: new InMemoryCache(),
});

export default function ApolloProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
