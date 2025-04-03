import React, { useState } from 'react';
import styles from './Login.module.css';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        await onRegister(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.homeResponsiveLayout}>
      <header className={styles.logo}>
        <b className={styles.logo1}>mATCHPRIVÉ</b>
      </header>
      <section className={styles.heroBanner}>
        <div className={styles.loginBox}>
          <h2 className={styles.tagline}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className={styles.inputGroup}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <button 
              type="submit" 
              className={styles.startNowWrapper}
              disabled={isLoading}
            >
              <div className={styles.startNow}>
                {isLoading ? 'Loading...' : (isLogin ? 'Log In' : 'Register')}
              </div>
            </button>
          </form>
          <button 
            className={styles.switchButton}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Log in'}
          </button>
        </div>
      </section>
    </div>
  );
}; 