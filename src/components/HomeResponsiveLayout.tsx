import { FunctionComponent, useState, useCallback } from "react";
import { Chatbot } from "./CHATBOT";
import PortalPopup from "./PortalPopup";
import CallToActionContainer from "./CallToActionContainer";
import { Login } from "./Login";
import matchPriveAPI from "../services/api";
import styles from "./HomeResponsiveLayout.module.css";

export type HomeResponsiveLayoutType = {
  className?: string;
};

const HomeResponsiveLayout: FunctionComponent<HomeResponsiveLayoutType> = ({
  className = "",
}) => {
  const [isChatbotPopupOpen, setChatbotPopupOpen] = useState(false);
  const [isLoginPopupOpen, setLoginPopupOpen] = useState(false);

  const openChatbotPopup = useCallback(() => {
    setChatbotPopupOpen(true);
  }, []);

  const closeChatbotPopup = useCallback(() => {
    setChatbotPopupOpen(false);
  }, []);

  const openLoginPopup = useCallback(() => {
    setLoginPopupOpen(true);
  }, []);

  const closeLoginPopup = useCallback(() => {
    setLoginPopupOpen(false);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      await matchPriveAPI.login(email, password);
      closeLoginPopup();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      await matchPriveAPI.register(email, password);
      closeLoginPopup();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className={`${styles.homeResponsiveLayout} ${className}`}>
      <div className={styles.logo}>
        <div className={styles.logo1}>MatchPrivé</div>
        <div className={styles.noSwiping}>
          <p className={styles.tagline}>Find your perfect match</p>
        </div>
      </div>
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.leftContentContainer}>
            <div className={styles.leftContentText}>Start your journey</div>
          </div>
          <div className={styles.rightContent}>
            <div className={styles.stepsContent}>
              <div className={styles.titleOne}>
                <div className={styles.one}>1</div>
                <div className={styles.stepOneTitle}>Create your profile</div>
              </div>
              <div className={styles.stepOneDescriptionContainer}>
                <span>Tell us about yourself and what you're looking for</span>
              </div>
              <div className={styles.titleTwo}>
                <div className={styles.two}>2</div>
                <div className={styles.stepOneTitle}>Get matched</div>
              </div>
              <div className={styles.stepOneDescriptionContainer}>
                <span>Our AI will find your perfect match</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.faqTitle}>Why MatchPrivé?</div>
        <div className={styles.faqDescription}>
          <span>Our AI-powered matching algorithm ensures you find someone who truly understands you.</span>
        </div>
      </div>
      <div className={styles.content2}>
        <div className={styles.whyMatchprivTitle}>Ready to find your match?</div>
        <div className={styles.startNowWrapper} onClick={openChatbotPopup}>
          <div className={styles.startNow}>Start Now</div>
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.footerContents}>
          <div className={styles.links}>
            <div className={styles.privacyPolicy}>Privacy Policy</div>
            <div className={styles.privacyPolicy}>Terms of Service</div>
            <div className={styles.privacyPolicy}>Contact Us</div>
          </div>
          <div className={styles.rights}>© 2024 MatchPrivé. All rights reserved.</div>
        </div>
      </div>
      {isChatbotPopupOpen && (
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.5)"
          placement="Centered"
          onOutsideClick={closeChatbotPopup}
        >
          <Chatbot />
        </PortalPopup>
      )}
      {isLoginPopupOpen && (
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.5)"
          placement="Centered"
          onOutsideClick={closeLoginPopup}
        >
          <Login onLogin={handleLogin} onRegister={handleRegister} />
        </PortalPopup>
      )}
    </div>
  );
};

export default HomeResponsiveLayout;
