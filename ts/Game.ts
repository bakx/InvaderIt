import { loadAnimationSprites, loadBackgrounds, loadCharacters, loadLevels, loadEntities } from "./Functions";
import { AnimationSprites } from "./Models/AnimatedSprite";
import { Backgrounds } from "./Models/Background";
import { Characters, Character } from "./Models/Character";
import { DrawText } from "./Models/DrawText";
import { LevelData, Levels } from "./Models/Level";
import { Player } from "./Player";
import { Point } from "pixi.js";
import { Entities } from "./Models/Entities";

export class Game {

  /** Application specific variables */
  app: PIXI.Application;
  designWidth: number;
  designHeight: number;

  /** State related variables */
  gameState: GameState = GameState.Loading;
  gameFrame: number = 0;

  /** Resources */
  backgrounds: Backgrounds;
  levels: Levels;
  animationSprites: AnimationSprites;
  entities: Entities;
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

    // Set up game resolution
    this.designWidth = this.designWidth || 1920;
    this.designHeight = this.designHeight || 1080;

    // Create Pixi application
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

    // Start loading resources
    this.loadGame();
  }

  /** Handles keyboard events */
  keyboardHandler() {

    // 
    if (this.gameState === GameState.Running) {

      // Determine if the WSAD or Arrow keys are current pressed
      if (kp[37] || kp[65] || kp[38] || kp[87] || kp[39] || kp[68] || kp[40] || kp[83]) {
        let position: Point = this.player.position;

        if (kp[37] || kp[65]) position.x -= 5;
        if (kp[38] || kp[87]) position.y -= 5;
        if (kp[39] || kp[68]) position.x += 5;
        if (kp[40] || kp[83]) position.y += 5;

        this.handleInteraction(Actions.Move, position);
      }

      // Spacebar will fire
      if (kp[32]) {
        this.handleInteraction(Actions.Fire, this.player.position);
      }

      // Escape will bring up the menu
      if (kp[27]) {
        this.menu();
      }
    }

    // 
    if (this.gameState === GameState.Menu) {

      // Escape will bring up the menu
      if (kp[27]) {
        this.start();
      }
    }

  }

  /** Sets up the game  the default game parameters */
  loadGame() {

    // Load backgrounds
    loadBackgrounds(this.app)
      .then(backgrounds => {
        this.backgrounds = backgrounds;

        // Load entities
        loadEntities()
          .then(entities => {
            this.entities = entities;

            // Load the animation sprites
            loadAnimationSprites()
              .then(animationSprites => {
                this.animationSprites = animationSprites;

                // Load the characters
                loadCharacters(this)
                  .then(characters => {
                    this.characters = characters
                  })

                  .then(_ => {

                    // Load levels
                    loadLevels(this.app, this)
                      .then(levels => {
                        this.levels = levels;

                        // Create FPS counter
                        this.fpsCounter = new DrawText(this.app.stage, '', 10, 10);

                        // Create Debug text
                        this.debugHelper = new DrawText(this.app.stage, '', 10, 30);

                        // Set level to starting point.
                        this.levelIndex = 0;

                        // Load level
                        this.loadLevel();

                        // Start game engine
                        this.start();
                      });
                  })
              })
          });
      });
  }

  /** Loads all resources that are defined for the specific level */
  loadLevel() {

    // If a level is already loaded, remove all items from the stage
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
        this.onclick(event);
      });

      this.app.renderer.plugins.interaction.on('touchend', (event: any) => {
        this.onclick(event);
      });
    }

    // Load background
    this.level.background.show();
  }

  /** Starts the game loop */
  start() {
    this.gameState = GameState.Running;
    this.app.start();
  }

  /** Pauses the game loop */
  pause() {
    this.gameState = GameState.Paused;
    this.app.stop();
  }

  /** Stops the game loop */
  stop() {
    this.gameState = GameState.Stopped;
    this.app.stop();
  }

  menu() {
    this.gameState = GameState.Menu;
    this.app.stop();
  }

  /** Main game loop that updates all entities */
  update() {

    // Handle keyboard events
    this.keyboardHandler();

    // Handle the events from the main game loop 
    if (this.gameState === GameState.Running) {

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

    // Update background
    if (this.level && this.level.background) {
      this.level.background.redraw(newWidth, height);
    }
  }

  /** */
  onclick(event: any) {

    // Get a reference to the positioning data
    let x = Math.floor(event.data.global.x);
    let y = Math.floor(event.data.global.y);

    // Determine if the click was outside the screen bounds
    if (x < 0 || y < 0 || x > this.app.screen.width || y > this.app.screen.height) {
      console.debug('Click registered outside screen bounds. Ignoring...');
      return;
    }

    // Determine on which half of the screen was clicked (left or right)
    if (x < this.app.screen.width / 2) {
      // Update player position
      if (this.player) {
        this.handleInteraction(Actions.Move, new Point(x, y));
      }
    }
    else {
      this.handleInteraction(Actions.Fire, new Point(x, y));
    }
  }

  /** */
  handleInteraction(action: Actions, position: Point) {
    switch (action) {
      case Actions.Move:
        this.player.gotoPosition = position;
        break;
      case Actions.Fire:
        this.player.action("fire", position);
        break;
    }
  }
}

let kp: any = [];

window.onkeydown = function (e: any) {
  let code = e.keyCode ? e.keyCode : e.which;
  kp[code] = true;
}
window.onkeyup = function (e: any) {
  let code = e.keyCode ? e.keyCode : e.which;
  kp[code] = false;
};


export enum Actions {
  Move,
  Fire
}

export enum GameState {
  Loading,
  Menu,
  Paused,
  Stopped,
  Running
}

