import React, { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import { API_URL } from "../config";
export default function ChatComponent() {
    const [userQuestionCount, setUserQuestionCount] = useState(0);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatRef = useRef(null);
    const sessionId = useRef(`sess-${Date.now()}`);

    const getTime = () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getMockResponse = (input) => {
        input = input.toLowerCase();
        if (input.includes("name")) return "What is your company’s name?";
        if (input.includes("industry")) return "What industry is your company in?";
        if (input.includes("done") || input.includes("complete")) return "Thanks! I’ve built your customer persona.";
        return "Tell me more about your company.";
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            sender: "user",
            text: input,
            timestamp: getTime()
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        const newCount = userQuestionCount + 1;
        setUserQuestionCount(newCount);
        // console.log(`API URL ${API_URL}`)
        if (newCount >= 5) {
            // Stop after 4 user questions
            const finalMessage = {
                sender: "bot",
                text:
                    `Looks like you're gearing up for a solid sales strategy.
Let us help you equip your Sales Reps, boost conversions, and maximize ROI — all while growing your brand's influence.
Visit https://cadime.ai/ to learn more.`,
                timestamp: getTime(),
            };

            setTimeout(() => {
                setMessages((prev) => [...prev, finalMessage]);
                setLoading(false);
            }, 1000);

            return;
        }
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: sessionId.current,
                    text: input,
                }),
            });

            const data = await response.json();

            const botMessage = {
                sender: "bot",
                text: data.message,
                timestamp: getTime(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            console.error("Lex error:", err);
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "⚠️ My apoligies. There was an error. Please click Start Over, so I can help you", timestamp: getTime() },
            ]);
        } finally {
            setLoading(false);
        }
    };
    // 👇 1. Run once to show welcome message
    useEffect(() => {
        setMessages([
            {
                sender: "bot",
                text: "👋 Welcome! I’m here to help you generate a customer persona for your business. You can start by saying something like: 'I want to create a persona' or 'Help me build a persona from my company info.'",
                timestamp: getTime(),
            },
        ]);
    }, []);
    useEffect(() => {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, loading]);

    const isPersonaReady = messages.some((msg) =>
        msg.sender === "bot" && msg.text.toLowerCase().includes("built your customer persona")
    );

    return (
        <>
            <div ref={chatRef}
                className="mb-3 border rounded p-3 bg-white"
                style={{
                    resize: "vertical",           // allows drag-to-resize
                    overflow: "auto",             // enables scrolling
                    minHeight: "200px",           // prevents shrinking too small
                    maxHeight: "600px",           // prevents growing too huge
                }}>
                {messages.map((msg, i) => (
                    <MessageBubble key={i} sender={msg.sender} text={msg.text} timestamp={msg.timestamp} />
                ))}

                {loading && (
                    <div className="d-flex justify-content-start align-items-center gap-2 px-3 py-2">
                        <div className="dot dot1"></div>
                        <div className="dot dot2"></div>
                        <div className="dot dot3"></div>
                    </div>
                )}
            </div>

            <div className="input-group">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    type="text"
                    className="form-control"
                    placeholder="Say something like: 'I want to create a persona' or 'Help me define my company'"
                />
                <button onClick={handleSend} className="btn btn-success" disabled={loading}>
                    Send
                </button>
            </div>

            <button
                className="btn btn-outline-danger mt-3 w-100"
                onClick={() => {
                    setMessages([
                        {
                            sender: "bot",
                            text: "👋 Welcome! I’m here to help you generate a customer persona for your business. You can start by saying something like: 'I want to create a persona' or 'Help me build a persona from my company info.'",
                            timestamp: getTime(),
                        },
                    ]);
                    setUserQuestionCount(0);
                    setInput("");
                    sessionId.current = `sess-${Date.now()}`;
                }}
            >
                🔄 Start Over
            </button>

            {isPersonaReady && (
                <div className="alert alert-info mt-3 rounded-4 shadow-sm">
                    <h5>🎯 Your Customer Persona</h5>
                    <ul className="mb-0">
                        <li><strong>Company Name:</strong> SampleTech Inc.</li>
                        <li><strong>Industry:</strong> AI-powered SaaS tools</li>
                        <li><strong>Ideal Customer:</strong> Mid-sized digital marketing firms</li>
                        <li><strong>Key Pain Point:</strong> Need better lead targeting</li>
                    </ul>
                </div>
            )}
        </>
    );
}
