import ReactDOMServer from 'react-dom/server';
class Compositor {
    constructor() {
        this.layers = [];
    }

    draw = () => {
        return RENDA(this.layers);
    }
}

export const RENDA = (layers) => {
    return (
        <>
            {layers.map(layer => (
                <>
                    {layer()}
                </>
            ))
        }
        </>
    )
}

export default Compositor;
