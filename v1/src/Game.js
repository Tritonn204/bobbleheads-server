import { useEffect, useState, useRef } from 'react';
import useScript from './hooks/useScript.js';
import socketIOClient from "socket.io-client";
import Compositor from './Compositor.js';

import { Stage, Sprite } from '@inlet/react-pixi'

import { createChar } from './modules/entities.js';

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
    const canvasRef = useRef();
    const [gScale, setGScale] = useState();
    const [gWidth, setGWidth] = useState();
    const [gHeight, setGHeight] = useState();
    const [testLevel, setTestLevel] = useState();

    const [level, setLevel] = useState();
    const [comp, setComp] = useState();
    const [clock, setClock] = useState(0);

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

    //Sizes game window on page load, and enables dynamic resizing
    useEffect(() => {
        scaleWindow();
        addListeners();
    }, [])

    const addListeners = () => {
        window.addEventListener('resize', e => {
            scaleWindow();
        });
    }

    //Adjust game window size
    const scaleWindow = () => {
        var scaler = document.documentElement.clientHeight/18;
        scaler = Math.max(24, scaler);
        setGScale(scaler/64);
        setGWidth(document.documentElement.clientWidth);
        setGHeight(document.documentElement.clientHeight);
    }



    //Initializes game on page load, after fetching required data from the server
    useEffect(() => {

        const loadMap = assetManager.loadLevel(0);
        const loadPlayer = assetManager.loadPlayer(0);

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
                        accumulatedTime -= delta;
                    }
                    gameLoop.current = requestAnimationFrame(update);
                }

                gameLoop.current = requestAnimationFrame(update);
            })
    }, []);

    const render = () => {
        if (level)
        {
            return (
                <>
                    {level.comp.draw()}
                </>
            )
        }
    }

    return (
        <Stage width={gWidth} height={gHeight}>
            {render()}
        </Stage>
    )
}

export default Game;
