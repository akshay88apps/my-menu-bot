// app/page.tsx
"use client"; // This directive is crucial for client-side components in App Router

import React, { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import MenuItemCard from '../components/MenuItemCard';
import OrderPane from '../components/OrderPane';
import { sendMessageToBot, confirmOrder } from '../lib/api';
import styles from '../styles/Home.module.css';

// --- Type Definitions (Crucial for TypeScript) ---
interface Message {
    sender: 'user' | 'bot';
    text: string;
}

interface RecommendedDish {
    dish_id: string;
    dish_name: string;
    price: number;
    description: string;
}

interface OrderItem {
    dish_id: string;
    dish_name: string;
    price: number; // Price per unit
    quantity: number;
}
// --- End Type Definitions ---


export default function Page() {
    // State variables, now explicitly typed
    const [messages, setMessages] = useState<Message[]>([]);
    const [recommendedDishes, setRecommendedDishes] = useState<RecommendedDish[]>([]);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    const handleSendMessage = async (text: string) => { // 'text' parameter now explicitly typed
        const newUserMessage: Message = { sender: 'user', text };
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);

        const botThinkingMessage: Message = { sender: 'bot', text: '...' };
        setMessages((prevMessages) => [...prevMessages, botThinkingMessage]);

        try {
            const response = await sendMessageToBot(text);
            const botResponseText: string = response.bot_response;
            const newRecommendedDishes: RecommendedDish[] = response.recommended_dishes || [];

            setMessages((prevMessages) => {
                const updatedMessages = prevMessages.filter(msg => msg !== botThinkingMessage);
                return [...updatedMessages, { sender: 'bot', text: botResponseText }];
            });
            setRecommendedDishes(newRecommendedDishes);

        } catch (error) {
            console.error("Error in chat:", error);
            setMessages((prevMessages) => {
                const updatedMessages = prevMessages.filter(msg => msg !== botThinkingMessage);
                return [...updatedMessages, { sender: 'bot', text: 'Error: Could not get response.' }];
            });
        }
    };

    const handleAddItem = (itemToAdd: RecommendedDish) => {
        setOrderItems((prevItems) => {
            const existingItem = prevItems.find(item => item.dish_id === itemToAdd.dish_id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.dish_id === itemToAdd.dish_id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevItems, { ...itemToAdd, quantity: 1 }];
            }
        });
    };

    const handleUpdateItemQuantity = (dishId: string, newQuantity: number) => {
        setOrderItems((prevItems) => {
            if (newQuantity <= 0) {
                return prevItems.filter(item => item.dish_id !== dishId);
            }
            return prevItems.map(item =>
                item.dish_id === dishId ? { ...item, quantity: newQuantity } : item
            );
        });
    };

    const handleRemoveItem = (dishId: string) => {
        setOrderItems((prevItems) => prevItems.filter(item => item.dish_id !== dishId));
    };

    const handleConfirmOrder = async () => {
        if (orderItems.length === 0) {
            alert("Your order is empty!");
            return;
        }
        const orderDetails = orderItems.map(item => ({
            dish_id: item.dish_id,
            dish_name: item.dish_name,
            quantity: item.quantity,
            price_per_unit: item.price
        }));
        try {
            const response = await confirmOrder(orderDetails);
            alert(response.message);
            setOrderItems([]);
            setRecommendedDishes([]);
            setMessages(prev => [...prev, { sender: 'bot', text: "Thank you for your order! Is there anything else I can help you with?" }]);
        } catch (error) {
            console.error("Order confirmation failed:", error);
            alert("Failed to confirm order. Please try again.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.chatSection}>
                <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
                <div className={styles.recommendations}>
                    {recommendedDishes.map((item) => (
                        <MenuItemCard key={item.dish_id} item={item} onAddItem={handleAddItem} />
                    ))}
                </div>
            </div>
            <div className={styles.orderSection}>
                <OrderPane
                    orderItems={orderItems}
                    onUpdateItemQuantity={handleUpdateItemQuantity}
                    onRemoveItem={handleRemoveItem}
                    onConfirmOrder={handleConfirmOrder}
                />
            </div>
        </div>
    );
}
