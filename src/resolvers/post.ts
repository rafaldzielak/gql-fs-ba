import { Post } from "../entities/Post";
import { Resolver, Query, Arg, Int, Mutation, Ctx, InputType, Field, UseMiddleware } from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
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
