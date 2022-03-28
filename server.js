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
const delta = 1000/61; //Server physics frame rate

const { setupMaster, setupWorker } = require("@socket.io/sticky");

const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

const socketIo = require('socket.io');
const level = new Level();

const matches = {};
const matchIdsByWallet = {};
const liveMatches = [];

const origins = ['http://localhost:3000', 'https://youthful-keller-2f50ca.netlify.app'];

if (cluster.isMaster) {
    const httpServer = http.createServer();

    setupMaster(httpServer, {
        loadBalancingMethod: "least-connection",
    });

    httpServer.listen(port);

    console.log(`Master ${process.pid} is running`, `Listening on port ${port}`);

    for (let i = 0; i < Math.min(numCPUs, 1); i++) {
        const PORT = port+i+1;
        cluster.fork({port: PORT});
    }

    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {

    console.log(`Worker ${process.pid} is running`);

    const pubClient = createClient({ url: 'redis://:rIFAotBkFclk7tIV6DaDcGdVWgaUU1rb@redis-10388.c81.us-east-1-2.ec2.cloud.redislabs.com:10388'});
    const subClient = pubClient.duplicate();
    const server = http.createServer();

    const io = new socketIo.Server(server, {
        cors: {
            origin: [
                "https://youthful-keller-2f50ca.netlify.app",
                "http://localhost:3000"
            ],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter(createAdapter(pubClient, subClient));

        setupWorker(io);

        io.on("connection", socket => {
            //Default Values per player instance
            socket.userData = { worker: process.pid, pos: new Vec2(0,0), vel: new Vec2(0,0), heading: 0, dir: 0 };
            console.log(`${socket.id} connected`);

            socket.on('setWallet', data => {
                socket.userData.wallet = data;
            });

            socket.on('getGameId', async (cb) => {
                const currentMatch = await pubClient.get('matchIdsByWallet:' + socket.userData.wallet);
                let id = null;
                if (currentMatch && currentMatch != 0) id = currentMatch;
                if (typeof cb === "function")
                cb(id);
            });

            socket.on('requestGame', cb => {
                var gameId = (( Math.random() * 99999 ) | 0) + 1;
                if (typeof cb === "function")
                cb(gameId.toString());
            });

            socket.on('fetchData', async (cb) => {
                const currentMatch = await pubClient.get('matchIdsByWallet:' + socket.userData.wallet);
                console.log(currentMatch);
                const data = matches[currentMatch].players[socket.userData.wallet];
                if (typeof cb === "function")
                cb({
                    pos: data ? data.pos : new Vec2(640,0),
                    vel: data ? data.vel : new Vec2(0,0),
                    facing: data ? data.facing : 1,
                });
            })

            socket.on('fetchMatches', async (cb) => {
                const liveMatches = await pubClient.LRANGE('liveMatches', 0, -1);
                if (typeof cb === "function"){
                    cb(liveMatches);
                }
            })

            socket.on('createGame', async(room, cb) => {
                const gameId = room.toString();

                socket.join(gameId);
                console.log(typeof gameId);

                matches[gameId] = {};
                matches[gameId].level = new Level();
                matches[gameId].players = {};

                await pubClient.LPUSH('liveMatches', gameId);
                await pubClient.set('matchIdsByWallet:' + socket.userData.wallet, gameId);
                await pubClient.set('match:' + gameId + ':port', process.env.port);

                matches[gameId].sendPackets = startBroadcast(gameId);
                matches[gameId].update = startGameInstance(gameId);

                console.log(cb);
                if (typeof cb === "function") cb();
            })

            socket.on('clearMatchID', async () => {
                await pubClient.DEL('matchIdsByWallet:' + socket.userData.wallet);
            })

            socket.on('endGame', async (data) => {
                await pubClient.LREM('liveMatches', data.room);
                await pubClient.DEL('match:' + data.room + ':port');

                matches[data.room] = null;

                io.sockets.in(data.room).emit('leave', data.room);
            });

            socket.on('joinGame', async (data, cb) => {
                const gamePort = await pubClient.get('match:' + data + ':port');
                const currentMatch = await pubClient.get('matchIdsByWallet:' + socket.userData.wallet);
                if (currentMatch && currentMatch != 0) {
                    const player = matches[currentMatch].players[socket.userData.wallet];
                    if (player && player.socketID != null) {
                        io.sockets.sockets.get(player.socketID).disconnect();
                    }
                }
                socket.join(data);
                await pubClient.set('matchIdsByWallet:' + socket.userData.wallet, data);
                if (typeof cb === "function") cb();
            });

            socket.on('leaveGame', async(data) => {
                const currentMatch = await pubClient.get('matchIdsByWallet:' + socket.userData.wallet);
                matches[currentMatch].players[socket.userData.wallet] = null;
                await pubClient.DEL('matchIdsByWallet:' + socket.userData.wallet);
                socket.broadcast.emit('deletePlayer', { id: socket.userData.wallet });
                socket.leave(data);
            })
            //Initializes server framework for storing a player state
            socket.on('init', async (data) => {
                const currentMatch = await pubClient.get('matchIdsByWallet:' + socket.userData.wallet);

                const player = matches[currentMatch].players[socket.userData.wallet];

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
            socket.on('animation', async (data) => {
                const currentMatch = await pubClient.get('matchIdsByWallet:' + socket.userData.wallet);
                if (matches[currentMatch].players[socket.userData.wallet]) matches[currentMatch].players[socket.userData.wallet].animation = data;
            });

            //Handle removing players from client worlds
            socket.on("disconnect", async (reason) => {
                const currentMatch = await pubClient.get('matchIdsByWallet:' + socket.userData.wallet);
                if (currentMatch){
                    const player = matches[currentMatch].players[socket.userData.wallet];
                    player.socketID = null;
                    clearInput(player, socket);
                    console.log(`Player ${socket.userData.wallet} lost connection, ${reason}`);
                } else {
                    console.log(`Client ${socket.id} lost connection, ${reason}`);
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
        const newPlayer = async (data, socket) => {
            const player = entities.createChar(socket);

            const currentMatch = await pubClient.get('matchIdsByWallet:' + socket.userData.wallet);
            const match = matches[currentMatch];

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
            const heartbeat = async () => {
                let pack = {};

                const time =  Date.now();

                const playerIDs = Object.keys(matches[room].players);

                for (const ID of playerIDs) {
                    if (matches[room].players[ID]){
                        pack[ID] = {
                            timestamp: time,
                            hp: matches[room].players[ID].hp,
                            skeleton: matches[room].players[ID].skeleton,
                            pos: {x: matches[room].players[ID].pos.x, y: matches[room].players[ID].pos.y},
                            vel: {x: matches[room].players[ID].vel.x, y: matches[room].players[ID].vel.y},
                            facing: matches[room].players[ID].facing,
                            grounded: matches[room].players[ID].isGrounded,
                            animation: matches[room].players[ID].animation,
                            hurtTime: matches[room].players[ID].hurtTime,
                            hitSource: matches[room].players[ID].hitSource,
                        }
                    }
                }
                if (Object.keys(pack).length > 0) io.to(room).emit('remoteData', pack);
                //Data for future replays
                // pubClient.HSET('matchSnapshots', room, time, JSON.stringify(pack), () => {});

                setTimeout(heartbeat, interval);
            }
            return setTimeout(heartbeat, interval);
        }


        //Server-side game loop, performs authoratative physics calculations at a set rate of 'delta' ms
        let lastTime = Date.now();
        let accumulatedTime = 0;

        const startGameInstance = (room) => {
            const update = () => {
                const time = Date.now();
                accumulatedTime += time - lastTime;
                lastTime = time;
                while (accumulatedTime > delta) {
                    matches[room].level.update(delta/1000);
                    accumulatedTime -= delta;
                }
                setTimeout(update, delta);
            }
            return setTimeout(update, delta);
        }
    });

    server.listen(process.env.port);

    process.on('exit', () => {
        Object.keys(matches).forEach(async(key) => {
            await pubClient.LREM('liveMatches', key);
            io.emit('clearMatchID');
        })
    });
}
