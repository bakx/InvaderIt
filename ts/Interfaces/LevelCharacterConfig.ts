import { Point } from "pixi.js";
import { LevelCharacterShieldConfig } from "./LevelCharacterShieldConfig";
export interface LevelCharacterConfig {
    id: string;
    sprite: string;
    isPlayer: boolean;
    animationKey: string;
    animationSpeed: number;
    position: Point;
    life: number;
    shield: LevelCharacterShieldConfig;
}
