import ReactDOMServer from 'react-dom/server';
class Compositor {
    constructor() {
        this.layers = [];
    }

    draw = (scale) => {
        return RENDA(this.layers, scale);
    }
}

export const RENDA = (layers, scale) => {
    return (
        <>
            {layers.map(layer => (
                <>
                    {layer(scale)}
                </>
            ))
        }
        </>
    )
}

export default Compositor;
