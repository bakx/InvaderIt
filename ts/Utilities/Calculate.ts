export class Calculate {

    /** Constructor of the Calculate class */
    constructor() {
    }

    static getBarWidth(barWidth: number, currentBar: number, fullBar: number): number {

        // Make sure current value can't go lower than 0
        if (currentBar < 0) { currentBar = 0; }

        // Make sure current value can't exceed max value
        if (currentBar > fullBar) { currentBar = fullBar; }

        // Calculate width
        let width = barWidth / fullBar * currentBar;

        // Return width
        return width > 0 ? width : 0;
    }
}