import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Message } from './Message';

@Entity()
export class Chat {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, user => user.chatsAsUser1)
    user1!: User;

    @ManyToOne(() => User, user => user.chatsAsUser2)
    user2!: User;

    @OneToMany(() => Message, message => message.chat)
    messages!: Message[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 