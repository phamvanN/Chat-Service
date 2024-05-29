import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./App.css";

// Verwende die Umgebungsvariable für die Socket-Verbindung
const socket = io.connect(process.env.REACT_APP_SOCKET_URL);

const App = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("joinRoom", { username, room });
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message !== "") {
      socket.emit("chatMessage", { username, text: message, room });
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      {!joined ? (
        <div className="join-room">
          <h2>Join a Room</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div className="chat-room">
          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.username === username ? "self" : ""}`}>
                <p>
                  <strong>{message.username}</strong>:{" "}
                  {message.text.split("\n").map((str, idx) => (
                    <React.Fragment key={idx}>
                      {str}
                      <br />
                    </React.Fragment>
                  ))}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};

export default App;
