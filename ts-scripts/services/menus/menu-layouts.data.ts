import { Molasses } from "../../molasses";
import { MenuItemMulti } from "./menu-item-multi";
import { MenuItemSingle } from "./menu-item-single";
import { MenuItem } from "./menu-item";
import { MenuItems } from "./menu-items.data";

export class MenuLayouts {
  private static readonly MULTI_ITEMS: Record<string, MenuItemMulti> = {
    NPCs: new MenuItemMulti({
      name: 'D&D Tools',
      type: 'Tool',
      description: 'A collection of tools to facilitate fifth edition Dungeons and Dragons',
      showcaseConfig: {
        highlightType: 1,
      },
      children: [
        MenuItems.npcInitiative,
        MenuItems.npcCreator,
        MenuItems.npcSummons,
        MenuItems.npcGenerator,
        MenuItems.diceHistogram,
        MenuItems.dice,
      ]
    })
  };

  static readonly ALL: MenuItemSingle[] = Molasses.Object.values(MenuItems);

  static readonly MAIN_MENU: (MenuItemSingle | MenuItemMulti)[] = [
    MenuItems.covidDashboard,
    MenuItems.resume,
    MenuItems.infectionModel,
    MenuItems.wordle,
    MenuItems.pacManV2,
    MenuItems.wiresV2,
    MenuItems.emWaves,
    MenuItems.calculatorii,
    MenuItems.vectors,
    MenuItems.matrices,
    MenuItems.daydream,
    MenuLayouts.MULTI_ITEMS.NPCs,
    MenuItems.algebra,
    MenuItems.escape,
    MenuItems.ticTacToe,
    MenuItems.kittenAndCrypt,
    MenuItems.luigi,
    MenuItems.npcNames,
    MenuItems.archive
  ].filter((item: MenuItem) => {
    return !item.archive && !item.isSecret;
  });

  static readonly ARCHIVE_MENU: (MenuItemSingle | MenuItemMulti)[] = [
    MenuItems.wiresV1,
    MenuItems.complexCalculator,
    MenuItems.lunarDefense,
    MenuItems.quadraticCalc,
    MenuItems.pacManV1,
    MenuItems.eightBall,
    MenuItems.overwatchHome,
  ].filter((item: MenuItem) => {
    return item.archive && !item.isSecret;
  });

  static readonly TOP_MENU: {
    games: (MenuItemSingle | MenuItemMulti)[],
    tools: (MenuItemSingle | MenuItemMulti)[],
  } = {
      games: MenuLayouts.filterTopMenu([
        MenuItems.wordle,
        MenuItems.pacManV2,
        MenuItems.daydream,
        MenuItems.wiresV2,
        MenuItems.escape,
        MenuItems.ticTacToe,
        MenuItems.kittenAndCrypt,
        MenuItems.luigi
      ]),
      tools: MenuLayouts.filterTopMenu([
        MenuLayouts.MULTI_ITEMS.NPCs,
        MenuItems.emWaves,
        MenuItems.covidDashboard,
        MenuItems.matrices,
        MenuItems.infectionModel,
        MenuItems.vectors,
        MenuItems.algebra,
        MenuItems.calculatorii,
      ])
    }

  private static filterTopMenu(items: (MenuItemSingle | MenuItemMulti)[]): (MenuItemSingle | MenuItemMulti)[] {
    return items
      .filter((item: MenuItem) => {
        return !item.archive && !item.isSecret;
      })
      .sort((a: MenuItem, b: MenuItem) => {
        return a.shortName < b.shortName ? -1 : 1;
      });
  }

  static readonly SECRET_ITEMS = Molasses.Object.values(MenuItems).filter((item) => {
    return item.isSecret;
  });
}
