import { FunctionComponent } from "react";
import styles from "./CallToActionContainer.module.css";

export type CallToActionContainerType = {
  className?: string;
  onStartChat: () => void;
  onLogin: () => void;
};

const CallToActionContainer: FunctionComponent<CallToActionContainerType> = ({
  className = "",
  onStartChat,
  onLogin
}) => {
  return (
    <div className={`${styles.callToActionContainer} ${className}`}>
      <button className={styles.startButton} onClick={onStartChat}>
        Start Matching
      </button>
      <button className={styles.loginButton} onClick={onLogin}>
        Login
      </button>
    </div>
  );
};

export default CallToActionContainer;
