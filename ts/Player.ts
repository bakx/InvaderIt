import "pixi-sound";
import { Character, CharacterAction } from "./Models/Character";
import { InteractiveEntities } from "./InteractiveEntities";
import { ActiveActionSprite } from "./ActiveActionSprite";
import { Point } from "pixi.js";
import { Game } from "./Game";
import { CanMove, PathFinding } from "./Utilities/PathFinding";
import { calculateMovement } from "./Functions";

export class Player extends InteractiveEntities {

    /** Constructor of the Enemy class */
    constructor(container: PIXI.Container, character: Character) {
        super(container, character);
    }

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
    update(game: Game) {
        let movementSpeed = 5;

        if (this.canMove && this.gotoPosition) {

            // Determine if position X needs to be updated
            this.position.x = calculateMovement(this.position.x, this.gotoPosition.x, movementSpeed);

            // Determine if position Y needs to be updated
            this.position.y = calculateMovement(this.position.y, this.gotoPosition.y, movementSpeed);

            // Set the position of the character
            this.character.position.x = this.position.x;
            this.character.position.y = this.position.y;
        }

        // Handle actions
        if (this.activeActionSprites.length > 0) {
            for (let i = 0; i < this.activeActionSprites.length; i++) {
                let action: ActiveActionSprite = this.activeActionSprites[i];

                if (action.markDelete) {

                    // Diagnostics
                    console.debug(`Removing  ${action.key} from the active action sprites`);

                    this.activeActionSprites.splice(i, 1);
                    continue;
                }

                // Get character action
                let actionDetails: CharacterAction = this.character.actions.get(action.key);

                // Update velocity
                action.sprite.position.x += actionDetails.velocity.x;
                action.sprite.position.y += actionDetails.velocity.y;
            }
        }

        super.updateHealthContainers();
    }

}