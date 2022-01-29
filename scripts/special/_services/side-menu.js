/**
 * ham_menu.js
 *
 * Handles the mobile menu
 *
 * @author Cole Stanley
 * Created: 2017
 * Last updated: August 2021
 */
import { cws } from "./cws.js";
import { Menu } from "./special/menu-items.js";
import { Button } from "./special/_components/button.component.js";
var itemNo = 0;
// menu title
document.getElementById("hamMenu").children[0].children[0].setAttributeNode(cws.betterCreateAttr("onclick", "closeHam()"));
/**
 * Creates a menu item on any csca page
 */
function createHamItem(item, parent) {
    let newItem = document.createElement('div');
    newItem.classList.add('lowerHam');
    newItem.id = `menuItem${itemNo}`;
    newItem.innerHTML = `<a ${getLink()}>${item.shortName}</a>`;
    if (!parent)
        switch (item.type) {
            case 'Game':
                parent = document.getElementById("gamesMenuItem");
                break;
            case 'Dropdown':
            case 'Tool':
                parent = document.getElementById("sitesMenuItem");
        }
    parent.appendChild(newItem);
    if (item.children) {
        newItem.classList.add('dropdown');
        const subMenu = document.createElement('div');
        subMenu.classList.add('side-menu-dropdown');
        newItem.appendChild(subMenu);
        Button.createByAttachment(newItem, () => {
            if (subMenu.style.display !== '')
                subMenu.style.display = '';
            else
                subMenu.style.display = 'block';
        });
        item.children.forEach((child) => {
            createHamItem(child, subMenu);
        });
        return;
    }
    itemNo++;
    function getLink() {
        if (item.links.href) {
            if (location.href.split("/").slice(-1)[0] === 'index.html' || item.links.href.substring(0, 4) == "http")
                return `href = ${item.links.href}`;
            else
                return `href = ../${item.links.href}`;
        }
        else
            return '';
    }
}
function displayMenuItems(row) {
    let buttons = document.getElementsByClassName("secretDropdownContainer")[row].getElementsByClassName("lowerham");
    for (let i = 0; i < buttons.length; i++) {
        let button = buttons[i];
        if (button.style.display !== "block")
            button.style.display = "block";
        else
            button.style.display = "none";
    }
}
function generateMenu() {
    let menuItems = Menu.getTopMenu();
    menuItems.games.forEach((item) => { createHamItem(item); });
    menuItems.tools.forEach((item) => { createHamItem(item); });
}
function init() {
    let menu = document.getElementById("hamMenu");
    generateMenu();
    Button.createByAttachment(menu.querySelector("#gamesMenuItem"), () => { displayMenuItems(0); });
    Button.createByAttachment(menu.querySelector("#sitesMenuItem"), (event) => {
        const path = event.composedPath();
        for (let i = 0; i < path.length; i++) {
            if (path[i] instanceof HTMLBodyElement)
                break;
            else if (path[i].classList.contains('dropdown'))
                return;
        }
        displayMenuItems(1);
    });
    Button.createByAttachment(menu.querySelector("#miscMenuItem"), () => { displayMenuItems(2); });
}
init();
//# sourceMappingURL=side-menu.js.map