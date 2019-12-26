import { Background } from "./Background";
import { Character } from "./Character";
import { LevelConfig } from "./Configuration/LevelsConfig";

export class LevelData {
    name: string;
    background: Background;
    backgroundMusic: string;
    characters: Character[];
    config: LevelConfig;
    entities: any[] = [];
}