import { Point } from "pixi.js";
import { Character } from "./Models/Character";

export class Player {
    /** Constructor of the Player class */
    constructor(character: Character) {
        this._character = character;
        this._position = character.position;
    }

    // Character configuration
    private _character: Character;

    // Player movement
    private _canMove: boolean = true;
    private _position: Point;
    private _gotoPosition: Point;

    /** Get the unique id of player */
    get id(): string { return this._character.id }

    /** Get the position of player */
    get position(): Point { return this._position }

    /** Set the position of player */
    set position(position: Point) { this._position = position }

    /** Get the position the player should be moving towards */
    get gotoPosition(): Point { return this._gotoPosition }

    /** Set the position the player should be moving towards */
    set gotoPosition(gotoPosition: Point) { this._gotoPosition = gotoPosition }

    /** Get the character of this player */
    get character(): Character { return this._character }

    /** Set the character of this player */
    set character(character: Character) { this._character = character }

    /** Update all events related to the player */
    update() {
        if (this._gotoPosition) {

            if (this._gotoPosition.x < this.position.x) {
                this.position.x--;
            } else {
                this.position.x++;
            }

            if (this._gotoPosition.y < this.position.y) {
                this.position.y--;
            } else {
                this.position.y++;
            }

            this.character.position.x = this.position.x;
            this.character.position.y = this.position.y;
        }
    }
}