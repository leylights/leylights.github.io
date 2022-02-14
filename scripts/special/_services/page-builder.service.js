/**
 * Builds the header & menu
 *
 * Activates darkmode where and when applicable
 */
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
import { GoogleAnalyticsController } from "./google-analytics-controller.service.js";
import { KeyboardListener } from "../../tools/keyboard-listener.js";
import { Menu } from "./menu-items.service.js";
import { CookieInterface } from "./cookie-interface.service.js";
import { SideMenuService } from "./side-menu.service.js";
var DarkModeResults;
(function (DarkModeResults) {
    DarkModeResults[DarkModeResults["Dark"] = 0] = "Dark";
    DarkModeResults[DarkModeResults["Light"] = 1] = "Light";
    DarkModeResults[DarkModeResults["NoResponse"] = 2] = "NoResponse";
})(DarkModeResults || (DarkModeResults = {}));
export class PageBuilder {
    static init(buildElements) {
        const index = window.location.href.search("index.html") !== -1 || window.location.href.split(window.location.origin + '/')[1] === '';
        PageBuilder.buildHead();
        if (buildElements) {
            PageBuilder.buildTop(index);
            SideMenuService.build();
            PageBuilder.buildBottom();
            const darkModeListener = new KeyboardListener(window);
            darkModeListener.addEventListener((listener) => __awaiter(this, void 0, void 0, function* () {
                const result = yield checkForDarkMode(listener);
                return (result === DarkModeResults.Dark);
            }), () => {
                PageBuilder.doDarkmode(true);
                PageBuilder.darkModeStatus = DarkModeResults.Dark;
                cws.forcedLightingMode = -1;
            });
            darkModeListener.addEventListener((listener) => __awaiter(this, void 0, void 0, function* () {
                const result = yield checkForDarkMode(listener);
                return (result === DarkModeResults.Light);
            }), () => {
                PageBuilder.removeDarkMode();
                PageBuilder.darkModeStatus = DarkModeResults.Light;
                cws.forcedLightingMode = 1;
            });
        }
        function checkForDarkMode(listener) {
            return __awaiter(this, void 0, void 0, function* () {
                return checkForPasscode().then((validResponse) => __awaiter(this, void 0, void 0, function* () {
                    if (validResponse) {
                        CookieInterface.setCookie(GoogleAnalyticsController.HIDE_COOKIE, 'true');
                        return yield checkForDark();
                    }
                    else
                        return DarkModeResults.NoResponse;
                }));
                function checkForPasscode() {
                    return __awaiter(this, void 0, void 0, function* () {
                        const pressed = listener.isWordDown('river');
                        return pressed;
                    });
                }
                function checkForDark() {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield sleep(1500);
                        const darkPressed = listener.isWordDown('dark'), lightPressed = listener.isWordDown('li');
                        if (darkPressed)
                            console.log('Dark mode activated.');
                        else if (lightPressed)
                            console.log('Light mode activated.');
                        else
                            console.log('No valid input received');
                        if (darkPressed)
                            return DarkModeResults.Dark;
                        if (lightPressed)
                            return DarkModeResults.Light;
                        else
                            return DarkModeResults.NoResponse;
                    });
                }
                function sleep(ms) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return new Promise(resolve => setTimeout(resolve, ms));
                    });
                }
            });
        }
    }
    /**
     * Registers a function to be called when the darkness of the page is determined,
     * or immediately if it already has been
     */
    static addDarkModeListener(listener) {
        if (PageBuilder.darkModeStatus == DarkModeResults.Light) {
            listener.listener(false, PageBuilder.getLightModeStyleSheet());
        }
        else if (PageBuilder.darkModeStatus == DarkModeResults.Dark) {
            listener.listener(true, PageBuilder.getDarkModeStyleSheet());
        }
        PageBuilder.darkModeListeners.push(listener);
    }
    /**
     * Adds the given stylesheet to the <head>
     */
    static loadCSSFile(absolutePath) {
        const path = cws.getRelativeUrlPath(absolutePath);
        if (document.head.querySelector(`link[rel=stylesheet][href="${path}"]`))
            return; // don't double-load
        document.head.appendChild(cws.createLinkElement(path, 'stylesheet'));
    }
    /**
     * Populates the <head> element
     */
    static buildHead() {
        PageBuilder.buildGoogleAnalytics();
        const currentPage = this.getCurrentPageData();
        if (currentPage.noindex)
            PageBuilder.insertMetaTag('robots', 'noindex');
        if (currentPage.description)
            PageBuilder.insertMetaTag('description', currentPage.description, true);
        PageBuilder.insertMetaTag('author', PageBuilder.STRUCTURED_DATA.name, true);
        if (currentPage.date && currentPage.showDate)
            PageBuilder.insertMetaTag('date', currentPage.date, true);
        PageBuilder.doDarkmode(false);
    }
    /**
     * Builds the top of a generic page
     */
    static buildTop(index) {
        // loading
        setTimeout(function () {
            document.getElementById("loadingScreen").children[0].style.opacity = "1";
        }, 16);
        document.addEventListener('readystatechange', function (event) {
            console.log(document.readyState, event);
            if (document.readyState === "complete") {
                document.getElementById("loadingScreen").style.opacity = "0";
                setTimeout(function () {
                    document.getElementById("loadingScreen").outerHTML = "";
                }, (parseFloat(window.getComputedStyle(document.getElementById("loadingScreen")).transitionDuration) * 1000));
            }
        });
        // header
        const header = document.createElement("header");
        header.setAttributeNode(cws.betterCreateAttr("id", "header"));
        let headerContent = `<div id='homeHead'> 
           <div id='headerBounds'> 
             <a href='${cws.getRelativeUrlPath('')}'> 
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
              src='${cws.getRelativeUrlPath('siteimages/menuicon.png')}'> 
         </div>`;
        if (index) // removing ../ from URLs
            headerContent = headerContent.replace(/\.\.\//g, "");
        header.innerHTML = headerContent;
        header.querySelector('#hamImage').addEventListener('click', SideMenuService.openMenu);
        document.body.appendChild(header);
        // menu
        const hamMenu = document.createElement("div");
        hamMenu.id = "hamMenu";
        let menuContent = `<div id = 'side-menu-content'> 
         <div> 
           <h1 id='menuTitle'>menu</h1> 
         </div> 
         <div id='games-dropdown-category' class='side-menu-dropdown-category'>
           <button class='side-menu-category-button'>
             <div>Games</div>
           </button> 
         </div> 
         <div id='tools-dropdown-category' class='side-menu-dropdown-category'>
           <button class='side-menu-category-button'>
             <div>Tools</div>
           </button> 
         </div> 
         <div id='misc-dropdown-category' class='side-menu-dropdown-category'> 
           <button class='side-menu-category-button'>
             <div>Miscellaneous</div>
           </button> 
           <div class='side-menu-item' style='display: none;'>
             <a href='${cws.getRelativeUrlPath('pages/resume.html')}'>Resume</a>
           </div> 
           <div class='side-menu-item' style='display: none;'>
             <a href='${cws.getRelativeUrlPath('pages/archive.html')}'>Project Archive</a>
           </div> 
         </div>
         <img  
         id='side-menu-end-button' 
         src='${cws.getRelativeUrlPath('siteimages/closebutton.png')}'>
       <\div>`;
        if (index)
            menuContent = menuContent.replace(/\.\.\//g, "");
        hamMenu.innerHTML = menuContent;
        hamMenu.querySelector('#side-menu-end-button').addEventListener('click', SideMenuService.closeMenu);
        document.body.appendChild(hamMenu);
        // links
        const gFontsLoad = document.createElement("link");
        gFontsLoad.setAttributeNode(cws.betterCreateAttr("rel", "preconnect"));
        gFontsLoad.setAttributeNode(cws.betterCreateAttr("href", "https://fonts.gstatic.com"));
        document.head.appendChild(gFontsLoad);
        const poppins = document.createElement("link");
        poppins.setAttributeNode(cws.betterCreateAttr("rel", "stylesheet"));
        poppins.setAttributeNode(cws.betterCreateAttr("href", "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&display=swap"));
        document.head.appendChild(poppins);
    }
    static buildGoogleAnalytics() {
        // exit on dev
        if (!window.location.origin.includes(PageBuilder.siteURL)) {
            console.log('Hidden from google analytics: on development environment.');
            return;
        }
        else if (CookieInterface.getCookieValue(GoogleAnalyticsController.HIDE_COOKIE)) {
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
    /**
     * Imports scripts at bottom of HTML
     */
    static buildBottom() {
        generateScript("scripts/special/_services/top-menu.service.js", true);
        function generateScript(name, isModule) {
            const out = document.createElement("script");
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
    static doDarkmode(force) {
        if (force || cws.isDark) {
            this.enableDarkMode(force);
        }
        else {
            const lightStyleSheet = PageBuilder.getLightModeStyleSheet();
            PageBuilder.darkModeStatus = DarkModeResults.Light;
            PageBuilder.darkModeListeners.forEach((listener) => {
                listener.listener(false, lightStyleSheet);
            });
        }
    }
    static getCurrentPageData() {
        const currentPage = transformLink(window.location.pathname);
        const results = Menu.getAll().filter((item) => {
            if (currentPage === transformLink('/' + item.links.href))
                return true;
            else if (currentPage === '/index.html' && transformLink(item.links.href) === '')
                return true;
            return false;
        });
        if (results.length > 1)
            throw new Error('getCurrentPageData failed.');
        return results[0];
        function transformLink(link) {
            return link.toLowerCase().replace(/\.\.\//g, '');
        }
    }
    static getDarkModeStyleSheet() {
        return PageBuilder.genericGetStyleSheet('/main-dark.css');
    }
    static getLightModeStyleSheet() {
        return PageBuilder.genericGetStyleSheet('/main.css');
    }
    static genericGetStyleSheet(hrefFragment) {
        const ss = Array.from(document.styleSheets).filter((sheet) => {
            return sheet.href.includes(hrefFragment);
        })[0];
        return ss;
    }
    /**
     * Adds the main_dark.css stylesheet and notifies listeners
     */
    static enableDarkMode(isFromDebug) {
        // find main.css link
        const mainCSSArr = Array.from(document.getElementsByTagName("link"))
            .filter((x) => { return x.rel == "stylesheet"; })
            .filter((x) => { return x.href.includes("main.css"); });
        if (mainCSSArr.length == 0) // MAIN.CSS IS NOT PRESENT ON PAGE; dark mode does not apply
            return;
        const mainCSS = mainCSSArr[0];
        const darkCSS = cws.createLinkElement(cws.getRelativeUrlPath("stylesheets/main-dark.css"), 'stylesheet');
        mainCSS.parentNode.insertBefore(darkCSS, mainCSS.nextSibling); // insertion
        darkCSS.addEventListener('load', () => {
            const darkStyleSheet = PageBuilder.getDarkModeStyleSheet();
            PageBuilder.darkModeStatus = DarkModeResults.Dark;
            PageBuilder.darkModeListeners.forEach((listener) => {
                listener.listener(true, darkStyleSheet);
            });
        });
        // activate listeners
        if (isFromDebug)
            this.darkModeListeners.forEach((listener) => {
                var _a;
                if ((_a = listener.config) === null || _a === void 0 ? void 0 : _a.notifyOnDebugToggle) {
                    listener.listener(false, PageBuilder.getDarkModeStyleSheet());
                }
            });
    }
    static insertMetaTag(name, content, insertAtTop) {
        const metaTag = cws.createElement({
            type: 'meta',
            otherNodes: [
                { type: 'name', value: name, },
                { type: 'content', value: content, },
            ]
        });
        if (insertAtTop)
            document.head.insertAdjacentElement('afterbegin', metaTag);
        else
            document.head.appendChild(metaTag);
    }
    /**
     * Removes the main_dark.css stylesheet and notifies listeners
     */
    static removeDarkMode() {
        Array.from(document.head.querySelectorAll('link')).forEach((link) => {
            if (link.href.includes('dark.css'))
                link.remove();
        });
        this.darkModeListeners.forEach((listener) => {
            var _a;
            if ((_a = listener.config) === null || _a === void 0 ? void 0 : _a.notifyOnDebugToggle) {
                listener.listener(false, PageBuilder.getLightModeStyleSheet());
            }
        });
    }
}
PageBuilder.darkModeListeners = [];
PageBuilder.darkModeStatus = DarkModeResults.NoResponse;
PageBuilder.siteURL = 'colestanley.ca';
PageBuilder.STRUCTURED_DATA = {
    name: 'Cole Stanley',
};
//# sourceMappingURL=page-builder.service.js.map