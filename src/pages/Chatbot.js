import React, { useState, useRef, useEffect } from "react";
import "../assets/styles/Chatbot.css";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [activeView, setActiveView] = useState("chat"); // 'chat' or 'history'
  const messagesEndRef = useRef(null);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("agricultureChatHistory");
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      setChatHistory(history);

      // If there are previous chats, load the most recent one
      if (history.length > 0) {
        const mostRecentChat = history[0];
        setCurrentChatId(mostRecentChat.id);
        setMessages(mostRecentChat.messages || []);
      }
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("agricultureChatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate a unique ID for new chats
  const generateChatId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(generateChatId());
    setInput("");
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // If no current chat, create a new one
    let chatId = currentChatId;
    if (!chatId) {
      chatId = generateChatId();
      setCurrentChatId(chatId);
    }

    // Add user message
    const userMessage = { text: input, sender: "user", timestamp: new Date() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();

      // Add bot reply
      const botMessage = {
        text: data.reply,
        sender: "bot",
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      // Update chat history
      const newHistoryItem = {
        id: chatId,
        title: input.length > 30 ? input.substring(0, 30) + "..." : input,
        messages: finalMessages,
        timestamp: new Date(),
      };

      setChatHistory((prev) => {
        // Remove existing chat with same ID if it exists
        const filteredHistory = prev.filter((chat) => chat.id !== chatId);
        return [newHistoryItem, ...filteredHistory];
      });
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      const errorMessage = {
        text: "Error: " + error.message,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const switchToFasterModel = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/switch-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama2:7b" }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.error("Model switch error:", error);
      alert("Failed to switch model: " + error.message);
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all chat history?")) {
      setChatHistory([]);
      setMessages([]);
      setCurrentChatId(null);
      localStorage.removeItem("agricultureChatHistory");
    }
  };

  const loadChat = (chat) => {
    setMessages(chat.messages || []);
    setCurrentChatId(chat.id);
    setActiveView("chat");
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <h2>🌾 Agriculture Assistant</h2>
          <p>Ask about crops, soil, irrigation, farming techniques, and more</p>
        </div>
        <div className="header-controls">
          <button
            onClick={switchToFasterModel}
            className="model-switch-btn"
            title="Switch to a faster model"
          >
            ⚡ Faster Responses
          </button>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="chatbot-navbar">
        <button onClick={() => setActiveView("history")}>History</button>
        <button onClick={startNewChat}>New Chat</button>
        <button onClick={() => setActiveView("chat")}>Chat</button>
      </div>

      <div className="chat-main">
        {/* Chat History Sidebar */}
        <div
          className={`chat-history ${activeView === "history" ? "active" : ""}`}
        >
          <div className="history-header">
            <h3>Chat History</h3>
            {chatHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="clear-history"
                title="Clear history"
              >
                🗑️
              </button>
            )}
          </div>

          <button className="new-chat-btn" onClick={startNewChat}>
            + New Chat
          </button>

          <div className="history-list">
            {chatHistory.length === 0 ? (
              <div className="no-history">No chat history yet</div>
            ) : (
              chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={`history-item ${
                    currentChatId === chat.id ? "active" : ""
                  }`}
                  onClick={() => loadChat(chat)}
                >
                  <div className="history-question">{chat.title}</div>
                  <div className="history-date">
                    {formatDate(chat.timestamp)} • {formatTime(chat.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`chat-area ${activeView === "chat" ? "active" : ""}`}>
          <div className="chat-box">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <p>
                  Hello! I'm your agriculture assistant. How can I help you
                  today?
                </p>
                <div className="suggestion-chips">
                  <button
                    onClick={() => setInput("Best crops for rainy season")}
                  >
                    Rainy season crops
                  </button>
                  <button onClick={() => setInput("How to test soil pH")}>
                    Test soil pH
                  </button>
                  <button
                    onClick={() => setInput("Organic fertilizer recipes")}
                  >
                    Organic fertilizers
                  </button>
                  <button onClick={() => setInput("Pest control methods")}>
                    Pest control
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.sender}`}>
                  <div className="message-content">
                    {msg.sender === "bot" && (
                      <span className="bot-icon">🤖</span>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="message bot">
                <div className="message-content">
                  <span className="bot-icon">🤖</span>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about crops, soil, irrigation..."
              disabled={isLoading}
            />
            <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
              {isLoading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
