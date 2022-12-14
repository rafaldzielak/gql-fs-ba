import { Post } from "../entities/Post";
import { Resolver, Query, Arg, Int, Mutation, Ctx, InputType, Field, UseMiddleware, FieldResolver, Root } from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { dataSource } from "../";

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Query(() => [Post])
  posts(@Arg("limit", () => Int) limit: number, @Arg("cursor", () => String, { nullable: true }) cursor: string | null): Promise<Post[]> {
    const realLimit = Math.min(50, limit);
    const qb = dataSource.getRepository(Post).createQueryBuilder("p").orderBy('"createdAt"', "DESC").take(realLimit);
    if (cursor) qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });

    return qb.getMany();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    return Post.findOne({ where: { id } });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(@Arg("input") input: PostInput, @Ctx() { req }: MyContext): Promise<Post> {
    return Post.create({ ...input, creatorId: (req.session as any).userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(@Arg("id") id: number, @Arg("title") title: string): Promise<Post | null> {
    const post = await Post.findOne({ where: { id } });
    if (!post) return null;
    if (typeof title !== "undefined") {
      post.title = title;
      await Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    try {
      await Post.delete({ id });
      return true;
    } catch (error) {
      return false;
    }
  }
}
