import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Chat } from './Chat';

@Entity()
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, user => user.messages)
    sender!: User;

    @ManyToOne(() => Chat, chat => chat.messages)
    chat!: Chat;

    @Column('text')
    content!: string;

    @CreateDateColumn()
    timestamp!: Date;
} 