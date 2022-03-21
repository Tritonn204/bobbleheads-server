import { Container } from 'pixi.js';
import { drawTile, updateTile } from "./tileutil.js";
import * as PIXI from "pixi.js";


export const createCharLayer = (entities, scale, cam) => {
    return (
        <>
        {Array.from(entities).map(entity => (
            <>
            {entity.draw(scale, cam)}
            </>
            )
        )}
        </>
    )
}
