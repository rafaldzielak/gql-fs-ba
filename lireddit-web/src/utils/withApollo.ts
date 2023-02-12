import { ApolloClient, InMemoryCache } from "@apollo/client";
import { withApollo as createWithApollo } from "next-apollo";
import { PaginatedPosts } from "../generated/graphql";

export const client = new ApolloClient({
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
});

export const withApollo = createWithApollo(client);
