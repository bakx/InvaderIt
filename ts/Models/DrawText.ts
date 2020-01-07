export class DrawText {
    private pixiText: PIXI.Text;
    private pixiTextStyle: PIXI.TextStyle;

    constructor(container: PIXI.Container, text: string, x: number, y: number, style?: PIXI.TextStyle) {
        this.pixiTextStyle = (style) ? style : this.getDefaultStyle();
        this.pixiText = new PIXI.Text(text, this.pixiTextStyle);
        this.pixiText.x = x;
        this.pixiText.y = y;

        // Add to container
        container.addChild(this.pixiText);
    }

    /** Set the text of the text object */
    set Text(text: string) {
        this.pixiText.text = text;
    }

    /** Set X location of the text object */
    set x(x: number) {
        this.pixiText.x = x;
    }

    /** Set Y location of the text object */
    set y(y: number) {
        this.pixiText.y = y;
    }

    /** Retrieve the height of the text object */
    get height(): number {
        return this.pixiText.height;
    }

    /** Set the font size of the text object */
    set fontSize(fontSize: number) {
        this.pixiTextStyle.fontSize = fontSize;
    }

    getDefaultStyle(): PIXI.TextStyle {
        const style = new PIXI.TextStyle({
            fontFamily: "Tahoma",
            fontSize: 18,
            fontWeight: "bold",
            lineJoin: "round",
            stroke: "white",
            strokeThickness: 2
        });

        return style;
    };
}
