import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import CryptoJS from 'crypto-js';
import './App.css';

const socket = io('http://localhost:4000');

function App() {
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    socket.on('previous messages', (msgs) => {
      setMessages(msgs.map(msg => {
        return CryptoJS.AES.decrypt(msg.message, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8);
      }));
    });

    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg.message]);
    });

    return () => {
      socket.off('previous messages');
      socket.off('chat message');
    };
  }, []);

  const joinRoom = () => {
    if (room.trim()) {
      socket.emit('join room', room);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('chat message', { room, message });
      setMessage('');
      resizeTextarea();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    resizeTextarea();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <h1>Chat App</h1>
        <div>
          <input
            type="text"
            placeholder="Enter room name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
        <div className="chat-window">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className="message">
                {msg.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            ))}
          </div>
          <form className="message-form" onSubmit={sendMessage}>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="message-input"
              rows="1"
            />
            <button type="submit" className="send-button">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
