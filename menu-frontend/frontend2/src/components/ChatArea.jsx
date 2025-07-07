import React, { useState, useRef, useEffect } from "react";

export const ChatArea = ({ messages, addMessage, addToOrder, isLoading, setIsLoading }) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    addMessage(userMsg);
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      addMessage({ role: "bot", content: data.bot_response });
      (data.recommended_dishes || []).forEach(addToOrder);
    } catch {
      addMessage({ role: "bot", content: "Sorry, something went wrong." });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto flex flex-col">
      {messages.map((m, i) => (
        <div key={i} className={`my-1 max-w-xs px-3 py-2 rounded ${m.role === "user" ? "ml-auto bg-blue-100" : "bg-gray-200"}`}>
          {m.content}
        </div>
      ))}
      {isLoading && <div className="text-sm text-gray-500">Bot is typing...</div>}
      <div ref={messagesEndRef} />
      <div className="mt-auto flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Your message..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
};

