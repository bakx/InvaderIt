import { CharacterAnimationStatesConfig } from "./CharacterAnimationStatesConfig";
import { CharacterAnimationDetailsConfig } from "./CharacterAnimationDetailsConfig";
import { CharacterActionConfig } from "./CharacterActionConfig";

export interface CharacterConfig {
    id: string;
    defaultAnimationKey: string;
    defaultAnimationSpeed: number;
    animationDetails: CharacterAnimationDetailsConfig[];
    animationStates: CharacterAnimationStatesConfig[];
    actions: CharacterActionConfig[];
}

