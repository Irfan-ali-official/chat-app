const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const wss = new WebSocket.Server({ port: 8080 });
const users = new Map(); // Track connected users: { id: { name, ws } }

// Define broadcastUserList function first
function broadcastUserList() {
  const userList = Array.from(users.values()).map((user) => user.name);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "userList",
          users: userList,
        })
      );
    }
  });
}

// Define broadcastMessage function
function broadcastMessage(senderId, text) {
  const sender = users.get(senderId);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "chat",
          sender: sender.name,
          text,
          timestamp: new Date().toISOString(),
        })
      );
    }
  });
}

wss.on("connection", (ws) => {
  const userId = uuidv4();
  console.log(`New connection: ${userId}`);

  ws.on("message", (data) => {
    const message = JSON.parse(data);

    // Handle different message types
    switch (message.type) {
      case "login":
        users.set(userId, { name: message.name, ws });
        broadcastUserList(); // Now this will work
        break;
      case "chat":
        broadcastMessage(userId, message.text);
        break;
    }
  });
  wss.on("connection", (ws) => {
    console.log("New connection");
    ws.on("message", (data) => {
      console.log("Received message:", data.toString());
    });
  });
  ws.on("close", () => {
    users.delete(userId);
    broadcastUserList();
  });
});

console.log("WebSocket server running on ws://localhost:8080");
