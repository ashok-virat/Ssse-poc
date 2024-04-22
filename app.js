const express = require("express");
const app = express();
const port = 3000;

let clients = [];

// WebSocket server (outside of the serverless function)
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    ws.on('message', function incoming(message) {
        console.log('Received: %s', typeof message);
        // Broadcast message to all clients
        wss.clients.forEach(function each(client) {
            client.send(JSON.stringify(message));
        });
    });
});


const eventsHandler = (req, res) => {
    try {
        const headers = {
            "Content-Type": "text/event-stream",
            Connection: "keep-alive",
            "Cache-Control": "no-cache",
        };

        res.writeHead(200, headers);

        const data = `data: ${JSON.stringify("connection established")}\n\n`;
        res.write(data);

        const clientId = Date.now();

        const newClient = {
            id: clientId,
            response: res,
        };

        clients.push(newClient);

        req.on("close", () => {
            console.log(`${clientId} Connection closed`);
            clients = clients.filter((client) => client.id !== clientId);
        });
    } catch (error) {
        console.error("Error in eventsHandler:", error);
        res.status(500).send("Internal Server Error");
    }
};

app.get("/blogs", (req, res) => {
    res.send('route added')
});

app.get("/blogs/events", eventsHandler);

// Define a route
app.get("/", (req, res) => {
    res.send("Hello, World!");
});