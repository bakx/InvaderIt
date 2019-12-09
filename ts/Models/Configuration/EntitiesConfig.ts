export interface EntitiesConfig {
    data: EntityConfig[];
}

export interface EntityConfig {
    id: string;
    filename: string;
    width: number;
    height: number;
}