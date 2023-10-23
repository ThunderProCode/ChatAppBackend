const express = require('express');
// const cors = require('cors');
// const app = express();
// const http = require('http');
// const path = require('path');
// const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server({
    cors: {
        origin: "http://localhost:3000"
    }
});

io.listen(8080);

const userSockets = [];
function generateUniqueID() {
    while (true) {
        const randomNumber = Math.floor(100000 + Math.random() * 900000); // Generates a random number between 100000 and 999999
        if (!userSockets[randomNumber]) {
        return randomNumber;
        }
    }
} 

io.on('connection', (socket) => {
    const userId = generateUniqueID();
    socket.data.username = userId;
    userSockets[userId] = socket;

    socket.emit('username',socket.data.username);

    socket.on('connectionUsername', (connectionUsername) => {
        const targetSocket = userSockets[connectionUsername];
        if(targetSocket) {
            console.log('Sender: '+socket.data.username);
            console.log('Receiver: '+targetSocket.data.username);

            socket.emit('connectedToUser',targetSocket.data.username);
            targetSocket.emit('connectedToUser',socket.data.username);

        }
    });

    socket.on('chat message', (msg) => {
        const targetSocket = userSockets[msg.to];
        if(targetSocket) {
            targetSocket.emit('chat message',msg.message);
        }

    });

    socket.on('disconnect', () => {
        delete userSockets[socket.data.username];
    });

})

