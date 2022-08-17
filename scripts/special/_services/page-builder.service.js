/**
 * Builds the header & menu
 *
 * Activates darkmode where and when applicable
 */
import { cws } from '../../cws.js';
import { GoogleAnalyticsController } from './google-analytics-controller.service.js';
import { CookieInterface } from './cookie-interface.service.js';
import { SideMenuService } from './side-menu.service.js';
import { TopMenuService } from './top-menu.service.js';
import { DarkModeService } from './dark-mode.service.js';
import { CoreDataService } from './core-data.service.js';
import { MenuLayouts } from './menus/menu-layouts.data.js';
export class PageBuilder {
    static init(buildElements) {
        PageBuilder.buildHead();
        if (buildElements) {
            PageBuilder.buildTop();
            TopMenuService.build();
            SideMenuService.build();
            PageBuilder.riverify();
            DarkModeService.init();
        }
    }
    /**
     * Adds the given stylesheet to the <head>
     */
    static loadCSSFile(absolutePath) {
        const path = cws.getRelativeUrlPath(absolutePath);
        if (document.head.querySelector(`link[rel=stylesheet][href='${path}']`))
            return; // don't double-load
        document.head.appendChild(cws.createLinkElement(path, 'stylesheet'));
    }
    /**
     * River-ifies the page
     */
    static riverify() {
        var _a;
        if (!CoreDataService.shouldRiverify)
            return;
        const logos = Array.from(document.querySelectorAll('#big-logo')).concat(Array.from(document.querySelectorAll('.site-logo')));
        logos.forEach((el) => {
            el.src = el.src.replace('/logo', '/river-logo');
            el.classList.add('river-logo');
        });
        // replace title
        document.head.querySelector('title').innerText =
            document.head.querySelector('title').innerText.replace('colestanley.ca', CoreDataService.siteName);
        // replace loading screen
        const loadingLogo = (_a = document.body.querySelector('#loadingScreen')) === null || _a === void 0 ? void 0 : _a.querySelector('img');
        if (loadingLogo)
            loadingLogo.src = CoreDataService.siteLogoSrc;
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
    }
    /**
     * Builds the top of a generic page
     */
    static buildTop() {
        // loading
        setTimeout(function () {
            document.getElementById('loadingScreen').children[0].style.opacity = '1';
        }, 16);
        // remove load listener
        PageBuilder.registerLoadListener(() => {
            document.getElementById('loadingScreen').style.opacity = '0';
            setTimeout(function () {
                document.getElementById('loadingScreen').outerHTML = '';
            }, (parseFloat(window.getComputedStyle(document.getElementById('loadingScreen')).transitionDuration) * 1000));
        });
        // set up load listener to listen to load
        document.addEventListener('readystatechange', function () {
            if (document.readyState === 'complete') {
                PageBuilder.loadTarget.dispatchEvent(new Event('load'));
            }
        });
        // links
        const gFontsLoad = cws.createElement({
            type: 'link',
            otherNodes: {
                rel: 'preconnect',
                href: 'https://fonts.gstatic.com'
            }
        });
        document.head.appendChild(gFontsLoad);
        const poppins = cws.createElement({
            type: 'link',
            otherNodes: {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&display=swap'
            }
        });
        document.head.appendChild(poppins);
    }
    static buildGoogleAnalytics() {
        // exit on dev
        if (!window.location.origin.includes(CoreDataService.publicSiteUrl)) {
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
    static getCurrentPageData() {
        const currentPage = transformLink(window.location.pathname);
        const results = MenuLayouts.ALL.filter((item) => {
            if (currentPage === transformLink(item.singleLinks.href))
                return true;
            else if (currentPage === '/index.html' && transformLink(item.singleLinks.href) === '/')
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
    static registerLoadListener(listener) {
        this.loadTarget.addEventListener('load', listener);
    }
}
PageBuilder.STRUCTURED_DATA = {
    name: CoreDataService.personalName,
};
PageBuilder.loadTarget = new EventTarget();
//# sourceMappingURL=page-builder.service.js.map