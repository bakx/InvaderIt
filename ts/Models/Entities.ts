export class Entities {
    data: Map<string, Entity> = new Map<string, Entity>();
}

export class Entity {
    /** Constructor of the Entity class  
    * @param id the id of the entity
    * @param sprite sprite of the entity
    */
    constructor(id: string, sprite: PIXI.Sprite) {
        this._id = id;
        this._sprite = sprite;
    }

    /** ID of this collection of animated sprites */
    private _id: string;

    /** Texture of the sprite */
    private _sprite: PIXI.Sprite;

    /** Get the id of this sprite */
    id(): string { return this._id }

    /** Get the sprite */
    sprite(): PIXI.Sprite { return this._sprite }
}