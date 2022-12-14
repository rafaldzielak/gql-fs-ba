import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, BaseEntity, ManyToOne } from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";

@ObjectType() // makes it possible to put into resolver
@Entity()
export class Post extends BaseEntity {
  @Field() // exposes to gql schema
  @PrimaryGeneratedColumn()
  id!: number; // string is also supported

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => String)
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field()
  @Column()
  creatorId: number;

  @ManyToOne(() => User, (user) => user.posts)
  creator: User;
}
