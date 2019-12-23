import { Point } from "pixi.js";
import { AnimationDetails, AnimationSprite } from "./AnimatedSprite";
import { Entity } from "./Entities";

export class Characters {
    data: Map<string, Character> = new Map<string, Character>();
}

export class Character {
    /** Constructor of the Character class (thanks captain obvious comment - TODO) */
    constructor(id: string) {
        this._id = id;
        this._actions = new Map<string, CharacterAction>();
        this._position = new Point();
    }

    // Character configuration

    private _id: string;
    private _isPlayer: boolean;
    private _defaultAnimationKey: string;
    private _defaultAnimationSpeed: number;
    private _animationDetails: Map<string, AnimationDetails>;
    private _animationStates: Map<string, string>;
    private _actions: Map<string, CharacterAction>;

    // Stage settings

    private _stage: PIXI.Container;
    private _position: Point;

    // Health settings

    private _life: number;
    private _shield: number;

    // Animation settings

    private _animation: PIXI.AnimatedSprite;
    private _animationSpeed: number;
    private _animationSource: AnimationSprite;
    private _animationKey: string;

    // Restore animation settings
    private _restoreAnimationKey: string;
    private _isPlayingSingleAnimation: boolean;
    private _restoreAutoPlay: boolean = true;
    private _restoreLoop: boolean = true;
    private _restoreInteractive: boolean = true;

    // Play settings

    private _autoPlay: boolean = true;
    private _loop: boolean = true;
    private _interactive: boolean = true;

    /** Get the id of object */
    get id(): string { return this._id }

    /** Is this a playable character? */
    get isPlayer(): boolean { return this._isPlayer }

    /** Is this a playable character? */
    set isPlayer(isPlayer: boolean) { this._isPlayer = isPlayer }

    /** Get the default animation key of character */
    get defaultAnimationKey(): string { return this._defaultAnimationKey }

    /** Set the default animation key of character */
    set defaultAnimationKey(defaultAnimationKey: string) { this._defaultAnimationKey = defaultAnimationKey }

    /** Get the default animation speed of character */
    get defaultAnimationSpeed(): number { return this._defaultAnimationSpeed }

    /** Set the default animation speed of character */
    set defaultAnimationSpeed(defaultAnimationSpeed: number) { this._defaultAnimationSpeed = defaultAnimationSpeed }

    /** Get the animation details of character */
    get animationDetails(): Map<string, AnimationDetails> { return this._animationDetails }

    /** Set the animation details of character */
    set animationDetails(animationDetails: Map<string, AnimationDetails>) { this._animationDetails = animationDetails }

    /** Get the animation states of character */
    get animationStates(): Map<string, string> { return this._animationStates }

    /** Set the animation states of character */
    set animationStates(animationStates: Map<string, string>) { this._animationStates = animationStates }

    /** Get the actions of character */
    get actions(): Map<string, CharacterAction> { return this._actions }

    /** Set the actions of character */
    set actions(actions: Map<string, CharacterAction>) { this._actions = actions }

    /** Get the stage of character */
    get stage(): PIXI.Container { return this._stage }

    /** Set the stage of character */
    set stage(stage: PIXI.Container) { this._stage = stage }

    /** Get the position of character */
    get position(): Point { return this._position }

    /** Set the position of character */
    set position(position: Point) {
        console.debug(`Position for character ${this.id} is x:${this.position.x}, y:${this.position.y}`);

        this._position = position
    }

    /** Get the life of character */
    get life(): number { return this._life }

    /** Set the life of character */
    set life(life: number) {
        console.debug(`Setting life for character ${this.id} to: ${life}`);

        this._life = life
    }

    /** Get the shield of character */
    get shield(): number { return this._shield }

    /** Set the shield of character */
    set shield(shield: number) {
        console.debug(`Setting shield for character ${this.id} to: ${shield}`);

        this._shield = shield
    }

    /** Get the animation source of character */
    get animationSource(): AnimationSprite { return this._animationSource }

    /** Set the animation source of character */
    set animationSource(animationSource: AnimationSprite) { this._animationSource = animationSource }

    /** Get the animation key of character */
    get animationKey(): string { return this._animationKey }

    /** Set the animation key of character */
    set animationKey(animationKey: string) { this._animationKey = animationKey }

    /** If a single animation is playing, this key is used to 'restore' to the previous state */
    get restoreAnimationKey(): string { return this._restoreAnimationKey }

    /** Set the animation key that should be playing after a single animation was played (e.g., when a character gets hit and needs to be restored to their default animation) */
    set restoreAnimationKey(restoreAnimationKey: string) { this._restoreAnimationKey = restoreAnimationKey }

    /** Is the animation effect playing automatically? */
    get restoreAutoPlay(): boolean { return this._restoreAutoPlay }

    /** Restore the autoplay value of the animation that was playing before a single animation was played (e.g., when a character gets hit and needs to be restored to their default animation settings) */
    set restoreAutoPlay(restoreAutoPlay: boolean) { this._restoreAutoPlay = restoreAutoPlay }

    /** Is the animation effect of this character looping? */
    get restoreLoop(): boolean { return this._restoreLoop }

    /** Restore the loop value of the animation that was playing before a single animation was played (e.g., when a character gets hit and needs to be restored to their default animation settings) */
    set restoreLoop(restoreLoop: boolean) { this._restoreLoop = restoreLoop }

    /** Is this character interactive? */
    get restoreInteractive(): boolean { return this._restoreInteractive }

    /** Restore the character interactive value of the animation that was playing before a single animation was played (e.g., when a character gets hit and needs to be restored to their default animation settings) */
    set restoreInteractive(restoreInteractive: boolean) { this._restoreInteractive = restoreInteractive }

    /** Is a single animation effect playing? */
    get isPlayingSingleAnimation(): boolean { return this._isPlayingSingleAnimation }

    /** Set the flag that indicates that a single animation is playing */
    set isPlayingSingleAnimation(isPlayingSingleAnimation: boolean) { this._isPlayingSingleAnimation = isPlayingSingleAnimation }

    /** Is the animation effect playing automatically? */
    get autoPlay(): boolean { return this._autoPlay }

    /** Should the animation effect play automatically? */
    set autoPlay(autoPlay: boolean) { this._autoPlay = autoPlay }

    /** Is the animation effect of this character looping? */
    get loop(): boolean { return this._loop }

    /** Should the animation effect of this character loop? */
    set loop(loop: boolean) { this._loop = loop }

    /** Is this character interactive? */
    get interactive(): boolean { return this._interactive }

    /** Is this character interactive? */
    set interactive(interactive: boolean) { this._interactive = interactive }

    /** Get the amination of character */
    get animation(): PIXI.AnimatedSprite { return this._animation }

    /** Set the amination of character */
    set animation(animation: PIXI.AnimatedSprite) { this._animation = animation }

    /** Get the animation speed of character */
    get animationSpeed(): number { return this._animationSpeed }

    /** Set the animation speed of character */
    set animationSpeed(animationSpeed: number) {
        console.debug(`Setting animation speed to ${animationSpeed} for character ${this.id}`);

        this._animationSpeed = animationSpeed
    }

    /** Add character to stage */
    addStage() {

        // Diagnostics
        console.debug(`Adding character ${this.id} to the stage at position ${this.position.x},${this.position.y} with animation ${this.animationKey}`);

        if (!this.animation) {
            throw new Error(`Animation object not set for ${this.id}`);
        }

        if (!this.stage) {
            throw new Error(`Stage object not set for ${this.id}`);
        }

        this.stage.addChild(this.animation);
    }

    /** Remove character to stage */
    removeStage() {

        // Diagnostics
        console.debug(`Removing character ${this.id} from the stage`);
        this.stage.removeChild(this.animation);
    }

    /** Play an animation once. E.g., when a character is hit. After playing once, it will revert back to the original animation */
    playSingleAnimation(key: string, callback: CallableFunction = null) {

        // Indicate that a single animation is currently playing
        if (!this.isPlayingSingleAnimation) {
            this.restoreAnimationKey = this._animationKey;
            this.restoreAutoPlay = this._autoPlay;
            this.restoreLoop = this._loop;
            this.restoreInteractive = this._interactive;
        }

        // Indicate that a single animation is triggered
        this.isPlayingSingleAnimation = true;

        // Play new animation
        this.createAnimation(key, true, false);

        // Get a reference to this object for usage in the callback
        let char = this;

        // Hook into the onComplete event to restore the original animation
        this.animation.onComplete = function (e) {
            char.createAnimation(char.restoreAnimationKey, char.restoreAutoPlay, char.restoreLoop, char.restoreInteractive);
            char.isPlayingSingleAnimation = false;
            char.restoreAnimationKey = null;

            if (callback) {
                callback();
            }
        };
    }

    /** Set the animation for the character */
    createAnimation(key: string, autoPlay: boolean = true, loop: boolean = true, interactive: boolean = false) {

        // Update local variables
        this.autoPlay = autoPlay;
        this.loop = loop;
        this.interactive = interactive;

        // Stop existing play
        if (this.animation) {
            if (this.animation.playing) {
                this.animation.stop();
            }
        }

        // Update animation key
        this.animationKey = key;

        // Assign new animation
        let isVisible: boolean = this.animation != null;
        if (isVisible) {
            this.removeStage();
        }

        // Diagnostics
        console.debug(`Changing the animation for character ${this.id} to  ${this.animationKey}`);

        // Get the original animation source and create a new animated sprite from it
        let animationSource = this.animationSource.getAnimation(this.animationKey).textures;
        let currentPosition = this.animation?.position;

        this.animation = new PIXI.AnimatedSprite(animationSource);
        this.animation.animationSpeed = this._animationSpeed;

        // Set existing position (if any)
        if (currentPosition) {
            this.animation.position = currentPosition;
        }

        // If the character should be visible, add it back to the stage
        if (isVisible) {
            this.addStage();
        }

        // Play?
        if (autoPlay) {
            this.animation.play();
        }

        // Loop?
        this.animation.loop = loop;

        // Interactive?
        this.animation.interactive = interactive;

        /* 
        if (interactive) {
            let e = this;
            this.animation.removeAllListeners();

            this.animation.on("touchend", function () { e.playAnimation(e) });
            this.animation.on("click", function () { e.playAnimation(e) });
        }
        */

        // Overrides animation details for this specific character.
        if (this._animationDetails && this._animationDetails.has(key)) {
            let details = this._animationDetails.get(key);

            // Override animation speed if configured
            if (details.animationSpeed != null) {
                this.animation.animationSpeed = details.animationSpeed;
            }

            // Override loop property if configured
            if (details.loop != null) {
                this.animation.loop = details.loop;
            }
        }
    }

    /** Update all events related to the character */
    update() {
        this.animation.x = this.position.x;
        this.animation.y = this.position.y;
    }
}

export class CharacterAction {
    id: string;
    entity: Entity;
    velocity: Point;
    offset: Point;
    scale: Point;
    sound: string;
    triggerTimeout: number;
    lifetime: number;
    damage: number;
}