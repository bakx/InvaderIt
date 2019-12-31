import "pixi-sound";
import { Point } from "pixi.js";
import { ActiveActionSprite } from "./ActiveActionSprite";
import { Game } from "./Game";
import { Character } from "./Models/Character";
import { DrawText } from "./Models/DrawText";
import { MoveBox } from "./MoveBox";
import { Calculate } from "./Utilities/Calculate";

export class InteractiveEntities {

    /** Constructor of the InteractiveEntities class */
    constructor(container: PIXI.Container, character: Character) {
        this._stage = container;
        this._character = character;
        this._position = character.position;
        this._gotoPosition = new Point();
        this._activeActionSprites = [];
        this._actionTriggered = new Map<string, number>();
    }

    // Pixi
    private _stage: PIXI.Container;

    // Enemy container
    private _container: PIXI.Container;

    // Character configuration
    private _characterContainer: PIXI.Container;
    private _character: Character;

    // Enemy movement
    private _position: Point;
    private _gotoPosition: Point;
    private _canMove: boolean = true;
    private _reverseX: boolean = false;
    private _reverseY: boolean = false;
    private _moveBox: MoveBox;

    // Action configuration
    private _activeActionSprites: ActiveActionSprite[];
    private _actionTriggered: Map<string, number>;

    // Entity statistics
    private _barWidth: number = 128;
    private _barHeight: number = 8;
    private _idContainer: PIXI.Container;
    private _statisticsContainer: PIXI.Container;
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

    /** Get the unique id of entity */
    get id(): string { return this._character.id; }

    // Entity container

    /** Get the container of this enemy */
    get container(): PIXI.Container { return this._container; }

    /** Set the container of this enemy */
    set container(container: PIXI.Container) { this._container = container; }

    // Character configuration

    /** Get the character container of this enemy */
    get characterContainer(): PIXI.Container { return this._characterContainer; }

    /** Set the character container of this enemy */
    set characterContainer(characterContainer: PIXI.Container) { this._characterContainer = characterContainer; }

    /** Get the character of this enemy */
    get character(): Character { return this._character; }

    /** Set the character of this enemy */
    set character(character: Character) { this._character = character; }

    // Enemy movement

    /** Get the position of entity */
    get position(): Point { return this._position; }

    /** Set the position of entity */
    set position(position: Point) { this._position = position; }

    /** Get the position the enemy should be moving towards */
    get gotoPosition(): Point { return this._gotoPosition; }

    /** Set the position the enemy should be moving towards */
    set gotoPosition(gotoPosition: Point) { this._gotoPosition = gotoPosition; }

    /** Get the statistics container */
    get canMove(): boolean { return this._canMove; }

    /** Set the area in which the entity can move */
    set canMove(canMove: boolean) { this._canMove = canMove; }

    /** Should the X movement be reversed? */
    get reverseX(): boolean { return this._reverseX; }

    /** Set the area in which the entity can move */
    set reverseX(reverseX: boolean) { this._reverseX = reverseX; }

    /** Should the Y movement be reversed? */
    get reverseY(): boolean { return this._reverseY; }

    /** Set the area in which the entity can move */
    set reverseY(reverseY: boolean) { this._reverseY = reverseY; }

    /** Get the area in which the entity can move */
    get moveBox(): MoveBox { return this._moveBox; }

    /** Set the area in which the entity can move */
    set moveBox(moveBox: MoveBox) { this._moveBox = moveBox; }

    // Action configuration

    /** Get the statistics container */
    get activeActionSprites(): ActiveActionSprite[] { return this._activeActionSprites; }

    /** Set the statistics container */
    set activeActionSprites(activeActionSprites: ActiveActionSprite[]) { this._activeActionSprites = activeActionSprites; }

    /** */
    public get actionTriggered(): Map<string, number> {
        return this._actionTriggered;
    }

    /** */
    public set actionTriggered(actionTriggered: Map<string, number>) {
        this._actionTriggered = actionTriggered;
    }

    // Entity statistics

    /** Get the id container of this entity */
    get idContainer(): PIXI.Container { return this._idContainer; }

    /** Set the id container of this entity */
    set idContainer(idContainer: PIXI.Container) { this._idContainer = idContainer; }

    /** Get the statistics container */
    get statisticsContainer(): PIXI.Container { return this._statisticsContainer; }

    /** Set the statistics container */
    set statisticsContainer(enemyStatistics: PIXI.Container) { this._statisticsContainer = enemyStatistics; }



    /** Get the life of entity */
    get life(): number { return this._life; }

    /** Set the life of entity */
    set life(life: number) {
        this._life = life;

        // Update health bar
        this.updateHealthbars();
    }

    /** Get the life of entity */
    get lifeFull(): number { return this._lifeFull; }

    /** Set the life of entity */
    set lifeFull(lifeFull: number) {
        this._lifeFull = lifeFull;

        // Update health bar
        this.updateHealthbars();
    }

    /** Get the shield of entity */
    get shield(): number { return this._shield; }

    /** Set the shield of entity */
    set shield(shield: number) {
        this._shield = shield;

        if (this.shield > this.shieldFull) {
            this.shield = this.shieldFull;
        }

        // Update health bar
        this.updateHealthbars();
    }

    /** Get the shield of entity */
    get shieldFull(): number { return this._shieldFull; }

    /** Set the shield of entity */
    set shieldFull(shieldFull: number) {
        this._shieldFull = shieldFull;

        // Update health bar
        this.updateHealthbars();
    }

    /** Get the shield recharge of entity */
    get shieldRechargeRate(): number { return this._shieldRechargeRate; }

    /** Set the shield recharge rate of entity */
    set shieldRechargeRate(shieldRechargeRate: number) { this._shieldRechargeRate = shieldRechargeRate; }

    // Entity states

    /** Is this entity in it's final state (e.g., playing a destroy animation) */
    get finalState(): boolean { return this._finalState; }

    /** Set the final state (e.g., playing a destroy animation) state of this entity */
    set finalState(finalState: boolean) { this._finalState = finalState; }

    /** */
    public get lastAction(): number { return this._lastAction; }

    /** */
    public set lastAction(lastAction: number) { this._lastAction = lastAction; }

    /** Initialize all properties related to the entity. This function needs to be called to render
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

        // Debug
        this._idContainer = new PIXI.Container();
        new DrawText(this._idContainer, this.id, this.characterContainer.x, this.character.animation.height);
        this.container.addChild(this._idContainer);

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
        this.statisticsContainer = new PIXI.Container();
        this.statisticsContainer.zIndex = 10;

        // Attach is as a child object
        this.container.addChild(this.statisticsContainer);

        // Create the background rectangle
        this._backgroundBar = new PIXI.Graphics();
        this._backgroundBar.beginFill(0x000000);
        this._backgroundBar.drawRect(0, 0, this._barWidth, this._barHeight * 2);
        this._backgroundBar.endFill();

        this.statisticsContainer.addChild(this._backgroundBar);

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

    /** */
    updateHealthContainers() {

        // Update the statistics bar
        this.statisticsContainer.position.set(this.character.animation.position.x + this.character.animation.width / 2 - this.statisticsContainer.width / 2, this.character.position.y - 20);

        // Update debug text
        this.idContainer.position.set(this.character.animation.position.x + this.character.animation.width / 2 - this.idContainer.width / 2, this.character.position.y + 10);
    }
}