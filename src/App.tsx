import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { Login } from './components/Login';
import { Chatbot } from './components/CHATBOT';
import HomeResponsiveLayout from './components/HomeResponsiveLayout';
import matchPriveAPI from './services/api';
import styles from './App.module.css';

function AppContent() {
  const navigate = useNavigate();
  const { createNewSession } = useSession();

  const handleLogin = async (email: string, password: string) => {
    const response = await matchPriveAPI.login(email, password);
    localStorage.setItem('auth_token', response.token);
    await createNewSession();
    navigate('/chat');
  };

  const handleRegister = async (email: string, password: string) => {
    const response = await matchPriveAPI.register(email, password);
    localStorage.setItem('auth_token', response.token);
    await createNewSession();
    navigate('/chat');
  };

  return (
    <div className={styles.app}>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} onRegister={handleRegister} />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/" element={<HomeResponsiveLayout />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </Router>
  );
}

export default App; 