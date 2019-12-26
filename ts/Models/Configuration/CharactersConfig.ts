import { Point } from "pixi.js"

export interface CharactersConfig {
    data: CharacterConfig[];
}

export interface CharacterConfig {
    id: string;
    defaultAnimationKey: string;
    defaultAnimationSpeed: number;
    animationDetails: CharacterAnimationDetailsConfig[];
    animationStates: CharacterAnimationStatesConfig[];
    actions: CharacterActionConfig[];
}

export interface CharacterAnimationStatesConfig {
    state: string;
    animationKey: string;
}

export interface CharacterAnimationDetailsConfig {
    key: string;
    overrides: CharacterAnimationDetailsDataConfig;
}

export interface CharacterAnimationDetailsDataConfig {
    animationSpeed: number;
    loop: boolean;
}

export interface CharacterActionConfig {
    id: string;
    entity: string;
    velocity: Point;
    offset: Point;
    scale: Point;
    triggerTimeout: number;
    lifetime: number;
    damage: number;
}