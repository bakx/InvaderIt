import { MultipackLoader } from "./Extensions/MultipackLoader";
import { SpriteLoader } from "./Extensions/SpriteLoader";
import { Game } from "./Game";
import { AnimationSpriteConfig } from "./Interfaces/AnimationSpriteConfig";
import { BackgroundConfig } from "./Interfaces/BackgroundsConfig";
import { BackgroundSpritesConfig } from "./Interfaces/BackgroundSpritesConfig";
import { CharacterAnimationDetailsConfig } from "./Interfaces/CharacterAnimationDetailsConfig";
import { CharacterAnimationStatesConfig } from "./Interfaces/CharacterAnimationStatesConfig";
import { CharacterConfig } from "./Interfaces/CharactersConfig";
import { EntityConfig } from "./Interfaces/EntitiesConfig";
import { LevelCharacterConfig } from "./Interfaces/LevelCharacterConfig";
import { LevelConfig } from "./Interfaces/LevelsConfig";
import { SoundConfig } from "./Interfaces/SoundsConfig";
import { AnimationDetails, AnimationSprite, AnimationSprites, AnimationState } from "./Models/AnimatedSprite";
import { Background } from "./Models/Background";
import { Character, CharacterAction } from "./Models/Character";
import { Entity, EntitySound } from "./Models/Entities";
import { LevelData } from "./Models/Level";
import { Sound, Sounds } from "./Models/Sound";

/**
 * Loads a local .json file and returns the contents of the file
 * to the callback function.
 *
 * @param {string} file Name of the file
 * @param {CallableFunction} callback Name of callback function
 */
export function loadJSON(file: string): Promise<string> {

  return new Promise(async (resolve) => {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open("GET", file, true);
    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == 200) {
        resolve(xobj.responseText);
      }
    };

    xobj.send(null);
  })
}

/** Loads the sound effects into the pixi library */
export function loadSounds(app: PIXI.Application): Promise<Sounds> {

  return new Promise(async (resolve) => {
    let sounds: Sounds = new Sounds();
    let soundDataData: SoundConfig[];

    loadJSON('config/sounds.json')
      .then(data => {
        soundDataData = JSON.parse(data) as SoundConfig[];

        if (soundDataData == null) {
          throw new Error('Unable to load sounds');
        }

        for (let i = 0; i < soundDataData.length; i++) {
          let config: SoundConfig = soundDataData[i];

          // Prepare sound effect
          let sound: Sound = new Sound(config.id, config.filename);

          PIXI.sound.add(config.id, config.filename);
          sounds.data.set(config.id, sound);
        }

        // Resolve promise
        resolve(sounds);
      });
  })
}

/** Loads the backgrounds configuration file and parses it to a Backgrounds object */
export function loadBackgrounds(app: PIXI.Application): Promise<Map<string, Background>> {

  return new Promise(async (resolve) => {
    let backgrounds: Map<string, Background> = new Map<string, Background>();
    let backgroundData: BackgroundConfig[];

    loadJSON('config/backgrounds.json')
      .then(data => {
        backgroundData = JSON.parse(data) as BackgroundConfig[];

        if (backgroundData == null) {
          throw new Error('Unable to load backgrounds');
        }

        for (let i = 0; i < backgroundData.length; i++) {
          let config: BackgroundConfig = backgroundData[i];

          // Prepare background
          let background: Background = new Background(config.name);

          for (let j = 0; j < config.sprites.length; j++) {
            let sprite = config.sprites[j] as BackgroundSpritesConfig;

            // Add sprite
            background.add(
              app.stage,
              sprite.file,
              sprite.width == null ? app.screen.width : app.screen.width,
              sprite.height == null ? app.screen.height : app.screen.height
            );

            // Set update parameters
            background.addUpdate(
              sprite.index, sprite.update.x, sprite.update.y);
          }

          // Initialize
          background.init();

          // Add to collection
          backgrounds.set(config.name, background);

          // Resolve promise
          resolve(backgrounds);
        }
      });
  })
}

/** Loads the animated sprites configuration file and parses it to a AnimationSprites object */
export async function loadAnimationSprites(): Promise<AnimationSprites> {

  return new Promise(async (resolve) => {
    let animationData: AnimationSpriteConfig[];
    let animationSprites: AnimationSprites = new AnimationSprites();

    loadJSON('config/animation_sprites.json')
      .then(data => {
        animationData = JSON.parse(data) as AnimationSpriteConfig[];

        if (animationData == null) {
          throw new Error('Unable to load animation data.');
        }

        for (let i = 0; i < animationData.length; i++) {
          let config: AnimationSpriteConfig = animationData[i];

          // Diagnostics
          console.info(`Loading ${config.id} ${config.filename}`);

          // Load file
          let packLoader: MultipackLoader = new MultipackLoader(config.id);
          packLoader.loadFile(config.filename, config.startAt, config.endAt, (id: string, message: string, sprites: AnimationSprite) => {
            animationSprites.data.set(config.id, sprites);

            if (animationData.length == animationSprites.data.size) {
              resolve(animationSprites);
            }
          });
        }
      })
  })
}

/** Loads the entities sprites configuration file and parses it to a Entities object */
export async function loadEntities(): Promise<Map<string, Entity>> {

  return new Promise(async (resolve) => {
    let entityData: EntityConfig[];

    loadJSON('config/entities.json')
      .then(data => {
        entityData = JSON.parse(data) as EntityConfig[];

        if (entityData == null) {
          throw new Error('Unable to load entities data.');
        }

        // Load file
        let loader: SpriteLoader = new SpriteLoader();

        // Get all config items
        for (let i = 0; i < entityData.length; i++) {
          let config: EntityConfig = entityData[i];

          // Diagnostics
          console.info(`Adding ${config.id} ${config.filename}`);

          loader.addFile(config.id, config.filename);

          // Create entity sound object
          let entitySound: EntitySound = new EntitySound(config.sound.id, config.sound.volume);

          loader.addSound(config.id, entitySound);
        }

        // Load files
        loader.loadFiles(function (cb: Map<string, Entity>) {
          resolve(cb);
        });
      })
  })
}

/** Loads the characters */
export function loadCharacters(game: Game): Promise<Map<string, Character>> {

  return new Promise(async (resolve) => {

    let characters: Map<string, Character> = new Map<string, Character>();
    let characterData: CharacterConfig[];

    loadJSON('config/characters.json')
      .then(data => {
        characterData = JSON.parse(data) as CharacterConfig[];

        if (characterData == null) {
          throw new Error('Unable to load character data');
        }

        for (let i = 0; i < characterData.length; i++) {
          let config: CharacterConfig = characterData[i];
          let animationSource: AnimationSprite;

          // Set animation source
          if (game.animationSprites.data.has(config.id)) {
            animationSource = game.animationSprites.data.get(config.id);
          }
          else {
            throw new Error(`Unable to load animation source ${config.id}`);
          }

          // Create the character data
          let character = new Character(config.id);

          // Set animation data
          character.animationSource = animationSource;
          character.defaultAnimationKey = config.defaultAnimationKey;
          character.defaultAnimationSpeed = config.defaultAnimationSpeed;

          // Create animation states
          character.animationStates = new Map<string, string>();

          // Prepare animation details
          for (let j = 0; j < config.animationStates.length; j++) {
            let animationStateData: CharacterAnimationStatesConfig = config.animationStates[j];
            let details: AnimationState = new AnimationState();

            details.state = animationStateData.state;
            details.animationKey = animationStateData.animationKey;

            character.animationStates.set(animationStateData.state, animationStateData.animationKey);
          }

          // Create animation details
          character.animationDetails = new Map<string, AnimationDetails>();

          // Prepare animation details
          for (let j = 0; j < config.animationDetails.length; j++) {
            let animationDetailsData: CharacterAnimationDetailsConfig = config.animationDetails[j];
            let details: AnimationDetails = new AnimationDetails();

            details.animationSpeed = animationDetailsData.overrides.animationSpeed;
            details.loop = animationDetailsData.overrides.loop;

            character.animationDetails.set(animationDetailsData.key, details);
          }

          // Create the character actions
          for (let j = 0; j < config.actions.length; j++) {
            let actionData = config.actions[j];

            let action = new CharacterAction();
            action.id = actionData.id;
            action.entity = game.entities.get(actionData.entity);
            action.velocity = actionData.velocity;
            action.scale = actionData.scale;
            action.offset = actionData.offset;
            action.triggerTimeout = actionData.triggerTimeout;
            action.lifetime = actionData.lifetime;
            action.damage = actionData.damage;

            character.actions.set(actionData.id, action);
          }

          // Add to collection
          characters.set(config.id, character);
        }

        resolve(characters);
      })
  })
}

/** Loads the levels configuration file and parses it to a Levels object */
export function loadLevels(app: PIXI.Application, game: Game): Promise<LevelData[]> {

  return new Promise(async (resolve) => {
    let levels: LevelData[] = [];
    let levelData: LevelConfig[];

    loadJSON('config/levels.json')
      .then(data => {
        levelData = JSON.parse(data) as LevelConfig[];

        if (levelData == null) {
          throw new Error('Unable to load levels');
        }

        for (let i = 0; i < levelData.length; i++) {
          let config: LevelConfig = levelData[i];

          // Create level object

          let level = new LevelData();
          level.config = config;

          // Set background
          if (game.backgrounds.has(config.background)) {
            level.background = game.backgrounds.get(config.background);
            level.background.init();
          }
          else {
            throw new Error(`Unable to load background ${config.background} for level ${config.name}`);
          }

          // Set background music
          level.backgroundMusic = config.backgroundMusic;

          // Load Characters

          level.characters = [];

          for (let j = 0; j < config.characters.length; j++) {
            let levelCharacterConfig: LevelCharacterConfig = config.characters[j];
            let character: Character;

            if (game.characters.has(levelCharacterConfig.sprite)) {
              let characterSource: Character = game.characters.get(levelCharacterConfig.sprite);

              // Clone the original character
              character = new Character(levelCharacterConfig.id);

              // Set level character properties 
              character.isPlayer = levelCharacterConfig.isPlayer;
              character.movementSpeed = levelCharacterConfig.movementSpeed;
              character.actions = characterSource.actions;
              character.animationSource = characterSource.animationSource;
              character.animationStates = characterSource.animationStates;
              character.animationDetails = characterSource.animationDetails;
              character.animationKey = levelCharacterConfig.animationKey;
              character.animationSpeed = levelCharacterConfig.animationSpeed;
              character.position.x = levelCharacterConfig.position.x;
              character.position.y = levelCharacterConfig.position.y;
              character.scale.x = levelCharacterConfig.scale ? levelCharacterConfig.scale.x : 1;
              character.scale.y = levelCharacterConfig.scale ? levelCharacterConfig.scale.y : 1;
              character.life = levelCharacterConfig.life;
              character.shield = levelCharacterConfig.shield.strength;
              character.shieldRechargeRate = levelCharacterConfig.shield.rechargeRate;

              // Set stage
              character.stage = app.stage;

              // Create the animation
              character.createAnimation(character.animationKey);
            }
            else {
              throw new Error(`Unable to load character ${levelCharacterConfig.id} for level ${config.name}`);
            }

            level.characters.push(character);
          }

          // Add to collection
          levels.push(level);
        }

        resolve(levels);
      })
  }
  )
}

/** Calculate the new position of a moving element */
export function calculateMovement(currentPosition: number, moveTo: number, moveSpeed: number, isPlayer: boolean = false): number {

  // Determine if movement is required
  if (moveTo == currentPosition) {
    return currentPosition;
  }

  // It's possible speed is not set to 1 and overshooting its position. These variables are used to prevent that from happening
  let isBefore: boolean = currentPosition < moveTo;
  let isAfter: boolean = !isBefore;

  if (isPlayer) {
    if (currentPosition > moveTo) {
      currentPosition -= moveSpeed;
    } else {
      currentPosition += moveSpeed;
    }
  }
  else {
    // Update the current position
    currentPosition += moveSpeed;
  }

  // 
  if (isBefore && currentPosition > moveTo || isAfter && currentPosition < moveTo) {
    return moveTo;
  }
  return currentPosition;
}