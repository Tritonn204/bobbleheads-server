import { useEffect, useState, useRef } from 'react';
import useScript from './hooks/useScript.js';
import socketIOClient from "socket.io-client";
import Compositor from './Compositor.js';

const layerManager = require('./modules/layers.js');
const gameLogic = require("./modules/main.js");
const assetManager = require("./modules/assets.js");
const physics = require("./modules/physics.js")

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
        try {
            socketRef.current = socketIOClient(ENDPOINT);
        }catch(e){
            //console.log(e);
        }
        loadLevel();
        scaleWindow();
        window.addEventListener('resize', scaleWindow);

        //Cleanup
        return () => {
            if (socketRef)
            socketRef.current.disconnect();
        }
    }, []);

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

        Promise.all([loadSprites,loadMap,loadPlayer])
            .then(([sprites, level, player]) => {
                const comp = new Compositor();

                const mapLayer = layerManager.createBG(level.layers, sprites, gWidth, gHeight);
                comp.layers.push(mapLayer);

                var lastTime;

                const char = new Entity();
                char.pos.set(100,500);
                char.vel.set(100,-800);

                char.update = function updateChar(delta) {
                    this.pos.x += this.vel.x*delta
                    this.pos.y += this.vel.y*delta;
                    this.vel.y += physics.gravity*delta;
                }

                const charLayer = layerManager.createCharLayer(player, char.pos);
                comp.layers.push(charLayer);

                const update = (time) => {
                    if (lastTime == undefined)
                        lastTime = time;
                    const delta = time - lastTime;
                    const deltaFactor = delta/1000;

                    lastTime = time;

                    char.update(deltaFactor);

                    requestAnimationFrame(update);
                }

                const render = (time) => {
                    if (lastTime == undefined)
                        lastTime = time;

                    const delta = time - lastTime;
                    const deltaFactor = delta/1000;

                    context.scale(gScale, gScale);
                    context.clearRect(0, 0, gWidth, gHeight);

                    comp.draw(context);
                    requestAnimationFrame(render);
                    context.resetTransform();
                }

                requestAnimationFrame(update);
                requestAnimationFrame(render);
            })
    });

    return (
        <>
            <canvas ref={canvasRef} width={gWidth} height={gHeight}/>
        </>
    )
}

class Entity {
    constructor() {
        this.pos = new Vec2(0,0);
        this.vel = new Vec2(0,0);
    }
}

class Vec2 {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }

    set(x, y){
        this.x = x;
        this.y = y;
    }
}

export default Game;
