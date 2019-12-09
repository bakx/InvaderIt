import { Point } from "pixi.js";
import { Character, CharacterAction } from "./Models/Character";
import { calculateMovement } from "./Functions";

export class Player {
    /** Constructor of the Player class */
    constructor(character: Character) {
        this._character = character;
        this._position = character.position;

        this._activeActionSprites = [];
    }

    // Character configuration
    private _character: Character;

    // Player movement
    private _canMove: boolean = true;
    private _position: Point;
    private _gotoPosition: Point;

    // Action configuration
    private _activeActionSprites: ActiveActionSprite[];

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

    action(actionKey: string, position: Point) {
        // Get action from character
        let characterAction: CharacterAction = this.character.actions.get(actionKey);

        switch (actionKey) {
            case "fire":
                // Create sprite
                let sprite = PIXI.Sprite.from(characterAction.entity.sprite().texture);

                // Set position
                sprite.position = this.character.position;

                // Add offset
                sprite.position.x += characterAction.offset.x;
                sprite.position.y += characterAction.offset.y;

                // Add to stage
                this.character.stage.addChild(sprite);

                // Create action class
                let activeActionSprite: ActiveActionSprite = new ActiveActionSprite("Doesn't matter", actionKey, sprite);

                // Add to collection to keep track
                this._activeActionSprites.push(activeActionSprite);
                break;

            default:
                throw new Error(`Character ${this.character.id} does not have an action ${actionKey}.`)
        }
    }

    /** Update all events related to the player */
    update() {
        let movementSpeed = 5;

        if (this._canMove && this._gotoPosition) {
            // Determine if position X needs to be updated
            this.position.x = calculateMovement(this.position.x, this._gotoPosition.x, movementSpeed);

            // Determine if position Y needs to be updated
            this.position.y = calculateMovement(this.position.y, this._gotoPosition.y, movementSpeed);

            // Set the position of the character
            this.character.position.x = this.position.x;
            this.character.position.y = this.position.y;
        }

        // Handle actions
        if (this._activeActionSprites.length > 0) {
            for (let i = 0; i < this._activeActionSprites.length; i++) {
                let action: ActiveActionSprite = this._activeActionSprites[i];

                // Get character action
                let actionDetails: CharacterAction = this.character.actions.get(action.key);

                // Update velocity
                action.sprite.position.x += actionDetails.velocity.x;
                action.sprite.position.y += actionDetails.velocity.y;
            }
        }
    }
}

/** Internal class to support action elements */
class ActiveActionSprite {
    /** Constructor of the ActiveActionSprite class */
    constructor(id: string, key: string, sprite: PIXI.Sprite) {
        this._key = key;
        this._sprite = sprite;
    }

    private _key: string;
    private _sprite: PIXI.Sprite;

    get key(): string {
        return this._key;
    }

    get sprite(): PIXI.Sprite {
        return this._sprite;
    }
}