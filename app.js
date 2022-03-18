const Vec2 = require('./modules/util.js').Vec2;
const Level = require('./modules/level.js');
const handleInput = require('./modules/input.js');

const entities = require('./modules/entities.js');

const express = require('express');
const http = require('http');

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const interval = 1000/25; //Server broadcast rate
const delta = 1000/60; //Server physics frame rate


//slight change
const app = express();
app.use(index);

const server = http.createServer(app);

const socketIo = require('socket.io');
const level = new Level();
const players = {};

const io = new socketIo.Server(server, {
    cors: {
        origin: [
            "https://youthful-keller-2f50ca.netlify.app",
            "http://localhost:3000"
        ],
        methods: ["GET", "POST"]
    }
});

//Called upon establishment of a new collection
io.on("connection", socket => {
    //Default Values per player instance
    socket.userData = { pos: new Vec2(0,0), vel: new Vec2(0,0), heading: 0, dir: 0 };
    console.log(`${socket.id} connected`);

    //Initializes server framework for storing a player state
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

    //Triggers client callback for latency calculation upon ping requests
    socket.on("ping", (cb) => {
        if (typeof cb === "function")
          cb();
    });

    //Mirror player animations from client
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

    //Loads map data server-side upon room creation
    socket.on("loadLevel", levelData => {
        if (level.data) return;
        level.data = levelData.data;
        level.loadCollisionData();
    })
});

//Add a new player entity to the server state for authoratative physics
const newPlayer = (data, socket) => {
    const player = entities.createChar(socket);
    players[socket.id] = player;
    player.pos = data.pos;
    player.vel = data.vel;
    level.entities.add(player);
    level.addInteractiveEntity(player);
    handleInput(player, socket);
}

//Create a packet for the server-side player data, and broadcast it at a set rate of 'interval' ms
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
                animation: socket.userData.animation,
                hurtTime: players[ID].hurtTime,
                hitSource: players[ID].hitSource,
                guard: players[ID].guard
            }
        }
    }

    if (Object.keys(pack).length > 0) io.emit('remoteData', pack);
}, interval);

//Server-side game loop, performs authoratative physics calculations at a set rate of 'delta' ms
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

//Start server
server.listen(port, () => console.log(`Listening on port ${port}`));
