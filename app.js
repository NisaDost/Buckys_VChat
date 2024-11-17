const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = {};

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    users[socket.id] = { volume: 1.0 };
    io.emit('user list', users);

    socket.on('disconnect', () => {
        console.log('user disconnected');
        delete users[socket.id];
        io.emit('user list', users);
        io.emit('user left', socket.id);
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    socket.on('join', (room) => {
        socket.join(room);
        socket.to(room).emit('user joined', socket.id);
    });

    socket.on('leave', (room) => {
        socket.leave(room);
        socket.to(room).emit('user left', socket.id);
    });

    socket.on('signal', (data) => {
        socket.to(data.room).emit('signal', data);
    });

    socket.on('set volume', (data) => {
        if (users[data.id]) {
            users[data.id].volume = data.volume;
            io.emit('user list', users);
        }
    });

    socket.on('screen share', (data) => {
        socket.to(data.room).emit('screen share', data);
    });

    socket.on('stop screen share', (data) => {
        socket.to(data.room).emit('stop screen share', data);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});