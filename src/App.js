import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState('');
  const [currentRoom, setCurrentRoom] = useState('');

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    return () => {
      socket.off('message');
    };
  }, []);

  const joinRoom = () => {
    if (room !== '' && room !== currentRoom) {
      socket.emit('join', room);
      setCurrentRoom(room);
      setMessages([]);
    }
  };

  const sendMessage = () => {
    if (message.trim() !== '' && currentRoom !== '') {
      socket.emit('message', { room: currentRoom, message });
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-header">
          <h1>Chat App</h1>
          <div className="room-container">
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Room"
            />
            <button onClick={joinRoom}>Join Room</button>
          </div>
        </div>
        <div className="chat-main">
          <ul className="chat-messages">
            {messages.map((msg, index) => (
              <li key={index} className="message">
                <span dangerouslySetInnerHTML={{ __html: msg.replace(/\n/g, '<br>') }} />
              </li>
            ))}
          </ul>
        </div>
        <div className="chat-form-container">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={handleKeyPress}
            rows="3"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
