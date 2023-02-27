import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createWithApollo } from "../utils/createWithApollo";
import { PaginatedPosts } from "../generated/graphql";
import { NextPageContext } from "next";

export const createClient = (ctx: NextPageContext) =>
  new ApolloClient({
    uri: "http://localhost:4000/graphql",
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              keyArgs: [],
              merge(existing: PaginatedPosts | undefined, incoming: PaginatedPosts) {
                console.log(existing, incoming);
                return { ...incoming, posts: [...(existing?.posts || []), ...incoming.posts] };
              },
            },
          },
        },
      },
    }),
    credentials: "include",
    headers: {
      cookie: (typeof window === "undefined" ? ctx?.req?.headers.cookie : undefined) || "",
    },
  });

export const withApollo = createWithApollo(createClient);
