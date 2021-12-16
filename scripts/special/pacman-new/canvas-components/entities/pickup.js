import { PacmanConstants } from "../constants.js";
import { PacmanEntity } from "./entity.js";
export class PacmanPickup extends PacmanEntity {
    constructor(x, y, radius, colour, name) {
        const diameter = radius * 2;
        super(x, y, diameter, diameter, colour, name);
    }
    get diameter() {
        return this.radius * 2;
    }
    get radius() {
        return this.width / 2;
    }
}
PacmanPickup.BASE_WIDTH = PacmanConstants.HALL_WIDTH / 8;
PacmanPickup.CHASE_WIDTH = PacmanConstants.HALL_WIDTH / 2;
//# sourceMappingURL=pickup.js.map