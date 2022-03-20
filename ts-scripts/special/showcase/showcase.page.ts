import { KeyboardListener } from "../../tools/keyboard-listener.js";
import { Menu, MenuItem } from "../_services/menu-items.service.js";
import { PageBuilder } from "../_services/page-builder.service.js";
import { ShowcaseItemSpotlight } from "./components/item-spotlight.component.js";
import { ShowcaseItem } from "./components/item.component.js";
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

    // Secret menu builder
    const keyListener = new KeyboardListener(window);
    keyListener.addEventListener((listener) => {
      return listener.isWordDown('river');
    }, () => {
      if (me.secretsCreated) return;
      const secrets: MenuItem[] = Menu.getSecretItems();
      me.createItems(secrets, me.elements.secretItemsContainer);
      me.menuItems.concat(secrets);
      me.secretsCreated = true;
    });

    // Handle dark mode
    PageBuilder.addDarkModeListener({
      listener: (isDark: boolean) => {
        let newColour: string;
        if (isDark) {
          newColour = '#000b';
        } else {
          newColour = '#888b';
        }
        document.documentElement.style.setProperty("--showcase-shadow-colour", newColour);
      },
      config: { notifyOnDebugToggle: true },
    });
  }

  private createItems(this: ShowcasePage, items: MenuItem[], parent: HTMLElement = this.elements.items) {
    const me = this;
    items.forEach((menuItem) => {
      if (menuItem.showcase) {
        me.items[me.items.length - 1].giveShadow('bot');
        me.spotlights.push(new ShowcaseItemSpotlight(menuItem, parent));
      }

      me.items.push(new ShowcaseItem(menuItem, parent));

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
      return new ShowcasePage(Menu.getArchiveMenu());
    else
      return new ShowcasePage(Menu.getMainMenu());
  }
}

ShowcasePage.init();
