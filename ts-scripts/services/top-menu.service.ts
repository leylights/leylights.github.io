
/**
 * top-menu.service.js
 * 
 * @author River Stanley, 
 * Start Date: January 2021
 */

import { Molasses } from '../molasses.js';
import { CoreDataService } from './core-data.service.js';
import { DarkModeService } from './dark-mode.service.js';
import { MenuItemMulti } from './menus/menu-item-multi.js';
import { MenuItemSingle } from './menus/menu-item-single.js';
import { MenuItem } from './menus/menu-item.js';
import { MenuLayouts } from './menus/menu-layouts.data.js';
import { SideMenuService } from './side-menu.service.js';

export class TopMenuService {
  private static header: HTMLElement;

  public static build() {
    function getDropdownButton(text: string, menuId: string) {
      return Molasses.createElement({
        type: 'div',
        classList: 'header-menu-item-container',
        children: [
          Molasses.createElement({
            type: 'div',
            classList: 'header-menu-item',
            children: [
              Molasses.createElement({
                type: 'span',
                innerText: text.toLowerCase(),
              }),
            ],
          }),
          Molasses.createElement({
            type: 'div',
            classList: 'header-dropdown-body',
            id: menuId,
          })
        ],
      });
    }

    function getNoDropdownButton(text: string, link: string, spanId?: string) {
      return Molasses.createElement({
        type: 'div',
        classList: 'header-menu-item-container',
        children: [Molasses.createElement({
          type: 'div',
          classList: 'header-menu-item',
          children: [
            Molasses.createElement({
              type: 'a',
              classList: 'header-link',
              otherNodes: [{ type: 'href', value: link }],
              children: [
                Molasses.createElement({
                  type: 'span',
                  id: spanId,
                  innerText: text.toLowerCase(),
                }),
              ]
            })],
        }),]
      });
    }

    TopMenuService.header = Molasses.createElement({
      type: 'nav',
      id: 'desktop-header',
      children: [
        Molasses.createElement({
          type: 'div',
          id: 'header-inner-bounds',
          children: [
            Molasses.createElement({
              type: 'div',
              id: 'header-left',
              children: [

                Molasses.createElement({
                  type: 'a',
                  otherNodes: [{ type: 'href', value: '/' }],
                  children: [Molasses.createElement({
                    type: 'img',
                    id: 'header-logo',
                    classList: 'site-logo',
                    otherNodes: [{ type: 'src', value: CoreDataService.siteLogoSrc }],
                  }),
                  Molasses.createElement({
                    type: `div`,
                    id: 'header-title',
                    children: [
                      Molasses.createElement({
                        type: 'div',
                        classList: 'inner',
                        children: [
                          Molasses.createElement({
                            type: 'h1',
                            classList: 'name',
                            innerText: CoreDataService.siteName.replace('.github.io', ''),
                          }),
                          CoreDataService.siteName.includes('.github.io') ?
                            Molasses.createElement({
                              type: 'span',
                              classList: 'github-io',
                              innerText: '.github.io'
                            }) : null
                        ]
                      }),
                    ]
                  }),
                  ]
                }),
              ]
            }), Molasses.createElement({
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
        Molasses.createElement({
          type: 'button',
          id: 'side-menu-opener',
          children: [
            Molasses.createElement({
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

  private static createTopItem(item: MenuItem, parent?: HTMLElement) {
    // determine parent
    let type: keyof HTMLElementTagNameMap = 'a';
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

    const newItem = Molasses.createElement({
      type: type,
      classList: 'header-item',
      innerHTML: item instanceof MenuItemSingle && item.isExternalLink
        ? item.shortName + ' (\u2B73)'
        : item.shortName,
    });

    // links need to work on index and child pages

    if (item instanceof MenuItemSingle && item.singleLinks.href)
      newItem.setAttributeNode(Molasses.betterCreateAttr('href', item.singleLinks.href));

    parent.appendChild(newItem);

    if (item instanceof MenuItemMulti) {
      newItem.classList.add('dropdown');
      const subMenu = document.createElement('div');
      subMenu.classList.add('header-dropdown-body');
      newItem.appendChild(subMenu)
      item.children.forEach((child: MenuItem) => {
        TopMenuService.createTopItem(child, subMenu);
      });
    }
  }

  static createDarkModeToggle(id: string): HTMLElement {
    const toggle: HTMLElement = Molasses.createElement({
      type: 'div',
      classList: 'dark-mode-toggle',
      id: id,
      children: [
        Molasses.createElement({
          type: 'input',
          otherNodes: { type: 'checkbox' },
        }),
        Molasses.createElement({
          type: 'div',
          classList: 'slider',
        }),
      ],
    });

    if (DarkModeService.isDark) toggle.querySelector('input').checked = true;

    toggle.querySelector('input').addEventListener('click', function () {
      DarkModeService.toggleDarkMode();

      for (const input of document.querySelectorAll('.dark-mode-toggle input')) {
        if (input !== this) (input as HTMLInputElement).checked = !(input as HTMLInputElement).checked;
      }
    });

    return toggle;
  }

  private static generateMenu(): void {
    const items = MenuLayouts.TOP_MENU;

    items.games.forEach((item: MenuItem) => {
      TopMenuService.createTopItem(item);
    });

    items.tools.forEach((item: MenuItem) => {
      TopMenuService.createTopItem(item);
    });
  }
}
