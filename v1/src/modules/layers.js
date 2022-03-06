import { Sprite } from '@inlet/react-pixi';
import { drawTile } from "./tileutil.js";

export const createBG = (level) => {
    if (level.tileSet){
        return (
            <>
            {level.tiles.grid.map((column, x) => (
                column.map((tileId, y) => {
                    if (level.bgTiles.get(x,y)){
                        return(
                        <>
                            {drawTile(level.bgTiles.get(x,y),level.tileSet,x,y)}
                            {drawTile(tileId,level.tileSet,x,y)}
                        </>);
                    } else {
                        return(
                            <>
                            {drawTile(tileId,level.tileSet,x,y)}
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


export const createCharLayer = (entities) => {
    return (
        <>
        {Array.from(entities).map(entity => (
            <>
            {entity.draw()}
            </>
            )
        )}
        </>
    )
}
