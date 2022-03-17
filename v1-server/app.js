const Vec2 = require('./modules/util.js').Vec2;
const Level = require('./modules/level.js');
const entities = require('./modules/entities.js');

const express = require('express');
const http = require('http');

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const interval = 1000/25; //Server broadcast rate
const delta = 1000/60; //Server physics frame rate

const app = express();
app.use(index);

const server = http.createServer(app);

const socketIo = require('socket.io');
const level = new Level();

const io = new socketIo.Server(server, {
    cors: {
        origin: function(origin, callback) {
            if (origin.includes("localhost")){
                callback(null, true);
            }
            else {
                callback(null, false);
            }
        },
        methods: ["GET", "POST"]
    }
});

io.on("connection", socket => {
    //Default Values per player instance
    socket.userData = { pos: new Vec2(0,0), vel: new Vec2(0,0), heading: 0, dir: 0 };
    console.log(`${socket.id} connected`);

    socket.on('init', data => {
        socket.userData.skeleton = data.skeleton;
        socket.userData.hp = data.hp;
        socket.userData.pos = data.pos;
        socket.userData.vel = data.vel;
        socket.userData.heading = data.h;
        socket.userData.pb = data.pb;
        socket.userData.command = null;
        socket.userData.dir = 0;
        newPlayer(data, socket.id);
        socket.broadcast.emit('addPlayer', {
            skeleton: data.skeleton,
            id: socket.id
        });
    });

    socket.on('input', data => {
        const button = data.key;
        socket.userData.command = data.key;
    });

    //Handle removing players from client worlds
    socket.on("disconnect", () => {
        console.log(`Client ${socket.id} disconnected`);
        socket.broadcast.emit('deletePlayer', { id: socket.id });
    });

    socket.on("chat message", msg => {
        console.log(msg);
    });

    socket.on("loadLevel", levelData => {\
        if (level.data) return;
        level.data = levelData.data;
        level.loadCollisionData();
    })
});

const newPlayer = (data, id) => {
    const player = entities.createChar(id);
    player.pos = data.pos;
    player.vel = data.vel;
    level.entities.add(player);
    level.addInteractiveEntity(player);
}

setInterval(() => {
    let pack = [];

    for (const [_, socket] of io.of("/").sockets) {
        if (socket.userData.skeleton != undefined)
            pack.push({
                id: socket.id,
                hp: socket.userData.hp,
                skeleton: socket.userData.skeleton,
                pos: socket.userData.pos,
                vel: socket.userData.vel,
                command: socket.userData.command,
                heading: socket.userData.heading,
                pb: socket.userData.pb,
                dir: socket.userData.dir
            })
    }

    if (pack.length > 0) io.emit('remoteData', pack);
}, interval);

setInterval(() => {
    level.update(delta/1000);
}, delta);

server.listen(port, () => console.log(`Listening on port ${port}`));
