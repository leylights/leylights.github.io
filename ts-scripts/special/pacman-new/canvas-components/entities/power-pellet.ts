import { Canvas } from "../../../../components/canvas.component.js";
import { PacmanEntityEnum } from "../../helper.js";
import { PacmanConstants } from "../constants.js";
import { PacmanState } from "../state.js";
import { PacmanPickup } from "./pickup.js";

export class PacmanPowerPellet extends PacmanPickup {
  constructor(x: number, y: number) {
    super(x, y, PacmanPickup.CHASE_WIDTH / 2, PacmanConstants.PINK_PELLET_COLOR, PacmanEntityEnum.POWER_PELLET);
  }

  draw(this: PacmanPickup, canvas: Canvas) {
    const interval = PacmanConstants.PELLET_ANIMATION_UPDATE_INTERVAL / 2;
    const time = PacmanState.animationNow;

    if (time % (interval * 2) < interval)
      canvas.fillCircle(this.x, this.y, this.radius, this.colour, false);
  }
}
