import { Exclude } from "class-transformer";
import {BaseEntity,Column, Entity, PrimaryGeneratedColumn, Unique} from "typeorm";
@Entity()
@Unique(["phone_number"])
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    password: string;

    @Column({unique:true})
    phone_number:string;
  

}