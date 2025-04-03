import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

declare module 'vite' {
  interface ImportMetaEnv {
    VITE_API_URL: string;
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Types
interface UserProfile {
  id: string;
  profile_completed: boolean;
  report_path?: string;
  report_sent_at?: string;
  report_sent_status?: 'sent' | 'failed' | null;
}

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  sender: 'user' | 'gpt';
  timestamp: string;
}

interface StartSessionResponse {
  user_id: string;
  initial_message: string;
}

interface ChatRequest {
  user_id: string;
  message: string;
}

interface ChatResponse {
  message: string;
  profile_completed: boolean;
  report_status?: {
    generated: boolean;
    sent: boolean;
    path?: string;
  };
}

interface AuthResponse {
  token: string;
  user_id: string;
  email: string;
}

interface SessionResponse {
  sessionId: string;
  email?: string;
  profile?: any;
  lastUpdated: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only redirect to login for authenticated routes
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        originalRequest.url?.includes('/api/auth/')) {
      originalRequest._retry = true;
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// API endpoints
const matchPriveAPI = {
  // Start a new session - triggers backend user creation and initial GPT message
  startSession: async (): Promise<StartSessionResponse> => {
    const response: AxiosResponse<StartSessionResponse> = await api.post('/api/session/start/');
    localStorage.setItem('user_id', response.data.user_id);
    return response.data;
  },

  // Send a chat message and get GPT response
  sendMessage: async (message: string): Promise<ChatResponse> => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      throw new Error('No user_id found. Please start a new session.');
    }

    const response: AxiosResponse<ChatResponse> = await api.post('/api/chat/message/', {
      user_id,
      message,
    });
    return response.data;
  },

  // Get user profile status
  getProfile: async (userId: string): Promise<UserProfile> => {
    const response: AxiosResponse<UserProfile> = await api.get(`/api/profile/${userId}`);
    return response.data;
  },

  // Get chat history
  getChatHistory: async (): Promise<ChatMessage[]> => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      throw new Error('No user_id found. Please log in.');
    }
    const response: AxiosResponse<ChatMessage[]> = await api.get(`/api/chat/${user_id}/history/`);
    return response.data;
  },

  // Check report status
  checkReportStatus: async (userId: string): Promise<{
    generated: boolean;
    sent: boolean;
    path?: string;
  }> => {
    const response: AxiosResponse<UserProfile> = await api.get(`/api/profile/${userId}/report/`);
    return {
      generated: !!response.data.report_path,
      sent: response.data.report_sent_status === 'sent',
      path: response.data.report_path,
    };
  },

  // Register a new user
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/api/auth/register/', {
      email,
      password,
    });
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user_id', response.data.user_id);
    return response.data;
  },

  // Login user
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/api/auth/login/', {
      email,
      password,
    });
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user_id', response.data.user_id);
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Create a new session
   * @returns Promise with session ID
   */
  createSession: async (): Promise<SessionResponse> => {
    const response = await api.post<SessionResponse>('/api/session/create');
    return response.data;
  },

  /**
   * Save email to session
   * @param sessionId Session ID
   * @param email User's email
   * @returns Promise with updated session
   */
  saveEmail: async (sessionId: string, email: string): Promise<SessionResponse> => {
    const response = await api.post<SessionResponse>(`/api/session/${sessionId}/email`, { email });
    return response.data;
  },

  /**
   * Get session by ID
   * @param sessionId Session ID
   * @returns Promise with session data
   */
  getSession: async (sessionId: string): Promise<SessionResponse> => {
    const response = await api.get<SessionResponse>(`/api/session/${sessionId}`);
    return response.data;
  },

  /**
   * Update session profile
   * @param sessionId Session ID
   * @param profile Profile data
   * @returns Promise with updated session
   */
  updateSessionProfile: async (sessionId: string, profile: any): Promise<SessionResponse> => {
    const response = await api.put<SessionResponse>(`/api/session/${sessionId}/profile`, { profile });
    return response.data;
  },
};

// Helper to check if profile is complete based on GPT response
export const isProfileComplete = (gptResponse: string): boolean => {
  return gptResponse.toLowerCase().includes('your matchprivé profile is complete');
};

export default matchPriveAPI; 