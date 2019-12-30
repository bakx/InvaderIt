import { MoveBox } from "../MoveBox";
import { Enemy } from "../Enemies";

export class PathFinding {

    /** Constructor of the PathFinding class */
    constructor() {
    }

    static enemyPaths(moveBox: MoveBox, source: Enemy, enemies: Map<string, Enemy>, moveSpeed: number): CanMove {

        let canMove: CanMove = new CanMove();

        // Determine what directions the enemy can move to
        enemies.forEach(enemy => {
            if (source.id != enemy.id) {

                let horizontalAlign: boolean = false;
                let verticalAlign: boolean = false;

                // Determine if they are on the same line vertically
                if (source.position.y >= enemy.position.y &&
                    source.position.y < enemy.position.y + enemy.character.animation.height) {
                    verticalAlign = true;
                }

                // Determine if they are on the same line horizontally
                if (source.position.x > enemy.position.x &&
                    source.position.x < enemy.position.x + enemy.character.animation.width) {
                    horizontalAlign = true;
                }

                /** */
                if (horizontalAlign &&
                    source.position.y >= enemy.position.y - moveSpeed &&
                    source.position.y < enemy.position.y - moveSpeed + enemy.character.animation.height) {
                    canMove.up = false;
                }

                /** */
                if (horizontalAlign &&
                    source.position.y >= enemy.position.y + moveSpeed &&
                    source.position.y < enemy.position.y + moveSpeed) {
                }

                /** */
                if (verticalAlign &&
                    source.position.x >= enemy.position.x - moveSpeed &&
                    source.position.x < enemy.position.x - moveSpeed + enemy.character.animation.width) {
                    canMove.left = false;
                }

                /** */
                if (verticalAlign &&
                    source.position.x >= enemy.position.x + moveSpeed &&
                    source.position.x < enemy.position.x + moveSpeed) {
                    canMove.right = false;
                }

            };
        })

        if (source.position.y - moveSpeed < moveBox.minY) {
            canMove.up = false;
        }

        if (source.position.y + source.character.animation.height + moveSpeed > moveBox.maxY) {
            canMove.down = false;
        }

        if (source.position.x - moveSpeed < moveBox.minX) {
            canMove.left = false;
        }

        if (source.position.x + source.character.animation.width + moveSpeed > moveBox.maxX) {
            canMove.right = false;
        }

        return canMove;
    }
}

export class CanMove {

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

