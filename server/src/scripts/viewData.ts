import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Chat } from '../entities/Chat';
import { Message } from '../entities/Message';
import { Match } from '../entities/Match';

async function viewData() {
    try {
        await AppDataSource.initialize();
        
        // Get all users
        const users = await AppDataSource.getRepository(User).find();
        console.log('\nUsers:');
        console.log(JSON.stringify(users, null, 2));
        
        // Get all chats
        const chats = await AppDataSource.getRepository(Chat).find({
            relations: ['user1', 'user2', 'messages']
        });
        console.log('\nChats:');
        console.log(JSON.stringify(chats, null, 2));
        
        // Get all messages
        const messages = await AppDataSource.getRepository(Message).find({
            relations: ['sender', 'chat']
        });
        console.log('\nMessages:');
        console.log(JSON.stringify(messages, null, 2));
        
        // Get all matches
        const matches = await AppDataSource.getRepository(Match).find({
            relations: ['user1', 'user2']
        });
        console.log('\nMatches:');
        console.log(JSON.stringify(matches, null, 2));
        
    } catch (error) {
        console.error('Error viewing data:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

viewData(); 