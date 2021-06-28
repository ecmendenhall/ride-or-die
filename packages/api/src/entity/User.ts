import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    address: string;

    @Column()
    stravaId: number;

    @Column()
    token: string;

}
