import React, { useEffect, useState } from "react";
import "../styles/ChatBox.css";

const ChatBox = ({ socket, role }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Receive message and update state in real-time
    socket.on("receive-message", (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    return () => {
      socket.off("receive-message"); // Cleanup on unmount
    };
  }, [socket]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      sender: role, // "teacher" or "student"
      text: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Send message to the server
    socket.emit("send-message", messageData);

    // Update messages locally for instant display
    setMessages((prevMessages) => [...prevMessages, messageData]);

    setNewMessage(""); // Clear input field
  };

  return (
    <div className="chatbox">
      <div className="chat-header">📢 Live Chat</div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === role ? "self" : "other"}`}
          >
            <strong>{msg.sender === "teacher" ? "👨‍🏫 Teacher" : "🎓 Student"}:</strong> {msg.text}
            <span className="timestamp">{msg.timestamp}</span>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
