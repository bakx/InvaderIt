import { Point } from "pixi.js";
import { Enemy } from "../Enemies";
import { MoveBox } from "../MoveBox";

export class PathFinding {

    /** Constructor of the PathFinding class */
    constructor() {
    }

    static entityPaths(moveBox: MoveBox, source: Enemy, entities: Map<string, Enemy>, moveSpeed: Point): MoveDirections {

        let moveDirections: MoveDirections = new MoveDirections();

        // Determine what directions the entity can move to
        entities.forEach(entity => {

            if (source.id != entity.id) {

                let horizontalAlign: boolean = false;
                let verticalAlign: boolean = false;

                // Determine if they are on the same line horizontally
                //

                // If the source is located before the other entity
                if (source.position.x <= entity.position.x) {

                    // 
                    if (source.position.x + source.character.animation.width > entity.position.x) {
                        horizontalAlign = true;
                    }

                } else {

                    // 
                    if (source.position.x < entity.position.x + entity.character.animation.width) {
                        horizontalAlign = true;
                    }
                }

                // Determine if they are on the same line vertically
                //

                // If the source is located before the other entity
                if (source.position.y <= entity.position.y) {

                    // 
                    if (source.position.y + source.character.animation.height > entity.position.y) {
                        verticalAlign = true;
                    }

                } else {

                    // 
                    if (source.position.y < entity.position.y + entity.character.animation.height) {
                        verticalAlign = true;
                    }
                }

                /** */
                if (verticalAlign) {

                    // If the source is located before the other entity
                    if (source.position.x <= entity.position.x) {

                        // If the other entity is located 
                        if (source.position.x + source.character.animation.width + moveSpeed.y > entity.position.x) {
                            moveDirections.right = false;
                        }

                    } else {

                        // 
                        if (source.position.x + moveSpeed.y < entity.position.x + entity.character.animation.width) {
                            moveDirections.left = false;
                        }
                    }
                }

                /** */
                if (horizontalAlign) {

                    // If the source is located before the other entity
                    if (source.position.y <= entity.position.y) {

                        // 
                        if (source.position.y + source.character.animation.height > entity.position.y) {
                            moveDirections.down = false;
                        }

                    } else {

                        // 
                        if (source.position.y < entity.position.y + entity.character.animation.height) {
                            moveDirections.up = false;
                        }
                    }
                }


            };
        })

        if (source.position.y - moveSpeed.y < moveBox.minY) {
            moveDirections.up = false;
        }

        if (source.position.y + source.character.animation.height + moveSpeed.y > moveBox.maxY) {
            moveDirections.down = false;
        }

        if (source.position.x - moveSpeed.x < moveBox.minX) {
            moveDirections.left = false;
        }

        if (source.position.x + source.character.animation.width + moveSpeed.x > moveBox.maxX) {
            moveDirections.right = false;
        }

        return moveDirections;
    }
}

export class MoveDirections {

    /** Constructor of the CanMove class */
    constructor(up: boolean = true, right: boolean = true, down: boolean = true, left: boolean = true) {
        this._up = up;
        this._right = right;
        this._down = down;
        this._left = left;
    }

    private _up: boolean;
    private _right: boolean;
    private _down: boolean;
    private _left: boolean;

    get up(): boolean {
        return this._up;
    }
    get right(): boolean {
        return this._right;
    }
    get down(): boolean {
        return this._down;
    }
    get left(): boolean {
        return this._left;
    }

    set up(up: boolean) {
        this._up = up;
    }
    set right(right: boolean) {
        this._right = right;
    }
    set down(down: boolean) {
        this._down = down;
    }
    set left(left: boolean) {
        this._left = left;
    }
}

