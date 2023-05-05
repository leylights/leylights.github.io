import { Canvas } from "../../components/canvas.component";
import { WiresState } from "./state";

export class WiresTile {
  static tiles: WiresTile[][] = [];
  static sprites: any = [];

  x: number;
  y: number;
  w: number;
  h: number;
  img: HTMLImageElement;
  imgp: HTMLImageElement;
  imgr: HTMLImageElement;

  potential: boolean[];
  exits: boolean[];
  used: boolean;
  filled: boolean;
  isPowered: boolean;

  hovering: boolean;

  rotation: number;
  permarotation: number;
  rotateTimer: number;
  rotates: number;

  dontPower: boolean;

  constructor(x: number, y: number, w: number = WiresState.tileWidth, h: number = WiresState.tileWidth, img?: HTMLImageElement) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = img;
    this.imgp = img;
    this.imgr = img;

    // up, right, down, left
    this.potential = [true, true, true, true];
    this.exits = [false, false, false, false];
    this.used = false;
    this.filled = false;
    this.isPowered = false;

    this.hovering = false;

    this.rotation = 0;
    this.permarotation = 0;
    this.rotateTimer = 0;
    this.rotates = 0;

    this.dontPower = false;
  }

  get bottom() {
    return this.y + this.h;
  }

  draw(this: WiresTile, canvas: Canvas) {
    canvas.context.translate(this.x + this.w / 2, this.y + this.h / 2);
    canvas.context.rotate(
      (this.permarotation + this.rotation) * (Math.PI / 180)
    );

    if (WiresState.showRed && this.isPowered)
      canvas.drawImage(this.imgr, -this.w / 2, -this.h / 2, this.w, this.h);
    else if (this.isPowered && !this.dontPower)
      canvas.drawImage(this.imgp, -this.w / 2, -this.h / 2, this.w, this.h);
    else canvas.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);

    if (this.hovering)
      canvas.fillRect(-this.w / 2, -this.h / 2, this.w, this.h, "#00000033");
    if (WiresState.showAns && !this.used)
      canvas.fillRect(-this.w / 2, -this.h / 2, this.w, this.h, "#FF000033");
    else if (WiresState.showAns)
      canvas.fillRect(-this.w / 2, -this.h / 2, this.w, this.h, "#00FF0033");

    canvas.context.rotate(
      (-this.permarotation - this.rotation) * (Math.PI / 180)
    );
    canvas.context.translate(-this.x - this.w / 2, -this.y - this.h / 2);
  }

  /**
   * Rotates the tile 
   */
  rotate(amt: number) {
    let oldE = [];
    for (let i = 0; i < this.exits.length; i++)
      oldE[i] = this.exits[i];
    for (let i = 0; i < 4; i++)
      this.exits[i] = oldE[(i + amt + 4) % 4];
  }
}
