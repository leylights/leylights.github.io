/**
 * Builds the header & menu
 * 
 * Activates darkmode where and when applicable
 */

import { cws } from "./cws.js";
import { KeyboardListener } from "./tools/keyboard-listener.js";

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

  static init(): void {
    const index: boolean = window.location.href.search("index.html") !== -1 || window.location.href.split(window.location.origin + '/')[1] === '';

    PageBuilder.buildTop(index);
    PageBuilder.buildBottom();

    const darkModeListener = new KeyboardListener(window);
    darkModeListener.addEventListener(async (listener: KeyboardListener) => {
      const result = await checkForDarkMode(listener);
      return (result === DarkModeResults.Dark);
    }, () => {
      PageBuilder.doDarkmode(true);
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

    async function checkForDarkMode(listener: KeyboardListener): Promise<DarkModeResults> {
      return checkForPasscode().then(async (validResponse) => {
        if (validResponse)
          return await checkForDark();
        else
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
   * Builds the top of a generic page
   */

  static buildTop(index: boolean) {
    // loading

    setTimeout(function () {
      let el = (document.getElementById("loadingScreen").children[0] as HTMLElement);
      el.style.opacity = "1";
    }, 16)

    document.addEventListener('readystatechange', function (event) { // remove
      console.log(document.readyState, event);

      if (document.readyState === "complete") {
        document.getElementById("loadingScreen").style.opacity = "0";
        setTimeout(function () {
          document.getElementById("loadingScreen").outerHTML = "";
        }, (parseFloat(window.getComputedStyle(document.getElementById("loadingScreen")).transitionDuration) * 1000));
      }
    });

    // darkmode

    PageBuilder.doDarkmode(false);

    // header

    let header = document.createElement("header");
    header.setAttributeNode(cws.betterCreateAttr("id", "header"));
    let headerContent =
      `<div id='homeHead'> 
          <div id='headerBounds'> 
            <a href='${cws.getRelativeUrlPath('index.html')}'> 
              <img id='headerLogo' src='${cws.getRelativeUrlPath('siteimages/logo.svg')}' alt='csca'/> 
              <div id = 'headerName'> 
                <h1>colestanley.ca</h1> 
              </div> 
            </a> 
            <div class='headerMenu'> 
              <a class='headerDropBox' href='${cws.getRelativeUrlPath('pages/resume.html')}' onclick = ''> 
                <div class='headerDropButton'>
                  <span id='resume-header-button'>Resume</span>
                </div>  
              </a> 
              <a class='headerDropBox' href='${cws.getRelativeUrlPath('pages/archive.html')}' onclick = ''> 
                <div class='headerDropButton'>Archive</div>  
              </a> 
              <a class='headerDropBox' href='javascript:void(0)' onclick = ''> 
                <div class='headerDropButton'>Tools</div> 
                <div class='headerDropBody' id='toolsMenu'></div> 
              </a> 
              <a class='headerDropBox' href='javascript:void(0)' onclick = ''> 
                <div class='headerDropButton'>Games</div> 
                <div class='headerDropBody' id='gamesMenu'></div> 
              </a> 
            </div> 
          </div> 
          <img id='hamImage' 
             src='${cws.getRelativeUrlPath('siteimages/menuicon.png')}' onclick='openHam();'> 
        </div>`;

    if (index) // removing ../ from URLs
      headerContent = headerContent.replace(/\.\.\//g, "");

    header.innerHTML = headerContent;

    document.body.appendChild(header);

    // menu

    let hamMenu = document.createElement("div");
    hamMenu.id = "hamMenu";

    let menuContent =
      `<div id = 'side-menu-content'> 
        <div> 
          <h1 id='menuTitle' onclick='closeHam()'>menu</h1> 
        </div> 
        <div id='gamesMenuItem' class='secretDropdownContainer'>
          <button class='upperHam'>
            <div>Games</div>
          </button> 
        </div> 
        <div id='sitesMenuItem' class='secretDropdownContainer'>
          <button class='upperHam'>
            <div>Gadgets &amp; Tools</div>
          </button> 
        </div> 
        <div id='miscMenuItem' class='secretDropdownContainer'> 
          <button class='upperHam'>
            <div>Miscellaneous</div>
          </button> 
          <div class='lowerHam' style='display: none;'>
            <a href='${cws.getRelativeUrlPath('pages/resume.html')}'>Resume</a>
          </div> 
          <div class='lowerHam' style='display: none;'>
            <a href='${cws.getRelativeUrlPath('pages/archive.html')}'>Project Archive</a>
          </div> 
        </div>
        <img  
        class='side-menu-end-button' 
        src='${cws.getRelativeUrlPath('siteimages/closebutton.png')}' onclick='closeHam()'>
      <\div>`;

    if (index)
      menuContent = menuContent.replace(/\.\.\//g, "");

    hamMenu.innerHTML = menuContent;
    document.body.appendChild(hamMenu);

    // links

    let gFontsLoad = document.createElement("link");
    gFontsLoad.setAttributeNode(cws.betterCreateAttr("rel", "preconnect"));
    gFontsLoad.setAttributeNode(cws.betterCreateAttr("href", "https://fonts.gstatic.com"));
    document.head.appendChild(gFontsLoad);

    let poppins = document.createElement("link");
    poppins.setAttributeNode(cws.betterCreateAttr("rel", "stylesheet"));
    poppins.setAttributeNode(cws.betterCreateAttr("href", "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&display=swap"));
    document.head.appendChild(poppins);
  }

  /**
   * Imports scripts at bottom of HTML
   */

  static buildBottom() {
    generateScript("scripts/top-menu.js", true);
    generateScript("scripts/side-menu-open-close.js", false);
    generateScript("scripts/side-menu.js", true);

    function generateScript(name: string, isModule?: boolean): void {
      let out = document.createElement("script");
      if (isModule)
        out.setAttributeNode(cws.betterCreateAttr("type", "module"));
      out.setAttributeNode(cws.betterCreateAttr("src", cws.getRelativeUrlPath(name)));
      document.body.appendChild(out);
    }
  }

  /**
   * Activates main-dark.css at night
   * 
   * @param force Forces darkmode to activate no matter the time of day
   */

  static doDarkmode(force?: boolean) {
    if (force || cws.isDark) {
      this.enableDarkMode(force);
    } else {
      const lightStyleSheet: CSSStyleSheet = PageBuilder.getLightModeStyleSheet();
      PageBuilder.darkModeStatus = DarkModeResults.Light;
      PageBuilder.darkModeListeners.forEach((listener: PageBuilderDarkModeListener) => {
        listener.listener(false, lightStyleSheet);
      });
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
  static enableDarkMode(isFromDebug: boolean): void {
    // find main.css link
    const mainCSSArr = Array.from(document.getElementsByTagName("link"))
      .filter((x) => { return x.rel == "stylesheet" })
      .filter((x) => { return x.href.includes("main.css") });

    if (mainCSSArr.length == 0) // MAIN.CSS IS NOT PRESENT ON PAGE; dark mode does not apply
      return;

    const mainCSS = mainCSSArr[0];
    const darkCSS = cws.createLinkElement(cws.getRelativeUrlPath("stylesheets/main-dark.css"), 'stylesheet')

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

  /**
   * Removes the main_dark.css stylesheet and notifies listeners
   */
  static removeDarkMode(): void {
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

PageBuilder.init();