import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Resolver, Query, Ctx } from "type-graphql";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() ctx: MyContext): Promise<Post[]> {
    return ctx.em.find(Post, {});
  }
}
