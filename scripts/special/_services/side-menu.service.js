/**
 * SideMenuService
 *
 * Handles the mobile menu
 *
 * @author Cole Stanley
 * Created: 2017
 * Last updated: February 2022
 */
import { cws } from '../../cws.js';
import { Button } from '../_components/button.component.js';
import { Menu } from './menu-items.service.js';
export class SideMenuService {
    static build() {
        SideMenuService.menu = SideMenuService.buildMenuStructure();
        SideMenuService.generateMenu();
        const categories = Array.from(SideMenuService.menu.querySelectorAll('.side-menu-dropdown-category'));
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
        SideMenuService.menu.querySelector('#side-menu-end-button').addEventListener('click', () => { SideMenuService.closeMenu(); });
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
                    parent = document.getElementById('games-dropdown-category');
                    break;
                case 'Dropdown':
                case 'Tool':
                    parent = document.getElementById('tools-dropdown-category');
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
    static buildMenuStructure() {
        function createCategory(name, type, content) {
            return cws.createElement({
                type: 'div',
                id: `${type}-dropdown-category`,
                classList: 'side-menu-dropdown-category side-menu-top-level-item',
                children: (content || []).concat([cws.createElement({
                        type: 'button',
                        classList: 'side-menu-top-level-button',
                        innerHTML: name,
                    })]),
            });
        }
        function createTopLevelButton(name, link) {
            return cws.createElement({
                type: 'div',
                classList: 'side-menu-top-level-item',
                children: [cws.createElement({
                        type: 'a',
                        classList: 'side-menu-top-level-button',
                        otherNodes: [{ type: 'href', value: link }],
                        innerText: name,
                    })]
            });
        }
        const sideMenu = cws.createElement({
            type: 'nav',
            id: 'side-menu',
            children: [
                cws.createElement({
                    type: 'div',
                    id: 'side-menu-content',
                    children: [
                        cws.createElement({
                            type: 'div',
                            id: 'side-menu-title-container',
                            children: [cws.createElement({
                                    type: 'h1',
                                    id: 'side-menu-title',
                                    innerText: 'menu',
                                })],
                        }),
                        createCategory('Games', 'games'),
                        createCategory('Tools', 'tools'),
                        createTopLevelButton('Archive', '/pages/archive.html'),
                        createTopLevelButton('Resume', '/pages/resume.html'),
                        cws.createElement({
                            type: 'button',
                            id: 'side-menu-end-button',
                            children: [cws.createElement({
                                    type: 'img',
                                    otherNodes: [{ type: 'src', value: '/siteimages/closebutton.png' }],
                                })]
                        })
                    ],
                }),
            ]
        });
        sideMenu.querySelector('#side-menu-end-button').addEventListener('click', SideMenuService.closeMenu);
        document.body.appendChild(sideMenu);
        return sideMenu;
    }
    static closeMenu() {
        SideMenuService.menu.style.width = '0%';
        document.getElementById('side-menu-opener').style.opacity = '1';
        SideMenuService.menu.style.minWidth = '0';
        for (let i = 0; i < document.getElementsByClassName('side-menu-item').length; i++)
            document.getElementsByClassName('side-menu-item')[i].style.display = 'none';
    }
    static displayMenuItems(category) {
        const buttons = category.querySelectorAll('.side-menu-item');
        buttons.forEach((button) => {
            if (button.style.display !== 'block')
                button.style.display = 'block';
            else
                button.style.display = 'none';
        });
    }
    static generateMenu() {
        const menuItems = Menu.getTopMenu();
        menuItems.games.forEach((item) => { SideMenuService.createMenuItem(item); });
        menuItems.tools.forEach((item) => { SideMenuService.createMenuItem(item); });
    }
    static openMenu() {
        if (document.body.clientWidth < 700) {
            SideMenuService.menu.style.width = '100%';
        }
        else {
            let menuW = Math.round(window.innerWidth * 0.15);
            if (menuW < 200)
                menuW = 200;
            SideMenuService.menu.style.width = menuW + 'px';
            document.getElementById('header').style.width = (100 - menuW) + 'px';
        }
        document.getElementById('side-menu-opener').style.opacity = '0';
    }
}
SideMenuService.itemNo = 0;
//# sourceMappingURL=side-menu.service.js.map