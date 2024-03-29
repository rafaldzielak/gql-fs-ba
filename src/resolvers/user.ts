import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Resolver, Query, Mutation, InputType, Field, Arg, Ctx, ObjectType, FieldResolver, Root } from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";
import { dataSource } from "../index";

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

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if ((req.session as any).userId === user.id) return user.email;
    return "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { req, redis }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length < 6) return { errors: [{ field: "newPassword", message: "Password must be greater than 6" }] };
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) return { errors: [{ field: "token", message: "Invalid token" }] };

    const id = parseInt(userId);

    const user = await User.findOne({ where: { id } });
    if (!user) return { errors: [{ field: "token", message: "No user" }] };

    const hashedPassword = await argon2.hash(newPassword);

    await User.update({ id }, { password: hashedPassword });
    (req.session as any).userId = user.id;
    redis.del(key);

    return { user };
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    const userId = (req.session as any).userId;
    if (!userId) return null;
    return User.findOne({ where: { id: userId } });
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string, @Ctx() { req, redis }: MyContext) {
    const user = await User.findOne({ where: { email } });
    if (!user) return true;
    const token = v4();
    await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, "EX", 1000 * 60 * 60 * 24);
    sendEmail(email, `<a href="http://localhost:3000/change-password/${token}">reset password</a>`);
    return true;
  }

  @Mutation(() => UserResponse)
  async register(@Arg("options") options: UsernamePasswordInput, @Ctx() { req }: MyContext): Promise<UserResponse> {
    if (options.username.length < 3 || options.username.includes("@"))
      return { errors: [{ field: "username", message: "Username must be greater than 2 and can't contain @ sign" }] };
    if (!options.email.includes("@")) return { errors: [{ field: "email", message: "Invalid email" }] };
    if (options.password.length < 6) return { errors: [{ field: "password", message: "Password must be greater than 6" }] };

    let user;
    try {
      // The same:
      // User.create({ username: options.username, email: options.email, password: options.password }).save();
      const hashedPassword = await argon2.hash(options.password);
      const result = await dataSource
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
    } catch (error) {
      console.log("err", error);
    }

    (req.session as any).userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@") ? { where: { email: usernameOrEmail } } : { where: { username: usernameOrEmail } }
    );
    if (!user) return { errors: [{ field: "usernameOrEmail", message: "Username doesn't exist" }] };
    const isValid = await argon2.verify(user.password, password);
    if (!isValid) return { errors: [{ field: "password", message: "Incorrect password" }] };
    (req.session as any).userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext) {
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
