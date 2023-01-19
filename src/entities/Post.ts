import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";
import { Updoot } from "./Updoot";

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

  @Field()
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @OneToMany(() => Updoot, (updoot) => updoot.post)
  updoots: Updoot[];
}
