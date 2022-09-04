/**
 * SideMenuService
 * 
 * Handles the mobile menu
 * 
 * @author Cole Stanley
 * Created: 2017
 */

import { Leylights } from '../leylights.js';
import { Button } from '../components/button.component.js';
import { MenuItemMulti } from './menus/menu-item-multi.js';
import { MenuItemSingle } from './menus/menu-item-single.js';
import { MenuItem } from './menus/menu-item.js';
import { MenuLayouts } from './menus/menu-layouts.data.js';
import { TopMenuService } from './top-menu.service.js';

export class SideMenuService {
  private static itemNo = 0;

  private static menu: HTMLElement;

  static build() {
    SideMenuService.menu = SideMenuService.buildMenuStructure();
    SideMenuService.generateMenu();

    const categories: HTMLElement[] = Array.from(SideMenuService.menu.querySelectorAll('.side-menu-dropdown-category'));

    categories.forEach((category) => {
      Button.createByAttachment(category, (event: PointerEvent) => {
        const path = event.composedPath();

        // If a dropdown was clicked, don't display anything
        for (let i = 0; i < path.length; i++) {
          if (path[i] instanceof HTMLBodyElement) break;
          else if ((path[i] as HTMLElement).classList.contains('dropdown')) return;
        }

        SideMenuService.displayMenuItems(category);
      });
    });
  }

  private static createMenuItem(
    item: MenuItem,
    parent?: HTMLElement | null
  ): void {
    const newItem = document.createElement('div');
    newItem.classList.add('side-menu-item');
    newItem.id = `menu-item-${SideMenuService.itemNo}`;
    if (item instanceof MenuItemSingle)
      newItem.appendChild(Leylights.createElement({
        type: 'a',
        innerText: item.shortName,
        otherNodes: { href: item.singleLinks.href },
      }));

    if (!parent) {
      if (item instanceof MenuItemSingle && item.type === 'Game')
        parent = document.getElementById('games-dropdown-category');
      else
        parent = document.getElementById('tools-dropdown-category');
    }

    parent.appendChild(newItem);

    if (item instanceof MenuItemMulti) {
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

      item.children.forEach((child: MenuItem) => {
        SideMenuService.createMenuItem(child, subMenu);
      });
      return;
    }

    SideMenuService.itemNo++;
  }

  private static buildMenuStructure(): HTMLElement {
    function createCategory(name: string, type: string, content?: HTMLElement[]): HTMLElement {
      return Leylights.createElement({
        type: 'div',
        id: `${type}-dropdown-category`,
        classList: 'side-menu-dropdown-category side-menu-top-level-item',
        children: (content || []).concat([Leylights.createElement({
          type: 'button',
          classList: 'side-menu-top-level-button',
          innerHTML: name,
        })]),
      });
    }

    function createTopLevelButton(name: string, link: string): HTMLElement {
      return Leylights.createElement({
        type: 'div',
        classList: 'side-menu-top-level-item',
        children: [Leylights.createElement({
          type: 'a',
          classList: 'side-menu-top-level-button',
          otherNodes: [{ type: 'href', value: link }],
          innerText: name,
        })]
      });
    }

    const sideMenu = Leylights.createElement({
      type: 'nav',
      id: 'side-menu',
      children: [
        Leylights.createElement({
          type: 'div',
          id: 'side-menu-content',
          children: [
            Leylights.createElement({
              type: 'div',
              id: 'side-menu-title-container',
              children: [Leylights.createElement({
                type: 'h1',
                id: 'side-menu-title',
                innerText: 'menu',
              })],
            }),
            createCategory('Games', 'games'),
            createCategory('Tools', 'tools'),
            createTopLevelButton('Archive', '/pages/archive.html'),
            createTopLevelButton('Resume', '/pages/resume.html'),
            Leylights.createElement({
              type: 'button',
              id: 'side-menu-end-button',
              children: [Leylights.createElement({
                type: 'img',
                otherNodes: [{ type: 'src', value: '/siteimages/closebutton.png' }],
              })]
            }),
            Leylights.createElement({
              type: 'div',
              classList: 'dark-mode-container',
              children: [
                Leylights.createElement({
                  type: 'span',
                  innerText: 'Dark mode'
                }),
                TopMenuService.createDarkModeToggle('side-menu-dark-toggle'),
              ]
            })
          ],
        }),
      ]
    });

    sideMenu.querySelector('#side-menu-end-button').addEventListener('click', SideMenuService.toggleMenu);
    document.body.appendChild(sideMenu);
    return sideMenu;
  }

  private static displayMenuItems(category: HTMLElement) {
    const buttons = category.querySelectorAll('.side-menu-item');

    buttons.forEach((button: HTMLElement) => {
      if (button.style.display !== 'block')
        button.style.display = 'block';
      else
        button.style.display = 'none';
    });
  }

  private static generateMenu() {
    MenuLayouts.TOP_MENU.games.forEach((item) => { SideMenuService.createMenuItem(item); });
    MenuLayouts.TOP_MENU.tools.forEach((item) => { SideMenuService.createMenuItem(item); });
  }

  static toggleMenu(): void {
    document.getElementById('side-menu-opener').classList.toggle('hidden');
    document.getElementById('side-menu').classList.toggle('open');
  }
}
