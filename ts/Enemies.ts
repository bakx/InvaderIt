import "pixi-sound";
import { Point } from "pixi.js";
import { ActiveActionSprite } from "./ActiveActionSprite";
import { calculateMovement } from "./Functions";
import { Game } from "./Game";
import { Character, CharacterAction } from "./Models/Character";
import { MoveBox } from "./MoveBox";
import { Calculate } from "./Utilities/Calculate";

export class Enemy {

    /** Constructor of the Enemy class */
    constructor(stage: PIXI.Container, character: Character) {
        this._stage = stage;
        this.character = character;
        this.position = character.position;

        this._activeActionSprites = [];
    }

    // Pixi
    private _stage: PIXI.Container;

    // Enemy container
    private _container: PIXI.Container;

    // Character configuration
    private _characterContainer: PIXI.Container;
    private _character: Character;

    // Enemy movement
    private _canMove: boolean = true;
    private _position: Point;
    private _gotoPosition: Point;
    private _reverse: boolean = false;
    private _moveBox: MoveBox;

    // Action configuration
    private _activeActionSprites: ActiveActionSprite[];

    // Enemy statistics
    private _barWidth: number = 128;
    private _barHeight: number = 8;
    private _enemyStatistics: PIXI.Container;
    private _backgroundBar: PIXI.Graphics;
    private _healthBar: PIXI.Graphics;
    private _shieldsBar: PIXI.Graphics;

    private _life: number;
    private _lifeFull: number;
    private _shield: number;
    private _shieldFull: number;
    private _shieldRechargeRate: number;

    // Enemy states
    private _finalState: boolean = false;
    private _lastAction: number = Date.now();

    /** Get the unique id of enemy */
    get id(): string { return this._character.id; }

    /** Get the position of enemy */
    get position(): Point { return this._position; }

    /** Set the position of enemy */
    set position(position: Point) { this._position = position; }

    /** Get the position the enemy should be moving towards */
    get gotoPosition(): Point { return this._gotoPosition; }

    /** Set the position the enemy should be moving towards */
    set gotoPosition(gotoPosition: Point) { this._gotoPosition = gotoPosition; }

    /** Get the container of this enemy */
    get container(): PIXI.Container { return this._container; }

    /** Set the container of this enemy */
    set container(container: PIXI.Container) { this._container = container; }

    /** Get the character container of this enemy */
    get characterContainer(): PIXI.Container { return this._characterContainer; }

    /** Set the character container of this enemy */
    set characterContainer(characterContainer: PIXI.Container) { this._characterContainer = characterContainer; }

    /** Get the character of this enemy */
    get character(): Character { return this._character; }

    /** Set the character of this enemy */
    set character(character: Character) { this._character = character; }

    /** Get the area in which the entity can move */
    get moveBox(): MoveBox { return this._moveBox; }

    /** Set the area in which the entity can move */
    set moveBox(moveBox: MoveBox) { this._moveBox = moveBox; }

    /** Get the statistics container */
    get enemyStatistics(): PIXI.Container { return this._enemyStatistics; }

    /** Set the statistics container */
    set enemyStatistics(enemyStatistics: PIXI.Container) { this._enemyStatistics = enemyStatistics; }

    /** Get the life of enemy */
    get life(): number { return this._life; }

    /** Set the life of enemy */
    set life(life: number) {
        this._life = life;

        // Update health bar
        this.updateHealthbars();
    }

    /** Get the life of enemy */
    get lifeFull(): number { return this._lifeFull; }

    /** Set the life of enemy */
    set lifeFull(lifeFull: number) {
        this._lifeFull = lifeFull;

        // Update health bar
        this.updateHealthbars();
    }

    /** Get the shield of enemy */
    get shield(): number { return this._shield; }

    /** Set the shield of enemy */
    set shield(shield: number) {
        this._shield = shield;

        // Update health bar
        this.updateHealthbars();
    }

    /** Get the shield of enemy */
    get shieldFull(): number { return this._shieldFull; }

    /** Set the shield of enemy */
    set shieldFull(shieldFull: number) {
        this._shieldFull = shieldFull;

        // Update health bar
        this.updateHealthbars();
    }

    /** Get the shield recharge of character */
    get shieldRechargeRate(): number { return this._shieldRechargeRate; }

    /** Set the shield recharge rate of character */
    set shieldRechargeRate(shieldRechargeRate: number) { this._shieldRechargeRate = shieldRechargeRate; }

    /** Is this enemy in it's final state (e.g., playing a destroy animation) */
    get finalState(): boolean { return this._finalState; }

    /** Set the final state (e.g., playing a destroy animation) state of this enemy */
    set finalState(finalState: boolean) { this._finalState = finalState; }

    /** Initialize all properties related to the enemy. This function needs to be called to render
     * the item to the screen. It creates the container objects and sets up the health bars .
     */
    init() {

        // Create container that stores the character and other items
        this.container = new PIXI.Container();

        // Create container that stores the character
        this.characterContainer = new PIXI.Container();
        this.characterContainer.zIndex = 10;

        // Add the character
        this.characterContainer.addChild(this.character.animation);

        // Add the character container to the global container
        this.container.addChild(this.characterContainer);

        // Initialize statistics
        this.life = this.lifeFull;
        this.shield = this.shieldFull;

        // Create the statistics bar
        this.createHealthBars();

        // Add container to stage
        this.addStage();
    }

    /** Add container to stage */
    addStage() {
        this._stage.addChild(this.container);
    }
    /** Remove container to stage */
    removeStage() {
        this._stage.removeChild(this.container);
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
    playAnimation(state: string, cb: CallableFunction = null, attachChildren: boolean = true) {

        // Retrieve the animation key from the animation stage
        if (this.character.animationStates.has(state)) {
            let animationKey = this._character.animationStates.get(state);
            this.character.playSingleAnimation(this.characterContainer, animationKey, 0, cb, attachChildren);
        } else {
            console.error(`Character ${this.character.id} does not support animation state ${state}.`);
        }
    }

    /** */
    hasCollision(game: Game, action: ActiveActionSprite) {
        // Prevent retriggering the event for this action element
        action.triggerEvents = false;


        this.shield -= action.damage;

        if (this.shield < 0) {
            this.life -= action.damage;
        }
        // Check life of entity
        if (this.life > 0) {

            // Trigger hit animation
            this.playAnimation("hit");

        } else {

            // Determine if this enemy is already in it's final state
            if (this.finalState) {
                console.info(`Enemy ${this.id} indicates final state. Ignoring...`);
                return;
            }

            // Hide health bar
            this._backgroundBar.width = 0;

            // Mark enemy as final state
            this.finalState = true;

            // create reference to current instance
            let g = this;

            // Trigger death animation - TODO This needs to trigger the enemy specific DEATH property
            this.playAnimation("death", () => {

                // Remove the character from the stage
                this.removeStage();

                // Remove the enemies from the list
                game.enemies.delete(this.id);
            });

        }
    }

    /** Create the statistics group that contains the health and shield bars */
    createHealthBars() {

        // Create the container object
        this.enemyStatistics = new PIXI.Container();
        this.enemyStatistics.zIndex = 10;

        // Attach is as a child object
        this.container.addChild(this.enemyStatistics);

        // Create the background rectangle
        this._backgroundBar = new PIXI.Graphics();
        this._backgroundBar.beginFill(0x000000);
        this._backgroundBar.drawRect(0, 0, this._barWidth, this._barHeight * 2);
        this._backgroundBar.endFill();

        this.enemyStatistics.addChild(this._backgroundBar);

        // Create the health bar
        this._healthBar = new PIXI.Graphics();
        this._healthBar.beginFill(0x6EE544);
        this._healthBar.drawRect(0, 0, this._barWidth, this._barHeight);
        this._healthBar.endFill();

        this._backgroundBar.addChild(this._healthBar);

        // Create the shields bar
        this._shieldsBar = new PIXI.Graphics();
        this._shieldsBar.beginFill(0x0094FF);
        this._shieldsBar.drawRect(0, this._barHeight, this._barWidth, this._barHeight);
        this._shieldsBar.endFill();

        this._backgroundBar.addChild(this._shieldsBar);
    }

    /** */
    updateHealthbars() {
        if (this.life && this.shield && this._healthBar && this._shieldsBar) {

            this._healthBar.width = Calculate.getBarWidth(this._barWidth, this.life, this.lifeFull);
            this._shieldsBar.width = Calculate.getBarWidth(this._barWidth, this.shield, this.shieldFull);
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

            // Update the statistics bar
            this.enemyStatistics.position.set(this.character.animation.position.x + this.character.animation.width / 2 - this.enemyStatistics.width, this.character.position.y + 10);
        }

        // Regenerate shields?
        if (this.shield != this.shieldFull) {
            this.shield += this.shieldRechargeRate;
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