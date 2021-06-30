import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, (user) => user.token)
  user!: User;

  @Column()
  expires!: number;

  @Column()
  accessToken!: string;

  @Column()
  refreshToken!: string;

  @Column()
  scopes!: string;
}
