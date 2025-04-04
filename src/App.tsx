import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { Chatbot } from './components/CHATBOT';
import matchPriveAPI from './services/api';
import styles from './App.module.css';

function App() {
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await matchPriveAPI.login(email, password);
      if (response && response.token) {
        localStorage.setItem('auth_token', response.token);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      const response = await matchPriveAPI.register(email, password);
      if (response && response.token) {
        localStorage.setItem('auth_token', response.token);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  return (
    <SessionProvider>
      <Router>
        <div className={styles.app}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login onLogin={handleLogin} onRegister={handleRegister} />} />
            <Route path="/chat" element={<Chatbot />} />
          </Routes>
        </div>
      </Router>
    </SessionProvider>
  );
}

export default App; 