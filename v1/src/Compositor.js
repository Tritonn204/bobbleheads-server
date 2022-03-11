import ReactDOMServer from 'react-dom/server';
class Compositor {
    constructor() {
        this.layers = [];
    }

    draw = (app, scale, camera) => {
        this.layers.map((layer, index) => {
            layer(app, scale, camera);
        })
    }
}

export default Compositor;
