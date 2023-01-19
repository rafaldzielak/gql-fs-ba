import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import connectRedis from "connect-redis";
import session from "express-session";
import Redis from "ioredis";
import { MyContext } from "./types";
import cors from "cors";
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Updoot } from "./entities/Updoot";

export const dataSource = new DataSource({
  type: "postgres",
  database: "lireddit",
  username: "postgres",
  password: "asdasd",
  logging: true,
  synchronize: true,
  entities: [Post, User, Updoot],
});

const main = async () => {
  const app = express();

  await dataSource.initialize();

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  redis.connect().catch(console.error);

  app.use(cors({ credentials: true, origin: ["https://studio.apollographql.com", "http://localhost:3001"] }));

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis as any, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, //only for https
      },
      saveUninitialized: false,
      secret: "akjsdalskjd", //should be in env
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res, redis }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => console.log("Server started on localhost:4000"));
};

main().catch((err) => console.error(err));
