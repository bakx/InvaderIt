import { LevelCharacterConfig } from "./LevelCharacterConfig";

export interface LevelConfig {
    name: string;
    background: string;
    backgroundMusic: string;
    characters: LevelCharacterConfig[];
}

