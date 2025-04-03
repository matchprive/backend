import React, { createContext, useContext, useState, useEffect } from 'react';
import matchPriveAPI from '../services/api';
import { sendResumeLinkEmail, sendWelcomeBackEmail } from '../utils/emailService';
import { ChatMessage } from '../utils/sessionManagement';

interface SessionContextType {
  sessionId: string | null;
  email: string | null;
  profile: any | null;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  createNewSession: () => Promise<void>;
  saveEmail: (email: string) => Promise<void>;
  updateProfile: (profile: any) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new session on mount if none exists
  useEffect(() => {
    if (!sessionId) {
      createNewSession();
    }
  }, []);

  const createNewSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const session = await matchPriveAPI.createSession();
      setSessionId(session.sessionId);
      setEmail(null);
      setProfile(null);
      setChatHistory([]);
    } catch (err) {
      setError('Failed to create new session');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEmail = async (email: string) => {
    if (!sessionId) {
      setError('No active session');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await matchPriveAPI.saveEmail(sessionId, email);
      setEmail(email);
      await sendResumeLinkEmail(email, sessionId);
    } catch (err) {
      setError('Failed to save email');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profile: any) => {
    if (!sessionId) {
      setError('No active session');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await matchPriveAPI.updateSessionProfile(sessionId, profile);
      setProfile(profile);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const session = await matchPriveAPI.getSession(sessionId);
      setSessionId(session.sessionId);
      setEmail(session.email || null);
      setProfile(session.profile || null);
      setChatHistory([]);
      
      if (session.email) {
        await sendWelcomeBackEmail(session.email, sessionId);
      }
    } catch (err) {
      setError('Failed to load session');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        email,
        profile,
        chatHistory,
        isLoading,
        error,
        setError,
        createNewSession,
        saveEmail,
        updateProfile,
        loadSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
} 