import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Resolver, Query, Mutation, InputType, Field, Arg, Ctx, ObjectType } from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  email: string;

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

  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string, @Ctx() { em, req, redis }: MyContext) {
    const user = await em.findOne(User, { email });
    if (!user) return true;
    const token = v4();
    await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, "EX", 1000 * 60 * 60 * 24);
    sendEmail(email, `<a href="http://localhost:3000/change-password/${token}">reset password</a>`);
    return true;
  }

  @Mutation(() => UserResponse)
  async register(@Arg("options") options: UsernamePasswordInput, @Ctx() { em, req }: MyContext): Promise<UserResponse> {
    if (options.username.length < 3 || options.username.includes("@"))
      return { errors: [{ field: "username", message: "Username must be greater than 2 and can't contain @ sign" }] };
    if (!options.email.includes("@")) return { errors: [{ field: "email", message: "Invalid email" }] };
    if (options.password.length < 6) return { errors: [{ field: "password", message: "Password must be greater than 6" }] };
    const existingUser = await em.findOne(User, { username: options.username.toLowerCase() });
    if (existingUser) return { errors: [{ field: "username", message: "Username already taken" }] };
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, { username: options.username, password: hashedPassword, email: options.email });
    await em.persistAndFlush(user);
    (req.session as any).userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, usernameOrEmail.includes("@") ? { email: usernameOrEmail } : { username: usernameOrEmail });
    if (!user) return { errors: [{ field: "usernameOrEmail", message: "Username doesn't exist" }] };
    const isValid = await argon2.verify(user.password, password);
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
