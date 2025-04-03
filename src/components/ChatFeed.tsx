import { FunctionComponent } from "react";
import ChatBubbleBot from "./ChatBubbleBot";
import ChatBubbleUser from "./ChatBubbleUser";
import styles from "./ChatFeed.module.css";

export type ChatFeedType = {
  className?: string;
};

const ChatFeed: FunctionComponent<ChatFeedType> = ({ className = "" }) => {
  return (
    <div className={[styles.chatFeed, className].join(" ")}>
      <ChatBubbleBot helloUSER="Hello USER" />
      <ChatBubbleUser message="heflafjkelajklfjladkj" />
    </div>
  );
};

export default ChatFeed;
