import { FunctionComponent } from "react";
import styles from "./ChatBubbleUser.module.css";

export type ChatBubbleUserType = {
  className?: string;
  message: string;
};

const ChatBubbleUser: FunctionComponent<ChatBubbleUserType> = ({
  className = "",
  message
}) => {
  return (
    <div className={[styles.userMessage, className].join(" ")}>
      {message}
    </div>
  );
};

export default ChatBubbleUser;
