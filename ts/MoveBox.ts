export class MoveBox {
    /**  */
    constructor(minX: number, maxX: number, minY: number, maxY: number) {
        this._minX = minX;
        this._maxX = maxX;
        this._minY = minY;
        this._maxY = maxY;
    }
    private _minX: number;
    private _maxX: number;
    private _minY: number;
    private _maxY: number;
    get minX(): number {
        return this._minX;
    }
    get maxX(): number {
        return this._maxX;
    }
    get minY(): number {
        return this._minY;
    }
    get maxY(): number {
        return this._maxY;
    }
}
