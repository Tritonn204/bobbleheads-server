export class Vec2 {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }

    lerp(vec, amt) {
        this.x = (1-amt)*this.x+(amt*vec.x);
        this.y = (1-amt)*this.y+(amt*vec.y);
    }
}

export const lerp = (start, end, amt) => {
  return ((1-amt)*start+(amt*end));
}

export class Matrix {
    constructor() {
        this.grid = [];
    }

    get(x, y) {
        const col = this.grid[x];
        if (col) {
            return col[y];
        }
        return undefined;
    }

    set(x, y, value) {
        if (!this.grid[x]) {
            this.grid[x] = [];
        }
        this.grid[x][y] = value;
    }
}
