/**
 * top-menu.service.js
 *
 * @author Cole Stanley,
 * Start Date: January 2021
 */
import { cws } from '../../cws.js';
import { CoreDataService } from './core-data.service.js';
import { MenuItemMulti } from './menus/menu-item-multi.js';
import { MenuItemSingle } from './menus/menu-item-single.js';
import { MenuLayouts } from './menus/menu-layouts.data.js';
import { SideMenuService } from './side-menu.service.js';
export class TopMenuService {
    static build() {
        function getDropdownButton(text, menuId) {
            return cws.createElement({
                type: 'div',
                classList: 'header-menu-item-container',
                children: [
                    cws.createElement({
                        type: 'div',
                        classList: 'header-menu-item',
                        children: [
                            cws.createElement({
                                type: 'span',
                                innerText: text.toLowerCase(),
                            }),
                        ],
                    }),
                    cws.createElement({
                        type: 'div',
                        classList: 'header-dropdown-body',
                        id: menuId,
                    })
                ],
            });
        }
        function getNoDropdownButton(text, link, spanId) {
            return cws.createElement({
                type: 'div',
                classList: 'header-menu-item-container',
                children: [cws.createElement({
                        type: 'div',
                        classList: 'header-menu-item',
                        children: [
                            cws.createElement({
                                type: 'a',
                                classList: 'header-link',
                                otherNodes: [{ type: 'href', value: link }],
                                children: [
                                    cws.createElement({
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
        TopMenuService.header = cws.createElement({
            type: 'nav',
            id: 'desktop-header',
            children: [
                cws.createElement({
                    type: 'div',
                    id: 'header-inner-bounds',
                    children: [
                        cws.createElement({
                            type: 'a',
                            otherNodes: [{ type: 'href', value: '/' }],
                            children: [cws.createElement({
                                    type: 'img',
                                    id: 'header-logo',
                                    classList: 'site-logo',
                                    otherNodes: [{ type: 'src', value: CoreDataService.siteLogoSrc }],
                                }), cws.createElement({
                                    type: 'h1',
                                    id: 'header-title',
                                    innerText: CoreDataService.siteName,
                                })],
                        }), cws.createElement({
                            type: 'div',
                            id: 'header-menu',
                            children: [
                                getDropdownButton('Games', 'games-menu'),
                                getDropdownButton('Tools', 'tools-menu'),
                                getNoDropdownButton('Archive', '/pages/archive.html'),
                                getNoDropdownButton('Resume', '/pages/resume.html', 'header-resume-button'),
                            ],
                        }),
                    ],
                }),
                cws.createElement({
                    type: 'button',
                    id: 'side-menu-opener',
                    children: [
                        cws.createElement({
                            type: 'img',
                            id: 'side-menu-opener-image',
                            otherNodes: [{ type: 'src', value: '/siteimages/menuicon.png' }],
                        }),
                    ],
                }),
            ],
        });
        TopMenuService.header.querySelector('#side-menu-opener').addEventListener('click', SideMenuService.openMenu);
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
        const newItem = cws.createElement({
            type: type,
            classList: 'header-item',
            innerHTML: item instanceof MenuItemSingle && item.isExternalLink
                ? item.shortName + ' (\u2B73)'
                : item.shortName,
        });
        // links need to work on index and child pages
        if (item instanceof MenuItemSingle && item.singleLinks.href) {
            if ((window.location.href.search('index.html') !== -1 || window.location.href.split('colestanley.ca/')[1] === '') || item.singleLinks.href.substring(0, 4) == 'http') // on homepage OR linking externally (e.g. Drive)
                newItem.setAttributeNode(cws.betterCreateAttr('href', item.singleLinks.href));
            else // on child page
                newItem.setAttributeNode(cws.betterCreateAttr('href', item.singleLinks.href));
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