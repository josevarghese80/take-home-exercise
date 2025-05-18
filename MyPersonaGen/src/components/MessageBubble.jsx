import React from "react";
import { BsPerson } from "react-icons/bs"; // Bootstrap icons
import { HiOutlineUserCircle } from 'react-icons/hi';

export default function MessageBubble({ text, sender, timestamp }) {
  const isUser = sender === "user";

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
          {text}
        </div>
        <div className={`small text-muted mt-1 ${isUser ? "text-end" : "text-start"}`}>
          {timestamp}
        </div>
      </div>
      {isUser && <BsPerson size={24} className="ms-2 text-primary" />}
    </div>
  );
}
