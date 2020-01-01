import "pixi-sound";
import { Point } from "pixi.js";
import { ActiveActionSprite } from "./ActiveActionSprite";
import { calculateMovement } from "./Functions";
import { Game } from "./Game";
import { InteractiveEntities } from "./InteractiveEntities";
import { Character, CharacterAction } from "./Models/Character";
import { MoveDirections, PathFinding } from "./Utilities/PathFinding";

export class Enemy extends InteractiveEntities {

    /** Constructor of the Enemy class */
    constructor(container: PIXI.Container, character: Character) {
        super(container, character);
    }

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
                this.activeActionSprites.push(activeActionSprite);

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

    /** Update all events related to the enemy */
    update(game: Game) {
        let playerPosition: Point = game.player.position;

        if (this.life < 0) {
            return;
        }

        // Handle actions related to enemy
        this.handleActions(game);

        // If the enemy can move
        if (this.canMove) {

            // Update the desired position
            this.gotoPosition.x = playerPosition.x;
            this.gotoPosition.y = playerPosition.y;

            this.handleMovement(game);
        }

        // Regenerate shields?
        if (this.shield != this.shieldFull) {
            this.shield += this.shieldRechargeRate;
        }

        // Update the position of the health containers
        super.updateHealthContainers();
    }

    /** */
    handleMovement(game: Game) {

        // Determine which directions this entity can move to
        let moveDirections: MoveDirections = PathFinding.entityPaths(this.moveBox, this, game.enemies, this.character.movementSpeed);

        // Determine which direction to go
        // 

        let wantMoveLeft: boolean = this.reverseX;
        let wantMoveRight: boolean = !wantMoveLeft;

        if (wantMoveLeft && !moveDirections.left) {
            this.reverseX = false;
        }

        if (wantMoveRight && !moveDirections.right) {
            this.reverseX = true;
        }

        // Handle horizontal movement
        if (moveDirections.left || moveDirections.right) {

            // Set speed
            let speed = this.character.movementSpeed * (this.reverseX ? -1 : 1);

            // Move character
            this.position.x = calculateMovement(this.position.x, this.gotoPosition.x, speed);
        }
        else {
            console.warn(`Unable to move horizontally for enemy ${this.id}`);
        }

        // Handle vertical movement
        if (moveDirections.up || moveDirections.down) {

            if (moveDirections.up) {
                this.position.y = calculateMovement(this.position.y, this.gotoPosition.y, this.character.movementSpeed * -1);
            } else if (moveDirections.down) {
                    this.position.y = calculateMovement(this.position.y, this.gotoPosition.y, this.character.movementSpeed);
                }
        }
        else {
            console.warn(`Unable to move vertically for enemy ${this.id}`);
        }


        // Set the position of the character
        this.character.position.x = this.position.x;
        this.character.position.y = this.position.y;

        this.debugPosition.Text = `x: ${this.position.x} y: ${this.position.y}`;

    }

    /** */
    handleActions(game: Game) {

        /** */
        let playerPosition: Point = game.player.position;

        if (this.life > 0 && Date.now() - this.lastAction > 750) {
            let actionTriggerOdds = Math.floor(Math.random() * 1000);

            if (actionTriggerOdds > 940 && actionTriggerOdds <= 990) {
                this.lastAction = Date.now();
                this.action("fire", playerPosition);
            }

            if (actionTriggerOdds > 990) {
                this.lastAction = Date.now();
                this.action("missile", playerPosition);
            }
        }

        game.debugHelper.Text = `Action Sprites: ${this.activeActionSprites.length}`;

        // Handle actions
        if (this.activeActionSprites.length > 0) {
            for (let i = 0; i < this.activeActionSprites.length; i++) {
                let action: ActiveActionSprite = this.activeActionSprites[i];

                // Get character action
                let actionDetails: CharacterAction = this.character.actions.get(action.key);

                // Update velocity
                action.sprite.position.x += actionDetails.velocity.x;
                action.sprite.position.y += actionDetails.velocity.y;

                // If item is out of screen bounds, mark for delete
                if (action.sprite.position.x > game.app.screen.width || action.sprite.position.x < game.app.screen.width * -1) {
                    action.markDelete = true;
                }

                if (action.markDelete) {

                    // Diagnostics
                    console.debug(`Removing  ${action.key} from the active action sprites`);

                    this.activeActionSprites.splice(i, 1);
                    continue;
                }
            }
        }
    }
}