import { cws } from "../../cws.js";

export class WiresConstants {
  static readonly TOP_TILE_WIDTH: number = 35;
  static readonly TOP_TILE_COLOUR: string = "#111122";
  static readonly HIGH_SCORE_WIDTH: number = 95;
  static readonly HIGH_SCORE_HEIGHT: number = 45;
  private static readonly _isDark = cws.isDark;

  static readonly COLOURS = {
    POWER: "#00F5F5",
    ORANGE: "#FF8800",
    FAILURE: '#ff0000',
    DARK_MODE_BORDER: 'white',
    LIGHT_MODE_BORDER: 'black',
  }

  static readonly LIVES_COUNTER = {
    INNER_WIDTH: 55,
    VERTICAL_MARGIN: 4,
    BLUE: WiresConstants.COLOURS.POWER,
    RED: WiresConstants.COLOURS.FAILURE,
  }

  static readonly BOTTOM_MARGIN: number = 50;
  static readonly SIDE_MARGIN: number = 16;

  static readonly BORDER = {
    WIDTH: 5,
    get COLOUR() {
      if (WiresConstants._isDark) {
        return WiresConstants.COLOURS.DARK_MODE_BORDER
      } else {
        return WiresConstants.COLOURS.LIGHT_MODE_BORDER
      }
    }
  }
}