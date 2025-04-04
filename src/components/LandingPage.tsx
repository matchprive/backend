import { FunctionComponent, useState, useCallback } from "react";
import styles from "./LandingPage.module.css";
import { Chatbot } from "./CHATBOT";
import { Login } from "./Login";
import matchPriveAPI from "../services/api";
import PortalPopup from "./PortalPopup";

type LandingPageProps = {
  onStartChat?: () => void;
  onLogin?: () => void;
};

export const LandingPage: FunctionComponent<LandingPageProps> = ({ onStartChat, onLogin }) => {
  const [isChatbotPopupOpen, setIsChatbotPopupOpen] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      const response = await matchPriveAPI.login(email, password);
      if (response && response.token) {
        setIsLoginPopupOpen(false);
        onLogin?.();
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  }, [onLogin]);

  const handleRegister = useCallback(async (email: string, password: string) => {
    try {
      const response = await matchPriveAPI.register(email, password);
      if (response && response.token) {
        setIsLoginPopupOpen(false);
        onLogin?.();
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  }, [onLogin]);

  return (
    <div className={styles.landingPage}>
      <header className={styles.header}>
        <div className={styles.logo}>MatchPrive</div>
        <div className={styles.tagline}>Find Your Perfect Match</div>
        <button className={styles.loginButton} onClick={() => setIsLoginPopupOpen(true)}>
          Login
        </button>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <h2 className={styles.heroText}>Find Your Perfect Match</h2>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepTitle}>Create Your Profile</div>
              </div>
              <div className={styles.stepDescription}>
                Sign up and create your personalized profile to start your journey
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepTitle}>Match with Others</div>
              </div>
              <div className={styles.stepDescription}>
                Our AI-powered algorithm will find your perfect match based on your preferences
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepTitle}>Start Dating</div>
              </div>
              <div className={styles.stepDescription}>
                Connect with your matches and start meaningful relationships
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.whySection}>
        <h2 className={styles.whyTitle}>Why Choose MatchPrive?</h2>
        <p className={styles.whyDescription}>
          We use advanced AI technology to match you with compatible partners based on your personality, interests, and values. Our platform ensures a safe and secure environment for meaningful connections.
        </p>
      </section>

      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Ready to Find Your Match?</h2>
        <button className={styles.ctaButton} onClick={() => setIsChatbotPopupOpen(true)}>
          Start Matching
        </button>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLinks}>
            <a href="#" className={styles.footerLink}>About Us</a>
            <a href="#" className={styles.footerLink}>Privacy Policy</a>
            <a href="#" className={styles.footerLink}>Terms of Service</a>
            <a href="#" className={styles.footerLink}>Contact</a>
          </div>
          <div className={styles.copyright}>
            © 2024 MatchPrive. All rights reserved.
          </div>
        </div>
      </footer>

      {isChatbotPopupOpen && (
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.5)"
          placement="Centered"
          onOutsideClick={() => setIsChatbotPopupOpen(false)}
        >
          <Chatbot />
        </PortalPopup>
      )}

      {isLoginPopupOpen && (
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.5)"
          placement="Centered"
          onOutsideClick={() => setIsLoginPopupOpen(false)}
        >
          <Login onLogin={handleLogin} onRegister={handleRegister} />
        </PortalPopup>
      )}
    </div>
  );
};

export default LandingPage; 