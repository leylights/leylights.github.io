import { KeyboardListener } from "../../tools/keyboard-listener.js";
import { DarkModeService } from "../_services/dark-mode.service.js";
import { MenuItemMulti } from "../_services/menus/menu-item-multi.js";
import { MenuItemSingle } from "../_services/menus/menu-item-single.js";
import { MenuItem } from "../_services/menus/menu-item.js";
import { MenuLayouts } from "../_services/menus/menu-layouts.data.js";
import { PageBuilder } from "../_services/page-builder.service.js";
import { ShowcaseItemSpotlight } from "./components/item-spotlight.component.js";
import { ShowcaseMultiItem } from "./components/multi-item.component.js";
import { ShowcaseItem } from "./components/showcase-item.component.js";
import { ShowcaseSingleItem } from "./components/single-item.component.js";
import { SpotlightHeader } from "./components/spotlight-header.component.js";

export class ShowcasePage {
  items: ShowcaseItem[] = [];
  spotlights: ShowcaseItemSpotlight[] = [];

  private menuItems: MenuItem[];
  private secretsCreated: boolean = false;

  private static isInitialized = false;

  private elements = {
    mainSpotlight: document.getElementById('showcase-main-spotlight'),
    mainSpotlightImage: document.getElementById('showcase-main-spotlight-image'),
    items: document.getElementById('showcase-items'),
    secretItemsContainer: document.getElementById('showcase-secrets'),
  }

  constructor(items: MenuItem[]) {
    const me = this;

    PageBuilder.loadCSSFile('stylesheets/showcase.css');

    // Create items
    me.menuItems = items;
    me.createItems(me.menuItems);

    // Enable parallax behaviour
    me.enableParallaxScrolling();

    // Set up fade-ins
    me.startFadeListeners();

    // Secret menu builder
    const keyListener = new KeyboardListener(window);
    keyListener.addEventListener((listener) => {
      return listener.isWordDown('river');
    }, () => {
      if (me.secretsCreated) return;
      const secrets: MenuItem[] = MenuLayouts.SECRET_ITEMS;
      me.createItems(secrets, me.elements.secretItemsContainer);
      me.menuItems.concat(secrets);
      me.secretsCreated = true;
    });
  }

  private createItems(this: ShowcasePage, items: MenuItem[], parent: HTMLElement = this.elements.items) {
    const me = this;

    items.forEach((menuItem) => {
      if (menuItem.showcase) {
        me.items[me.items.length - 1].giveShadow('bot');
        me.spotlights.push(new ShowcaseItemSpotlight(menuItem, parent));
      }

      if (menuItem instanceof MenuItemSingle) me.items.push(new ShowcaseSingleItem(menuItem, parent));
      else me.items.push(new ShowcaseMultiItem(menuItem as MenuItemMulti, parent));

      if (menuItem.showcase) me.items[me.items.length - 1].giveShadow('top');
    });
  }

  private enableParallaxScrolling(this: ShowcasePage): void {
    const me = this;
    new SpotlightHeader(me.elements.mainSpotlight);

    window.addEventListener('scroll', () => {
      me.spotlights.forEach((sl) => {
        // Ensure all spotlights a valid height
        sl.resizeToContents();
        sl.parallaxScroll();
      });
    });
  }

  static init() {
    if (ShowcasePage.isInitialized) return;
    else ShowcasePage.isInitialized = true;

    if (window.location.pathname.includes('archive'))
      return new ShowcasePage(MenuLayouts.ARCHIVE_MENU);
    else
      return new ShowcasePage(MenuLayouts.MAIN_MENU);
  }

  private startFadeListeners(this: ShowcasePage): void {
    const archivePreface = document.getElementById('archive-items-preface');
    const items = this.items.map((item: ShowcaseSingleItem) => item.container);
    if (archivePreface) items.push(archivePreface);

    const fadeListener = () => {
      items.forEach((item: HTMLElement) => {
        const containerRect = item.getBoundingClientRect();
        if (item.classList.contains('single-item') && containerRect.y + containerRect.height * 0.5 > window.innerHeight) return;
        if (item.classList.contains('multi-item') && containerRect.y > window.innerHeight) return;

        if (!item.classList.contains('animation-playing') && !item.classList.contains('animation-complete')) {
          item.classList.add('animation-playing');
          const animationTime = parseFloat(window.getComputedStyle(item).animationDuration);

          setTimeout(() => {
            item.classList.remove('animation-playing');
            item.classList.add('animation-complete');
          }, animationTime * 1000); // set final state
          setTimeout(() => {
            item.querySelectorAll('.no-opacity').forEach((child) => {
              child.classList.remove('no-opacity');
            });
          }, animationTime * 1000 - 100); // remove animation class
        }
      });
    }

    PageBuilder.registerLoadListener(() => {
      fadeListener();
      window.addEventListener('scroll', fadeListener);
    });
  }
}

ShowcasePage.init();
