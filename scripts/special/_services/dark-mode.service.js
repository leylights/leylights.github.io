var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cws } from "../../cws.js";
import { KeyboardListener } from "../../tools/keyboard-listener.js";
import { CookieInterface } from "./cookie-interface.service.js";
import { GoogleAnalyticsController } from "./google-analytics-controller.service.js";
const DEBUG_FORCE_LIGHT_MODE = false;
var DarkModeStatus;
(function (DarkModeStatus) {
    DarkModeStatus[DarkModeStatus["Dark"] = 0] = "Dark";
    DarkModeStatus[DarkModeStatus["Light"] = 1] = "Light";
    DarkModeStatus[DarkModeStatus["NoResponse"] = 2] = "NoResponse";
})(DarkModeStatus || (DarkModeStatus = {}));
export class DarkModeService {
    /**
     * Sets up the DarkModeService.  Doesn't switch to dark mode unless it should.
     */
    static init() {
        if (this.darkModeStylesheets.length > 0)
            throw new Error('DarkModeService initialized twice!');
        // load main-dark.css if necessary
        const mainStylesheet = Array.from(document.querySelectorAll('link[rel=stylesheet]'))
            .filter((el) => { return el.href.includes('main.css'); })[0];
        if (mainStylesheet) {
            this.darkModeStylesheets.push(cws.createStylesheetElement('/stylesheets/main-dark.css'));
            this.mainDarkModeStylesheet = this.darkModeStylesheets[0];
        }
        this.registerDebugListeners();
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !DEBUG_FORCE_LIGHT_MODE) {
            this.switchTo.darkMode();
        }
        else
            this.switchTo.lightMode();
    }
    /**
     * Registers a function to be called when the darkness of the page is determined,
     * or immediately if it already has been
     */
    static addDarkModeListener(listener) {
        if (DarkModeService.darkModeStatus == DarkModeStatus.Light) {
            listener.listener(false, DarkModeService.getStyleSheet.light());
        }
        else if (DarkModeService.darkModeStatus == DarkModeStatus.Dark) {
            listener.listener(true, DarkModeService.getStyleSheet.dark());
        }
        DarkModeService.darkModeListeners.push(listener);
    }
    static genericSwitchTo(loadedStyles, removedStyles, finalStatus) {
        const tasks = loadedStyles.map((ss) => {
            return new Promise((resolve) => {
                document.head.appendChild(ss);
                ss.addEventListener('load', () => {
                    resolve(true);
                });
            });
        });
        tasks.concat(removedStyles.map((ss) => {
            return new Promise((resolve) => {
                if (ss.parentElement) // exists on page
                    ss.remove();
                resolve(true);
            });
        }));
        // load all dark stylesheets
        Promise.all(tasks).then(() => {
            DarkModeService.darkModeStatus = finalStatus;
            const isDark = finalStatus === DarkModeStatus.Dark;
            const css = isDark ? DarkModeService.getStyleSheet.dark() : DarkModeService.getStyleSheet.light();
            DarkModeService.darkModeListeners.forEach((listener) => {
                listener.listener(isDark, css);
            });
        });
    }
    static getCSSStylesheet(linkElement) {
        return Array.from(document.styleSheets).filter((ss) => { return ss.href === linkElement.href; })[0];
    }
    static registerDebugListeners() {
        const darkModeKeyListener = new KeyboardListener(window);
        addKeyboardListener(DarkModeStatus.Dark, 'Dark');
        addKeyboardListener(DarkModeStatus.Light, 'Light');
        function addKeyboardListener(status, type) {
            darkModeKeyListener.addEventListener((listener) => __awaiter(this, void 0, void 0, function* () {
                const result = yield checkForForcedDarkMode(listener);
                return (result === status);
            }), () => {
                status === DarkModeStatus.Light ? DarkModeService.switchTo.lightMode() : DarkModeService.switchTo.darkMode();
                DarkModeService.darkModeStatus = status;
                console.info(`${type} mode activated.`);
            });
        }
        function checkForForcedDarkMode(listener) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolveCheck) => {
                    new Promise((resolvePasswordCheck) => {
                        const pressed = listener.isWordDown('river');
                        resolvePasswordCheck(pressed);
                    }).then((wasPasswordFound) => __awaiter(this, void 0, void 0, function* () {
                        if (!wasPasswordFound)
                            return resolveCheck(DarkModeStatus.NoResponse);
                        CookieInterface.setCookie(GoogleAnalyticsController.HIDE_COOKIE, 'true');
                        yield sleep(1500);
                        const darkPressed = listener.isWordDown('dark'), lightPressed = listener.isWordDown('li');
                        if (darkPressed)
                            return resolveCheck(DarkModeStatus.Dark);
                        else if (lightPressed)
                            return resolveCheck(DarkModeStatus.Light);
                        else {
                            console.log('No valid input received');
                            return resolveCheck(DarkModeStatus.NoResponse);
                        }
                    }));
                });
                function sleep(ms) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return new Promise(resolve => setTimeout(resolve, ms));
                    });
                }
            });
        }
    }
    static genericRegisterStylesheet(absPath, array, status) {
        const el = cws.createStylesheetElement(absPath);
        el.classList.add(status === DarkModeStatus.Light ? this.stylesheetClassnames.light : this.stylesheetClassnames.dark);
        array.push(el);
        if (this.darkModeStatus === status) {
            document.head.appendChild(el);
        }
    }
}
DarkModeService.stylesheetClassnames = {
    dark: 'dark-mode-stylesheet',
    light: 'light-mode-stylesheet',
};
DarkModeService.darkModeListeners = [];
DarkModeService.darkModeStatus = DarkModeStatus.NoResponse;
DarkModeService.darkModeStylesheets = [];
DarkModeService.lightModeStylesheets = [];
DarkModeService.switchTo = {
    darkMode() {
        return DarkModeService.genericSwitchTo(DarkModeService.darkModeStylesheets, DarkModeService.lightModeStylesheets, DarkModeStatus.Dark);
    },
    lightMode() {
        return DarkModeService.genericSwitchTo(DarkModeService.lightModeStylesheets, DarkModeService.darkModeStylesheets, DarkModeStatus.Light);
    }
};
DarkModeService.getStyleSheet = {
    dark: () => {
        return DarkModeService.getCSSStylesheet(DarkModeService.mainDarkModeStylesheet);
    },
    light: () => {
        const mainStyle = Array.from(document.head.querySelectorAll('link[rel=stylesheet]')).filter((link) => {
            return link.href.includes('stylesheets/main.css');
        })[0];
        return DarkModeService.getCSSStylesheet(mainStyle);
    },
};
DarkModeService.registerStylesheet = {
    dark(absPath) {
        DarkModeService.genericRegisterStylesheet(absPath, DarkModeService.darkModeStylesheets, DarkModeStatus.Dark);
    },
    light(absPath) {
        DarkModeService.genericRegisterStylesheet(absPath, DarkModeService.lightModeStylesheets, DarkModeStatus.Light);
    }
};
//# sourceMappingURL=dark-mode.service.js.map