import { Vec2 } from './modules/util.js';

const express = require('express');
const http = require('http');

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const interval = 1/25; //Server broadcast rate
const delta = 1/60; //Server physics frame rate

const app = express();
app.use(index);

const server = http.createServer(app);

const socketIo = require('socket.io');

const io = new socketIo.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on("connection", socket => {
    //Default Values per player instance
    socket.userData = { pos: new Vec2(), vel: new Vec2(), heading: 0 };
    console.log(`${socket.id} connected`);

    socket.on('init', data => {
        socket.userData.skeleton = data.skeleton;
        socket.userData.hp = data.hp;
        socket.userData.pos = data.pos;
        socket.userData.vel = data.vel;
        socket.userData.heading = data.h;
        socket.userData.pb = data.pb;
        socket.userData.command = null;
    });

    socket.on('input', data => {
        const button = data.key;
        socket.userData.command = data.key;
    })


    //Handle removing players from client worlds
    socket.on("disconnect", () => {
        console.log(`Client ${socket.id} disconnected`);
        socket.broadcast.emit('deletePlayer', { id: socket.id });
    });

    socket.on("chat message", msg => {
        console.log(msg);
    });
});

setInterval(() => {
    const nsp = io.of('/');
    let pack = [];

    for(let id in io.sockets.sockets) {
        const socket = nsp.connected[id];
        //Only push initialized sockets
        if (socket.userData.skeleton !== undefined) {
            pack.push({
                id: socket.id,
                hp: socket.userData.hp,
                skeleton: socket.userData.skeleton,
                pos: socket.userData.pos,
                vel: socket.userData.vel,
                command: socket.userData.command,
                heading: socket.userData.heading,
                pb: socket.userData.pb,
            })
        }
    }
    if (pack.length > 0) io.emit('remoteData', pack);
}, interval);

server.listen(port, () => console.log(`Listening on port ${port}`));
