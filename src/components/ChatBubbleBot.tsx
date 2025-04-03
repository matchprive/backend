import { FunctionComponent, useMemo, type CSSProperties } from "react";
import styles from "./ChatBubbleBot.module.css";

export type ChatBubbleBotType = {
  className?: string;
  helloUSER?: string;

  /** Style props */
  botMessageBorder?: CSSProperties["border"];
  botMessageBackgroundColor?: CSSProperties["backgroundColor"];
  botMessageBorderRadius?: CSSProperties["borderRadius"];
  helloUSERColor?: CSSProperties["color"];
};

const ChatBubbleBot: FunctionComponent<ChatBubbleBotType> = ({
  className = "",
  botMessageBorder,
  botMessageBackgroundColor,
  botMessageBorderRadius,
  helloUSER,
  helloUSERColor,
}) => {
  const botMessageStyle: CSSProperties = useMemo(() => {
    return {
      border: botMessageBorder,
      backgroundColor: botMessageBackgroundColor,
      borderRadius: botMessageBorderRadius,
    };
  }, [botMessageBorder, botMessageBackgroundColor, botMessageBorderRadius]);

  const helloUSERStyle: CSSProperties = useMemo(() => {
    return {
      color: helloUSERColor,
    };
  }, [helloUSERColor]);

  return (
    <button
      className={[styles.botMessage, className].join(" ")}
      style={botMessageStyle}
    >
      <div className={styles.helloUser} style={helloUSERStyle}>
        {helloUSER}
      </div>
    </button>
  );
};

export default ChatBubbleBot;
