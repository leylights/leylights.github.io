import { cws } from "../../cws.js";
import { KeyboardListener } from "../../tools/keyboard-listener.js";
import { CookieInterface } from "./cookie-interface.service.js";
import { GoogleAnalyticsController } from "./google-analytics-controller.service.js";

const DEBUG_FORCE_LIGHT_MODE: boolean = false;

enum DarkModeStatus {
  Dark,
  Light,
  NoResponse
}

export type DarkModeListener = {
  listener: (isDark: boolean, styleSheet?: CSSStyleSheet) => void,
  config?: {
    notifyOnDebugToggle?: boolean
  }
}

export class DarkModeService {
  private static readonly stylesheetClassnames = {
    dark: 'dark-mode-stylesheet',
    light: 'light-mode-stylesheet',
  };

  private static darkModeListeners: DarkModeListener[] = [];
  private static darkModeStatus: DarkModeStatus = DarkModeStatus.NoResponse;

  private static darkModeStylesheets: HTMLLinkElement[] = [];
  private static lightModeStylesheets: HTMLLinkElement[] = [];

  private static mainDarkModeStylesheet: HTMLLinkElement;

  /**
   * Sets up the DarkModeService.  Doesn't switch to dark mode unless it should.
   */
  static init() {
    if (this.darkModeStylesheets.length > 0) throw new Error('DarkModeService initialized twice!');

    // load main-dark.css if necessary
    const mainStylesheet: HTMLLinkElement = Array.from(
      document.querySelectorAll('link[rel=stylesheet]') as NodeListOf<HTMLLinkElement>)
      .filter((el: HTMLLinkElement) => { return el.href.includes('main.css') })[0];

    if (mainStylesheet) {
      this.darkModeStylesheets.push(cws.createStylesheetElement('/stylesheets/main-dark.css'));
      this.mainDarkModeStylesheet = this.darkModeStylesheets[0];
    }

    this.registerDebugListeners();

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !DEBUG_FORCE_LIGHT_MODE) {
      this.switchTo.darkMode();
    } else
      this.switchTo.lightMode();
  }

  /**
   * Registers a function to be called when the darkness of the page is determined, 
   * or immediately if it already has been
   */
  static addDarkModeListener(listener: DarkModeListener) {
    if (DarkModeService.darkModeStatus == DarkModeStatus.Light) {
      listener.listener(false, DarkModeService.getStyleSheet.light());
    } else if (DarkModeService.darkModeStatus == DarkModeStatus.Dark) {
      listener.listener(true, DarkModeService.getStyleSheet.dark());
    }

    DarkModeService.darkModeListeners.push(listener);
  }

  private static genericSwitchTo(loadedStyles: HTMLLinkElement[], removedStyles: HTMLLinkElement[], finalStatus: DarkModeStatus) {
    const tasks: Promise<boolean>[] = loadedStyles.map((ss: HTMLLinkElement) => {
      return new Promise((resolve) => {
        document.head.appendChild(ss);
        ss.addEventListener('load', () => {
          resolve(true);
        });
      });
    });

    tasks.concat(removedStyles.map((ss: HTMLLinkElement) => {
      return new Promise((resolve) => {
        if (ss.parentElement) // exists on page
          ss.remove();

        resolve(true);
      });
    }));

    // load all dark stylesheets
    Promise.all(tasks).then(() => { // fire all listeners
      DarkModeService.darkModeStatus = finalStatus;

      const isDark: boolean = finalStatus === DarkModeStatus.Dark;

      const css: CSSStyleSheet = isDark ? DarkModeService.getStyleSheet.dark() : DarkModeService.getStyleSheet.light();
      DarkModeService.darkModeListeners.forEach((listener: DarkModeListener) => {
        listener.listener(isDark, css);
      });
    });
  }

  private static switchTo = {
    darkMode() {
      return DarkModeService.genericSwitchTo(
        DarkModeService.darkModeStylesheets,
        DarkModeService.lightModeStylesheets,
        DarkModeStatus.Dark
      );
    },

    lightMode() {
      return DarkModeService.genericSwitchTo(
        DarkModeService.lightModeStylesheets,
        DarkModeService.darkModeStylesheets,
        DarkModeStatus.Light
      );
    }
  }

  private static getStyleSheet = {
    dark: () => {
      return DarkModeService.getCSSStylesheet(DarkModeService.mainDarkModeStylesheet);
    },

    light: () => {
      const mainStyle: HTMLLinkElement = Array.from(document.head.querySelectorAll('link[rel=stylesheet]') as NodeListOf<HTMLLinkElement>).filter((link) => {
        return link.href.includes('stylesheets/main.css');
      })[0];
      return DarkModeService.getCSSStylesheet(mainStyle);
    },
  }

  private static getCSSStylesheet(linkElement: HTMLLinkElement): CSSStyleSheet {
    return Array.from(document.styleSheets).filter((ss) => { return ss.href === linkElement.href })[0]
  }

  private static registerDebugListeners() {
    const darkModeKeyListener = new KeyboardListener(window);

    addKeyboardListener(DarkModeStatus.Dark, 'Dark');
    addKeyboardListener(DarkModeStatus.Light, 'Light');

    function addKeyboardListener(status: DarkModeStatus, type: string) {
      darkModeKeyListener.addEventListener(async (listener: KeyboardListener) => {
        const result = await checkForForcedDarkMode(listener);
        return (result === status);
      }, () => {
        status === DarkModeStatus.Light ? DarkModeService.switchTo.lightMode() : DarkModeService.switchTo.darkMode();
        DarkModeService.darkModeStatus = status;

        console.info(`${type} mode activated.`);
      });
    }

    async function checkForForcedDarkMode(listener: KeyboardListener): Promise<DarkModeStatus> {
      return new Promise((resolveCheck) => {
        new Promise((resolvePasswordCheck) => {
          const pressed: boolean = listener.isWordDown('river');
          resolvePasswordCheck(pressed);
        }).then(async (wasPasswordFound: boolean) => {
          if (!wasPasswordFound) return resolveCheck(DarkModeStatus.NoResponse);

          CookieInterface.setCookie(GoogleAnalyticsController.HIDE_COOKIE, 'true');

          await sleep(1500);

          const darkPressed = listener.isWordDown('dark'),
            lightPressed = listener.isWordDown('li');
          
          if (darkPressed) return resolveCheck(DarkModeStatus.Dark);
          else if (lightPressed) return resolveCheck(DarkModeStatus.Light);
          else {
            console.log('No valid input received');
            return resolveCheck(DarkModeStatus.NoResponse);
          }
        })
      });

      async function sleep(ms: number): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
    }
  }

  static genericRegisterStylesheet(absPath: string, array: HTMLLinkElement[], status: DarkModeStatus) {
    const el: HTMLLinkElement = cws.createStylesheetElement(absPath);
    el.classList.add(status === DarkModeStatus.Light ? this.stylesheetClassnames.light : this.stylesheetClassnames.dark);

    array.push(el);
    if (this.darkModeStatus === status) {
      document.head.appendChild(el);
    }
  }

  static registerStylesheet = {
    dark(absPath: string) {
      DarkModeService.genericRegisterStylesheet(absPath, DarkModeService.darkModeStylesheets, DarkModeStatus.Dark);
    },

    light(absPath: string) {
      DarkModeService.genericRegisterStylesheet(absPath, DarkModeService.lightModeStylesheets, DarkModeStatus.Light);
    }
  }
}
