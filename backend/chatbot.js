import React, { useState } from "react";
import axios from "axios";

const Chatbox = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    // Add user message to chat
    setChat((prev) => [...prev, { sender: "user", text: message }]);

    try {
      const res = await axios.post("http://localhost:5000/chat", { message });
      const botReply = res.data.reply;

      setChat((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setChat((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Failed to get response from server" },
      ]);
    }

    setMessage("");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>🌱 Farm AI Assistant</h2>
      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "auto",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {chat.map((msg, i) => (
          <p
            key={i}
            style={{ textAlign: msg.sender === "user" ? "right" : "left" }}
          >
            <strong>{msg.sender === "user" ? "You: " : "AI: "}</strong>
            {msg.text}
          </p>
        ))}
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask about soil, crops..."
        style={{ width: "75%", padding: "8px" }}
      />
      <button onClick={sendMessage} style={{ padding: "8px 12px" }}>
        Send
      </button>
    </div>
  );
};

export default Chatbox;
