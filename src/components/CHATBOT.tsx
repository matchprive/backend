import React, { useEffect, useState } from 'react';
import { useSession } from '../contexts/SessionContext';
import matchPriveAPI from '../services/api';
import styles from './Chatbot.module.css';
import { ChatMessage } from '../utils/sessionManagement';

export function Chatbot() {
  const { 
    sessionId, 
    chatHistory,
    createNewSession, 
    error: sessionError,
    setError: setSessionError
  } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize messages from chat history
  useEffect(() => {
    if (chatHistory) {
      setMessages(chatHistory);
    }
  }, [chatHistory]);

  // Create a new session when component mounts
  useEffect(() => {
    if (!sessionId) {
      createNewSession();
    }
  }, [sessionId, createNewSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { 
      role: 'user', 
      content: input,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await matchPriveAPI.sendMessage(input);
      const assistantMessage: ChatMessage = { 
        role: 'assistant', 
        content: response.message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatbot}>
        <div className={styles.header}>
          <div className={styles.title}>
          <div className={styles.connectionChat}>MatchPrivé Chat</div>
          <div className={styles.poweredByLarkBerry}>Powered by GPT</div>
        </div>
      </div>
      <div className={styles.messages}>
          {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${styles[msg.role]}`}>
            {msg.content}
            </div>
          ))}
          {isLoading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.typing}>...</div>
            </div>
          )}
        </div>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
          </button>
        </form>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
