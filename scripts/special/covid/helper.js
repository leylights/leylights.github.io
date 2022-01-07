import { cws } from "../../cws.js";
export class COVIDHelper {
    static formatAsPercentage(n) {
        return cws.roundToDecimalPlaces(100 * n, 2) + '%';
    }
}
//# sourceMappingURL=helper.js.map