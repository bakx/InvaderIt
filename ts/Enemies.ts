import "pixi-sound";
import { Point } from "pixi.js";
import { ActiveActionSprite } from "./ActiveActionSprite";
import { calculateMovement } from "./Functions";
import { Game } from "./Game";
import { Character, CharacterAction } from "./Models/Character";

export class Enemies {
    data: Map<string, Enemy> = new Map<string, Enemy>();
}

export class Enemy {
    /** Constructor of the Enemy class */
    constructor(character: Character) {
        this._character = character;
        this._position = character.position;

        this._activeActionSprites = [];
    }

    // Character configuration
    private _character: Character;

    // Enemy movement
    private _canMove: boolean = true;
    private _position: Point;
    private _gotoPosition: Point;
    private _reverse: boolean = false;
    private _moveBox: MoveBox;

    private _lastAction: number = Date.now();

    // Action configuration
    private _activeActionSprites: ActiveActionSprite[];

    // Enemy states
    private _life: number;
    private _shield: number;
    private _finalState: boolean = false;

    /** Get the unique id of enemy */
    get id(): string { return this._character.id }

    /** Get the position of enemy */
    get position(): Point { return this._position }

    /** Set the position of enemy */
    set position(position: Point) { this._position = position }

    /** Get the position the enemy should be moving towards */
    get gotoPosition(): Point { return this._gotoPosition }

    /** Set the position the enemy should be moving towards */
    set gotoPosition(gotoPosition: Point) { this._gotoPosition = gotoPosition }

    /** Get the character of this enemy */
    get character(): Character { return this._character }

    /** Set the character of this enemy */
    set character(character: Character) { this._character = character }

    /** Get the area in which the entity can move */
    get moveBox(): MoveBox { return this._moveBox }

    /** Set the area in which the entity can move */
    set moveBox(moveBox: MoveBox) { this._moveBox = moveBox }

    /** Get the life of enemy */
    get life(): number { return this._life }

    /** Set the life of enemy */
    set life(life: number) {
        console.debug(`Setting life for enemy ${this.id} to: ${life}`);

        this._life = life
    }

    /** Get the shield of enemy */
    get shield(): number { return this._shield }

    /** Set the shield of enemy */
    set shield(shield: number) {
        console.debug(`Setting shield for enemy ${this.id} to: ${shield}`);

        this._shield = shield
    }

    /** Is this enemy in it's final state (e.g., playing a destroy animation) */
    get finalState(): boolean { return this._finalState }

    /** Set the final state (e.g., playing a destroy animation) state of this enemy */
    set finalState(finalState: boolean) { this._finalState = finalState }

    /** Handle action */
    action(actionKey: string, position: Point) {

        // Get action from character
        let characterAction: CharacterAction = this.character.actions.get(actionKey);

        // Sanity check #1 - TODO update comment
        if (characterAction == null) {
            console.error(`${this.character.id} does not have action ${actionKey} defined.`);
            return;
        }
        // Sanity check #2 - TODO update comment
        if (characterAction.entity == null) {
            console.error(`${this.character.id} has an invalid action. Action ${characterAction?.id} has an invalid or missing sprite.`);
            return;
        }

        // Execute action
        switch (actionKey) {
            case "fire":
            case "missile":

                // Create sprite
                let sprite = PIXI.Sprite.from(characterAction.entity.sprite.texture);

                // Set position
                sprite.position = this.character.position;

                // Add offset
                sprite.position.x += characterAction.offset.x;
                sprite.position.y += characterAction.offset.y;

                // Scale?
                if (characterAction.scale) {
                    sprite.scale = characterAction.scale;
                }

                // Add to stage
                this.character.stage.addChild(sprite);

                // Create action class
                let activeActionSprite: ActiveActionSprite = new ActiveActionSprite(actionKey, sprite);

                // Add to collection to keep track
                this._activeActionSprites.push(activeActionSprite);

                // Play sound effect
                if (characterAction.entity.sound.id) {

                    if (PIXI.sound.exists(characterAction.entity.sound.id)) {
                        PIXI.sound.play(characterAction.entity.sound.id, {
                            volume: characterAction.entity.sound.volume
                        });
                    }
                    else {
                        console.error(`Missing sound effect: ${characterAction.entity.sound.id}`);
                    }
                }

                break;

            default:
                console.error(`Character ${this.character.id} does not have an action ${actionKey}.`);
        }
    }

    /** Plays a specific animation */
    playAnimation(state: string, cb: CallableFunction = null) {

        // Retrieve the animation key from the animation stage
        if (this._character.animationStates.has(state)) {
            let animationKey = this._character.animationStates.get(state);
            this._character.playSingleAnimation(animationKey, cb);
        } else {
            console.error(`Character ${this.character.id} does not support animation state ${state}.`);
        }
    }

    /** Update all events related to the enemy */
    update(game: Game) {
        let playerPosition: Point = game.player.position;

        if (this.life > 0 && Date.now() - this._lastAction > 750) {
            let actionTriggerOdds = Math.floor(Math.random() * 1000);

            if (actionTriggerOdds > 940 && actionTriggerOdds <= 990) {
                this._lastAction = Date.now();
                this.action("fire", playerPosition);
            }

            if (actionTriggerOdds > 990) {
                this._lastAction = Date.now();
                this.action("missile", playerPosition);
            }
        }

        if (!this._gotoPosition) this._gotoPosition = new Point();
        this._gotoPosition.x = playerPosition.x;
        this._gotoPosition.y = playerPosition.y;

        let movementSpeed = 3;

        if (this._canMove && this._gotoPosition) {

            if (this.position.x - movementSpeed < this.moveBox.minX + (this.character.animation.width / 2)) {
                this._reverse = true;
            }
            if (this.position.x - movementSpeed > this.moveBox.maxX - this.character.animation.width / 2) {
                this._reverse = false;
            }

            // Determine if position X needs to be updated
            this.position.x = calculateMovement(this.position.x, this._gotoPosition.x, movementSpeed * (this._reverse ? -1 : 1));

            // Determine if position Y needs to be updated
            this.position.y = calculateMovement(this.position.y, this._gotoPosition.y, movementSpeed);

            // Add a 0.02% chance to flip position
            let randomMovement: number = Math.floor(Math.random() * 1000);

            if (randomMovement < 2) {
                this._reverse = !this._reverse;
            }

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

                // If item is out of screen bounds, mark for delete
                if (action.sprite.position.x < game.app.screen.width || action.sprite.position.x > game.app.screen.width) {
                    action.markDelete = true;
                }
            }
        }
    }
}

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