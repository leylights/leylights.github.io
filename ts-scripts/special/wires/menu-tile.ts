import { Canvas } from "../components/canvas.component.js";
import { WiresConstants } from "./constants.js";
import { WiresState } from "./state.js";
import { WiresTile } from "./tile.js";

type WiresGameMode = 'competitive' | 'casual' | 'both';

type MenuTileCreationData = {
  textBuilder?: () => string | number,
  font?: string,
  index?: number,
  competitiveIndex?: number,
  isLivesCounter?: boolean;
  hoverable?: boolean;
  x?: number,
  y?: number,
  w?: number,
  h?: number,
  colour?: string,
  mode: WiresGameMode,
}

export class WiresMenuTile {
  private _x: number;
  private _y: number;
  private _index: number;
  private _competitiveIndex: number;
  private _isLivesCounter: boolean;
  private _hoverable: boolean = true;
  private _isHovered: boolean = false;
  private _mode: WiresGameMode;

  w: number;
  h: number;

  colour: string;
  hoverColour: string = "#000009";
  textBuilder: () => string | number;
  fontFamily: string;

  textColour: string = 'white';
  textSize: number = 20;

  constructor(data: MenuTileCreationData) {
    this._x = data.x;
    this._y = data.y;

    this._index = data.index;
    if (data.competitiveIndex)
      this._competitiveIndex = data.competitiveIndex;

    if (data.w)
      this.w = data.w;
    else this.w = WiresConstants.TOP_TILE_WIDTH;

    this.h = data.h ? data.h : this.w;
    this.textBuilder = data.textBuilder;
    this.colour = data.colour ?? WiresConstants.TOP_TILE_COLOUR;

    this._isLivesCounter = data.isLivesCounter || false;

    this._mode = data.mode;

    if (data.hoverable === false)
      this._hoverable = false;

    if (data.font)
      this.fontFamily = data.font;
  }

  get index(): number {
    if (WiresState.isCompetitive && this.hasCompetitiveIndex)
      return this._competitiveIndex;
    else return this._index;
  }

  get hasCompetitiveIndex(): boolean {
    return !!(this._competitiveIndex || this._competitiveIndex === 0);
  }

  get hasIndex(): boolean {
    return !!(this.index || this._index === 0);
  }

  get hoverable(): boolean {
    return this._hoverable;
  }

  get isDisplayed(): boolean {
    if (!WiresState.isCompetitive && this._mode === 'competitive')
      return false;
    else if (WiresState.isCompetitive && this._mode === 'casual')
      return false;
    return true;
  }

  get isHovered(): boolean {
    return this._hoverable && this._isHovered && this.isDisplayed;
  }

  set isHovered(b: boolean) {
    this._isHovered = this._hoverable && b;
  }

  get right(): number {
    return this.x + this.w;
  }

  get x(): number {
    if (this._x) {
      return this._x;
    } if (this.hasIndex) {
      const x = WiresTile.tiles[0][0].x + this.index * (this.w + WiresConstants.BORDER.WIDTH);
      if (this._isLivesCounter)
        return x;
      else
        return x + WiresState.livesCounterOuterWidth;
    } else {
      return -1;
    }
  }

  get y(): number {
    if (this._y) {
      return this._y;
    } else if (this.hasIndex) {
      return WiresTile.tiles[0][0].y - WiresConstants.TOP_TILE_WIDTH - 5;
    } else {
      return -1;
    }
  }

  set x(n: number) {
    this._x = n;
  }

  set y(n: number) {
    this._y = n;
  }

  redraw(this: WiresMenuTile, canvas: Canvas) {
    if (!this.isDisplayed)
      return;

    canvas.fillRect(
      this.x - WiresConstants.BORDER.WIDTH,
      this.y - WiresConstants.BORDER.WIDTH,
      this.w + WiresConstants.BORDER.WIDTH * 2,
      this.h + WiresConstants.BORDER.WIDTH * 2,
      WiresConstants.BORDER.COLOUR
    );

    const colour = this.isHovered ? this.hoverColour : this.colour;
    canvas.fillRect(this.x, this.y, this.w, this.h, colour);

    const text = this.textBuilder ? this.textBuilder() : '';
    canvas.drawCenteredText(
      text,
      this.x + this.w / 2,
      this.y + this.h / 2,
      this.textColour,
      this.textSize,
      this.fontFamily
    );

    if (this._isLivesCounter) {
      const colCount = 7,
        colWidth = Math.floor(this.w / colCount),
        spareMargin = this.w % colCount,
        leftMargin = Math.floor(spareMargin / 2);

      for (let x = 0; x < 3; x++) {
        const colour = x < WiresState.remainingAttempts ? WiresConstants.LIVES_COUNTER.BLUE : WiresConstants.LIVES_COUNTER.RED;

        canvas.fillRect(
          this.x + colWidth * ((2 * x) + 1) + leftMargin,
          this.y + WiresConstants.LIVES_COUNTER.VERTICAL_MARGIN,
          colWidth,
          this.h - 2 * WiresConstants.LIVES_COUNTER.VERTICAL_MARGIN,
          colour
        );
      }
    }
  }
}