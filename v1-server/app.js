const Vec2 = require('./modules/util.js').Vec2;
const Level = require('./modules/level.js');
const handleInput = require('./modules/input.js');

const entities = require('./modules/entities.js');

const express = require('express');
const http = require('http');

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const interval = 1000/25; //Server broadcast rate
const delta = 1000/80; //Server physics frame rate

const app = express();
app.use(index);

const server = http.createServer(app);

const socketIo = require('socket.io');
const level = new Level();
const players = {};

const io = new socketIo.Server(server, {
    cors: {
        origin: [
            "https://youthful-keller-2f50ca.netlify.app/",
            "https://localhost:*"
        ],
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
        socket.userData.facing = 1;
        socket.userData.animation = {
            name: "Idle",
            loop: true
        }
        newPlayer(data, socket);
        socket.broadcast.emit('addPlayer', {
            skeleton: data.skeleton,
            id: socket.id
        });
    });

    socket.on('animation', data => {
        socket.userData.animation = data;
    });

    //Handle removing players from client worlds
    socket.on("disconnect", () => {
        console.log(`Client ${socket.id} disconnected`);
        socket.broadcast.emit('deletePlayer', { id: socket.id });
    });

    socket.on("chat message", msg => {
        console.log(msg);
    });

    socket.on("loadLevel", levelData => {
        if (level.data) return;
        level.data = levelData.data;
        level.loadCollisionData();
    })
});

const newPlayer = (data, socket) => {
    const player = entities.createChar(socket.id);
    players[socket.id] = player;
    player.pos = data.pos;
    player.vel = data.vel;
    level.entities.add(player);
    level.addInteractiveEntity(player);
    handleInput(player, socket);
}

setInterval(() => {
    let pack = {};

    for (const [_, socket] of io.of("/").sockets) {
        if (socket.userData.skeleton != undefined){
            const ID = socket.id;
            pack[ID] = {
                hp: players[ID].hp,
                skeleton: socket.userData.skeleton,
                pos: players[ID].pos,
                vel: players[ID].vel,
                command: players[ID].command,
                heading: players[ID].heading,
                pb: socket.userData.pb,
                facing: players[ID].facing,
                grounded: players[ID].isGrounded,
                animation: socket.userData.animation
            }
        }
    }

    if (Object.keys(pack).length > 0) io.emit('remoteData', pack);
}, interval);

let lastTime = Date.now();
let accumulatedTime = 0;

setInterval(() => {
    const time = Date.now();
    let deltaTime = time - lastTime;

    accumulatedTime += deltaTime;
    lastTime = time;

    while (accumulatedTime > delta) {
        level.update(delta/1000);
        accumulatedTime -= delta;
    }
}, delta);

server.listen(port, () => console.log(`Listening on port ${port}`));
