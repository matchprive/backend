import { FunctionComponent } from "react";
import styles from "./SendButton.module.css";

export type SendButtonType = {
  className?: string;
};

const SendButton: FunctionComponent<SendButtonType> = ({ className = "" }) => {
  return (
    <div className={[styles.sendButton, className].join(" ")}>
      <img
        className={styles.sendButtonIcon}
        loading="lazy"
        alt=""
        src="/send-button@2x.png"
      />
    </div>
  );
};

export default SendButton;
