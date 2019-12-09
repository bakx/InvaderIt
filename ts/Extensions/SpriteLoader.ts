import { Entities, Entity } from "../Models/Entities";

/**
 * 
 * Work in progress.
 * Created by Gideon Bakx
 */

export class SpriteLoader {
    /** Constructor of the SpriteLoader class  
    */
    constructor() {
    }

    /** Mapping for all entities  */
    private _files: Map<string, string> = new Map<string, string>();

    /**
    * @param id ID of the entity
    * @param file filename of the entity
    */
    addFile(id: string, filename: string) {
        this._files.set(id, filename);
    }

    loadFiles(callback: CallableFunction) {
        // Prepare return data
        let entities: Entities = new Entities();

        // Initialize the loader
        const loader = new PIXI.Loader();

        // Get all keys
        let keys: Array<string> = Array.from(this._files.keys());

        // Load all files and add them to the loader
        keys.forEach(key => {
            loader.add(key, this._files.get(key));
        });

        /** Callback that processes the loaded resources and adds them to the animatedSprites object */
        loader.load((loader: any, resources: any) => {
            keys.forEach(key => {
                // Create the sprite
                let sprite = PIXI.Sprite.from(resources[key].texture);
                
                // Create the entity
                let entity: Entity = new Entity(key, sprite);

                // Update the return object
                entities.data.set(key, entity);
            });
        });

        /** Fatal error while loading resources */
        loader.onError.add((err: string) => {
            throw new Error(err);
        });

        /** When loading is complete, perform callback to inform dependent parts */
        loader.onComplete.add(() => {
            callback(entities);
        });
    }
}