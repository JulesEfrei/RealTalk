import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const createClient = (cookies: ReadonlyRequestCookies) => {
  return new ApolloClient({
    ssrMode: true,
    link: new HttpLink({
      uri:
        process.env.NEXT_PUBLIC_GRAPHQL_URI || "http://localhost:3000/graphql",
      credentials: "include",
      headers: {
        Cookie: cookies.toString(),
      },
    }),
    cache: new InMemoryCache(),
  });
};

export default createClient;
