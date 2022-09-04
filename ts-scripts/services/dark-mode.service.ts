import { Leylights } from "../leylights.js";

enum DarkModeStatus {
  Dark,
  Light
}

export type DarkModeListener = {
  listener: (isDark: boolean) => void,
  config?: {
    notifyOnDebugToggle?: boolean
  }
}

export class DarkModeService {
  private static readonly stylesheetClassnames = {
    dark: 'dark-mode-stylesheet',
    light: 'light-mode-stylesheet',
  };

  private static initializations: number = 0;

  static darkModeCookieKey = 'selected-dark-mode';

  private static darkModeListeners: DarkModeListener[] = [];

  private static darkModeStylesheets: HTMLLinkElement[] = [];
  private static lightModeStylesheets: HTMLLinkElement[] = [];

  /**
   * Sets up the DarkModeService.  Doesn't switch to dark mode unless it should.
   */
  static init() {
    if (this.initializations > 0) throw new Error('DarkModeService initialized twice');
    this.initializations++;

    if (this.isDark) document.documentElement.classList.toggle('dark');
    else document.documentElement.classList.toggle('light');

    if ((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) || localStorage.getItem(DarkModeService.darkModeCookieKey)) {
      this.switchTo.darkMode();
    } else
      this.switchTo.lightMode();
  }

  static get darkModeStatus(): DarkModeStatus {
    if (localStorage.getItem(DarkModeService.darkModeCookieKey) === 'dark')
      return DarkModeStatus.Dark;
    else if (localStorage.getItem(DarkModeService.darkModeCookieKey) === 'light')
      return DarkModeStatus.Light;
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      return DarkModeStatus.Dark;
    else
      return DarkModeStatus.Light;
  }

  static get isDark(): boolean {
    return this.darkModeStatus === DarkModeStatus.Dark;
  }

  private static get isDarkByDefault(): boolean {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  static toggleDarkMode(): void {
    document.documentElement.classList.toggle('dark');
    document.documentElement.classList.toggle('light');
    if (document.documentElement.classList.contains('dark')) {
      if (DarkModeService.isDarkByDefault) // returned to dark
        localStorage.removeItem(DarkModeService.darkModeCookieKey);
      else // moved to dark
        localStorage.setItem(DarkModeService.darkModeCookieKey, 'dark');
    } else {
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
  static addDarkModeListener(listener: DarkModeListener) {
    if (DarkModeService.darkModeStatus == DarkModeStatus.Light) {
      listener.listener(false);
    } else if (DarkModeService.darkModeStatus == DarkModeStatus.Dark) {
      listener.listener(true);
    }

    DarkModeService.darkModeListeners.push(listener);
  }

  static fireDarkModeListeners(): void {
    const isDark: boolean = DarkModeService.darkModeStatus === DarkModeStatus.Dark;

    DarkModeService.darkModeListeners.forEach((listener: DarkModeListener) => {
      listener.listener(isDark);
    });
  }

  private static genericSwitchTo(loadedStyles: HTMLLinkElement[], removedStyles: HTMLLinkElement[]) {
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

    Promise.all(tasks).then(() => { // fire all listeners
      DarkModeService.fireDarkModeListeners();
    });
  }

  private static switchTo = {
    darkMode() {
      return DarkModeService.genericSwitchTo(
        DarkModeService.darkModeStylesheets,
        DarkModeService.lightModeStylesheets,
      );
    },

    lightMode() {
      return DarkModeService.genericSwitchTo(
        DarkModeService.lightModeStylesheets,
        DarkModeService.darkModeStylesheets,
      );
    }
  }

  private static genericRegisterStylesheet(absPath: string, array: HTMLLinkElement[], status: DarkModeStatus) {
    const el: HTMLLinkElement = Leylights.createStylesheetElement(absPath);
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
