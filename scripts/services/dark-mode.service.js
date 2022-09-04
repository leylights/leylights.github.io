import { Leylights } from "../leylights.js";
var DarkModeStatus;
(function (DarkModeStatus) {
    DarkModeStatus[DarkModeStatus["Dark"] = 0] = "Dark";
    DarkModeStatus[DarkModeStatus["Light"] = 1] = "Light";
})(DarkModeStatus || (DarkModeStatus = {}));
export class DarkModeService {
    /**
     * Sets up the DarkModeService.  Doesn't switch to dark mode unless it should.
     */
    static init() {
        if (this.initializations > 0)
            throw new Error('DarkModeService initialized twice');
        this.initializations++;
        if (this.isDark)
            document.documentElement.classList.toggle('dark');
        else
            document.documentElement.classList.toggle('light');
        if ((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) || localStorage.getItem(DarkModeService.darkModeCookieKey)) {
            this.switchTo.darkMode();
        }
        else
            this.switchTo.lightMode();
    }
    static get darkModeStatus() {
        if (localStorage.getItem(DarkModeService.darkModeCookieKey) === 'dark')
            return DarkModeStatus.Dark;
        else if (localStorage.getItem(DarkModeService.darkModeCookieKey) === 'light')
            return DarkModeStatus.Light;
        else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
            return DarkModeStatus.Dark;
        else
            return DarkModeStatus.Light;
    }
    static get isDark() {
        return this.darkModeStatus === DarkModeStatus.Dark;
    }
    static get isDarkByDefault() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    static toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        document.documentElement.classList.toggle('light');
        if (document.documentElement.classList.contains('dark')) {
            if (DarkModeService.isDarkByDefault) // returned to dark
                localStorage.removeItem(DarkModeService.darkModeCookieKey);
            else // moved to dark
                localStorage.setItem(DarkModeService.darkModeCookieKey, 'dark');
        }
        else {
            if (DarkModeService.isDarkByDefault) // moved to light
                localStorage.setItem(DarkModeService.darkModeCookieKey, 'light');
            else // returned to light
                localStorage.removeItem(DarkModeService.darkModeCookieKey);
        }
        this.fireDarkModeListeners();
    }
    /**
     * Registers a function to be called when the darkness of the page is determined,
     * or immediately if it already has been
     */
    static addDarkModeListener(listener) {
        if (DarkModeService.darkModeStatus == DarkModeStatus.Light) {
            listener.listener(false);
        }
        else if (DarkModeService.darkModeStatus == DarkModeStatus.Dark) {
            listener.listener(true);
        }
        DarkModeService.darkModeListeners.push(listener);
    }
    static fireDarkModeListeners() {
        const isDark = DarkModeService.darkModeStatus === DarkModeStatus.Dark;
        DarkModeService.darkModeListeners.forEach((listener) => {
            listener.listener(isDark);
        });
    }
    static genericSwitchTo(loadedStyles, removedStyles) {
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
        Promise.all(tasks).then(() => {
            DarkModeService.fireDarkModeListeners();
        });
    }
    static genericRegisterStylesheet(absPath, array, status) {
        const el = Leylights.createStylesheetElement(absPath);
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
DarkModeService.initializations = 0;
DarkModeService.darkModeCookieKey = 'selected-dark-mode';
DarkModeService.darkModeListeners = [];
DarkModeService.darkModeStylesheets = [];
DarkModeService.lightModeStylesheets = [];
DarkModeService.switchTo = {
    darkMode() {
        return DarkModeService.genericSwitchTo(DarkModeService.darkModeStylesheets, DarkModeService.lightModeStylesheets);
    },
    lightMode() {
        return DarkModeService.genericSwitchTo(DarkModeService.lightModeStylesheets, DarkModeService.darkModeStylesheets);
    }
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