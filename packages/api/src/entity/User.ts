import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Token } from "./Token";
import { Session } from "./Session";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index({ unique: true })
  address?: string;

  @Column({ unique: true, nullable: true })
  stravaId?: number;

  @OneToOne(() => Token, (token) => token.user)
  @JoinColumn()
  token?: Token;

  @OneToOne(() => Session, (session) => session.user)
  @JoinColumn()
  session?: Session;
}
