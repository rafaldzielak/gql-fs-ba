import { Post } from "../entities/Post";
import {
  Resolver,
  Query,
  Arg,
  Int,
  Mutation,
  Ctx,
  InputType,
  Field,
  UseMiddleware,
  FieldResolver,
  Root,
  ObjectType,
  Info,
} from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { dataSource } from "../";
import { Updoot } from "../entities/Updoot";

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Mutation(() => Boolean)
  async vote(@Arg("postId", () => Int) postId: number, @Arg("value", () => Int) value: number, @Ctx() { req }: MyContext) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const userId = (req.session as any).userId;
    const updoot = await Updoot.findOne({ where: { postId, userId } });
    if (updoot && updoot.value !== realValue) {
      await dataSource.transaction(async (tm) => {
        await tm.query(`
          update updoot
          set value = ${realValue}
          where "postId" = ${postId} and "userId" = ${userId};
      `);
      });
    } else if (!updoot) {
      await dataSource.transaction(async (tm) => {
        tm.query(`
          insert into updoot ("userId", "postId", value)
          values (${userId},${postId},${realValue});`);
        await tm.query(`
          update post
          set points = points + ${realValue}
          where id = ${postId};
        `);
      });
    }

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Info() info: any
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];
    if (cursor) replacements.push(new Date(parseInt(cursor)));

    const posts = await dataSource.query(
      `
      select p.*, 
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt",
        'updatedAt', u."updatedAt"
        ) creator
      from post p
      inner join public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $2` : ""}
      order by p."createdAt" DESC
      limit $1
    `,
      replacements
    );

    // const qb = dataSource
    //   .getRepository(Post)
    //   .createQueryBuilder("p")
    //   .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
    //   .orderBy('p."createdAt"', "DESC")
    //   .take(realLimitPlusOne);
    // if (cursor) qb.where('p."createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });

    // const posts = await qb.getMany();

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
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
