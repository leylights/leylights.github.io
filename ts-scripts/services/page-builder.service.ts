/**
 * Builds the header & menu
 *
 * Activates darkmode where and when applicable
 */

import { Molasses } from "../molasses";
import { GoogleAnalyticsController } from "./google-analytics-controller.service";
import { CookieInterface } from "./cookie-interface.service";
import { SideMenuService } from "./side-menu.service";
import { TopMenuService } from "./top-menu.service";
import { DarkModeService } from "./dark-mode.service";
import { CoreDataService } from "./core-data.service";
import { MenuLayouts } from "./menus/menu-layouts.data";
import { MenuItemSingle } from "./menus/menu-item-single";

export class PageBuilder {
  private static readonly STRUCTURED_DATA = {
    name: CoreDataService.personalName,
  };

  private static initTime: number = Date.now();
  private static loadListeners: (() => void)[] = [];

  static init(buildElements: boolean): void {
    PageBuilder.buildHead();
    if (buildElements) {
      PageBuilder.buildTop();
      TopMenuService.build();
      SideMenuService.build();

      DarkModeService.init();
    }
  }

  /**
   * Adds the given stylesheet to the <head>
   */
  static loadCSSFile(absolutePath: string) {
    const path: string = Molasses.getRelativeUrlPath(absolutePath);
    if (document.head.querySelector(`link[rel=stylesheet][href='${path}']`))
      return; // don't double-load

    document.head.appendChild(Molasses.createLinkElement(path, "stylesheet"));
  }

  /**
   * Populates the <head> element
   */
  private static buildHead() {
    // replace title
    const titleElement: HTMLElement = document.head.querySelector("title");
    let title: string = CoreDataService.siteName;
    if (titleElement.innerHTML.trim() !== "") {
      title += " | " + titleElement.innerHTML.trim();
    }
    document.head.querySelector("title").innerText = title;

    // SEO and analytics
    PageBuilder.buildGoogleAnalytics();

    const currentPage = this.getCurrentPageData();
    if (currentPage.noindex) PageBuilder.insertMetaTag("robots", "noindex");
    if (currentPage.description)
      PageBuilder.insertMetaTag("description", currentPage.description, true);
    PageBuilder.insertMetaTag("author", PageBuilder.STRUCTURED_DATA.name, true);
    if (currentPage.date && currentPage.showDate)
      PageBuilder.insertMetaTag("date", currentPage.date, true);
  }

  /**
   * Builds the top of a generic page
   */

  private static buildTop() {
    // loading

    document
      .getElementById("loadingScreen")
      .querySelector("img").style.opacity = "1";

    // register load listener
    PageBuilder.registerLoadListener(() => {
      document.getElementById("loadingScreen").classList.add("hiding");
      setTimeout(function () {
        document.getElementById("loadingScreen").classList.add("hidden");
        setTimeout(() => {
          document.getElementById("loadingScreen").classList.remove("hiding");
        }, 16);
      }, parseFloat(
        window.getComputedStyle(document.getElementById("loadingScreen"))
          .transitionDuration
      ) * 1000);
    });

    // set up load listener to listen to load
    const minimumLoadingTime = 500; // required to prevent 'flashbang loading screen' effect
    document.addEventListener("readystatechange", () => {
      if (document.readyState === "complete") {
        if (Date.now() - PageBuilder.initTime <= minimumLoadingTime)
          setTimeout(() => {
            PageBuilder.fireLoadEvents();
          }, PageBuilder.initTime + minimumLoadingTime - Date.now());
        else PageBuilder.fireLoadEvents();
      }
    });

    // links

    const gFontsLoad = Molasses.createElement({
      type: "link",
      otherNodes: {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
      },
    });
    document.head.appendChild(gFontsLoad);

    const poppins = Molasses.createElement({
      type: "link",
      otherNodes: {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&display=swap",
      },
    });
    document.head.appendChild(poppins);
  }

  private static buildGoogleAnalytics() {
    if (!CoreDataService.isDev) {
      console.log("Hidden from google analytics: on development environment.");
      return;
    } else if (
      CookieInterface.getCookieValue(GoogleAnalyticsController.HIDE_COOKIE)
    ) {
      console.log("Hidden from google analytics: cookie set.");
      return;
    }

    GoogleAnalyticsController.init();
  }

  private static getCurrentPageData(): MenuItemSingle {
    const currentPage = transformLink(window.location.pathname);
    const results = MenuLayouts.ALL.filter((item) => {
      if (currentPage === transformLink(item.singleLinks.href)) return true;
      else if (
        currentPage === "/index.html" &&
        transformLink(item.singleLinks.href) === "/"
      )
        return true;
      return false;
    });

    if (results.length > 1) throw new Error("getCurrentPageData failed.");
    return results[0] as MenuItemSingle;

    function transformLink(link: string): string {
      return link.toLowerCase().replace(/\.\.\//g, "");
    }
  }

  private static insertMetaTag(
    name: string,
    content: string,
    insertAtTop?: boolean
  ): void {
    const metaTag: HTMLMetaElement = Molasses.createElement({
      type: "meta",
      otherNodes: [
        { type: "name", value: name },
        { type: "content", value: content },
      ],
    });

    if (insertAtTop) document.head.insertAdjacentElement("afterbegin", metaTag);
    else document.head.appendChild(metaTag);
  }

  static registerLoadListener(listener: () => any) {
    console.log(document.readyState);
    console.log(listener)
    if (document.readyState === "complete") {
      listener();
    } else {
      PageBuilder.loadListeners.push(listener);
    }
  }

  static fireLoadEvents() {
    PageBuilder.loadListeners.forEach((listener) => listener());
  }
}
