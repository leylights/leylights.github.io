import { WiresConstants } from "./constants.js";
import { WiresState } from "./state.js";
import { WiresTile } from "./tile.js";
export class WiresMenuTile {
    constructor(data) {
        var _a;
        this._hoverable = true;
        this._isHovered = false;
        this.hoverColour = "#000009";
        this.textColour = 'white';
        this.textSize = 20;
        this._x = data.x;
        this._y = data.y;
        this._index = data.index;
        if (data.competitiveIndex)
            this._competitiveIndex = data.competitiveIndex;
        if (data.w)
            this.w = data.w;
        else
            this.w = WiresConstants.TOP_TILE_WIDTH;
        this.h = data.h ? data.h : this.w;
        this.textBuilder = data.textBuilder;
        this.colour = (_a = data.colour) !== null && _a !== void 0 ? _a : WiresConstants.TOP_TILE_COLOUR;
        this._isLivesCounter = data.isLivesCounter || false;
        this._mode = data.mode;
        if (data.hoverable === false)
            this._hoverable = false;
        if (data.font)
            this.fontFamily = data.font;
    }
    get index() {
        if (WiresState.isCompetitive && this.hasCompetitiveIndex)
            return this._competitiveIndex;
        else
            return this._index;
    }
    get hasCompetitiveIndex() {
        return !!(this._competitiveIndex || this._competitiveIndex === 0);
    }
    get hasIndex() {
        return !!(this.index || this._index === 0);
    }
    get hoverable() {
        return this._hoverable;
    }
    get isDisplayed() {
        if (!WiresState.isCompetitive && this._mode === 'competitive')
            return false;
        else if (WiresState.isCompetitive && this._mode === 'casual')
            return false;
        return true;
    }
    get isHovered() {
        return this._hoverable && this._isHovered && this.isDisplayed;
    }
    set isHovered(b) {
        this._isHovered = this._hoverable && b;
    }
    get right() {
        return this.x + this.w;
    }
    get x() {
        if (this._x) {
            return this._x;
        }
        if (this.hasIndex) {
            const x = WiresTile.tiles[0][0].x + this.index * (this.w + WiresConstants.BORDER.WIDTH);
            if (this._isLivesCounter)
                return x;
            else
                return x + WiresState.livesCounterOuterWidth;
        }
        else {
            return -1;
        }
    }
    get y() {
        if (this._y) {
            return this._y;
        }
        else if (this.hasIndex) {
            return WiresTile.tiles[0][0].y - WiresConstants.TOP_TILE_WIDTH - 5;
        }
        else {
            return -1;
        }
    }
    set x(n) {
        this._x = n;
    }
    set y(n) {
        this._y = n;
    }
    redraw(canvas) {
        if (!this.isDisplayed)
            return;
        canvas.fillRect(this.x - WiresConstants.BORDER.WIDTH, this.y - WiresConstants.BORDER.WIDTH, this.w + WiresConstants.BORDER.WIDTH * 2, this.h + WiresConstants.BORDER.WIDTH * 2, WiresConstants.BORDER.COLOUR);
        const colour = this.isHovered ? this.hoverColour : this.colour;
        canvas.fillRect(this.x, this.y, this.w, this.h, colour);
        const text = this.textBuilder ? this.textBuilder() : '';
        canvas.drawCenteredText(text, this.x + this.w / 2, this.y + this.h / 2, this.textColour, this.textSize, this.fontFamily);
        if (this._isLivesCounter) {
            const colCount = 7, colWidth = Math.floor(this.w / colCount), spareMargin = this.w % colCount, leftMargin = Math.floor(spareMargin / 2);
            for (let x = 0; x < 3; x++) {
                const colour = x < WiresState.remainingAttempts ? WiresConstants.LIVES_COUNTER.BLUE : WiresConstants.LIVES_COUNTER.RED;
                canvas.fillRect(this.x + colWidth * ((2 * x) + 1) + leftMargin, this.y + WiresConstants.LIVES_COUNTER.VERTICAL_MARGIN, colWidth, this.h - 2 * WiresConstants.LIVES_COUNTER.VERTICAL_MARGIN, colour);
            }
        }
    }
}
//# sourceMappingURL=menu-tile.js.map