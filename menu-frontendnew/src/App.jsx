// -------------------- App.jsx --------------------
import React, { useState } from "react";
import { ChatArea } from "./components/ChatArea";
import { OrderSummary } from "./components/OrderSummary";
import { Header } from "./components/Header";
import "./App.css";

export default function App() {
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hi there! I’m your menu buddy 🍽️. What are you in the mood for today?" },
  ]);
  const [order, setOrder] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (msg) => setMessages((prev) => [...prev, msg]);
  const addToOrder = (dish) => setOrder((prev) => [...prev, dish]);
  const clearOrder = () => setOrder([]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Header clearOrder={clearOrder} />
      <div className="flex flex-1 overflow-hidden">
        <OrderSummary order={order} />
        <ChatArea
          messages={messages}
          addMessage={addMessage}
          addToOrder={addToOrder}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </div>
    </div>
  );
}

