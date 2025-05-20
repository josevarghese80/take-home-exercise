import React from "react";
import { BsPerson } from "react-icons/bs"; // Bootstrap icons
import { HiOutlineUserCircle } from 'react-icons/hi';

/*** MessageBubble displays a single chat message */

export default function MessageBubble({ text, sender, timestamp }) {
  const isUser = sender === "user";


  /***
    Detect URLs in message text and format them as clickable links.
    This uses a regular expression to identify URLs and wraps them in <a> tags.
    SECURITY NOTE:
      - The 'target="_blank"' attribute opens the link in a new tab/window,
        which prevents malicious sites from replacing your app’s page.
      - The 'rel="noopener noreferrer"' attribute is crucial:
      - 'noopener' prevents the new tab from accessing the `window.opener` property,
        which protects your app from potential phishing or tabnabbing attacks.
      - 'noreferrer' also removes the Referer header, which hides the origin URL
        from the linked site (can be helpful for privacy).
    Combined, these settings help prevent vulnerabilities such as reverse tabnabbing,
    where a malicious site opened via link can hijack the original tab's location.
  */


  const formatMessageText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.split(urlRegex).map((part, i) =>
      urlRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={isUser ? "text-white text-decoration-underline" : "text-primary text-decoration-underline"}
        >
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className={`d-flex mb-3 ${isUser ? "justify-content-end" : "justify-content-start"}`}>
      {!isUser && <HiOutlineUserCircle size={24} className="me-2 text-secondary" />}
      <div>
        <div
          className={`p-3 rounded-4 shadow-sm ${isUser ? "bg-primary text-white" : "bg-light text-dark"}`}
          style={{
            maxWidth: "75%",
            wordBreak: "break-word",
            animation: "fadeIn 0.3s ease-in-out",
          }}
        >
          {formatMessageText(text)}
        </div>
        <div className={`small text-muted mt-1 ${isUser ? "text-end" : "text-start"}`}>
          {timestamp}
        </div>
      </div>
      {isUser && <BsPerson size={24} className="ms-2 text-primary" />}
    </div>
  );
}
