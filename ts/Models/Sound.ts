export class Sounds {
    data: Map<string, Sound> = new Map<string, Sound>();
}

export class Sound {
    /** Constructor of the Sound class  
    * @param id the id of the sound
    * @param filename filename that contains the sound
    */
    constructor(id: string, filename: string) {
        this._id = id;
        this._file = filename;
    }

    /** ID of this collection of animated sprites */
    private _id: string;

    /** Texture of the sprite */
    private _file: string;

    /** Get the id of this sprite */
    id(): string { return this._id }
}