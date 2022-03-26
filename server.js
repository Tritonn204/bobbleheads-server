//Game packages
const Vec2 = require('./modules/util.js').Vec2;
const Level = require('./modules/level.js');
const handleInput = require('./modules/input.js').input;
const clearInput = require('./modules/input.js').clear;
const entities = require('./modules/entities.js');

//Server infrastructure packages
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

const express = require('express');
const http = require('http');

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const interval = 1000/25; //Server broadcast rate
const delta = 1000/60; //Server physics frame rate

const { setupMaster, setupWorker } = require("@socket.io/sticky");

app.use(index);

const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

const socketIo = require('socket.io');
const level = new Level();

const matches = {};
const matchIdsByWallet = {};
const liveMatches = [];

if (cluster.isMaster) {
    const app = express();
    console.log(`Master ${process.pid} is running`);

    const httpServer = http.createServer(app);
    setupMaster(httpServer, {
        loadBalancingMethod: "least-connection"
    });
    httpServer.listen(port);

    console.log(`Listening on port ${port}`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    const app = express();
    console.log(`Worker ${process.pid} is running`);

    const pubClient = createClient({ host: "localhost", port: 6379});
    const subClient = pubClient.duplicate();
    const server = http.createServer();

    const io = new socketIo.Server(server, {
        cors: {
            origin: [
                "https://youthful-keller-2f50ca.netlify.app",
                "http://localhost:3000"
            ],
            methods: ["GET", "POST"],
        }
    });

    io.adapter(createAdapter(pubClient, subClient));
    setupWorker(io);

    io.on("connection", socket => {
        //Default Values per player instance
        socket.userData = { pos: new Vec2(0,0), vel: new Vec2(0,0), heading: 0, dir: 0 };
        console.log(`${socket.id} connected`);

        socket.on('setWallet', data => {
            socket.userData.wallet = data;
        });

        socket.on('getGameId', cb => {
            let id = null;
            if (matchIdsByWallet[socket.userData.wallet]) id = matchIdsByWallet[socket.userData.wallet];
            if (typeof cb === "function")
            cb(id);
        });

        socket.on('requestGame', cb => {
            var gameId = (( Math.random() * 99999 ) | 0) + 1;
            if (typeof cb === "function")
            cb(gameId);
        });

        socket.on('fetchData', cb => {
            const data = matches[matchIdsByWallet[socket.userData.wallet]].players[socket.userData.wallet];
            if (typeof cb === "function")
            cb({
                pos: data ? data.pos : new Vec2(640,0),
                vel: data ? data.vel : new Vec2(0,0),
                facing: data ? data.facing : 1,
            });
        })

        socket.on('fetchMatches', cb => {
            if (typeof cb === "function")
            cb(JSON.stringify(liveMatches));
        })

        socket.on('createGame', gameId => {
            socket.join(gameId);

            matchIdsByWallet[socket.userData.wallet] = gameId;
            matches[gameId] = {};
            matches[gameId].level = new Level();
            matches[gameId].players = {};
            liveMatches.push(gameId);

            matches[gameId].sendPackets = startBroadcast(gameId);
            matches[gameId].update = startGameInstance(gameId);
        })

        socket.on('endGame', data => {
            var filtered = liveMatches.filter(function(value, index, arr){
                if (value == matches[data.room]) liveMatches.splice(index, 1);
            });
            matches[data.room] = null;
            io.sockets.in(data.room).emit('leave', data.room);
            clearInterval(matches[data.gameId].sendPackets);
            clearInterval(matches[data.gameId].update);
        });

        socket.on('joinGame', data => {
            if (matchIdsByWallet[socket.userData.wallet]) {
                const player = matches[matchIdsByWallet[socket.userData.wallet]].players[socket.userData.wallet];
                if (player && player.socketID != null) {
                    io.sockets.sockets.get(player.socketID).disconnect();
                }
            }
            socket.join(data);
            matchIdsByWallet[socket.userData.wallet] = data;
        });

        socket.on('leaveGame', data => {
            socket.leave(data);
            matches[matchIdsByWallet[socket.userData.wallet]].players[socket.userData.wallet] = null;
            matchIdsByWallet[socket.userData.wallet] = null;
            socket.broadcast.emit('deletePlayer', { id: socket.userData.wallet });
        })
        //Initializes server framework for storing a player state
        socket.on('init', data => {

            const player = matches[matchIdsByWallet[socket.userData.wallet]].players[socket.userData.wallet];

            socket.userData.hp = player ? player.hp : data.hp;
            socket.userData.pos = player ? player.pos : data.pos;
            socket.userData.vel = player ? player.vel : data.vel;
            socket.userData.heading = data.h;
            socket.userData.pb = data.pb;
            socket.userData.command = null;
            socket.userData.facing = player ? player.facing : 1;
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
            matches[matchIdsByWallet[socket.userData.wallet]].players[socket.userData.wallet].animation = data;
        });

        //Handle removing players from client worlds
        socket.on("disconnect", () => {
            if (matchIdsByWallet[socket.userData.wallet]){
                const player = matches[matchIdsByWallet[socket.userData.wallet]].players[socket.userData.wallet];
                player.socketID = null;
                clearInput(player, socket);
                console.log(`Player ${socket.userData.wallet} lost connection`);
            } else {
                console.log(`Client ${socket.id} disconnected`);
            }
        });

        socket.on("chat message", msg => {
            console.log(msg);
        });

        //Loads map data server-side upon room creation
        socket.on("loadLevel", levelData => {
            if (matches[levelData.room].level.data) return;
            matches[levelData.room].level.data = levelData.data;
            matches[levelData.room].level.loadCollisionData();
        })
    });

    //Add a new player entity to the server state for authoratative physics
    const newPlayer = (data, socket) => {
        const player = entities.createChar(socket);
        const match = matches[matchIdsByWallet[socket.userData.wallet]];

        console.log('player ' + socket.userData.wallet + ' joined');

        match.players[socket.userData.wallet] = player;
        player.socketID = socket.id;
        player.skeleton = data.skeleton;
        player.pos = data.pos;
        player.vel = data.vel;
        player.animation = {
            name: "Idle",
            loop: true
        }
        match.level.entities.add(player);
        match.level.addInteractiveEntity(player);
        handleInput(player, socket);
    }

    //Create a packet for the server-side player data, and broadcast it at a set rate of 'interval' ms
    const startBroadcast = (room) => {
        return setTimeout(async () => {
            let pack = {};

            const playerIDs = Object.keys(matches[gameId].players);
            for (const ID of playerIDs) {
                pack[ID] = {
                    hp: matches[gameId].players[ID].hp,
                    skeleton: matches[gameId].players[ID].skeleton,
                    pos: matches[gameId].players[ID].pos,
                    vel: matches[gameId].players[ID].vel,
                    command: matches[gameId].players[ID].command,
                    heading: matches[gameId].players[ID].heading,
                    facing: matches[gameId].players[ID].facing,
                    grounded: matches[gameId].players[ID].isGrounded,
                    animation: matches[gameId].players[ID].animation,
                    hurtTime: matches[gameId].players[ID].hurtTime,
                    hitSource: matches[gameId].players[ID].hitSource,
                }
            }
            if (Object.keys(pack).length > 0) io.to(room).emit('remoteData', pack);
            setTimeout(startBroadcast(interval));
        }, interval);
    }


    //Server-side game loop, performs authoratative physics calculations at a set rate of 'delta' ms
    let lastTime = Date.now();
    let accumulatedTime = 0;

    const startGameInstance = (room) => {
        return setTimeout(async () => {
            const time = Date.now();
            let deltaTime = time - lastTime;
            lastTime = time;
            matches[room].level.update(deltaTime/1000);

            setTimeout(startGameInstance(room));
        }, delta);
    }
}
