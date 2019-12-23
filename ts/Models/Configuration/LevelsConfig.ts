import { Point } from "pixi.js";

export interface LevelsConfig {
    data: LevelConfig[];
}

export interface LevelConfig {
    name: string;
    background: string;
    backgroundMusic: string;
    characters: LevelCharacterConfig[];
}

export interface LevelCharacterConfig {
    id: string;
    sprite: string;
    isPlayer: boolean;
    animationKey: string;
    animationSpeed: number;
    position: Point;
    life: number;
    shield: number;
}