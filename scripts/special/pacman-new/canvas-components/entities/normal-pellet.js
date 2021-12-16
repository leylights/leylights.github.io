import { PacmanEntityEnum } from "../../helper.js";
import { PacmanConstants } from "../constants.js";
import { PacmanPickup } from "./pickup.js";
export class PacmanNormalPellet extends PacmanPickup {
    constructor(x, y) {
        super(x, y, PacmanPickup.BASE_WIDTH / 2, PacmanConstants.PINK_PELLET_COLOR, PacmanEntityEnum.NORMAL_PELLET);
    }
    draw(canvas) {
        canvas.fillCircle(this.x, this.y, this.radius, this.colour, false);
    }
}
//# sourceMappingURL=normal-pellet.js.map