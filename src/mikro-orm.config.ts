import { MikroORM } from "@mikro-orm/postgresql";
import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";

const config: Parameters<typeof MikroORM.init>[0] = {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    glob: "!(*.d).{js,ts}",
  },
  user: "postgres",
  password: "asdasd",
  entities: [Post],
  dbName: "lireddit",
  type: "postgresql",
  debug: !__prod__,
  allowGlobalContext: true,
};

export default config;
