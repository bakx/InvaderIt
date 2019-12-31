import "pixi-sound";
import { Point } from "pixi.js";
import { ActiveActionSprite } from "./ActiveActionSprite";
import { calculateMovement } from "./Functions";
import { Game } from "./Game";
import { InteractiveEntities } from "./InteractiveEntities";
import { Character, CharacterAction } from "./Models/Character";
import { CanMove, PathFinding } from "./Utilities/PathFinding";

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

        // Handle actions related to enemy
        this.handleActions(game);

        //
        this.gotoPosition.x = playerPosition.x;
        this.gotoPosition.y = playerPosition.y;

        if (this.canMove && this.gotoPosition) {


            if (this.position.x < this.moveBox.minX + (this.character.animation.width / 2) && this.reverseX) {
                this.reverseX = !this.reverseX;
            }


            if (this.position.x > this.moveBox.maxX - (this.character.animation.width / 2)) {
                this.reverseX = !this.reverseX;
            }


            if (this.position.y < this.moveBox.minY + (this.character.animation.height / 2) && this.reverseY) {
                this.reverseY = !this.reverseY;
            }

            if (this.position.y > this.moveBox.maxY - (this.character.animation.height / 2)) {
                this.reverseY = !this.reverseY;
            }

            // Determine if position Y needs to be updated

            // Add a 0.02% chance to flip position
            let randomMovement: number = Math.floor(Math.random() * 1000);

            if (randomMovement < 2) {
                this.reverseX = !this.reverseX;
            }

            let canMove: CanMove = PathFinding.enemyPaths(this.moveBox, this, game.enemies, this.character.movementSpeed);

            // Determine if position X needs to be updated
            //

            // Should this enemy move horizontally
            if (this.gotoPosition.x > this.position.x || !this.reverseX) {

                if (this.reverseX) {
                    this.character.movementSpeed = this.character.movementSpeed * -1;
                }

                /** */
                if (canMove.right) {
                    this.position.x = calculateMovement(this.position.x, this.gotoPosition.x, this.character.movementSpeed);
                }
                else {
                    console.warn(`Unable to move right for enemy ${this.id}`);
                    this.reverseX = !this.reverseX;
                }
            } else {

                if (this.reverseX) {
                    this.character.movementSpeed = this.character.movementSpeed * -1;
                }

                /** */
                if (canMove.left) {
                    this.position.x = calculateMovement(this.position.x, this.gotoPosition.x, this.character.movementSpeed);
                }
                else {
                    console.warn(`Unable to move left for enemy ${this.id}`);
                    this.reverseX = !this.reverseX;
                }
            }

            // Determine if position Y needs to be updated
            //

            // Should this enemy move vertically
            if (this.gotoPosition.y > this.position.y || !this.reverseY) {

                if (this.reverseY) {
                    this.character.movementSpeed = this.character.movementSpeed * -1;
                }

                /** */
                if (canMove.down) {
                    this.position.y = calculateMovement(this.position.y, this.gotoPosition.y, this.character.movementSpeed);
                }
                else {
                    console.warn(`Unable to move down for enemy ${this.id}`);
                    this.reverseY = !this.reverseY;
                }
            } else {

                if (this.reverseY) {
                    this.character.movementSpeed = this.character.movementSpeed * -1;
                }

                /** */
                if (canMove.up) {
                    this.position.y = calculateMovement(this.position.y, this.gotoPosition.y, this.character.movementSpeed);
                }
                else {
                    console.warn(`Unable to move up for enemy ${this.id}`);
                    this.reverseY = !this.reverseY;
                }
            }

            // Set the position of the character
            this.character.position.x = this.position.x;
            this.character.position.y = this.position.y;
        }

        // Regenerate shields?
        if (this.shield != this.shieldFull) {
            this.shield += this.shieldRechargeRate;
        }

        /**         */
        super.updateHealthContainers();
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