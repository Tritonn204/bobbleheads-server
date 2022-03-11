import React from 'react';
import { useEffect, useState, useRef } from 'react';
import useScript from './hooks/useScript.js';
import socketIOClient from "socket.io-client";
import Compositor from './Compositor.js';

import { Stage, Sprite, PixiComponent  } from '@inlet/react-pixi'

import { createChar } from './modules/entities.js';
import Camera from './modules/camera.js';

import { Keyboard, KeyCodes } from './modules/input.js';
import { bindKeys } from './modules/controls.js';
import * as PIXI from "pixi.js";

import { Spine } from 'pixi-spine';

const physics = require("./modules/physics.js");
const assetManager = require("./modules/assets.js");
const layerManager = require("./modules/layers.js");

const loader = PIXI.Loader.shared;


//SERVER URL
const ENDPOINT = "http://127.0.0.1:4001";

//Scaling Settings
const baseWidth = 1920;
const baseHeight = 1080;

function Game() {
    const [response, setResponse] = useState("");
    const socketRef = useRef();

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

    //Establishes connection with the server
    // useEffect(() => {
    //         try {
    //             //socketRef.current = socketIOClient(ENDPOINT);
    //         }catch(e){
    //             //console.log(e);
    //         }
    //         //Cleanup on dismount
    //         return () => {
    //             //if (socketRef)
    //             //socketRef.current.disconnect();
    //         }
    // }, []);

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
            bh.stateData.setMix("Idle Left", "Walk Left", 0.2);
            bh.stateData.setMix("Walk Left", "Idle Left",  0.2);
            bh.stateData.setMix("Run Left", "Idle Left", 0.6);
            bh.stateData.setMix("Idle Left", "Run Left", 0.6);
            bh.stateData.setMix("Walk Left", "Run Left", 0.4);
            bh.stateData.setMix("Run Left", "Walk Left", 0.4);

            Promise.all([loadMap,createChar(0)])
                .then(([map, char]) => {
                    char.skeleton = bh;

                    //Loads keyboard handling logic
                    const input = new Keyboard();
                    let lastTime = 0;
                    let accumulatedTime = 0;
                    let delta = 1/60;

                    //Defines keybinds
                    bindKeys(char,input,window);

                    map.entities.add(char);

                    //Define the game loop update/render logic
                    const update = (time) => {
                         map.render(c);
                         char.render(c, bh);

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
        <div />
    )
}

export default Game;
