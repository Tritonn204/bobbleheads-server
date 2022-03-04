import { useEffect, useState, useRef } from 'react';
import useScript from './hooks/useScript.js';
import socketIOClient from "socket.io-client";

const gameUtils = require("./modules/utils.js");

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
        const A = document.documentElement.clientWidth/baseWidth;
        const B = document.documentElement.clientHeight/baseHeight;
        const SCALE = Math.min(A,B);
        setGScale(SCALE);
        setGWidth(baseWidth*SCALE);
        setGHeight(baseHeight*SCALE);
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.resetTransform();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#24b4ed";
        context.fillRect(0, 0, canvas.width, canvas.height);
        //Scale game window to fit
        context.scale(gScale,gScale);

        gameUtils.loadImage('/res/levels/0/0.png')
        .then(image => {
            const sprites = new gameUtils.SpriteSheet(image, 64, 64);
            for (let i = 0; i < testLevel.layers.length; i++){
                const tiles = testLevel.layers[i].positions;
                for(let j = 0; j < tiles.length; j++){
                    sprites.drawTile(tiles[j].id,context,tiles[j].x,tiles[j].y);
                }
            }
        })
    });

    return (
        <>
        <canvas ref={canvasRef} width={gWidth} height={gHeight}/>
        </>
    )
}

export default Game;
