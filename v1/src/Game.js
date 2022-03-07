import { useEffect, useState, useRef } from 'react';
import useScript from './hooks/useScript.js';
import socketIOClient from "socket.io-client";
import Compositor from './Compositor.js';

import { Stage, Sprite } from '@inlet/react-pixi'

import { createChar } from './modules/entities.js';
import Camera from './modules/camera.js';

import { Keyboard, KeyCodes } from './modules/input.js';
import { bindKeys } from './modules/controls.js';

const physics = require("./modules/physics.js");
const assetManager = require("./modules/assets.js");
const layerManager = require("./modules/layers.js");

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

    const updateCam = (char, level, delta) => {
      const {innerWidth : w, innerHeight: h } = window;

      var scaler = h/18;
      scaler = Math.max(24, scaler)/64;
      if (gScale != scaler)
          setGScale(scaler);

      camera.setSize(
         w/scaler,
         h/scaler
      );
      camera.update(char, level, delta);
    }

    //Initializes game on page load, after fetching required data from the server
    useEffect(() => {
        const loadMap = assetManager.loadLevel(0);
        const loadPlayer = assetManager.loadPlayer(0);

        const c = new Camera();

        Promise.all([loadMap,createChar(0)])
            .then(([map, char]) => {
                //Loads keyboard handling logic
                const input = new Keyboard();
                let lastTime = 0;
                let accumulatedTime = 0;
                let delta = 1/60;

                //Defines keybinds
                bindKeys(char,input,window);

                map.entities.add(char);
                setLevel(map);

                //Define the game loop update/render logic
                const update = (time) => {
                    setLevel(map);
                    setClock(Math.random());
                    //Compares real elapsed time with desired logic/physics framerate to maintain consistency
                    //accumulatedTime marks how many seconds have passed since the last logic update
                    accumulatedTime += (time - lastTime)/1000;
                    lastTime = time;

                    while (accumulatedTime > delta) {
                        map.update(delta);
                        updateCam(char, map, delta);
                        accumulatedTime -= delta;
                    }
                    gameLoop.current = requestAnimationFrame(update);
                }

                gameLoop.current = requestAnimationFrame(update);
            })
    }, []);

    const render = (scale) => {
        if (level)
        {
            return (
                <>
                    {level.comp.draw(scale, camera)}
                </>
            )
        }
    }

    return (
        <Stage ref={screenRef} options={{backgroundColor: 0x87CEEB, resizeTo: window}}>
            {render(gScale, camera)}
        </Stage>
    )
}

export default Game;
