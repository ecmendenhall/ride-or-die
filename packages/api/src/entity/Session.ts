import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, (user) => user.token)
  user!: User;

  @Column()
  nonce!: string;

  @Column()
  expires!: number;
}
