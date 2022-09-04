import { Leylights } from "../../leylights.js";
export class COVIDHelper {
    static formatAsPercentage(n) {
        return Leylights.roundToDecimalPlaces(100 * n, 2) + '%';
    }
}
//# sourceMappingURL=helper.js.map