import { Point } from "pixi.js";
import { Enemy } from "./Enemies";
import { Actions } from "./Enums/Actions";
import { GameState } from "./Enums/GameState";
import { loadAnimationSprites, loadBackgrounds, loadCharacters, loadEntities, loadLevels, loadSounds } from "./Functions";
import { AnimationSprites } from "./Models/AnimatedSprite";
import { Background } from "./Models/Background";
import { Character } from "./Models/Character";
import { DrawText } from "./Models/DrawText";
import { Entity, EntitySound } from "./Models/Entities";
import { LevelData } from "./Models/Level";
import { MoveBox } from "./MoveBox";
import { Player } from "./Player";
import { Collision2D } from "./Utilities/Collision2D";

export class Game {

  /** Application specific variables */
  app: PIXI.Application;
  designWidth: number;
  designHeight: number;

  /** State related variables */
  gameState: GameState = GameState.Loading;
  gameFrame: number = 0;

  /** Resources */
  backgrounds: Map<string, Background>;
  levels: LevelData[];
  animationSprites: AnimationSprites;
  entities: Map<string, Entity>;
  characters: Map<string, Character>;
  player: Player;
  enemies: Map<string, Enemy>;

  /** Sounds */
  backgroundMusic: EntitySound;

  /** Level data */
  level: LevelData;
  levelIndex: number;

  /** Text */
  fpsCounter: DrawText;
  debugHelper: DrawText;

  /** Libraries */
  bump: any;

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

    // Load sounds
    loadSounds(this.app)
      .then(() => {

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
      });


  }

  /** Loads all resources that are defined for the specific level */
  loadLevel() {

    // If a level is already loaded, remove all items from the stage
    if (this.level) {

      // Remove the player from the stage
      this.player.removeStage();

      // Remove all enemies from the stage
      this.enemies.forEach(enemy => {
        enemy.removeStage()
      });

      // Hide current level
      this.level.background.hide();
    }

    // Unload background music
    if (this.backgroundMusic) {
      PIXI.sound.stop(this.backgroundMusic.id);
    }

    // Unload all actions.
    if (this.player && this.player.activeActionSprites) {
      for (let i = 0; i < this.player.activeActionSprites.length; i++) {
        this.app.stage.removeChild(this.player.activeActionSprites[i].sprite);
      }
    }

    // Validate that the level exists
    if (this.levels.length - 1 < this.levelIndex) {
      console.warn(`Level ${this.levelIndex} was not found. Resetting to level 0`);
      this.levelIndex = 0;
    }

    // Load characters
    this.level = this.levels[this.levelIndex];

    // Reset all enemies
    this.enemies = new Map<string, Enemy>();
    this.enemies.clear();

    // Add all characters to the stage
    for (let i = 0; i < this.level.characters.length; i++) {
      let character = this.level.characters[i];

      // Reset the position of the character to the original location as defined in the config
      character.position.x = this.level.config.characters[i].position.x;
      character.position.y = this.level.config.characters[i].position.y;

      if (!character.isPlayer) {
        let enemy: Enemy = new Enemy(this.app.stage, character);
        enemy.lifeFull = character.life;
        enemy.shieldFull = character.shield;
        enemy.shieldRechargeRate = character.shieldRechargeRate;
        enemy.moveBox = new MoveBox(this.app.screen.width / 2, this.app.screen.width, 0, this.app.screen.height);

        // Initialize the enemy
        enemy.init();

        this.enemies.set(character.id, enemy);
      }
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
      this.player = new Player(this.app.stage, playerCharacter);

      // Pointers normalize touch and mouse
      this.app.renderer.plugins.interaction.on('pointerup', (event: any) => {
        this.onclick(event);
      });

      this.app.renderer.plugins.interaction.on('touchend', (event: any) => {
        this.onclick(event);
      });
    }

    // Load sounds
    this.backgroundMusic = this.entities.get(this.level.backgroundMusic).sound;
    PIXI.sound.play(this.backgroundMusic.id, {
      volume: this.backgroundMusic.volume,
      loop: true
    });

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

  /** Stops the game loop and sets the state to menu */
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

      // TEMP
      if (PIXI.sound.context.audioContext.state === 'suspended') {
        PIXI.sound.context.audioContext.resume();
      }

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

      // Update all enemy
      this.enemies.forEach(enemy => {
        enemy.update(this);
      })

      // Collision check
      this.player.activeActionSprites.forEach(action => {
        if (action.triggerEvents) {

          // Check collision for all enemies
          this.enemies.forEach(enemy => {
            if (Collision2D.boxedCollision(
              action.sprite.position, enemy.position,
              action.sprite.getLocalBounds(), enemy.character.animation.getLocalBounds()
            )) {
              enemy.hasCollision(this, action);
            }
          })
        }
      });

      // Check if all enemies are defeated
      if (this.enemies.size == 0) {
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

    // Handle the events from the main game loop 
    if (this.gameState === GameState.Running) {

      // Update background
      if (this.level && this.level.background) {
        this.level.background.redraw(newWidth, this.designHeight);
      }

      // Update all enemies
      this.enemies.forEach(enemy => {
        enemy.moveBox = new MoveBox(this.app.screen.width / 2, this.app.screen.width, 0, this.app.screen.height);
      })
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

