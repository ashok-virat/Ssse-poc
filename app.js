const express = require('express');
const app = express();
const port = 3000;

let clients = [];

let setRouter = (app) => {
    let baseUrl = '/blogs';
    const eventsHandler = async (request, response, next) => {
        console.log(response);
        try {
            const headers = {
                'Content-Type': 'text/event-stream',
                'Connection': 'keep-alive',
                'Cache-Control': 'no-cache'
            };

            // Use writeHead with a capital 'H'
            response.writeHead(200, headers);

            const data = `data: ${JSON.stringify('connection established')}\n\n`;
            response.write(data);
            setInterval(() => {
                response.write(data);
            }, 100000);


            const clientId = Date.now();

            const newClient = {
                id: clientId,
                response
            };

            clients.push(newClient);

            request.on('close', () => {
                console.log(`${clientId} Connection closed`);
                clients = clients.filter(client => client.id !== clientId);
            });
        } catch (error) {
            next(error);
        }
    };

    app.get(baseUrl + '/events', eventsHandler);
};

// Use the setRouter function
setRouter(app);

// Define a route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
