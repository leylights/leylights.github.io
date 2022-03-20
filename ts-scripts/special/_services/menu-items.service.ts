/**
 * Provides menu items to the rest of the website
 */

import { cws } from "../../cws.js";
import { PageBuilder } from "./page-builder.service.js";

// NOTE: showcase ordering is determined by order in this array

interface CoreMenuItem {
  name: string,
  type: "Game" | "Tool" | "Dropdown",
  date: string,
  links: {
    href: string,
    thumbnail?: string,
    showcase?: null | string
  },
}

export interface MenuItem extends CoreMenuItem {
  description: string,
  shortName: string,
  showcase: boolean,
  links: {
    href: string,
    hrefIsExternal?: boolean,

    thumbnail: string,
    showcase: null | string,
  },
  archive: boolean,
  children: MenuItem[],
  invertOnDark: boolean,
  showInSmallMenus: boolean,
  isSecret: boolean,
  isExternalLink: boolean,
  showDate: boolean,

  noindex: boolean,
}

type MixedMenuItem = CoreMenuItem | MenuItem;

const PRESENT_MONTH: string = new Date(Date.now()).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' });
const MENU_ITEMS = <{ [name: string | symbol]: MixedMenuItem }>{
  index: {
    name: "Home",
    shortName: "Home",
    type: "Tool",
    date: PRESENT_MONTH,
    links: {
      href: "",
    },
    showDate: false,
  },
  infectionModel: {
    name: "Infection Model",
    type: "Tool",
    date: "April 2021",
    description: "This simulation models the spread of a contagious infection within a localized community.",
    links: {
      href: "pages/infection.html",
      thumbnail: "siteimages/index/infection.png",
      showcase: 'siteimages/index/infection-spotlight.png',
    },
    showcase: true,
  },
  emWaves: {
    name: "The Propagation of Electromagnetic Waves",
    shortName: "EM Wave Animator",
    type: "Tool",
    date: "May 2020",
    description: "This interactive diagram demonstrates the motion of electromagnetic waves.",
    showcase: true,
    links: {
      href: "pages/emwaves.html",
      thumbnail: "siteimages/index/emwaves.png",
      showcase: "siteimages/index/emwavesbig.png"
    }
  },
  matrices: {
    name: "Matrix Calculator",
    type: "Tool",
    date: "June 2021",
    description: "This calculator calculates matrix operations.",
    links: {
      href: "pages/university/matrices.html"
    },
    "showInSmallMenus": false,
    "isSecret": true
  },
  daydream: {
    name: "Daydream",
    type: "Game",
    date: "June 2019",
    description: "Comb through a grid-based spaceship as you rearrange mirrors to fire a core of the enemy's ship. <br/><br/>Downloaded from Google Drive as an executable .jar file.",
    showcase: true,
    links: {
      href: "https://drive.google.com/open?id=1MlW4gyXsaFHNxZFwPfi4f-45UrGY9k6w",
      "hrefIsExternal": true,
      thumbnail: "siteimages/java/daydream-icon.png",
      showcase: "siteimages/java/daydream-showcase.png"
    },
    "isExternalLink": true
  },
  vectors: {
    name: "Vector Graphing Calculator",
    shortName: "Vector Graphing",
    type: "Tool",
    date: "June 2020",
    description: "Perform vector calculations with a 3D graph.",
    links: {
      href: "pages/vectors.html",
      thumbnail: "siteimages/index/vectors.png"
    }
  },
  wiresV2: {
    name: "Broken Wires",
    shortName: "Broken Wires",
    type: "Game",
    date: "October 2021",
    description: "Reconnect the two ends of a broken circuit in randomly generated puzzles",
    showcase: true,
    links: {
      href: "games/wires-v2.html",
      thumbnail: "siteimages/energy/thumb.png",
      showcase: "siteimages/energy/showcase.png"
    }
  },
  algebra: {
    name: "Algebraic Calculator",
    type: "Tool",
    date: "December 2020",
    description: "Feed equations into the calculator and get calculated answers.",
    links: {
      href: "pages/calculator.html"
    },
    "archive": true
  },
  ticTacToe: {
    name: "Tic Tac Toe AI",
    type: "Game",
    date: "April 2019",
    description: "Play Tic Tac Toe against a machine-learning opponent.<br/><br/>Downloaded from Google Drive as an executable .jar file.",
    links: {
      href: "https://drive.google.com/open?id=1YBHmeOboxp6Vb6JGg8EoS4n8ri_PbSkK",
      "hrefIsExternal": true,
      thumbnail: "siteimages/java/tic-tac-icon.png"
    },
    "invertOnDark": true,
    "isExternalLink": true
  },
  escape: {
    name: "Starship Escape",
    type: "Game",
    date: "July 2018",
    description: "Survive waves of enemies in this original sidescroller!",
    showcase: true,
    links: {
      href: "games/escape.html",
      thumbnail: "siteimages/escape/thumb.png",
      showcase: "siteimages/escape/thumb.png"
    }
  },
  dice: {
    name: "Dice Roller",
    type: "Tool",
    date: "July 2018",
    description: "A simple dice substitute for when you left your real dice at home.",
    links: {
      href: "pages/dice.html",
      thumbnail: "siteimages/dice/dicethumb.png"
    }
  },
  kittenAndCrypt: {
    name: "The Kitten And The Crypt",
    type: "Game",
    date: "June 2018",
    description: "Crawl through a randomly-generated dungeon to retrieve your lost kitten.<br/><br/>Downloaded from Google Drive as an executable .jar file.",
    showcase: true,
    links: {
      href: "https://drive.google.com/open?id=1nYmU7NLD6Ip7YVuD8M3xtqJ0o6QF6mJL",
      "hrefIsExternal": true,
      thumbnail: "siteimages/java/kitten-icon.png",
      showcase: "siteimages/java/kitten-sc.png"
    },
    "isExternalLink": true
  },
  luigi: {
    name: "Mario 1-1",
    type: "Game",
    date: "Fall 2017",
    description: "Play a replica of the first level of Mario!",
    showcase: true,
    links: {
      href: "games/luigi.html",
      thumbnail: "siteimages/mario/thumbnail.png",
      showcase: "siteimages/mario/showcase.png"
    }
  },
  complexCalculator: {
    name: "Complex Number Calculator",
    shortName: "Complex Numbers I",
    type: "Tool",
    date: "December 2020",
    description: "Calculates many attributes of complex numbers.",
    links: {
      href: "pages/complex.html",
      thumbnail: "siteimages/archive/complex.png"
    },
    "archive": true,
    "showInSmallMenus": false
  },
  lunarDefense: {
    name: "Lunar Defense",
    shortName: "Lunar Defense",
    type: "Game",
    date: "Spring 2017",
    description: "Defend the moon from an alien attack in a variety of game modes.",
    showcase: true,
    links: {
      href: "games/lunardefense.html",
      thumbnail: "siteimages/archive/showcasebg.png",
      showcase: "siteimages/archive/showcasebg.png"
    },
    "archive": true
  },
  quadraticCalc: {
    name: "Quadratic Calculator",
    shortName: "Quadratics",
    type: "Tool",
    date: "October 2018",
    description: "Calculates x-intercepts, so you don't have to!",
    links: {
      href: "pages/quadratic.html",
      thumbnail: "siteimages/archive/quadthumb.png"
    },
    "archive": true
  },
  pacManV1: {
    name: "Pac-Man (Version 1)",
    shortName: "Pac-Man V1",
    type: "Game",
    date: "June 2018",
    description: "Play a replica of the Bandai-Namco classic.",
    showcase: true,
    links: {
      href: "games/pacman-v1.html",
      thumbnail: "siteimages/pac/thumb-v1.png",
      showcase: "siteimages/pac/showcase-v1.png"
    },
    "archive": true
  },
  pacManV2: {
    name: "Pac-Man",
    shortName: "Pac-Man",
    type: "Game",
    date: "September 2021",
    description: "Play a replica of the Bandai-Namco classic.",
    showcase: true,
    links: {
      href: "games/pacman-v2.html",
      thumbnail: "siteimages/pac/thumb-v2.png",
      showcase: "siteimages/pac/showcase-v2.png"
    }
  },
  eightBall: {
    name: "Magic 8 Ball",
    shortName: "Eight Ball",
    type: "Tool",
    date: "Fall 2017",
    description: "Ask questions of your future to the all-knowing eight ball",
    links: {
      href: "pages/eightball.html",
      thumbnail: "siteimages/archive/eightballthumbnail.png"
    },
    "archive": true
  },
  npcGenerator: {
    name: "D&D 5e NPC Generator",
    shortName: "NPC Generator",
    type: "Tool",
    date: "February 2020",
    description: "This generator produces Dungeons and Dragons 5e enemies with randomized traits.",
    links: {
      href: "pages/npcs/generator.html",
      thumbnail: "siteimages/npcs/generator-thumbnail.png"
    },
    "invertOnDark": true
  },
  npcCreator: {
    name: "D&D 5e NPC Creator",
    shortName: "NPC Creator",
    type: "Tool",
    date: "August 2021",
    description: "Custom-create D&D 5e NPCs",
    links: {
      href: "pages/npcs/creator.html"
    }
  },
  npcInitiative: {
    name: "D&D 5e Initiative Tracker",
    shortName: "Initiative Tracker",
    type: "Tool",
    date: "August 2021",
    description: "Track initiative for a D&D 5e encounter.",
    links: {
      href: "pages/npcs/initiative-tracker.html",
      thumbnail: "siteimages/npcs/tracker-thumbnail.png"
    },
    "invertOnDark": true
  },
  npcNames: {
    name: "D&D 5e NPC Names List",
    shortName: "NPC Names List",
    type: "Tool",
    date: "August 2021",
    description: "Edit the list of NPC names",
    links: {
      href: "pages/npcs/names-list.html"
    },
    "isSecret": true
  },
  diceHistogram: {
    name: "Dice Histogram",
    shortName: "Dice Histogram",
    type: "Tool",
    date: "December 2021",
    description: "See the distribution of any number of dice rolled",
    links: {
      href: "pages/npcs/histogram.html",
      thumbnail: "siteimages/dice/dicethumb.png"
    },
  },
  npcSummons: {
    name: "D&D 5e Creature Tracker",
    shortName: "Creature Tracker",
    type: "Tool",
    date: "December 2021",
    description: "Handle attack and damage rolls for many creatures at once.",
    links: {
      href: "pages/npcs/summons.html",
      thumbnail: "siteimages/creatures/thumbnail.png"
    },
  },
  wiresV1: {
    name: "Broken Wires (Version 1)",
    shortName: "Broken Wires (V1)",
    type: "Game",
    date: "September 2018",
    description: "Reconnect the two ends of a broken circuit in randomly generated puzzles.  Built in vanilla JavaScript.",
    showcase: false,
    links: {
      href: "games/wires-v1.html",
      thumbnail: "siteimages/energy/thumb.png",
      showcase: "siteimages/energy/showcase.png"
    },
    "archive": true,
  },
  covidDashboard: {
    name: "COVID-19 Dashboard",
    shortName: "COVID Dashboard",
    type: "Tool",
    date: "January 2022",
    description: "Track daily COVID-19 updates using the COVID-19 Canada Open Data Working Group's open API.",
    links: {
      thumbnail: "siteimages/covid/thumb.png",
      href: "pages/covid-data/home.html",
    },
  },
  archive: {
    name: "Archive",
    shortName: "Archive",
    type: "Tool",
    date: "December 2016 - Present",
    links: {
      thumbnail: "siteimages/archive-lock.png",
      href: "pages/archive.html",
    },
    invertOnDark: true,
  },
  resume: {
    name: "Resume",
    shortName: "Resume",
    type: "Tool",
    date: PRESENT_MONTH,
    links: {
      href: "pages/resume.html",
    },
  },
  overwatchHome: {
    name: "Overwatch Impacts",
    shortName: "Overwatch - Home",
    description: 'The first web project I wrote (working with a friend), giving an analysis of the video game Overwatch.',
    type: "Tool",
    date: 'December 2016',
    links: {
      href: "pages/overwatchimpacts/home.html",
      thumbnail: "siteimages/archive/owithumbnail.png",
    },
    archive: true,
    noindex: true,
  },
  overwatchCommunity: {
    name: "Overwatch Impacts - Community",
    shortName: "Overwatch - Community",
    type: "Tool",
    date: 'December 2016',
    links: {
      href: "pages/overwatchimpacts/community.html",
    },
    noindex: true,
  },
  overwatchDevelopment: {
    name: "Overwatch Impacts - Development",
    shortName: "Overwatch - Development",
    type: "Tool",
    date: 'December 2016',
    links: {
      href: "pages/overwatchimpacts/development.html",
    },
    noindex: true,
  },
  overwatchGameplay: {
    name: "Overwatch Impacts - Gameplay",
    shortName: "Overwatch - Gameplay",
    type: "Tool",
    date: 'December 2016',
    links: {
      href: "pages/overwatchimpacts/gameplay.html",
    },
    noindex: true,
  },
  overwatchSociety: {
    name: "Overwatch Impacts - Society",
    shortName: "Overwatch - Society",
    type: "Tool",
    date: 'December 2016',
    links: {
      href: "pages/overwatchimpacts/society.html",
    },
    noindex: true,
  },
};

const mainMenuConfig: (CoreMenuItem | MenuItem)[] = [
  MENU_ITEMS.covidDashboard,
  MENU_ITEMS.infectionModel,
  MENU_ITEMS.resume,
  MENU_ITEMS.pacManV2,
  MENU_ITEMS.npcSummons,
  MENU_ITEMS.npcGenerator,
  MENU_ITEMS.emWaves,
  MENU_ITEMS.npcInitiative,
  MENU_ITEMS.diceHistogram,
  MENU_ITEMS.daydream,
  MENU_ITEMS.vectors,
  MENU_ITEMS.wiresV2,
  MENU_ITEMS.algebra,
  MENU_ITEMS.dice,
  MENU_ITEMS.escape,
  MENU_ITEMS.ticTacToe,
  MENU_ITEMS.kittenAndCrypt,
  MENU_ITEMS.luigi,
  MENU_ITEMS.matrices,
  MENU_ITEMS.npcNames,
  MENU_ITEMS.archive
];

const archiveMenuConfig = [
  MENU_ITEMS.wiresV1,
  MENU_ITEMS.complexCalculator,
  MENU_ITEMS.lunarDefense,
  MENU_ITEMS.quadraticCalc,
  MENU_ITEMS.pacManV1,
  MENU_ITEMS.eightBall,
  MENU_ITEMS.overwatchHome,
];

const topMenuConfig = {
  games: [
    MENU_ITEMS.pacManV2,
    MENU_ITEMS.daydream,
    MENU_ITEMS.wiresV2,
    MENU_ITEMS.escape,
    MENU_ITEMS.ticTacToe,
    MENU_ITEMS.kittenAndCrypt,
    MENU_ITEMS.luigi
  ],
  tools: [
    [
      'D&D Tools',
      MENU_ITEMS.dice,
      MENU_ITEMS.npcGenerator,
      MENU_ITEMS.npcCreator,
      MENU_ITEMS.npcSummons,
      MENU_ITEMS.diceHistogram,
      MENU_ITEMS.npcInitiative,
    ],
    MENU_ITEMS.emWaves,
    MENU_ITEMS.covidDashboard,
    MENU_ITEMS.matrices,
    MENU_ITEMS.infectionModel,
    MENU_ITEMS.vectors,
    MENU_ITEMS.algebra,
  ]
}

interface TopMenu {
  games: MenuItem[],
  tools: MenuItem[]
}

class MenuOps {
  static getMainMenu(): MenuItem[] {
    return MenuOps.mapItems(mainMenuConfig);
  }

  static getArchiveMenu(): MenuItem[] {
    return MenuOps.mapItems(archiveMenuConfig);
  }

  static getTopMenu(): TopMenu {
    const mappedGames = topMenuConfig.games.map((game: CoreMenuItem | MenuItem) => {
      return MenuOps.mapItems([game])[0];
    });

    const mappedTools = topMenuConfig.tools.map((tool) => {
      if (Array.isArray(tool)) {
        const newItem = {
          name: tool[0] as string,
          type: 'Dropdown',
          date: null,
          description: null,
          links: {
            href: null,
          },
          children: [],
        };

        for (let i = 1; i < tool.length; i++) {
          newItem.children.push(MenuOps.mapItems([tool[i] as CoreMenuItem])[0]);
        }

        return MenuOps.mapItems([newItem as (CoreMenuItem | MenuItem)])[0];
      } else {
        return MenuOps.mapItems([tool])[0];
      }
    });

    return {
      games: mappedGames,
      tools: mappedTools,
    }
  }

  static mapItems(items: CoreMenuItem[]): MenuItem[] {
    const formattedOutput: MenuItem[] = [];

    for (const itemIn of items) {
      const item: MenuItem = itemIn as MenuItem;

      const newItem: MenuItem = {
        name: item.name,
        type: item.type,
        date: item.date,
        showDate: !(item.showDate === false),
        description: item.description || "",
        links: {
          href: item.links.hrefIsExternal
            ? item.links.href
            : (item.links.href
              ? cws.getRelativeUrlPath(item.links.href)
              : item.links.href === '' ? '' : null),
          hrefIsExternal: item.links.hrefIsExternal || false,

          // non-core links:
          showcase: item.links.showcase ? cws.getRelativeUrlPath(item.links.showcase) : null,
          thumbnail: cws.getRelativeUrlPath(item.links.thumbnail ? item.links.thumbnail : PageBuilder.siteLogoSrc),
        },

        // non-core attributes:
        shortName: item.shortName || item.name,
        showcase: item.showcase || null,
        archive: item.archive || false,
        children: item.children || null,
        invertOnDark: getDefaultInvertOnDark(item),
        showInSmallMenus: item.showInSmallMenus ?? true,
        isSecret: item.isSecret || false,
        isExternalLink: item.isExternalLink || false,
        noindex: item.noindex || item.isSecret,
      };

      formattedOutput.push(newItem);
    }

    function getDefaultInvertOnDark(item: MenuItem) {
      if (!item.links.thumbnail) { // uses logo as thumbnail  
        return false;
      } else if (item.links.thumbnail && typeof item.invertOnDark === "undefined") { // does not use logo as thumbnail
        return false;
      } else { // item.invertOnDark is defined
        return item.invertOnDark;
      }
    }

    return formattedOutput;
  }

  static cloneMenuItem(item: MenuItem): MenuItem {
    return {
      name: item.name,
      shortName: item.shortName,
      type: item.type,
      date: item.date,
      description: item.description,
      showcase: item.showcase,
      links: {
        href: item.links.href,
        thumbnail: item.links.thumbnail,
        showcase: item.links.showcase,
      },
      archive: item.archive,
      children: item.children,
      invertOnDark: item.invertOnDark,
      showInSmallMenus: item.showInSmallMenus,
      isSecret: item.isSecret,
      isExternalLink: item.isExternalLink,
      noindex: item.noindex,
      showDate: item.showDate,
    }
  }
}

export class Menu {
  static getAll(): MenuItem[] {
    return MenuOps.mapItems(cws.Object.values(MENU_ITEMS));
  }

  static getMainMenu = function (): MenuItem[] {
    return MenuOps
      .getMainMenu()
      .filter((item: MenuItem) => {
        return !item.archive
      })
      .filter((item: MenuItem) => {
        return item.showInSmallMenus;
      }).filter((item: MenuItem) => {
        return !item.isSecret;
      });
  }

  static getTopMenu = function (): TopMenu {
    const menu = MenuOps
      .getTopMenu();

    menu.games = topMenuFilters(menu.games);
    menu.tools = topMenuFilters(menu.tools);

    return menu;

    function topMenuFilters(items: MenuItem[]) {
      return items
        .map((item: MenuItem) => {
          if (item.children)
            item.children = topMenuFilters(item.children);
          if (item.isExternalLink)
            item.shortName += ' (\u2B73)';

          return item;
        })
        .filter((item: MenuItem) => {
          return !item.archive;
        })
        .filter((item: MenuItem) => {
          return !item.isSecret;
        })
        .sort((a: MenuItem, b: MenuItem) => {
          return a.shortName < b.shortName ? -1 : 1;
        });
    }
  }

  static getArchiveMenu = function (): MenuItem[] {
    return MenuOps
      .getArchiveMenu()
      .filter((item: MenuItem) => {
        return item.archive
      })
      .filter((item: MenuItem) => {
        return !item.isSecret;
      })
      .map((item: MenuItem) => {
        const out: MenuItem = MenuOps.cloneMenuItem(item);
        return out;
      });
  }

  static getSecretItems = function (): MenuItem[] {
    return MenuOps.getMainMenu()
      .filter((item: MenuItem) => { return item.isSecret });
  }

  static BASE_LOWER_SHOWCASE_INNER_HTML = "<img class='lowerShowcase' src='SHOWCASE_SRC'>";

  static SHOWCASE_HEIGHT = 440;

  static BASE_ITEM_INNER_HTML = "\
  <div class='item OTHER_ITEM_CLASSES'>\
  <a href='LINK_TO_PAGE'>\
  <img src='SIDE_IMAGE_SRC' IMAGE_CLASS IMAGE_STYLE IMAGE_ALT>\
  <div class='itemText'>\
  <h2 class='RIGHT_CLASS'>TITLE</h2>\
  <h3 class='itemDate RIGHT_CLASS'>DATE_OF_CREATION</h3>\
  <p class='RIGHT_CLASS'>DESC</p>\
  </div>\
  </a>\
  </div>";
}
