import { useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [usersOnline, setUsersOnline] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const messagesEndRef = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    ws.current = new WebSocket("ws://192.168.0.103:8080");
    setConnectionStatus("connecting");

    ws.current.onopen = () => {
      setConnectionStatus("connected");
      ws.current.send(
        JSON.stringify({
          type: "login",
          name: user.displayName || "Anonymous",
        })
      );
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "chat") {
        setMessages((prev) => [...prev, data]);
      } else if (data.type === "userList") {
        setUsersOnline(data.users);
      }
    };

    ws.current.onerror = (e) => {
      setConnectionStatus("error");
      console.error("WebSocket error:", e);
    };

    ws.current.onclose = () => {
      setConnectionStatus("disconnected");
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const sendMessage = () => {
    if (input.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "chat",
          text: input,
        })
      );
      setInput("");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white p-4 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold">Chat App</h1>
          <button
            onClick={handleSignOut}
            className="text-sm bg-indigo-800 hover:bg-indigo-900 px-3 py-1 rounded transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="mb-6">
          <div className="text-xs uppercase font-semibold text-indigo-300 mb-2">
            Online Users ({usersOnline.length})
          </div>
          <div className="space-y-2">
            {usersOnline.map((username, index) => (
              <div key={index} className="flex items-center">
                <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                <span>{username}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Status Bar */}
        <div className="bg-white p-3 border-b flex items-center justify-between">
          <div className="flex items-center">
            <span
              className={`h-3 w-3 rounded-full mr-2 ${
                connectionStatus === "connected" ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            <span className="text-sm text-gray-600">
              {connectionStatus === "connected" ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-700">
            {user?.displayName || "Anonymous"}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === (user?.displayName || "Anonymous")
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender === (user?.displayName || "Anonymous")
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="font-medium text-sm">
                  {msg.sender === (user?.displayName || "Anonymous")
                    ? "You"
                    : msg.sender}
                </div>
                <div className="text-sm">{msg.text}</div>
                <div
                  className={`text-xs mt-1 ${
                    msg.sender === (user?.displayName || "Anonymous")
                      ? "text-indigo-200"
                      : "text-gray-500"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={connectionStatus !== "connected"}
            />
            <button
              type="submit"
              disabled={!input.trim() || connectionStatus !== "connected"}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
