import { PageBuilder } from "../../build-page.js";
import { Menu } from "../../menu-items.js";
import { KeyboardListener } from "../../tools/keyboard-listener.js";
import { ShowcaseItemSpotlight } from "./components/item-spotlight.component.js";
import { ShowcaseItem } from "./components/item.component.js";
import { SpotlightHeader } from "./spotlight-header.js";
class ShowcasePage {
    constructor() {
        this.items = [];
        this.spotlights = [];
        this.menuItems = Menu.getMainMenu();
        this.secretsCreated = false;
        this.elements = {
            mainSpotlight: document.getElementById('showcase-main-spotlight'),
            mainSpotlightImage: document.getElementById('showcase-main-spotlight-image'),
            items: document.getElementById('showcase-items'),
            secretItemsContainer: document.getElementById('showcase-secrets'),
        };
        const me = this;
        // Create items
        me.createItems(Menu.getMainMenu());
        // Enable parallax behaviour
        me.enableParallaxScrolling();
        // Secret menu builder
        const keyListener = new KeyboardListener(window);
        keyListener.addEventListener((listener) => {
            return listener.isWordDown('river');
        }, () => {
            if (me.secretsCreated)
                return;
            const secrets = Menu.getSecretItems();
            me.createItems(secrets, me.elements.secretItemsContainer);
            me.menuItems.concat(secrets);
            me.secretsCreated = true;
        });
        // Handle dark mode
        PageBuilder.addDarkModeListener({
            listener: (isDark, styleSheet) => {
                let newColour;
                if (isDark) {
                    newColour = '#000b';
                }
                else {
                    newColour = '#888b';
                }
                document.documentElement.style.setProperty("--showcase-shadow-colour", newColour);
            },
            config: { notifyOnDebugToggle: true },
        });
    }
    createItems(items, parent = this.elements.items) {
        const me = this;
        items.forEach((menuItem) => {
            if (menuItem.showcase) {
                me.items[me.items.length - 1].giveShadow('bot');
                me.spotlights.push(new ShowcaseItemSpotlight(menuItem, parent));
            }
            me.items.push(new ShowcaseItem(menuItem, parent));
            if (menuItem.showcase)
                me.items[me.items.length - 1].giveShadow('top');
        });
    }
    enableParallaxScrolling() {
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
}
new ShowcasePage();
//# sourceMappingURL=showcase.page.js.map