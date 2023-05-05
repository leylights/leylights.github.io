import { Canvas } from "../../../../components/canvas.component";
import { PacmanEntityEnum } from "../../helper";
import { PacmanConstants } from "../constants";
import { PacmanState } from "../state";
import { PacmanPickup } from "./pickup";

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
