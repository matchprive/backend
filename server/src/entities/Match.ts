import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Match {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, user => user.matchesAsUser1)
    user1!: User;

    @ManyToOne(() => User, user => user.matchesAsUser2)
    user2!: User;

    @Column('float')
    score!: number;

    @CreateDateColumn()
    matchedAt!: Date;
} 