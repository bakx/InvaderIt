export interface EntitiesConfig {
    data: EntityConfig[];
}

export interface EntityConfig {
    id: string;
    filename: string;
    width: number;
    height: number;
    sound: EntitySoundConfig;
}

export interface EntitySoundConfig {
    id: string;
    volume: number;
}