import { Sprite } from '@inlet/react-pixi';
import { drawTile } from "./tileutil.js";

export const createBG = (level, scale) => {
    if (level.tileSet){
        return (
            <>
            {level.tiles.grid.map((column, x) => (
                column.map((tileId, y) => {
                    if (level.bgTiles.get(x,y)){
                        return(
                        <>
                            {drawTile(level.bgTiles.get(x,y),level,x,y,scale)}
                            {drawTile(tileId,level,x,y,scale)}
                        </>);
                    } else {
                        return(
                            <>
                            {drawTile(tileId,level,x,y,scale)}
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


export const createCharLayer = (entities, scale) => {
    return (
        <>
        {Array.from(entities).map(entity => (
            <>
            {entity.draw(scale)}
            </>
            )
        )}
        </>
    )
}
