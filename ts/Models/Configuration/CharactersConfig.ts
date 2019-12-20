import { Point } from "pixi.js"
import { Entity } from "../Entities";

export interface CharactersConfig {
    data: CharacterConfig[];
}

export interface CharacterConfig {
    id: string;
    defaultAnimationKey: string;
    defaultAnimationSpeed: number;
    animationDetails: CharacterAnimationDetailsConfig[];
    actions: CharacterActionConfig[];
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
}