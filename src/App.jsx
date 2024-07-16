import { io } from "socket.io-client";
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { FiSend, FiLogIn } from 'react-icons/fi';
import { motion } from 'framer-motion';

const SOCKET_URL = "http://localhost:3000";

function App() {
  const MessageList = ({ messages }) => {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        <ul className="space-y-2">
          {messages.map((message, index) => (
            <motion.li
              key={index}
              className="flex justify-between items-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                alignSelf: message.name === name ? "flex-end" : "flex-start",
              }}
            >
              <span className="font-semibold">{message.name}:</span>
              <span className="ml-2">{message.message}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    );
  };

  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [roomText, setRoomText] = useState("");
  const [name, setName] = useState("");
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  const socket = io.connect(SOCKET_URL, {
    transport: ["websocket"],
  });

  useEffect(() => {
    socket.on("connect", () => {});

    socket.on("message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on("notification", (msg) => {
      toast.success(`${msg}`);
    });
  }, [socket]);

  const onSendMessage = (message) => {
    const newMessage = {
      name: name,
      message: message,
    };

    socket.emit("messageRoom", {
      room: roomId,
      message: newMessage,
    });
  };

  const handleRoomGeneration = () => {
    if (roomText === "" || name === "") {
      toast.warn("Please enter a room ID and your name to join the chat room.");
      return;
    }
    socket.emit("join", {
      room: roomText,
      name: name,
    });
    setRoomId(roomText);
    toast.success("Entered a Chat-Room");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {roomId === "" && (
        <motion.div
          className="bg-white p-8 rounded shadow-md w-full max-w-md"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6">Join Random Chat Application</h1>
          <div className="space-y-4">
            <input
              className="w-full p-2 border rounded"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
            <input
              className="w-full p-2 border rounded"
              type="text"
              value={roomText}
              onChange={(e) => setRoomText(e.target.value)}
              placeholder="Enter your Room ID"
            />
            <button onClick={handleRoomGeneration} className="w-full bg-blue-500 text-white p-2 rounded flex items-center justify-center space-x-2">
              <FiLogIn />
              <span>Join a Room</span>
            </button>
          </div>
        </motion.div>
      )}

      {roomId !== "" && (
        <motion.div
          className="bg-white p-8 rounded shadow-md w-full max-w-md"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-4">Welcome to {roomId} chat room!</p>
          <MessageList messages={messages} />
          <div className="flex mt-4 space-x-2">
            <input
              type="text"
              placeholder="Type your message here"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button onClick={handleSendMessage} className="bg-blue-500 text-white p-2 rounded flex items-center justify-center space-x-2">
              <FiSend />
              <span>Send</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default App;
