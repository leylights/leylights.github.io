/**
 * Builds the header & menu
 * 
 * Activates darkmode where and when applicable
 */

import { cws } from '../../cws.js';
import { GoogleAnalyticsController } from './google-analytics-controller.service.js';
import { KeyboardListener } from '../../tools/keyboard-listener.js';
import { Menu, MenuItem } from './menu-items.service.js';
import { CookieInterface } from './cookie-interface.service.js';
import { SideMenuService } from './side-menu.service.js';
import { TopMenuService } from './top-menu.service.js';


enum DarkModeResults {
  Dark,
  Light,
  NoResponse
}

export type PageBuilderDarkModeListener = {
  listener: (isDark: boolean, styleSheet?: CSSStyleSheet) => void,
  config?: {
    notifyOnDebugToggle?: boolean
  }
}

export class PageBuilder {
  private static darkModeListeners: PageBuilderDarkModeListener[] = [];
  private static darkModeStatus: DarkModeResults = DarkModeResults.NoResponse;

  public static publicSiteUrl: string = 'colestanley.ca';

  private static shouldRiverify = !window.location.hostname.includes('colestanley');
  public static personalName = PageBuilder.shouldRiverify ? 'River Stanley' : 'Cole Stanley';
  public static siteName: string = PageBuilder.shouldRiverify ? 'riverstanley.ca' : 'colestanley.ca';
  public static siteLogoSrc: string = PageBuilder.shouldRiverify ? '/siteimages/river-logo.svg' : '/siteimages/logo.svg';

  private static readonly STRUCTURED_DATA = {
    name: 'Cole Stanley',
  }

  static init(buildElements: boolean): void {
    PageBuilder.buildHead();
    if (buildElements) {
      PageBuilder.buildTop();
      TopMenuService.build();
      SideMenuService.build();
      PageBuilder.riverify();

      const darkModeListener = new KeyboardListener(window);
      darkModeListener.addEventListener(async (listener: KeyboardListener) => {
        const result = await checkForDarkMode(listener);
        return (result === DarkModeResults.Dark);
      }, () => {
        PageBuilder.enableDarkMode(true);
        PageBuilder.darkModeStatus = DarkModeResults.Dark;
        cws.forcedLightingMode = -1;
      });
      darkModeListener.addEventListener(async (listener: KeyboardListener) => {
        const result = await checkForDarkMode(listener);
        return (result === DarkModeResults.Light);
      }, () => {
        PageBuilder.removeDarkMode();
        PageBuilder.darkModeStatus = DarkModeResults.Light;
        cws.forcedLightingMode = 1;
      });
    }

    async function checkForDarkMode(listener: KeyboardListener): Promise<DarkModeResults> {
      return checkForPasscode().then(async (validResponse) => {
        if (validResponse) {
          CookieInterface.setCookie(GoogleAnalyticsController.HIDE_COOKIE, 'true');
          return await checkForDark();
        } else
          return DarkModeResults.NoResponse;
      });

      async function checkForPasscode(): Promise<boolean> {
        const pressed = listener.isWordDown('river');
        return pressed;
      }

      async function checkForDark(): Promise<DarkModeResults> {
        await sleep(1500);

        const darkPressed = listener.isWordDown('dark'),
          lightPressed = listener.isWordDown('li');

        if (darkPressed) console.log('Dark mode activated.');
        else if (lightPressed) console.log('Light mode activated.');
        else console.log('No valid input received');

        if (darkPressed) return DarkModeResults.Dark;
        if (lightPressed) return DarkModeResults.Light;
        else return DarkModeResults.NoResponse;
      }

      async function sleep(ms: number): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
    }
  }

  /**
   * Registers a function to be called when the darkness of the page is determined, 
   * or immediately if it already has been
   */
  static addDarkModeListener(listener: PageBuilderDarkModeListener) {
    if (PageBuilder.darkModeStatus == DarkModeResults.Light) {
      listener.listener(false, PageBuilder.getLightModeStyleSheet());
    } else if (PageBuilder.darkModeStatus == DarkModeResults.Dark) {
      listener.listener(true, PageBuilder.getDarkModeStyleSheet());
    }
    PageBuilder.darkModeListeners.push(listener);
  }

  /**
   * Adds the given stylesheet to the <head>
   */
  static loadCSSFile(absolutePath: string) {
    const path: string = cws.getRelativeUrlPath(absolutePath);
    if (document.head.querySelector(`link[rel=stylesheet][href='${path}']`)) return; // don't double-load

    document.head.appendChild(cws.createLinkElement(path, 'stylesheet'));
  }

  /**
   * River-ifies the page
   */
  static riverify(): void {
    if (!this.shouldRiverify) return;

    const logos = Array.from(document.querySelectorAll('#big-logo')).concat(
      Array.from(document.querySelectorAll('.site-logo'))
    );

    logos.forEach((el: HTMLImageElement) => {
      el.src = el.src.replace('/logo', '/river-logo');
      el.classList.add('river-logo');
    });

    // replace title
    document.head.querySelector('title').innerText =
      document.head.querySelector('title').innerText.replace('colestanley.ca', PageBuilder.siteName);

    // replace loading screen
    const loadingLogo = document.body.querySelector('#loadingScreen')?.querySelector('img');
    if (loadingLogo) loadingLogo.src = PageBuilder.siteLogoSrc;
  }

  /**
   * Populates the <head> element
   */
  private static buildHead() {
    PageBuilder.buildGoogleAnalytics();

    const currentPage = this.getCurrentPageData();
    if (currentPage.noindex) PageBuilder.insertMetaTag('robots', 'noindex');
    if (currentPage.description) PageBuilder.insertMetaTag('description', currentPage.description, true);
    PageBuilder.insertMetaTag('author', PageBuilder.STRUCTURED_DATA.name, true);
    if (currentPage.date && currentPage.showDate) PageBuilder.insertMetaTag('date', currentPage.date, true);

    PageBuilder.enableDarkMode(false);
  }

  /**
   * Builds the top of a generic page
   */

  private static buildTop() {
    // loading

    setTimeout(function () {
      (document.getElementById('loadingScreen').children[0] as HTMLElement).style.opacity = '1';
    }, 16);

    document.addEventListener('readystatechange', function (event) { // remove
      console.log(document.readyState, event);

      if (document.readyState === 'complete') {
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(function () {
          document.getElementById('loadingScreen').outerHTML = '';
        }, (parseFloat(window.getComputedStyle(document.getElementById('loadingScreen')).transitionDuration) * 1000));
      }
    });

    // header

    // links

    const gFontsLoad = document.createElement('link');
    gFontsLoad.setAttributeNode(cws.betterCreateAttr('rel', 'preconnect'));
    gFontsLoad.setAttributeNode(cws.betterCreateAttr('href', 'https://fonts.gstatic.com'));
    document.head.appendChild(gFontsLoad);

    const poppins = document.createElement('link');
    poppins.setAttributeNode(cws.betterCreateAttr('rel', 'stylesheet'));
    poppins.setAttributeNode(cws.betterCreateAttr('href', 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&display=swap'));
    document.head.appendChild(poppins);
  }

  private static buildGoogleAnalytics() {
    // exit on dev
    if (!window.location.origin.includes(PageBuilder.publicSiteUrl)) {
      console.log('Hidden from google analytics: on development environment.');
      return;
    } else if (CookieInterface.getCookieValue(GoogleAnalyticsController.HIDE_COOKIE)) {
      console.log('Hidden from google analytics: cookie set.');
      return;
    }

    GoogleAnalyticsController.init();

    document.head.insertAdjacentElement('afterbegin', cws.createElement({
      type: 'script',
      otherNodes: [
        { type: 'async', value: '', },
        { type: 'src', value: 'https://www.google-analytics.com/analytics.js', },
      ],
    }));
  }

  private static getCurrentPageData(): MenuItem {
    const currentPage = transformLink(window.location.pathname);
    const results = Menu.getAll().filter((item: MenuItem) => {
      if (currentPage === transformLink('/' + item.links.href)) return true;
      else if (currentPage === '/index.html' && transformLink(item.links.href) === '') return true;
      return false;
    });

    if (results.length > 1) throw new Error('getCurrentPageData failed.');
    return results[0];

    function transformLink(link: string): string {
      return link.toLowerCase().replace(/\.\.\//g, '');
    }
  }

  private static getDarkModeStyleSheet(): CSSStyleSheet {
    return PageBuilder.genericGetStyleSheet('/main-dark.css');
  }

  private static getLightModeStyleSheet(): CSSStyleSheet {
    return PageBuilder.genericGetStyleSheet('/main.css');
  }

  private static genericGetStyleSheet(hrefFragment: string): CSSStyleSheet {
    const ss = Array.from(document.styleSheets).filter((sheet: CSSStyleSheet) => {
      return sheet.href.includes(hrefFragment);
    })[0];
    return ss;
  }

  /**
   * Adds the main_dark.css stylesheet and notifies listeners
   */
  private static enableDarkMode(isFromDebug: boolean): void {
    // find main.css link
    const mainCSSArr = Array.from(document.getElementsByTagName('link'))
      .filter((x) => { return x.rel == 'stylesheet' })
      .filter((x) => { return x.href.includes('main.css') });

    if (mainCSSArr.length == 0) // MAIN.CSS IS NOT PRESENT ON PAGE; dark mode does not apply
      return;

    const mainCSS = mainCSSArr[0];
    const darkCSS = cws.createLinkElement(cws.getRelativeUrlPath('stylesheets/main-dark.css'), 'stylesheet')

    mainCSS.parentNode.insertBefore(darkCSS, mainCSS.nextSibling); // insertion

    darkCSS.addEventListener('load', () => {
      const darkStyleSheet: CSSStyleSheet = PageBuilder.getDarkModeStyleSheet();
      PageBuilder.darkModeStatus = DarkModeResults.Dark;
      PageBuilder.darkModeListeners.forEach((listener: PageBuilderDarkModeListener) => {
        listener.listener(true, darkStyleSheet);
      });
    });

    // activate listeners
    if (isFromDebug)
      this.darkModeListeners.forEach((listener: PageBuilderDarkModeListener) => {
        if (listener.config?.notifyOnDebugToggle) {
          listener.listener(false, PageBuilder.getDarkModeStyleSheet());
        }
      });
  }

  private static insertMetaTag(name: string, content: string, insertAtTop?: boolean): void {
    const metaTag: HTMLMetaElement = cws.createElement({
      type: 'meta',
      otherNodes: [
        { type: 'name', value: name, },
        { type: 'content', value: content, },
      ]
    });

    if (insertAtTop) document.head.insertAdjacentElement('afterbegin', metaTag);
    else document.head.appendChild(metaTag);
  }

  /**
   * Removes the main_dark.css stylesheet and notifies listeners
   */
  private static removeDarkMode(): void {
    Array.from(document.head.querySelectorAll('link')).forEach((link: HTMLLinkElement) => {
      if (link.href.includes('dark.css'))
        link.remove();
    });

    this.darkModeListeners.forEach((listener: PageBuilderDarkModeListener) => {
      if (listener.config?.notifyOnDebugToggle) {
        listener.listener(false, PageBuilder.getLightModeStyleSheet());
      }
    });
  }
}
