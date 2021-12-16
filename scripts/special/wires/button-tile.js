export class WiresMenuTile {
    constructor(text, x, y, w, h, colour = "#00DDDD") {
        this.textColour = 'white';
        this.textSize = 16;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h ? h : w;
        this.contentText = text;
        this.colour = colour;
    }
    redraw(canvas) {
        canvas.fillRect(this.x, this.y, this.w, this.h, this.colour);
        canvas.drawCenteredText(this.contentText, this.x + this.w / 2, this.y + this.h / 2, this.textColour, this.textSize);
    }
}
//# sourceMappingURL=button-tile.js.map