import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Resolver, Query, Mutation, InputType, Field, Arg, Ctx, ObjectType } from "type-graphql";
import argon2 from "argon2";

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
  @Mutation(() => UserResponse)
  async register(@Arg("options") options: UsernamePasswordInput, @Ctx() { em }: MyContext): Promise<UserResponse> {
    if (options.username.length < 3) return { errors: [{ field: "username", message: "Username must be greater than 2" }] };
    if (options.password.length < 6) return { errors: [{ field: "username", message: "Password must be greater than 6" }] };
    const existingUser = await em.findOne(User, { username: options.username.toLowerCase() });
    if (existingUser) return { errors: [{ field: "username", message: "Username already taken" }] };
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, { username: options.username, password: hashedPassword });
    await em.persistAndFlush(user);
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(@Arg("options") options: UsernamePasswordInput, @Ctx() { em, req }: MyContext): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username.toLowerCase() });
    if (!user) return { errors: [{ field: "username", message: "Username doesn't exist" }] };
    const isValid = await argon2.verify(user.password, options.password);
    if (!isValid) return { errors: [{ field: "username", message: "Incorrect password" }] };
    (req.session as any).userId = user.id;
    return { user };
  }
}
