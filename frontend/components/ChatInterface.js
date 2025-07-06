// components/ChatInterface.js
import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/ChatInterface.module.css';

const ChatInterface = ({ messages, onSendMessage }) => {
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            onSendMessage(inputMessage);
            setInputMessage('');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    return (
        <div className={styles.chatContainer}>
            <div className={styles.messagesDisplay}>
                {messages.map((msg, index) => (
                    <div key={index} className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}>
                        {msg.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className={styles.messageInputForm}>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className={styles.messageInput}
                />
                <button type="submit" className={styles.sendButton}>Send</button>
            </form>
        </div>
    );
};

export default ChatInterface;
