import { IPoint } from "pixi.js";

export class Collision2D {

    /** Constructor of the Collision2D class */
    constructor() {
  }

  static boxedCollision(sourcePosition : IPoint, targetPosition: IPoint, sourceSize : PIXI.ISize, targetSize : PIXI.ISize) : boolean {

    if (sourcePosition.x > targetPosition.x && 
      sourcePosition.x < targetPosition.x + targetSize.width && 
        sourcePosition.y > targetPosition.y - targetSize.height && 
        sourcePosition.y < targetPosition.y + targetSize.height) {
          return true;
        }
        
    return false;
  }
}