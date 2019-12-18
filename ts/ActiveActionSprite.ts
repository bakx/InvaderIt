/** Support action elements */
export class ActiveActionSprite {
    /** Constructor of the ActiveActionSprite class */
    constructor(key: string, sprite: PIXI.Sprite, triggerEvents: boolean = true) {
        this._key = key;
        this._sprite = sprite;
        this._triggerEvents = triggerEvents;
    }
    private _key: string;
    private _sprite: PIXI.Sprite;
    private _markDelete: boolean;
    private _triggerEvents: boolean;

    /** */
    get key(): string {
        return this._key;
    }

    /** */
    get sprite(): PIXI.Sprite {
        return this._sprite;
    }

    /** */
    get markDelete(): boolean {
        return this._markDelete;
    }

    /** */
    set markDelete(markDelete: boolean) {
        this._markDelete = markDelete;
    }

    /** */
    get triggerEvents(): boolean {
        return this._triggerEvents;
    }

    /** */
    set triggerEvents(triggerEvents: boolean) {
        this._triggerEvents = triggerEvents;
    }
}
