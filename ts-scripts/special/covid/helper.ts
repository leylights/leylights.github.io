import { Leylights } from "../../leylights.js";

export class COVIDHelper {
  static formatAsPercentage(n: number) {
    return Leylights.roundToDecimalPlaces(100 * n, 2) + '%';
  }
}
