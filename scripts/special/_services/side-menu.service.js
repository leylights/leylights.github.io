/**
 * SideMenuService
 *
 * Handles the mobile menu
 *
 * @author Cole Stanley
 * Created: 2017
 * Last updated: February 2022
 */
import { cws } from "../../cws.js";
import { Button } from "../_components/button.component.js";
import { Menu } from "./menu-items.service.js";
export class SideMenuService {
    static build() {
        const menu = document.getElementById("hamMenu");
        SideMenuService.generateMenu();
        const categories = [
            menu.querySelector("#games-dropdown-category"),
            menu.querySelector("#tools-dropdown-category"),
            menu.querySelector("#misc-dropdown-category"),
        ];
        categories.forEach((category) => {
            Button.createByAttachment(category, (event) => {
                const path = event.composedPath();
                // If a dropdown was clicked, don't display anything
                for (let i = 0; i < path.length; i++) {
                    if (path[i] instanceof HTMLBodyElement)
                        break;
                    else if (path[i].classList.contains('dropdown'))
                        return;
                }
                SideMenuService.displayMenuItems(category);
            });
        });
        document.getElementById("hamMenu").querySelector('#side-menu-end-button').addEventListener('click', () => { SideMenuService.closeMenu(); });
    }
    static createMenuItem(item, parent) {
        const newItem = document.createElement('div');
        newItem.classList.add('side-menu-item');
        newItem.id = `menu-item-${SideMenuService.itemNo}`;
        newItem.appendChild(cws.createElement({
            type: 'a',
            innerText: item.shortName,
            otherNodes: [getLink()],
        }));
        if (!parent)
            switch (item.type) {
                case 'Game':
                    parent = document.getElementById("games-dropdown-category");
                    break;
                case 'Dropdown':
                case 'Tool':
                    parent = document.getElementById("tools-dropdown-category");
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
                SideMenuService.createMenuItem(child, subMenu);
            });
            return;
        }
        SideMenuService.itemNo++;
        function getLink() {
            if (!item.links.href)
                return null;
            let link;
            if (item.links.href.includes('https'))
                link = item.links.href;
            else
                link = `/${item.links.href}`;
            return { type: 'href', value: link };
        }
    }
    static closeMenu() {
        document.getElementById("hamMenu").style.width = "0%";
        document.getElementById("hamImage").style.opacity = "1";
        document.getElementById("hamMenu").style.minWidth = "0";
        for (let i = 0; i < document.getElementsByClassName("side-menu-item").length; i++)
            document.getElementsByClassName("side-menu-item")[i].style.display = "none";
    }
    static displayMenuItems(category) {
        const buttons = category.querySelectorAll(".side-menu-item");
        buttons.forEach((button) => {
            if (button.style.display !== "block")
                button.style.display = "block";
            else
                button.style.display = "none";
        });
    }
    static generateMenu() {
        const menuItems = Menu.getTopMenu();
        menuItems.games.forEach((item) => { SideMenuService.createMenuItem(item); });
        menuItems.tools.forEach((item) => { SideMenuService.createMenuItem(item); });
    }
    static openMenu() {
        if (document.body.clientWidth < 700) {
            document.getElementById("hamMenu").style.width = "100%";
        }
        else {
            let menuW = Math.round(window.innerWidth * 0.15);
            if (menuW < 200)
                menuW = 200;
            document.getElementById("hamMenu").style.width = menuW + "px";
            document.getElementById("header").style.width = (100 - menuW) + "px";
        }
        document.getElementById("hamImage").style.opacity = "0";
    }
}
SideMenuService.itemNo = 0;
//# sourceMappingURL=side-menu.service.js.map