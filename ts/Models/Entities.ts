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

    /** Sound of the sprite */
    private _sound: EntitySound;

    /** Get the id of this object */
    get id(): string { return this._id }

    /** Get the sprite */
    get sprite(): PIXI.Sprite { return this._sprite }

    /** Get the sound configuration of this entity */
    get sound(): EntitySound { return this._sound }

    /** Set the sound configuration of this entity */
    set sound(entitySound: EntitySound) { this._sound = entitySound }
}

export class EntitySound {
    /** Constructor of the EntitySound class  
    * @param id the id of the entity sound
    */
    constructor(id: string, volume: number) {
        this._id = id;
        this._volume = volume;
    }

    /** ID of this collection of animated sprites */
    private _id: string;

    /** Volume of the sound effect */
    private _volume: number;

    /** Get the id of this object */
    get id(): string { return this._id }

    /** Get the volume */
    get volume(): number { return this._volume }
}