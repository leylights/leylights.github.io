
/**
 * top-menu.js
 * 
 * @author Cole Stanley, 
 * Start Date: January 2021
 * Last Update: June 2021
 */

import { cws } from "./cws.js";
import { Menu, MenuItem } from "./menu-items.js";

/**
 * Creates a menu item on any csca page
 */

function createTopItem(item: MenuItem, parent?: HTMLElement) {
  // determine parent
  if (!parent)
    switch (item.type) {
      case "Game":
        parent = document.getElementById("gamesMenu");
        break;
      case "Dropdown":
      case "Tool":
        parent = document.getElementById("toolsMenu");
        break;
    }

  let newItem = document.createElement("a");
  newItem.innerHTML = item.shortName;

  // links need to work on index and child pages

  if (item.links.href) {
    if ((window.location.href.search("index.html") !== -1 || window.location.href.split("colestanley.ca/")[1] === "") || item.links.href.substring(0, 4) == "http") // on homepage OR linking externally (e.g. Drive)
      newItem.setAttributeNode(cws.betterCreateAttr("href", item.links.href));
    else // on child page
      newItem.setAttributeNode(cws.betterCreateAttr("href", "../" + item.links.href));
  }

  parent.appendChild(newItem);

  if (item.type === 'Dropdown') {
    newItem.classList.add('dropdown');
    const subMenu = document.createElement('div');
    subMenu.classList.add('headerDropBody');
    newItem.appendChild(subMenu)
    item.children.forEach((child: MenuItem) => {
      createTopItem(child, subMenu);
    });
  }
}

function generateMenu(): void {
  let items = Menu.getTopMenu();

  items.games.forEach((item: MenuItem) => {
    createTopItem(item);
  });

  items.tools.forEach((item: MenuItem) => {
    createTopItem(item);
  });
}

generateMenu();