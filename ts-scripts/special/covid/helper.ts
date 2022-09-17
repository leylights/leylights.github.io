import { Molasses } from "../../molasses.js";

export class COVIDHelper {
  static formatAsPercentage(n: number) {
    return Molasses.roundToDecimalPlaces(100 * n, 2) + '%';
  }
}
