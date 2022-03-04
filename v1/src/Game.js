import { useEffect, useState, useRef } from 'react';
import useScript from './hooks/useScript.js';
import socketIOClient from "socket.io-client";
import Compositor from './Compositor.js';

import { Entity } from './modules/entity.js';
import { createChar } from './modules/entities.js';

import { GameLoop } from './modules/main.js';
import { Keyboard } from './modules/input.js'

const layerManager = require('./modules/layers.js');
const assetManager = require("./modules/assets.js");
const physics = require("./modules/physics.js");

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

    useEffect(() => {
        const connect = () => {
            try {
                socketRef.current = socketIOClient(ENDPOINT);
            }catch(e){
                //console.log(e);
            }

            //Cleanup
            return () => {
                if (socketRef)
                socketRef.current.disconnect();
            }
        }
        //connect();
    }, []);

    useEffect(() => {
        const initialize = () => {
            loadLevel();
            scaleWindow();

            //Add event listeners
            addListeners();
        }
        initialize();
    }, [])

    const addListeners = () => {
        window.addEventListener('resize', e => {
            scaleWindow();
        });
    }

    const loadLevel = async () => {
        fetch('res/levels/0/0.txt')
        .then(async(r) => {
            setTestLevel(await r.json());
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

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        const loadSprites = assetManager.loadLevelAssets(0);
        const loadMap = assetManager.loadLevelData(0);
        const loadPlayer = assetManager.loadPlayer(0);

        Promise.all([loadSprites,loadMap,createChar(0)])
            .then(([sprites, level, char]) => {
                const comp = new Compositor();

                const mapLayer = layerManager.createBG(level.layers, sprites, gWidth, gHeight);
                comp.layers.push(mapLayer);

                //Set position and velocity of the player object in testing
                char.pos.set(500,800);
                char.vel.set(100,-1200);

                const input = new Keyboard();
                input.addMapping(input.SPACE, keyState => {
                    if (keyState) {
                        char.jump.start();
                    } else {
                        char.jump.cancel();
                    }
                });

                input.listenTo(window);

                //Create sprite/draw layer for the player
                const charLayer = layerManager.createCharLayer(char);
                comp.layers.push(charLayer);

                //Initialize gameloop with logic/physics updating at a specified framerate
                const gameLoop = new GameLoop(1/60);
                //define update logic
                gameLoop.update = function update(delta) {
                    char.update(delta);
                }
                //define render logic, which happens after update
                gameLoop.render = function render() {
                    comp.draw(context);
                }

                gameLoop.start();
            })
    });

    return (
        <>
            <canvas ref={canvasRef} width={1000} height={1400}/>
        </>
    )
}

export default Game;
