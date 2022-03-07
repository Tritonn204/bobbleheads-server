import ReactDOMServer from 'react-dom/server';
class Compositor {
    constructor() {
        this.layers = [];
    }

    draw = (scale, camera) => {
        return RENDA(this.layers, scale, camera);
    }
}

export const RENDA = (layers, scale, camera) => {
    return (
        <>
            {layers.map(layer => (
                <>
                    {layer(scale, camera)}
                </>
            ))
        }
        </>
    )
}

export default Compositor;
