import { loadAnimationSprites, loadBackgrounds, loadCharacters, loadLevels } from "./Functions";
import { AnimationSprites } from "./Models/AnimatedSprite";
import { Backgrounds } from "./Models/Background";
import { Characters, Character } from "./Models/Character";
import { DrawText } from "./Models/DrawText";
import { LevelData, Levels } from "./Models/Level";
import { Player } from "./Players";
import { Point } from "pixi.js";

export class Game {

  /** Application specific variables */
  app: PIXI.Application;
  designWidth: number;
  designHeight: number;

  /** State related variables */
  gameLoadState: GameLoadingState = GameLoadingState.INIT;
  gameState: GameState = GameState.LOADING;
  gameFrame: number = 0;

  /** Resources */
  backgrounds: Backgrounds;
  levels: Levels;
  animationSprites: AnimationSprites;
  characters: Characters;
  player: Player;

  /** Level data */
  level: LevelData;
  levelIndex: number;

  /** Text */
  fpsCounter: DrawText;
  debugHelper: DrawText;

  /** Game constructor */
  constructor(width?: number, height?: number) {
    if (width) this.designWidth = width;
    if (height) this.designHeight = height;
  }

  /** Initialize the default game parameters */
  async initialize() {
    this.designWidth = this.designWidth || 1920;
    this.designHeight = this.designHeight || 1080;
    this.levelIndex = 0;

    this.app = new PIXI.Application({
      width: this.designWidth,
      height: this.designHeight,
    });
  }

  /** Sets up the game  the default game parameters */
  async setup() {
    // Add the view to the body
    document.body.appendChild(this.app.view);

    // Adapt to current view
    this.resizeView();

    // Initialize the AnimationSprites object
    this.animationSprites = new AnimationSprites();

    // Start loading resources
    this.loadGame();
  }

  /** Sets up the game  the default game parameters */
  loadGame() {
    // Load backgrounds
    loadBackgrounds(this.app)
      .then(backgrounds => {
        this.backgrounds = backgrounds;

        // Load the animation sprites
        loadAnimationSprites(this)
          .then(animationSprites => {
            this.animationSprites = animationSprites;

            // Load the characters
            loadCharacters(this)
              .then(characters => {
                this.characters = characters
              })
              .then(_ => {
                // Load all levels
                this.levels = loadLevels(this.app, this);

                // Create FPS counter
                this.fpsCounter = new DrawText(this.app.stage, '', 10, 10);

                // Create Debug text
                this.debugHelper = new DrawText(this.app.stage, '', 10, 30);

                // Load level
                this.loadLevel();

                // Start game engine
                this.start();
              })
          })
      });
  }

  /** Loads all resources that are defined for the specific level */
  loadLevel() {
    if (this.level) {
      // Remove all characters from the stage
      this.level.characters.forEach(char => {
        char.removeStage()
      });

      // Hide current level
      this.level.background.hide();
    }

    // Validate that the level exists
    if (this.levels.data.length - 1 < this.levelIndex) {
      console.warn(`Level ${this.levelIndex} was not found. Resetting to level 0`);
      this.levelIndex = 0;
    }

    // Load characters
    this.level = this.levels.data[this.levelIndex];

    // Add all characters to the stage
    for (let i = 0; i < this.level.characters.length; i++) {
      let character = this.level.characters[i];

      // Reset the position of the character to the original location as defined in the config
      character.position.x = this.level.config.characters[i].position.x;
      character.position.y = this.level.config.characters[i].position.y;

      // Add to stage
      character.addStage();
    }

    // Remove event listeners
    this.app.renderer.plugins.interaction.removeListener('pointerup');
    this.app.renderer.plugins.interaction.removeListener('touchend');

    // Prepare the playable characters
    let playerCharacter: Character = this.level.characters.find(p => p.isPlayer);
    if (!playerCharacter) {
      console.info(`No playable character founds at level ${this.levelIndex}`)
      this.player = null;
    }
    else {
      // Create new playable character
      this.player = new Player(playerCharacter);

      // Pointers normalize touch and mouse
      this.app.renderer.plugins.interaction.on('pointerup', (event: any) => {
        this.onStageClick(event);
      });

      this.app.renderer.plugins.interaction.on('touchend', (event: any) => {
        this.onStageClick(event);
      });
    }

    // Load background
    this.level.background.show();
  }

  /** Starts the game loop */
  start() {
    this.gameState = GameState.RUNNING;
    this.app.start();
  }

  /** Pauses the game loop */
  pause() {
    this.gameState = GameState.PAUSED;
    this.app.stop();
  }

  /** Stops the game loop */
  stop() {
    this.gameState = GameState.STOPPED;
    this.app.stop();
  }

  /** Main game loop that updates all entities */
  update() {
    // obtain the position of the mouse on the stage
    let mousePosition = this.app.renderer.plugins.interaction.mouse.global;
    //    this.debugHelper.Text = `${mousePosition.x} | ${mousePosition.y}`;


    if (this.gameState === GameState.RUNNING) {
      // Update the background
      this.level.background.update();

      // Update all characters
      this.level.characters.forEach(char => {
        char.update();
      })

      // Update the player (if any)
      if (this.player) {
        this.player.update();
      }

      // Temporary debugging code. If a character walks out of the screen, move to next level.
      if (this.level.characters.some(x => x.position.x > this.app.view.width)) {
        this.levelIndex++;
        this.loadLevel();
      }

      // Update game frame
      this.gameFrame++;
    }
  }

  /** Resizes the viewport & renderer to match the screen */
  resizeView() {
    let width = window.innerWidth || document.body.clientWidth;
    let height = window.innerHeight || document.body.clientHeight;

    // Calculate the ratio
    let ratio = height / this.designHeight;

    // Update the view 
    let view = this.app.renderer.view;

    // Calculate the new width ratio
    var newWidth = (width / ratio);

    // Apply view style sizing
    view.style.height = this.designHeight * ratio + "px";
    view.style.width = width + "px";

    // Resize application
    this.app.view.width = newWidth;
    this.app.view.height = height;

    // Resize renderer
    this.app.renderer.resize(newWidth, this.designHeight);
  }


  onStageClick(event: any) {

    let x = event.data.global.x;
    let y = event.data.global.y;

    // Determine where was clicked/touched
    if (x < 0 || y < 0 || x > this.app.screen.width || y > this.app.screen.height) {
      console.debug('Click registered outside screen bounds. Ignoring...');
      return;
    }

    // Determine where was clicked
    if (x < this.app.screen.width / 2) {
      // Left half of the screen.

      // Update player (if any)
      if (this.player) {
        this.player.gotoPosition = new Point(x, y);
      }

    } else {
      // Right half of the screen.
      console.log('pew pew pew');
    }
  }

}

export enum GameLoadingState {
  INIT,
  BACKGROUNDS,
  ANIMATIONSPRITES,
  CHARACTERS,
  LEVELS,
  LOADLEVEL,
  OVERLAY,
  DONE
}

export enum GameState {
  LOADING,
  MENU,
  PAUSED,
  STOPPED,
  RUNNING
}

