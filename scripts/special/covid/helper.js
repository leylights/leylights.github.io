import { Molasses } from "../../molasses.js";
export class COVIDHelper {
    static formatAsPercentage(n) {
        return Molasses.roundToDecimalPlaces(100 * n, 2) + '%';
    }
}
//# sourceMappingURL=helper.js.map