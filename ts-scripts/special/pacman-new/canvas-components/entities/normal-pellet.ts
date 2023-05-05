import { Canvas } from "../../../../components/canvas.component";
import { PacmanEntityEnum } from "../../helper";
import { PacmanConstants } from "../constants";
import { PacmanPickup } from "./pickup";

export class PacmanNormalPellet extends PacmanPickup {
  constructor(x: number, y: number) {
    super(x, y, PacmanPickup.BASE_WIDTH / 2, PacmanConstants.PINK_PELLET_COLOR, PacmanEntityEnum.NORMAL_PELLET)
  }

  draw(this: PacmanPickup, canvas: Canvas) {
    canvas.fillCircle(this.x, this.y, this.radius, this.colour, false);
  }
}
