import { EntitySoundConfig } from "./EntitySoundConfig";

export interface EntityConfig {
    id: string;
    filename: string;
    width: number;
    height: number;
    sound: EntitySoundConfig;
}

