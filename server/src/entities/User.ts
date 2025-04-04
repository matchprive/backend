import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Chat } from './Chat';
import { Message } from './Message';
import { Match } from './Match';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column('jsonb')
    profile!: {
        name: string;
        age: number;
        gender: string;
        location: string;
        bio: string;
        photos: string[];
        preferences: {
            minAge: number;
            maxAge: number;
            gender: string[];
            distance: number;
        };
        traits: {
            personality: string[];
            lifestyle: string[];
            values: string[];
        };
        goals: {
            relationshipType: string;
            timeline: string;
            dealbreakers: string[];
        };
    };

    @OneToMany(() => Chat, chat => chat.user1)
    chatsAsUser1!: Chat[];

    @OneToMany(() => Chat, chat => chat.user2)
    chatsAsUser2!: Chat[];

    @OneToMany(() => Message, message => message.sender)
    messages!: Message[];

    @OneToMany(() => Match, match => match.user1)
    matchesAsUser1!: Match[];

    @OneToMany(() => Match, match => match.user2)
    matchesAsUser2!: Match[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 