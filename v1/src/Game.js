import React from 'react';
import { useEffect, useState, useRef } from 'react';
import useScript from './hooks/useScript.js';
import socketIOClient from "socket.io-client";
import Remote from './modules/remote.js';

import { Stage, Sprite, PixiComponent  } from '@inlet/react-pixi'

import { createChar } from './modules/entities.js';
import Camera from './modules/camera.js';

import { Keyboard, KeyCodes } from './modules/input.js';
import { bindKeys, bindKeysServer } from './modules/controls.js';
import * as PIXI from "pixi.js";

import { Spine } from 'pixi-spine';

const physics = require("./modules/physics.js");
const assetManager = require("./modules/assets.js");
const animationManager = require("./modules/animation.js");
const layerManager = require("./modules/layers.js");

const loader = PIXI.Loader.shared;


//SERVER URL
const ENDPOINT = "https://d14b-2604-3d09-a880-b800-2842-325a-84ca-8350.ngrok.io";

//Scaling Settings
const baseWidth = 1920;
const baseHeight = 1080;

//Game Loop & logic for single player
export function Game() {
    const [response, setResponse] = useState("");

    //Canvas/Screen Buffer
    const screenRef = useRef();
    const [gScale, setGScale] = useState(1);
    const [gWidth, setGWidth] = useState();
    const [gHeight, setGHeight] = useState();
    const [testLevel, setTestLevel] = useState();

    const [level, setLevel] = useState();
    const [comp, setComp] = useState();
    const [clock, setClock] = useState(0);

    const [camera, setCamera] = useState(new Camera());

    let gameLoop = useRef();

    const getScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      var scaler = h/14;
      scaler = Math.max(24, scaler)/64;

      return scaler;
    }

    const animation = (app) => {
        var spineLoaderOptions = { metadata: { spineSkeletonScale: 1 } };
        app.loader.add('playerSkel','res/avatars/Game Ready/Bobbleheads.json', spineLoaderOptions);
    }

    const createSkeleton = (app, resources) => {
        let res = new Spine(resources.playerSkel.spineData);
        app.stage.addChild(res);
        return res;
    }

    //Initializes game on page load, after fetching required data from the server
    useEffect(() => {

        const serverState = new Remote();

        const app = new PIXI.Application({
          width: window.innerWidth,
          height: window.innerHeight,
          resizeTo: window,
          backgroundColor: 0x87CEEB,
          antialias: true
        });

        const loadMap = assetManager.loadLevel(app, 1);

        const c = new Camera();

        document.body.appendChild(app.view);

        animation(app);

        app.loader.load((loader, resources) => {
            const bh = createSkeleton(app, resources);
            const dummy = createSkeleton(app, resources);
            animationManager.bobbleheadMix(bh);
            animationManager.bobbleheadMix(dummy);

            Promise.all([loadMap,createChar(0), createChar(0)])
                .then(([map, char, prop]) => {
                    char.skeleton = bh;
                    prop.skeleton = dummy;

                    //Loads keyboard handling logic
                    const input = new Keyboard();
                    let lastTime = 0;
                    let accumulatedTime = 0;
                    let delta = 1/60;

                    //Defines keybinds
                    bindKeys(char,input,window);

                    map.entities.add(char);
                    map.entities.add(prop);

                    char.drawHP(app);
                    prop.drawHP(app);

                    map.addInteractiveEntity(char);
                    map.addInteractiveEntity(prop);

                    //Define the game loop update/render logic
                    const update = (time) => {
                         map.render(c);

                         //Compares real elapsed time with desired logic/physics framerate to maintain consistency
                         //accumulatedTime marks how many seconds have passed since the last logic update
                         accumulatedTime += (time - lastTime)/1000;
                         lastTime = time;

                         while (accumulatedTime > delta) {
                             const SCALE = getScale();
                             c.setSize(
                                window.innerWidth/SCALE,
                                window.innerHeight/SCALE,
                                SCALE
                             );
                             c.update(char, map, delta);
                             map.update(delta);
                             accumulatedTime -= delta;
                         }
                         gameLoop.current = requestAnimationFrame(update);
                         }
                     gameLoop.current = requestAnimationFrame(update);
                });
        });
    }, []);

    return (
        <div className='nobar' />
    )
}

//Game loop & logic for multiplayer
export function OnlineGame() {
    const [response, setResponse] = useState("");
    const [server, newServer] = useState(socketIOClient(ENDPOINT));

    //Canvas/Screen Buffer
    const screenRef = useRef();
    const [gScale, setGScale] = useState(1);
    const [gWidth, setGWidth] = useState();
    const [gHeight, setGHeight] = useState();
    const [testLevel, setTestLevel] = useState();

    const [level, setLevel] = useState();
    const [comp, setComp] = useState();
    const [clock, setClock] = useState(0);

    const [camera, setCamera] = useState(new Camera());

    let gameLoop = useRef();

    const getScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      var scaler = h/14;
      scaler = Math.max(24, scaler)/64;

      return scaler;
    }

    const animation = (app) => {
        var spineLoaderOptions = { metadata: { spineSkeletonScale: 1 } };
        app.loader.add('playerSkel','res/avatars/Game Ready/Bobbleheads.json', spineLoaderOptions);
    }

    const createSkeleton = (app, resources) => {
        let res = new Spine(resources.playerSkel.spineData);
        app.stage.addChild(res);
        return res;
    }

    const initPlayerOnServer = (entity) => {
        const data = {
            hp: entity.hp,
            skeleton: 0,
            pos: entity.pos,
            vel: entity.vel,
            command: entity.command,
            heading: entity.heading,
            pb: entity.pb,
            dir: entity.dir,
        }
        server.emit('init', data);
    }

    const checkForPlayers = (app, char, level, socket, serverState) => {
        server.on('addPlayer', data => {
            if (!serverState.players[data.id]) {
                createChar(data.skeleton, data.id, socket, false, serverState).then((player) => {
                    newPlayer(app, level, player);
                    serverState.players[data.id] = player;
                });
            }
        });

        server.on('deletePlayer', data => {
            if (serverState.players[data.id]) {
                const player = serverState.players[data.id];
                player.destroy();
                level.entities.delete(player);
                serverState.players[data.id] = null;
            }
        });

        server.on('remoteData', data => {
            serverState.remoteData = data;
            serverState.lastUpdate = Date.now();
            Object.entries(serverState.remoteData).forEach((item) => {
                const key = item[0];
                const userData = item[1];
                if (!serverState.players[key]) {
                    serverState.players[key] = {};
                    createChar(userData.skeleton, key, server, false, serverState).then((player) => {
                        newPlayer(app, level, player);
                        player.pos.set(userData.pos.x, userData.pos.y)
                        serverState.players[key] = player;
                    });
                }
            })
        });
    }

    const newPlayer = (app, level, player) => {
        const bh = createSkeleton(app, app.loader.resources);
        animationManager.bobbleheadMix(bh);
        player.skeleton = bh;

        player.drawHP(app);

        level.entities.add(player);
        level.addInteractiveEntity(player);
    }

    //Initializes game on page load, after fetching required data from the server
    useEffect(() => {
        const app = new PIXI.Application({
          width: window.innerWidth,
          height: window.innerHeight,
          resizeTo: window,
          backgroundColor: 0x87CEEB,
          antialias: true
        });

        const serverState = new Remote();

        const loadMap = assetManager.loadLevel(app, 1);

        const c = new Camera();

        document.body.appendChild(app.view);

        animation(app);

        app.loader.load((loader, resources) => {
            const bh = createSkeleton(app, resources);
            //const dummy = createSkeleton(app, resources);
            animationManager.bobbleheadMix(bh);
            //animationManager.bobbleheadMix(dummy);

            Promise.all([loadMap,createChar(0, server.id, server, serverState, true)])
                .then(([map, char]) => {
                    serverState.players[server.id] = char;
                    char.skeleton = bh;
                    server.emit('loadLevel', {
                        data: map.data
                    })
                    //prop.skeleton = dummy;

                    initPlayerOnServer(char);

                    //Loads keyboard handling logic
                    const input = new Keyboard();
                    let lastTime = 0;
                    let accumulatedTime = 0;
                    let delta = 1/60;

                    //Defines keybinds
                    bindKeysServer(char,input,window, server);


                    map.entities.add(char);
                    //map.entities.add(prop);

                    char.drawHP(app);
                    //prop.drawHP(app);

                    map.addInteractiveEntity(char);
                    //map.addInteractiveEntity(prop);
                    checkForPlayers(app, char, map, server, serverState);

                    //Define the game loop update/render logic
                    const update = (time) => {
                         map.render(c);

                         //Compares real elapsed time with desired logic/physics framerate to maintain consistency
                         //accumulatedTime marks how many seconds have passed since the last logic update
                         accumulatedTime += (time - lastTime)/1000;
                         lastTime = time;

                         while (accumulatedTime > delta) {
                             const SCALE = getScale();
                             c.setSize(
                                window.innerWidth/SCALE,
                                window.innerHeight/SCALE,
                                SCALE
                             );
                             c.update(char, map, delta);
                             map.update(delta, serverState);
                             accumulatedTime -= delta;
                         }
                         gameLoop.current = requestAnimationFrame(update);
                     }
                     gameLoop.current = requestAnimationFrame(update);
                });
        });

        //Cleanup on dismount
        return () => {
            if (server)
                server.disconnect();
        }
    }, []);

    return (
        <div className='nobar' />
    )
}
