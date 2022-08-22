import { DarkModeService } from "../../services/dark-mode.service.js";
export class WiresConstants {
}
WiresConstants.TOP_TILE_WIDTH = 35;
WiresConstants.TOP_TILE_COLOUR = "#111122";
WiresConstants.HIGH_SCORE_WIDTH = 95;
WiresConstants.HIGH_SCORE_HEIGHT = 45;
WiresConstants._isDark = DarkModeService.isDark;
WiresConstants.COLOURS = {
    POWER: "#00F5F5",
    ORANGE: "#FF8800",
    FAILURE: '#ff0000',
    DARK_MODE_BORDER: 'white',
    LIGHT_MODE_BORDER: 'black',
};
WiresConstants.LIVES_COUNTER = {
    INNER_WIDTH: 55,
    VERTICAL_MARGIN: 4,
    BLUE: WiresConstants.COLOURS.POWER,
    RED: WiresConstants.COLOURS.FAILURE,
};
WiresConstants.BOTTOM_MARGIN = 50;
WiresConstants.SIDE_MARGIN = 16;
WiresConstants.BORDER = {
    WIDTH: 5,
    get COLOUR() {
        if (WiresConstants._isDark) {
            return WiresConstants.COLOURS.DARK_MODE_BORDER;
        }
        else {
            return WiresConstants.COLOURS.LIGHT_MODE_BORDER;
        }
    }
};
//# sourceMappingURL=constants.js.map