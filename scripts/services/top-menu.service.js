/**
 * top-menu.service.js
 *
 * @author Cole Stanley,
 * Start Date: January 2021
 */
import { Leylights } from '../leylights.js';
import { CoreDataService } from './core-data.service.js';
import { DarkModeService } from './dark-mode.service.js';
import { MenuItemMulti } from './menus/menu-item-multi.js';
import { MenuItemSingle } from './menus/menu-item-single.js';
import { MenuLayouts } from './menus/menu-layouts.data.js';
import { SideMenuService } from './side-menu.service.js';
export class TopMenuService {
    static build() {
        function getDropdownButton(text, menuId) {
            return Leylights.createElement({
                type: 'div',
                classList: 'header-menu-item-container',
                children: [
                    Leylights.createElement({
                        type: 'div',
                        classList: 'header-menu-item',
                        children: [
                            Leylights.createElement({
                                type: 'span',
                                innerText: text.toLowerCase(),
                            }),
                        ],
                    }),
                    Leylights.createElement({
                        type: 'div',
                        classList: 'header-dropdown-body',
                        id: menuId,
                    })
                ],
            });
        }
        function getNoDropdownButton(text, link, spanId) {
            return Leylights.createElement({
                type: 'div',
                classList: 'header-menu-item-container',
                children: [Leylights.createElement({
                        type: 'div',
                        classList: 'header-menu-item',
                        children: [
                            Leylights.createElement({
                                type: 'a',
                                classList: 'header-link',
                                otherNodes: [{ type: 'href', value: link }],
                                children: [
                                    Leylights.createElement({
                                        type: 'span',
                                        id: spanId,
                                        innerText: text.toLowerCase(),
                                    }),
                                ]
                            })
                        ],
                    }),]
            });
        }
        TopMenuService.header = Leylights.createElement({
            type: 'nav',
            id: 'desktop-header',
            children: [
                Leylights.createElement({
                    type: 'div',
                    id: 'header-inner-bounds',
                    children: [
                        Leylights.createElement({
                            type: 'a',
                            otherNodes: [{ type: 'href', value: '/' }],
                            children: [Leylights.createElement({
                                    type: 'img',
                                    id: 'header-logo',
                                    classList: 'site-logo',
                                    otherNodes: [{ type: 'src', value: CoreDataService.siteLogoSrc }],
                                }), Leylights.createElement({
                                    type: 'h1',
                                    id: 'header-title',
                                    innerText: CoreDataService.siteName,
                                })],
                        }), Leylights.createElement({
                            type: 'div',
                            id: 'header-menu',
                            children: [
                                this.createDarkModeToggle('left-nav-toggle'),
                                getDropdownButton('Games', 'games-menu'),
                                getDropdownButton('Tools', 'tools-menu'),
                                getNoDropdownButton('Archive', '/pages/archive.html'),
                                getNoDropdownButton('Resume', '/pages/resume.html', 'header-resume-button'),
                            ],
                        }),
                    ],
                }),
                Leylights.createElement({
                    type: 'button',
                    id: 'side-menu-opener',
                    children: [
                        Leylights.createElement({
                            type: 'img',
                            id: 'side-menu-opener-image',
                            otherNodes: [{ type: 'src', value: '/siteimages/menuicon.png' }],
                        }),
                    ],
                }),
                this.createDarkModeToggle('right-nav-toggle'),
            ],
        });
        TopMenuService.header.querySelector('#side-menu-opener').addEventListener('click', SideMenuService.toggleMenu);
        TopMenuService.generateMenu();
        document.body.appendChild(TopMenuService.header);
    }
    /**
     * Creates a menu item on any csca page
     */
    static createTopItem(item, parent) {
        // determine parent
        let type = 'a';
        if (!parent) {
            if (item instanceof MenuItemSingle)
                switch (item.type) {
                    case 'Game':
                        parent = TopMenuService.header.querySelector('#games-menu');
                        break;
                    case 'Tool':
                        parent = TopMenuService.header.querySelector('#tools-menu');
                        break;
                }
            else {
                parent = TopMenuService.header.querySelector('#tools-menu');
                type = 'div';
            }
        }
        const newItem = Leylights.createElement({
            type: type,
            classList: 'header-item',
            innerHTML: item instanceof MenuItemSingle && item.isExternalLink
                ? item.shortName + ' (\u2B73)'
                : item.shortName,
        });
        // links need to work on index and child pages
        if (item instanceof MenuItemSingle && item.singleLinks.href) {
            if ((window.location.href.search('index.html') !== -1 || window.location.href.split('colestanley.ca/')[1] === '') || item.singleLinks.href.substring(0, 4) == 'http') // on homepage OR linking externally (e.g. Drive)
                newItem.setAttributeNode(Leylights.betterCreateAttr('href', item.singleLinks.href));
            else // on child page
                newItem.setAttributeNode(Leylights.betterCreateAttr('href', item.singleLinks.href));
        }
        parent.appendChild(newItem);
        if (item instanceof MenuItemMulti) {
            newItem.classList.add('dropdown');
            const subMenu = document.createElement('div');
            subMenu.classList.add('header-dropdown-body');
            newItem.appendChild(subMenu);
            item.children.forEach((child) => {
                TopMenuService.createTopItem(child, subMenu);
            });
        }
    }
    static createDarkModeToggle(id) {
        const toggle = Leylights.createElement({
            type: 'div',
            classList: 'dark-mode-toggle',
            id: id,
            children: [
                Leylights.createElement({
                    type: 'input',
                    otherNodes: { type: 'checkbox' },
                }),
                Leylights.createElement({
                    type: 'div',
                    classList: 'slider',
                }),
            ],
        });
        if (DarkModeService.isDark)
            toggle.querySelector('input').checked = true;
        toggle.querySelector('input').addEventListener('click', function () {
            DarkModeService.toggleDarkMode();
            for (const input of document.querySelectorAll('.dark-mode-toggle input')) {
                if (input !== this)
                    input.checked = !input.checked;
            }
        });
        return toggle;
    }
    static generateMenu() {
        const items = MenuLayouts.TOP_MENU;
        items.games.forEach((item) => {
            TopMenuService.createTopItem(item);
        });
        items.tools.forEach((item) => {
            TopMenuService.createTopItem(item);
        });
    }
}
//# sourceMappingURL=top-menu.service.js.map