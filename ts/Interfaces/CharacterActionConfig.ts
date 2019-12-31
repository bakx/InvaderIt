import { Point } from "pixi.js";
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
