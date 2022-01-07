import { cws } from "../../cws.js";

export class COVIDHelper {
  static formatAsPercentage(n: number) {
    return cws.roundToDecimalPlaces(100 * n, 2) + '%';
  }
}