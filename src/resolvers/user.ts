import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Resolver, Query, Mutation, InputType, Field, Arg, Ctx, ObjectType } from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME } from "../constants";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    const userId = (req.session as any).userId;
    if (!userId) return null;
    const user = await em.findOne(User, { id: userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(@Arg("options") options: UsernamePasswordInput, @Ctx() { em, req }: MyContext): Promise<UserResponse> {
    if (options.username.length < 3) return { errors: [{ field: "username", message: "Username must be greater than 2" }] };
    if (options.password.length < 6) return { errors: [{ field: "password", message: "Password must be greater than 6" }] };
    const existingUser = await em.findOne(User, { username: options.username.toLowerCase() });
    if (existingUser) return { errors: [{ field: "username", message: "Username already taken" }] };
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, { username: options.username, password: hashedPassword });
    await em.persistAndFlush(user);
    (req.session as any).userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(@Arg("options") options: UsernamePasswordInput, @Ctx() { em, req }: MyContext): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username.toLowerCase() });
    if (!user) return { errors: [{ field: "username", message: "Username doesn't exist" }] };
    const isValid = await argon2.verify(user.password, options.password);
    if (!isValid) return { errors: [{ field: "password", message: "Incorrect password" }] };
    (req.session as any).userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { em, req, res }: MyContext) {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      });
    });
  }
}
