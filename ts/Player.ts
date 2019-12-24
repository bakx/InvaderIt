import { Point } from "pixi.js";
import { ActiveActionSprite } from "./ActiveActionSprite";
import { calculateMovement } from "./Functions";
import { Character, CharacterAction } from "./Models/Character";

export class Player {

    /** Constructor of the Player class */
    constructor(character: Character) {
        this._character = character;
        this._position = character.position;
        this._activeActionSprites = [];
        this._actionTriggered = new Map<string, number>();
    }

    // Character configuration
    private _character: Character;

    // Player movement
    private _canMove: boolean = true;
    private _position: Point;
    private _gotoPosition: Point;

    // Active action sprites
    private _activeActionSprites: ActiveActionSprite[];

    // Keep track of triggered actions
    private _actionTriggered: Map<string, number>;

    // Drawing of the health bar
    private _healthBar: PIXI.Graphics;

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

    /** Get the active action sprites of this player */
    get activeActionSprites(): ActiveActionSprite[] { return this._activeActionSprites }

    /** Get mapping of triggererd actions and their trigger date */
    get actionTriggered(): Map<string, number> { return this._actionTriggered }

    /** Get the healthBar */
    get healthBar(): PIXI.Graphics { return this._healthBar }

    /** Handle the character action (e.g., firing a rocket) */
    action(actionKey: string, position: Point) {

        // Get action from character
        let characterAction: CharacterAction = this.character.actions.get(actionKey);

        // Is this action triggered before?
        if (this.actionTriggered.has(actionKey)) {
            let lastTrigger: number = this.actionTriggered.get(actionKey);

            // Check if the last trigger time exceeds the trigger timeout
            if (Date.now() - lastTrigger < characterAction.triggerTimeout) {

                // Diagnostics
                console.debug(`Action ${actionKey} ignored due trigger timeout ${characterAction.triggerTimeout} not met`);

                return;
            }
        }

        // Update mapping to indicate this action is firing
        this.actionTriggered.set(actionKey, Date.now());

        // Trigger action
        switch (actionKey) {
            case "fire":

                // Create sprite
                let sprite = PIXI.Sprite.from(characterAction.entity.sprite.texture);

                // Set position
                sprite.position = this.character.position;

                // Add offset
                sprite.position.x += characterAction.offset.x;
                sprite.position.y += characterAction.offset.y;

                // Add to stage
                this.character.stage.addChild(sprite);

                // Create action class
                let activeActionSprite: ActiveActionSprite = new ActiveActionSprite(actionKey, sprite);

                // Set properties
                activeActionSprite.lifetime = characterAction.lifetime;
                activeActionSprite.damage = characterAction.damage;

                // Add to collection to keep track
                this.activeActionSprites.push(activeActionSprite);

                // Play sound effect
                if (characterAction.entity.sound) {
                    PIXI.sound.play(characterAction.entity.sound.id, {
                        volume: characterAction.entity.sound.volume
                    });
                }

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

                if (action.markDelete) {

                    // Diagnostics
                    console.debug(`Removing  ${action.key} from the active action sprites`);

                    this._activeActionSprites.splice(i, 1);
                    continue;
                }

                // Get character action
                let actionDetails: CharacterAction = this.character.actions.get(action.key);

                // Update velocity
                action.sprite.position.x += actionDetails.velocity.x;
                action.sprite.position.y += actionDetails.velocity.y;
            }
        }
    }

    drawBar() {
        //Create the black background rectangle
        let innerBar = new PIXI.Graphics();
        innerBar.beginFill(0x000000);
        innerBar.drawRect(0, 0, 128, 8);
        innerBar.endFill();
        this.character.stage.addChild(innerBar);
    }
}