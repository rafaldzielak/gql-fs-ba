import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange } from "urql";
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

import { stringifyVariables } from "@urql/core";

export type MergeMode = "before" | "after";

export interface PaginationParams {
  cursorArgument?: string;
  limitArgument?: string;
  mergeMode?: MergeMode;
}

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    console.log(entityKey, fieldName);
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    console.log(fieldArgs);
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    console.log("KEY:", fieldKey);
    const isInTheCache = cache.resolve(cache.resolve(entityKey, fieldKey) as string, "posts") as string[];
    console.log({ isInTheCache });
    info.partial = !isInTheCache;
    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore") as boolean;
      if (!_hasMore) hasMore = _hasMore;
      results.push(...data);
    });

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    };
  };
};

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: { credentials: "include" as const },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          createPost: (_result, args, cache, info) => {
            const allFields = cache.inspectFields("Query");
            const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
            fieldInfos.forEach((fi) => cache.invalidate("Query", "posts", fi.arguments));
          },
          login: (_result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(cache, { query: MeDocument }, _result, (result, query) => {
              if (result.login.errors) return query;
              return { me: result.login.user };
            });
          },
          register: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(cache, { query: MeDocument }, _result, (result, query) => {
              if (result.register.errors) return query;
              return { me: result.register.user };
            });
          },
          logout: (_result, args, cache, info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(cache, { query: MeDocument }, _result, () => ({ me: null }));
          },
        },
      },
    }),
    ssrExchange,
    fetchExchange,
  ],
});
