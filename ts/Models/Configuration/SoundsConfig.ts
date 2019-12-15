export interface SoundsConfig {
    data: SoundConfig[];
}

export interface SoundConfig {
    id: string;
    filename: string;
    loop: boolean;
}