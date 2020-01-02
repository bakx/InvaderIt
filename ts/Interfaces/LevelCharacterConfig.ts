import { Point } from "pixi.js";
import { LevelCharacterShieldConfig } from "./LevelCharacterShieldConfig";
export interface LevelCharacterConfig {
    id: string;
    sprite: string;
    isPlayer: boolean;
    movementSpeed: Point;
    animationKey: string;
    animationSpeed: number;
    position: Point;
    scale: Point;
    life: number;
    shield: LevelCharacterShieldConfig;
}
