import { Sprite } from '@inlet/react-pixi';
import { drawTile } from "./tileutil.js";

export const createBG = (level, scale, cam) => {
    if (level.tileSet){
        return (
            <>
            {level.tiles.grid.map((column, x) => (
                column.map((tileId, y) => {
                    if (level.bgTiles.get(x,y)){
                        return(
                        <>
                            {drawTile(level.bgTiles.get(x,y),level,cam,x,y,scale)}
                            {drawTile(tileId,level,cam,x,y,scale)}
                        </>);
                    } else {
                        return(
                            <>
                            {drawTile(tileId,level,cam,x,y,scale)}
                            </>
                            );
                        }
                        }
                    )
                )
            )}
            </>
        )
    }
}


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
