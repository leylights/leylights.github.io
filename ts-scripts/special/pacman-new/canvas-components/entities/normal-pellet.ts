import { Canvas } from "../../../components/canvas.component.js";
import { PacmanEntityEnum } from "../../helper.js";
import { PacmanConstants } from "../constants.js";
import { PacmanPickup } from "./pickup.js";

export class PacmanNormalPellet extends PacmanPickup {
  constructor(x: number, y: number) {
    super(x, y, PacmanPickup.BASE_WIDTH / 2, PacmanConstants.PINK_PELLET_COLOR, PacmanEntityEnum.NORMAL_PELLET)
  }

  draw(this: PacmanPickup, canvas: Canvas) {
    canvas.fillCircle(this.x, this.y, this.radius, this.colour, false);
  }
}