import { Leylights } from "../../leylights.js";
import { MenuItemMulti } from "./menu-item-multi.js";
import { MenuItems } from "./menu-items.data.js";
export class MenuLayouts {
    static filterTopMenu(items) {
        return items
            .filter((item) => {
            return !item.archive && !item.isSecret;
        })
            .sort((a, b) => {
            return a.shortName < b.shortName ? -1 : 1;
        });
    }
}
MenuLayouts.MULTI_ITEMS = {
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
MenuLayouts.ALL = Leylights.Object.values(MenuItems);
MenuLayouts.MAIN_MENU = [
    MenuItems.covidDashboard,
    MenuItems.resume,
    MenuItems.infectionModel,
    MenuItems.wordle,
    MenuItems.pacManV2,
    MenuItems.wiresV2,
    MenuItems.emWaves,
    MenuItems.matrices,
    MenuItems.vectors,
    MenuItems.daydream,
    MenuLayouts.MULTI_ITEMS.NPCs,
    MenuItems.algebra,
    MenuItems.escape,
    MenuItems.ticTacToe,
    MenuItems.kittenAndCrypt,
    MenuItems.luigi,
    MenuItems.npcNames,
    MenuItems.archive
].filter((item) => {
    return !item.archive && !item.isSecret;
});
MenuLayouts.ARCHIVE_MENU = [
    MenuItems.wiresV1,
    MenuItems.complexCalculator,
    MenuItems.lunarDefense,
    MenuItems.quadraticCalc,
    MenuItems.pacManV1,
    MenuItems.eightBall,
    MenuItems.overwatchHome,
].filter((item) => {
    return item.archive && !item.isSecret;
});
MenuLayouts.TOP_MENU = {
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
};
MenuLayouts.SECRET_ITEMS = Leylights.Object.values(MenuItems).filter((item) => {
    return item.isSecret;
});
//# sourceMappingURL=menu-layouts.data.js.map