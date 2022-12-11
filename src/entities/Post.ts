import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType() // makes it possible to put into resolver
@Entity()
export class Post {
  [OptionalProps]?: "updatedAt" | "createdAt";

  @Field() // exposes to gql schema
  @PrimaryKey()
  id!: number; // string is also supported

  @Field(() => String)
  @Property({ type: "date", default: "NOW()" })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field(() => String)
  @Property({ type: "text" })
  title!: string;
}
