import { Guid } from "guid-typescript";

/** Support action elements */
export class ActiveActionSprite {
    /** Constructor of the ActiveActionSprite class */
    constructor(key: string, sprite: PIXI.Sprite, triggerEvents: boolean = true) {
        this._id = Guid.create().toString();
        this._key = key;
        this._sprite = sprite;
        this._triggerEvents = triggerEvents;
        this._lifetime = -1;
    }

    private _id: string;
    private _key: string;
    private _sprite: PIXI.Sprite;
    private _markDelete: boolean;
    private _triggerEvents: boolean;
    private _triggerTime: Date;
    private _lifetime: number;

    /** Get the id of object */
    get id(): string { return this._id }

    /** Get the action key of object */
    get key(): string {
        return this._key;
    }

    /** Get the sprite of the action element */
    get sprite(): PIXI.Sprite {
        return this._sprite;
    }

    /** Is this action element marked for deletion? */
    get markDelete(): boolean {
        return this._markDelete;
    }

    /** Set the flag that determines if this action element gets deleted on the next frame */
    set markDelete(markDelete: boolean) {
        this._markDelete = markDelete;
    }

    /** Is this action element triggerable? */
    get triggerEvents(): boolean {
        return this._triggerEvents;
    }

    /** Set the flag that determines if this action element can be triggered */
    set triggerEvents(triggerEvents: boolean) {
        this._triggerEvents = triggerEvents;
    }

    /** When was the action element triggered? */
    get triggerTime(): Date {
        return this._triggerTime;
    }

    /** Set the date when was the action element was triggered */
    set triggerTime(triggerTime: Date) {
        this._triggerTime = triggerTime;
    }

    /** Get the lifetime of this action element (in milliseconds) */
    get lifetime(): number {
        return this._lifetime;
    }

    /** Set the lifetime of this action element (in milliseconds) */
    set lifetime(lifetime: number) {
        this._lifetime = lifetime;
    }
}
