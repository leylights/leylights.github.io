import { MenuItemSingle } from './menu-item-single.js';

const PRESENT_MONTH: string = new Date(Date.now()).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' });

export const MenuItems = {
  index: new MenuItemSingle({
    name: 'Home',
    shortName: 'Home',
    type: 'Tool',
    date: PRESENT_MONTH,
    links: {
      href: '/',
    },
    showcaseConfig: {
      showDate: false,
    },
  }),
  infectionModel: new MenuItemSingle({
    name: 'Infection Model',
    type: 'Tool',
    date: 'April 2021',
    description: 'This simulation models the spread of a contagious infection within a localized community.',
    links: {
      href: '/pages/infection.html',
      thumbnail: '/siteimages/index/infection.png',
      showcase: '/siteimages/index/infection-spotlight.png',
    },
    showcaseConfig: {
      displayBanner: true,
      highlightType: 2,
    },
  }),
  emWaves: new MenuItemSingle({
    name: 'The Propagation of Electromagnetic Waves',
    shortName: 'EM Wave Animator',
    type: 'Tool',
    date: 'May 2020',
    description: 'This interactive diagram demonstrates the motion of electromagnetic waves.',
    showcaseConfig: {
      displayBanner: true,
    },
    links: {
      href: '/pages/emwaves.html',
      thumbnail: '/siteimages/index/emwaves.png',
      showcase: '/siteimages/index/emwavesbig.png'
    }
  }),
  matrices: new MenuItemSingle({
    name: 'Matrix Calculator',
    type: 'Tool',
    date: 'June 2021',
    description: 'This matrix calculator calculates matrix operations on complex and exact values.',
    links: {
      href: '/pages/university/matrices.html'
    },
    showInSmallMenus: false,
  }),
  daydream: new MenuItemSingle({
    name: 'Daydream',
    type: 'Game',
    date: 'June 2019',
    description: 'Comb through a grid-based spaceship as you rearrange mirrors to fire a core of the enemy\'s ship. <br/><br/>Downloaded from Google Drive as an executable .jar file.',
    showcaseConfig: {
      displayBanner: true,
    },
    links: {
      href: 'https://drive.google.com/open?id=1MlW4gyXsaFHNxZFwPfi4f-45UrGY9k6w',
      hrefIsExternal: true,
      thumbnail: '/siteimages/java/daydream-icon.png',
      showcase: '/siteimages/java/daydream-showcase.png'
    },
    isExternalLink: true
  }),
  vectors: new MenuItemSingle({
    name: 'Vector Graphing Calculator',
    shortName: 'Vector Graphing',
    type: 'Tool',
    date: 'June 2020',
    description: 'Perform vector calculations with a 3D graph.',
    links: {
      href: '/pages/vectors.html',
      thumbnail: '/siteimages/index/vectors.png'
    }
  }),
  wiresV2: new MenuItemSingle({
    name: 'Broken Wires',
    shortName: 'Broken Wires',
    type: 'Game',
    date: 'October 2021',
    description: 'Reconnect the two ends of a broken circuit in randomly generated puzzles',
    showcaseConfig: {
      displayBanner: true,
      highlightType: 1,
    },
    links: {
      href: '/games/wires-v2.html',
      thumbnail: '/siteimages/energy/thumb.png',
      showcase: '/siteimages/energy/showcase.png'
    },
  }),
  algebra: new MenuItemSingle({
    name: 'Algebraic Calculator',
    type: 'Tool',
    date: 'December 2020',
    description: 'Feed equations into the calculator and get calculated answers.',
    links: {
      href: '/pages/calculator.html'
    },
    'archive': true
  }),
  ticTacToe: new MenuItemSingle({
    name: 'Tic Tac Toe AI',
    type: 'Game',
    date: 'April 2019',
    description: 'Play Tic Tac Toe against a machine-learning opponent.<br/><br/>Downloaded from Google Drive as an executable .jar file.',
    links: {
      href: 'https://drive.google.com/open?id=1YBHmeOboxp6Vb6JGg8EoS4n8ri_PbSkK',
      hrefIsExternal: true,
      thumbnail: '/siteimages/java/tic-tac-icon.png'
    },
    showcaseConfig: {
      'invertOnDark': true,
    },
    isExternalLink: true
  }),
  escape: new MenuItemSingle({
    name: 'Starship Escape',
    type: 'Game',
    date: 'July 2018',
    description: 'Survive waves of enemies in this original sidescroller!',
    showcaseConfig: {
      displayBanner: true,
    },
    links: {
      href: '/games/escape.html',
      thumbnail: '/siteimages/escape/thumb.png',
      showcase: '/siteimages/escape/thumb.png'
    }
  }),
  dice: new MenuItemSingle({
    name: 'Dice Roller',
    type: 'Tool',
    date: 'July 2018',
    description: 'A simple dice substitute for when you left your real dice at home.',
    links: {
      href: '/pages/dice.html',
      thumbnail: '/siteimages/dice/dicethumb.png'
    }
  }),
  kittenAndCrypt: new MenuItemSingle({
    name: 'The Kitten And The Crypt',
    type: 'Game',
    date: 'June 2018',
    description: 'Crawl through a randomly-generated dungeon to retrieve your lost kitten.<br/><br/>Downloaded from Google Drive as an executable .jar file.',
    showcaseConfig: {
      displayBanner: true,
    },
    links: {
      href: 'https://drive.google.com/open?id=1nYmU7NLD6Ip7YVuD8M3xtqJ0o6QF6mJL',
      hrefIsExternal: true,
      thumbnail: '/siteimages/java/kitten-icon.png',
      showcase: '/siteimages/java/kitten-sc.png'
    },
    isExternalLink: true
  }),
  luigi: new MenuItemSingle({
    name: 'Mario 1-1',
    type: 'Game',
    date: 'Fall 2017',
    description: 'Play a replica of the first level of Mario!',
    showcaseConfig: {
      displayBanner: true,
    },
    links: {
      href: '/games/luigi.html',
      thumbnail: '/siteimages/mario/thumbnail.png',
      showcase: '/siteimages/mario/showcase.png'
    }
  }),
  complexCalculator: new MenuItemSingle({
    name: 'Complex Number Calculator',
    shortName: 'Complex Numbers I',
    type: 'Tool',
    date: 'December 2020',
    description: 'Calculates many attributes of complex numbers.',
    links: {
      href: '/pages/complex.html',
      thumbnail: '/siteimages/archive/complex.png'
    },
    'archive': true,
    showInSmallMenus: false
  }),
  lunarDefense: new MenuItemSingle({
    name: 'Lunar Defense',
    shortName: 'Lunar Defense',
    type: 'Game',
    date: 'Spring 2017',
    description: 'Defend the moon from an alien attack in a variety of game modes.',
    showcaseConfig: {
      displayBanner: true,
      highlightType: 1,
    },
    links: {
      href: '/games/lunardefense.html',
      thumbnail: '/siteimages/archive/showcasebg.png',
      showcase: '/siteimages/archive/showcasebg.png'
    },
    'archive': true
  }),
  quadraticCalc: new MenuItemSingle({
    name: 'Quadratic Calculator',
    shortName: 'Quadratics',
    type: 'Tool',
    date: 'October 2018',
    description: 'Calculates x-intercepts, so you don\'t have to!',
    links: {
      href: '/pages/quadratic.html',
    },
    'archive': true
  }),
  pacManV1: new MenuItemSingle({
    name: 'Pac-Man (Version 1)',
    shortName: 'Pac-Man V1',
    type: 'Game',
    date: 'June 2018',
    description: 'Play a replica of the Bandai-Namco classic.',
    showcaseConfig: {
      displayBanner: true,
    },
    links: {
      href: '/games/pacman-v1.html',
      thumbnail: '/siteimages/pac/thumb-v2.png',
      showcase: '/siteimages/pac/showcase-v1.png'
    },
    'archive': true
  }),
  pacManV2: new MenuItemSingle({
    name: 'Pac-Man',
    shortName: 'Pac-Man',
    type: 'Game',
    date: 'September 2021',
    description: 'Play a replica of the Bandai-Namco classic.',
    showcaseConfig: {
      displayBanner: true,
    },
    links: {
      href: '/games/pacman-v2.html',
      thumbnail: '/siteimages/pac/thumb-v2.png',
      showcase: '/siteimages/pac/showcase-v2.png'
    }
  }),
  eightBall: new MenuItemSingle({
    name: 'Magic 8 Ball',
    shortName: 'Eight Ball',
    type: 'Tool',
    date: 'Fall 2017',
    description: 'Ask questions of your future to the all-knowing eight ball',
    links: {
      href: '/pages/eightball.html',
      thumbnail: '/siteimages/archive/eightballthumbnail.png'
    },
    'archive': true
  }),
  npcGenerator: new MenuItemSingle({
    name: 'D&D 5e NPC Generator',
    shortName: 'NPC Generator',
    type: 'Tool',
    date: 'February 2020',
    description: 'This generator produces Dungeons and Dragons 5e enemies with randomized traits.',
    links: {
      href: '/pages/npcs/generator.html',
      thumbnail: '/siteimages/npcs/generator-thumbnail.png'
    },
    showcaseConfig: {
      'invertOnDark': true
    },
  }),
  npcCreator: new MenuItemSingle({
    name: 'D&D 5e NPC Creator',
    shortName: 'NPC Creator',
    type: 'Tool',
    date: 'August 2021',
    description: 'Custom-create D&D 5e NPCs',
    links: {
      href: '/pages/npcs/creator.html',
      thumbnail: '/siteimages/npcs/creator.png'
    },
    showcaseConfig: {
      invertOnDark: true,
    },
  }),
  npcInitiative: new MenuItemSingle({
    name: 'D&D 5e Initiative Tracker',
    shortName: 'Initiative Tracker',
    type: 'Tool',
    date: 'August 2021',
    description: 'Track initiative for a D&D 5e encounter.',
    links: {
      href: '/pages/npcs/initiative-tracker.html',
      thumbnail: '/siteimages/npcs/tracker-thumbnail.png'
    },
    showcaseConfig: {
      'invertOnDark': true
    },
  }),
  npcNames: new MenuItemSingle({
    name: 'D&D 5e NPC Names List',
    shortName: 'NPC Names List',
    type: 'Tool',
    date: 'August 2021',
    description: 'Edit the list of NPC names',
    links: {
      href: '/pages/npcs/names-list.html'
    },
    'isSecret': true
  }),
  diceHistogram: new MenuItemSingle({
    name: 'Dice Histogram',
    shortName: 'Dice Histogram',
    type: 'Tool',
    date: 'December 2021',
    description: 'See the distribution of any number of dice rolled',
    links: {
      href: '/pages/npcs/histogram.html',
      thumbnail: '/siteimages/dice/dicethumb.png'
    },
  }),
  npcSummons: new MenuItemSingle({
    name: 'D&D 5e Creature Tracker',
    shortName: 'Creature Tracker',
    type: 'Tool',
    date: 'December 2021',
    description: 'Handle attack and damage rolls for many creatures at once.',
    links: {
      href: '/pages/npcs/summons.html',
      thumbnail: '/siteimages/creatures/thumbnail.png'
    },
    showcaseConfig: {
      invertOnDark: true,
    },
  }),
  wiresV1: new MenuItemSingle({
    name: 'Broken Wires (Version 1)',
    shortName: 'Broken Wires (V1)',
    type: 'Game',
    date: 'September 2018',
    description: 'Reconnect the two ends of a broken circuit in randomly generated puzzles.  Built in vanilla JavaScript.',
    showcaseConfig: {
      displayBanner: false,
    },
    links: {
      href: '/games/wires-v1.html',
      thumbnail: '/siteimages/energy/thumb.png',
      showcase: '/siteimages/energy/showcase.png'
    },
    'archive': true,
  }),
  covidDashboard: new MenuItemSingle({
    name: 'COVID-19 Dashboard',
    shortName: 'COVID Dashboard',
    type: 'Tool',
    date: 'July 2022',
    description: 'Track daily COVID-19 updates using the COVID-19 Canada Open Data Working Group\'s open API.',
    links: {
      thumbnail: '/siteimages/covid/thumb.png',
      href: '/pages/covid-data/home.html',
    },
  }),
  archive: new MenuItemSingle({
    name: 'Archive',
    shortName: 'Archive',
    type: 'Tool',
    date: 'December 2016 - Present',
    links: {
      thumbnail: '/siteimages/archive-lock.png',
      href: '/pages/archive.html',
    },
    showcaseConfig: {
      invertOnDark: true,
    },
  }),
  resume: new MenuItemSingle({
    name: 'Resume',
    shortName: 'Resume',
    type: 'Tool',
    description: `University of Waterloo candidate for Bachelor's of Computer Science, 2025
    Wilfrid Laurier University candidate for Bachelor's of Business Administration, 2025`,
    date: PRESENT_MONTH,
    links: {
      href: '/pages/resume.html',
    },
    showcaseConfig: {
      isCentered: true,
      highlightType: 1,
    }
  }),
  overwatchHome: new MenuItemSingle({
    name: 'Overwatch Impacts',
    shortName: 'Overwatch - Home',
    description: 'The first web project I wrote (working with a friend), giving an analysis of the video game Overwatch.',
    type: 'Tool',
    date: 'December 2016',
    links: {
      href: '/pages/overwatchimpacts/home.html',
      thumbnail: '/siteimages/archive/owithumbnail.png',
    },
    archive: true,
    noindex: true,
  }),
  overwatchCommunity: new MenuItemSingle({
    name: 'Overwatch Impacts - Community',
    shortName: 'Overwatch - Community',
    type: 'Tool',
    date: 'December 2016',
    links: {
      href: '/pages/overwatchimpacts/community.html',
    },
    noindex: true,
  }),
  overwatchDevelopment: new MenuItemSingle({
    name: 'Overwatch Impacts - Development',
    shortName: 'Overwatch - Development',
    type: 'Tool',
    date: 'December 2016',
    links: {
      href: '/pages/overwatchimpacts/development.html',
    },
    noindex: true,
  }),
  overwatchGameplay: new MenuItemSingle({
    name: 'Overwatch Impacts - Gameplay',
    shortName: 'Overwatch - Gameplay',
    type: 'Tool',
    date: 'December 2016',
    links: {
      href: '/pages/overwatchimpacts/gameplay.html',
    },
    noindex: true,
  }),
  overwatchSociety: new MenuItemSingle({
    name: 'Overwatch Impacts - Society',
    shortName: 'Overwatch - Society',
    type: 'Tool',
    date: 'December 2016',
    links: {
      href: '/pages/overwatchimpacts/society.html',
    },
    noindex: true,
  }),
  wordle: new MenuItemSingle({
    name: 'Wordle',
    description: 'A rebuild of the popular puzzle game Wordle.',
    type: 'Game',
    date: 'April 2022',
    links: {
      href: '/games/wordle.html',
      thumbnail: '/siteimages/wordle/thumb-light.png',
    },
  }),
};
