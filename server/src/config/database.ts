import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Chat } from '../entities/Chat';
import { Message } from '../entities/Message';
import { Match } from '../entities/Match';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: process.env.POSTGRES_USER || 'laurachavez', // Your system username
    password: process.env.POSTGRES_PASSWORD || '', // Empty password for local development
    database: 'matchprive',
    synchronize: true, // Set to false in production
    logging: true,
    entities: [User, Chat, Message, Match],
    migrations: ['src/migrations/**/*.ts'],
    subscribers: ['src/subscribers/**/*.ts']
});

// Initialize the database connection
export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connection established');
    } catch (error) {
        console.error('Error during database initialization:', error);
        throw error;
    }
}; 