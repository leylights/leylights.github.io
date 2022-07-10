import { cws } from "../../cws.js";
import { KeyboardListener } from "../../tools/keyboard-listener.js";
import { Canvas } from "../_components/canvas.component.js";
import { WiresConstants } from "./constants.js";
import { WiresMenuTile } from "./menu-tile.js";
import { WiresState, WiresWinStateEnum } from "./state.js";
import { WiresTile } from "./tile.js";

class WiresPage {
  canvas: Canvas = new Canvas(document.getElementById('canvasFoundation'));

  readonly menuTiles = {
    livesCounter: new WiresMenuTile({
      index: 0,
      isLivesCounter: true,
      w: WiresConstants.LIVES_COUNTER.INNER_WIDTH,
      h: WiresConstants.TOP_TILE_WIDTH,
      hoverable: false,
      mode: 'competitive',
    }),
    solve: new WiresMenuTile({
      textBuilder: () => '\u2713',
      font: 'Times New Roman',
      w: 60,
      h: 60,
      mode: 'both',
    }),
    wins: new WiresMenuTile({
      textBuilder: () => { return WiresState.elapsedWins },
      index: 0,
      font: 'Encode Sans',
      hoverable: false,
      mode: 'both',
    }),
    help: new WiresMenuTile({
      textBuilder: () => '?',
      index: 1,
      font: 'Encode Sans',
      mode: 'casual',
    }),
    restart: new WiresMenuTile({
      textBuilder: () => "\u27F2",
      index: 2,
      font: 'Encode Sans',
      mode: 'casual',
    }),
    timer: new WiresMenuTile({
      textBuilder: () => { return Math.max(Math.ceil((WiresState.deadline - WiresState.now) / 1000), 0) },
      font: 'Encode Sans',
      competitiveIndex: 2,
      hoverable: false,
      mode: 'competitive',
    }),
    limitSize: new WiresMenuTile({
      textBuilder: () => {
        if (this.restrictSize) {
          return '\u26f6'
        } else {
          return '\u221E';
        }
      },
      index: 3,
      font: 'Encode Sans',
      mode: 'casual',
    }),
    tileSize: new WiresMenuTile({
      textBuilder: () => {
        switch (WiresState.tileWidth) {
          case 64:
            return "\u215F\u2081";
          case 48:
            return "\u00BE";
          case 32:
            return "\u00BD";
          case 16:
            return "\u00BC";
        }
      },
      index: 4,
      competitiveIndex: 1,
      font: 'Encode Sans',
      mode: 'both',
    }),
    highScore: new WiresMenuTile({
      textBuilder: () => { return 'TOP: ' + WiresState.elapsedCompetitiveWinsHighScore },
      font: 'Encode Sans',
      w: WiresConstants.HIGH_SCORE_WIDTH,
      h: WiresConstants.HIGH_SCORE_HEIGHT,
      hoverable: false,
      mode: 'competitive',
    }),
  };

  startTile: [number, number];
  endTile: [number, number];

  lastMouseX: number = -1;
  lastMouseY: number = -1;

  usePointer: boolean = false;
  restrictSize: boolean = true;

  startPos = { x: -9000, y: -9000, w: 24, h: 40, c: WiresConstants.COLOURS.POWER };
  endPos = { x: -9000, y: -9000, w: 0, h: 0, c: WiresConstants.COLOURS.ORANGE };

  constructor(competitiveMode: boolean) {
    document.documentElement.style.overflow = "hidden";
    document.getElementById("insWrap").outerHTML = "";
    this.generateSprites();
    WiresState.isCompetitive = competitiveMode;

    // building 1st map

    this.init(true);
    this.canvas.rebuildElement();
    this.canvas.start(() => { this.main() });
  }

  get isMobile() {
    return window.innerWidth <= 770;
  }

  get boardOuterWidth() {
    return WiresTile.tiles.length * WiresState.tileWidth + 2 * WiresConstants.BORDER.WIDTH;
  }

  get boardOuterRight() {
    return WiresTile.tiles[WiresTile.tiles.length - 1][0].x + WiresState.tileWidth + WiresConstants.BORDER.WIDTH;
  }

  init(this: WiresPage, firstTime: boolean) {
    const me = this;

    if (firstTime) {
      // setting the score

      WiresState.score = 0;

      try {
        WiresState.score = WiresState.elapsedWins;
      } catch (e) {
        WiresState.score = 0;
      }
    }

    this.resetBounds();
    this.generateTilesGrid(4, 4);
    if (WiresState.isCompetitive) this.calculateRemainingTime();
    if ((WiresState.maxW / 2 < 3 || WiresState.maxH / 2 < 3) && WiresState.tileWidth > 32) {
      switch (WiresState.tileWidth) {
        case 64:
          WiresState.tileWidth = 48;
          break;
        case 48:
          WiresState.tileWidth = 32;
          break;
      }
      this.resetBounds();
    }
    this.startPos.x = WiresTile.tiles[this.startTile[0]][this.startTile[1]].x - this.startPos.w;

    // shift canvas margin on mobile
    if (this.isMobile && document.getElementById("canvasBox").style.paddingTop !== "")
      document.getElementById("canvasBox").style.paddingTop = "0px";

    // Set listeners
    if (firstTime) {
      window.addEventListener("resize", () => {
        // me.canvas.resize();
        if (this.canvas.width < this.boardOuterRight)
          me.makeNewPuzzle();
      });
      me.canvas.addEventListener('click', (e) => {
        me.handleClick(e, true);
      });
      me.canvas.addEventListener('mousemove', (e) => {
        me.handleMouseMove(e);
      });
      me.canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        me.handleClick(e, false);
      });
      me.canvas.keys.addEventListener((listener: KeyboardListener) => {
        return listener.isKeyDown('e');
      }, () => {
        me.forEachTile((tile) => {
          if (
            tile.rotateTimer === 0
            && me.isHovering(tile.x, tile.y, tile.w, tile.h)
          ) {
            tile.rotates++;
            tile.rotation++;
            tile.rotateTimer = 33;
            tile.rotate(-1);
          }
        });
      });
      me.canvas.keys.addEventListener((listener: KeyboardListener) => {
        return listener.isKeyDown('q');
      }, () => {
        me.forEachTile((tile) => {
          if (
            tile.rotateTimer === 0
            && me.isHovering(tile.x, tile.y, tile.w, tile.h
            )) {
            tile.rotates--;
            tile.rotation--;
            tile.rotateTimer = 33;
            tile.rotate(1);
          }
        });
      });
    }
  }

  main(this: WiresPage): void {
    const me = this;
    // resets

    WiresState.now = Date.now();
    this.getInput();
    this.redraw();

    this.update();

    if (WiresState.isWon === WiresWinStateEnum.win) {
      this.winLevel();
    } else if (WiresState.isWon === WiresWinStateEnum.loss) {
      this.loseLevel();
    }

    if (this.usePointer) this.canvas.element.style.cursor = "pointer";
    else this.canvas.element.style.cursor = "default";
  }

  // calculates the time limit in competitive mode

  calculateRemainingTime(this: WiresPage) {
    let numoftiles = 0;
    let usedTiles = 0;

    for (let i = 0; i < WiresTile.tiles.length; i++) {
      for (let j = 0; j < WiresTile.tiles[i].length; j++) {
        numoftiles++;
        if (WiresTile.tiles[i][j].used) usedTiles++;
      }
    }

    if (this.isMobile)
      WiresState.deadline = WiresState.now + (numoftiles * 0.6 + usedTiles * 1.4) * (1300 - WiresState.score * 16);
    else
      WiresState.deadline = WiresState.now + (numoftiles * 0.3 + usedTiles * 1.2) * (1000 - WiresState.score * 36);
  }

  // sets every tile.isPowered to false

  clearPower(this: WiresPage) {
    for (let i = 0; i < WiresTile.tiles.length; i++) {
      for (let j = 0; j < WiresTile.tiles[i].length; j++) {
        WiresTile.tiles[i][j].isPowered = false;
        WiresTile.tiles[i][j].dontPower = false;
      }
    }
    this.endPos.c = "#FF8800";
  }

  // fills the path of previously empty tiles

  fillTiles(this: WiresPage) {
    // return;

    this.startPos.x = WiresTile.tiles[this.startTile[0]][this.startTile[1]].x - this.startPos.w;
    this.startPos.y = WiresTile.tiles[this.startTile[0]][this.startTile[1]].y + 12;

    for (let x = 0; x < WiresTile.tiles.length; x++) {
      for (let y = 0; y < WiresTile.tiles[0].length; y++) {
        let t = WiresTile.tiles[x][y];
        let tocontinue = false;
        for (let i = 0; i < 4; i++) {
          if (t.exits[i] === true) tocontinue = true;
        }
        if (tocontinue) continue;
        if (true) {
          t.filled = true;
          switch (Math.floor(Math.random() * 2)) {
            case 0:
              t.exits[0] = true;
              t.exits[1] = true;
              break;
            case 1:
              t.exits[0] = true;
              t.exits[2] = true;
              break;
          }
        }
      }
    }
  }

  /**
   * Runs foreach on the tiles array
   */
  forEachTile(this: WiresPage, fn: (tile: WiresTile) => void): void {
    for (let i = 0; i < WiresTile.tiles.length; i++)
      for (let j = 0; j < WiresTile.tiles[i].length; j++)
        fn(WiresTile.tiles[i][j]);
  }

  // creates a solvable path

  generatePath(this: WiresPage, x: number, y: number, start, iteration: number) {
    iteration++;
    if (iteration > 400) {
      this.generateTilesGrid(4, 4);
      console.log("Taking too long to load.  Restarting build process.");
      return;
    }
    let t = WiresTile.tiles[x][y];
    if (start) {
      try {
        t.exits[3] = true;
      } catch (e) {
        throw new Error(
          "generatePath(): Cannot read property 'exits' of undefined at " +
          x +
          " " +
          y
        );
      }
      this.startTile = [x, y];
    }
    t.used = true;

    // determining if there are any more potential exits

    for (let i = 0; i < 4; i++) {
      if (t.potential[i]) break;
      else if (i === 3) {
        t.used = false;
        // if there's technically a chance to exit right
        if (x === WiresTile.tiles.length - 1) {
          t.exits[1] = true;
          t.used = true;
          this.endPos.x = t.x + t.w;
          this.endPos.y = t.y + Math.floor(t.h * 0.2);
          this.endPos.w = Math.floor(t.w * 0.4);
          this.endPos.h = Math.floor(t.h * 0.6);
          this.endTile = [x, y];
          return null;
        } else if (
          y === WiresTile.tiles[0].length - 1 &&
          (x >= WiresTile.tiles.length * 0.2 || (x > 1 && WiresTile.tiles.length < 10))
        ) {
          t.exits[2] = true;
          t.used = true;
          this.endPos.x = t.x + Math.floor(t.w * 0.2);
          this.endPos.y = t.y + t.h;
          this.endPos.w = Math.floor(t.w * 0.6);
          this.endPos.h = Math.floor(t.h * 0.4);

          if (x === WiresTile.tiles.length - 1) {
            this.resetBottomButtons();
            this.redraw();
          }

          this.endTile = [x, y];
          return null;
        }
        // if neither exit is possible, back up and try again
        for (let e = 0; e < 4; e++) {
          if (t.exits[e] === true) {
            var backExit = e;
            switch (backExit) {
              case 0:
                WiresTile.tiles[x][y - 1].potential[2] = false;
                WiresTile.tiles[x][y - 1].exits[2] = false;
                this.generatePath(x, y - 1, false, iteration);
                break;
              case 1:
                WiresTile.tiles[x + 1][y].potential[3] = false;
                WiresTile.tiles[x + 1][y].exits[3] = false;
                this.generatePath(x + 1, y, false, iteration);
                break;
              case 2:
                WiresTile.tiles[x][y + 1].potential[0] = false;
                WiresTile.tiles[x][y + 1].exits[0] = false;
                this.generatePath(x, y + 1, false, iteration);
                break;
              case 3:
                try {
                  WiresTile.tiles[x - 1][y].potential[1] = false;
                  WiresTile.tiles[x - 1][y].exits[1] = false;
                  this.generatePath(x - 1, y, false, iteration);
                } catch (e) {
                  this.generateTilesGrid(WiresTile.tiles.length, WiresTile.tiles[0].length);
                }
                break;
            }
            break;
          }
        }
        t.exits = [false, false, false, false];
        t.potential = [false, false, false, false];
        return true;
      }
    }

    let i = Math.floor(Math.random() * 4);

    while (true) {
      if (i > 3) i = 0;
      if (t.potential[i]) {
        t.exits[i] = true;
        t.potential = [false, false, false, false];
        if (typeof WiresTile.tiles[x][y - 1] !== "undefined")
          WiresTile.tiles[x][y - 1].potential[2] = false;
        if (typeof WiresTile.tiles[x + 1] !== "undefined")
          WiresTile.tiles[x + 1][y].potential[3] = false;
        if (typeof WiresTile.tiles[x][y + 1] !== "undefined")
          WiresTile.tiles[x][y + 1].potential[0] = false;
        if (typeof WiresTile.tiles[x - 1] !== "undefined")
          WiresTile.tiles[x - 1][y].potential[1] = false;
        switch (i) {
          case 0:
            if (typeof WiresTile.tiles[x][y - 1] !== "undefined") {
              WiresTile.tiles[x][y - 1].exits[2] = true;
              WiresTile.tiles[x][y - 1].potential[2] = false;
              this.generatePath(x, y - 1, false, iteration);
            }
            break;
          case 1:
            if (typeof WiresTile.tiles[x + 1] !== "undefined") {
              WiresTile.tiles[x + 1][y].exits[3] = true;
              WiresTile.tiles[x + 1][y].potential[3] = false;
              this.generatePath(x + 1, y, false, iteration);
            }
            break;
          case 2:
            if (typeof WiresTile.tiles[x][y + 1] !== "undefined") {
              WiresTile.tiles[x][y + 1].exits[0] = true;
              WiresTile.tiles[x][y + 1].potential[0] = false;
              this.generatePath(x, y + 1, false, iteration);
            }
            break;
          case 3:
            if (typeof WiresTile.tiles[x - 1] !== "undefined") {
              WiresTile.tiles[x - 1][y].exits[1] = true;
              WiresTile.tiles[x - 1][y].potential[1] = false;
              this.generatePath(x - 1, y, false, iteration);
            }
            break;
        }
        if (start) {
          // BASE CASE(?)

          this.fillTiles();
          this.setImgs();
          this.rotateAllImgs();

          this.startPos.w = Math.floor(WiresState.tileWidth * 0.4);
          this.startPos.y =
            WiresTile.tiles[this.startTile[0]][this.startTile[1]].y + Math.floor(WiresState.tileWidth * 0.2);
          this.startPos.h = Math.floor(WiresState.tileWidth * 0.6);
        }
        return;
      }
      i++;
    }
  }

  generateSprites(this: WiresPage) {
    WiresTile.sprites[0] = this.addSprite("limiter");
    WiresTile.sprites[1] = [];
    WiresTile.sprites[2] = [];
    WiresTile.sprites[5] = [];
    for (let i = 1; i < 5; i++) {
      WiresTile.sprites[1][i - 1] = this.addSprite("c" + i);
      WiresTile.sprites[2][i - 1] = this.addSprite("cp" + i);
      WiresTile.sprites[5][i - 1] = this.addSprite("rc" + i);
    }
    for (let i = 1; i < 3; i++) {
      WiresTile.sprites[1][4 + i - 1] = this.addSprite("s" + i);
      WiresTile.sprites[2][4 + i - 1] = this.addSprite("sp" + i);
      WiresTile.sprites[5][4 + i - 1] = this.addSprite("rs" + i);
    }
  }

  // creates the grid

  generateTilesGrid(this: WiresPage, columns: number, rows: number) {
    // tile creation

    WiresTile.tiles = [];
    WiresState.showAns = false;
    let totalW = WiresState.tileWidth * columns;
    let lMargin = (this.canvas.width - totalW) / 2;
    for (let i = 0; i < columns; i++) {
      WiresTile.tiles[i] = [];
      for (let j = 0; j < rows; j++) {
        WiresTile.tiles[i][j] = new WiresTile(lMargin + i * WiresState.tileWidth, 50 + j * WiresState.tileWidth);
      }
    }

    // removing border potential
    for (let i = 0; i < WiresTile.tiles.length; i++) {
      WiresTile.tiles[i][0].potential[0] = false; // prevent top row from exiting up
      WiresTile.tiles[i][WiresTile.tiles[i].length - 1].potential[2] = false; // prevent bottom row from exiting down
    }
    for (let i = 0; i < WiresTile.tiles[0].length; i++) {
      WiresTile.tiles[0][i].potential[3] = false; // prevent left column from exiting left
      WiresTile.tiles[WiresTile.tiles.length - 1][i].potential[1] = false; // prevent right column from exiting right
    }

    this.resetBottomButtons();
    this.generatePath(0, Math.floor(Math.random() * rows), true, 0);
  }

  // makes a settings tile

  makeNewPuzzle(this: WiresPage) {
    this.resetBounds();
    this.generateTilesGrid(
      Math.ceil(Math.random() * (WiresState.maxW - WiresState.minW)) + WiresState.minW,
      Math.ceil(Math.random() * (WiresState.maxH - WiresState.minH)) + WiresState.minH
    );
    if (WiresState.isCompetitive) this.calculateRemainingTime();
  }

  getInput(this: WiresPage): void {
    // Keys

    if (
      this.canvas.keys.isKeyDown('Enter') &&
      !WiresTile.tiles[this.startTile[0]][this.startTile[1]].isPowered &&
      WiresState.lastSolutionTime < WiresState.now &&
      WiresTile.tiles[this.startTile[0]][this.startTile[1]].exits[3] === true
    ) {
      // Enter key pressed
      this.solve(this.startTile[0], this.startTile[1], 3, true);
    }
  }

  handleClick(this: WiresPage, e: MouseEvent, isLeftClick: boolean) {
    const me = this;

    me.forEachTile((tile: WiresTile) => {
      if (isClicked(tile.x, tile.y, tile.w, tile.h)) {
        if (isLeftClick) {
          tile.rotates--;
          tile.rotation--;
          tile.rotate(1);
        } else {
          tile.rotates++;
          tile.rotation++;
          tile.rotate(-1);
        }
      }
    });

    if (
      isClicked(this.menuTiles.solve.x, this.menuTiles.solve.y, this.menuTiles.solve.w, this.menuTiles.solve.h) &&
      !WiresTile.tiles[this.startTile[0]][this.startTile[1]].isPowered &&
      WiresState.lastSolutionTime < WiresState.now &&
      WiresTile.tiles[this.startTile[0]][this.startTile[1]].exits[3] === true
    ) {
      this.solve(this.startTile[0], this.startTile[1], 3, true);
    }
    if (!WiresState.isCompetitive) {
      if (isClicked(40 + WiresTile.tiles[0][0].x, WiresTile.tiles[0][0].y - 40, 35, 35)) {
        WiresState.showAns = !WiresState.showAns;
      } else if (
        isClicked(80 + WiresTile.tiles[0][0].x, WiresTile.tiles[0][0].y - 40, 35, 35)
      ) {
        this.makeNewPuzzle();
      } else if (
        isClicked(120 + WiresTile.tiles[0][0].x, WiresTile.tiles[0][0].y - 40, 35, 35)
      ) {
        this.restrictSize = !this.restrictSize;
      } else if (
        isClicked(160 + WiresTile.tiles[0][0].x, WiresTile.tiles[0][0].y - 40, 35, 35)
      ) {
        switch (WiresState.tileWidth) {
          case 64:
            WiresState.tileWidth = 48;
            break;
          case 48:
            WiresState.tileWidth = 32;
            break;
          case 32:
            WiresState.tileWidth = 64;
            break;
          case 16:
            WiresState.tileWidth = 64;
            break;
        }
        this.makeNewPuzzle();
        this.fillTiles();
      }
    } else {
      if (isClicked(40 + WiresTile.tiles[0][0].x + WiresConstants.LIVES_COUNTER.INNER_WIDTH, WiresTile.tiles[0][0].y - 40, 35, 35)) {
        switch (WiresState.tileWidth) {
          case 64:
            WiresState.tileWidth = 48;
            break;
          case 48:
            WiresState.tileWidth = 32;
            break;
          case 32:
            WiresState.tileWidth = 64;
            break;
          case 16:
            WiresState.tileWidth = 64;
            WiresState.remainingAttempts = 1;
            break;
        }
        this.makeNewPuzzle();
        if (WiresState.remainingAttempts < 1) {
          WiresState.score = 0;
          WiresState.remainingAttempts = 3;
        }
        this.fillTiles();
      }
    }

    function isClicked(x: number, y: number, w: number, h: number): boolean {
      return e.offsetX >= x
        && e.offsetX <= x + w
        && e.offsetY >= y
        && e.offsetY <= y + h;
    }
  }

  handleMouseMove(this: WiresPage, e: MouseEvent) {
    const me = this;
    // Hover
    this.lastMouseX = e.offsetX;
    this.lastMouseY = e.offsetY;

    let usePointer: boolean = false;
    me.forEachTile((tile) => {
      if (me.isHovering(tile.x, tile.y, tile.w, tile.h) && !this.isMobile) {
        tile.hovering = true;
        usePointer = true;
      } else tile.hovering = false;
    });

    cws.Object.values(this.menuTiles).forEach((tile: WiresMenuTile) => {
      if (
        me.isHovering(
          tile.x,
          tile.y,
          tile.w,
          tile.h
        )) {
        tile.isHovered = true;
        if (tile.isHovered)
          usePointer = true;
      } else tile.isHovered = false;
    });

    this.usePointer = usePointer;
  }

  isHovering(this: WiresPage, x: number, y: number, w: number, h: number): boolean {
    return this.lastMouseX >= x
      && this.lastMouseX <= x + w
      && this.lastMouseY >= y
      && this.lastMouseY <= y + h;
  }

  loseLevel(this: WiresPage) {
    const me = this;
    WiresState.isWon = WiresWinStateEnum.ongoing;
    setTimeout(function () {
      WiresState.showRed = true;
      me.startPos.c = "#DD0000";
      setTimeout(function () {
        me.startPos.c = "#00F5F5";
        me.clearPower();
        WiresState.lastSolutionTime = WiresState.now + 500;
        WiresState.showRed = false;
        if (WiresState.deadline - WiresState.now < 0) {
          me.makeNewPuzzle();
        }
        if (WiresState.remainingAttempts < 1 && WiresState.isCompetitive) {
          WiresState.lastSolutionTime = WiresState.now + 1000;
          WiresState.remainingAttempts = 3;
          WiresState.elapsedCompetitiveWins = 0;
          WiresState.score = 0;
          me.makeNewPuzzle();
        }
      }, 900);
    }, 100);
    if (WiresState.remainingAttempts > 0) WiresState.remainingAttempts--;
  }

  /**
   * Clears and redraws the canvas
   */
  redraw(): void {
    const me = this;
    this.canvas.clear();

    this.canvas.fillRect(
      WiresTile.tiles[0][0].x - WiresConstants.BORDER.WIDTH,
      WiresTile.tiles[0][0].y - WiresConstants.BORDER.WIDTH,
      WiresTile.tiles[0][0].w * WiresTile.tiles.length + WiresConstants.BORDER.WIDTH * 2,
      WiresTile.tiles[0][0].w * WiresTile.tiles[0].length + WiresConstants.BORDER.WIDTH * 2,
      WiresConstants.BORDER.COLOUR
    ); // outline
    this.canvas.fillRect(
      WiresTile.tiles[0][0].x,
      WiresTile.tiles[0][0].y,
      WiresState.tileWidth * WiresTile.tiles.length,
      WiresState.tileWidth * WiresTile.tiles[0].length,
      "black"
    ); // backdrop

    WiresTile.tiles.forEach((col) => {
      col.forEach((tile) => {
        tile.draw(this.canvas);
      });
    });

    if (WiresTile.tiles[this.startTile[0]][this.startTile[1]].isPowered) {
      this.canvas.fillRect(
        this.startPos.x - 5,
        this.startPos.y - 5,
        this.startPos.w + 5,
        this.startPos.h + 10,
        WiresConstants.BORDER.COLOUR
      );
      this.canvas.fillRect(this.startPos.x, this.startPos.y, this.startPos.w, this.startPos.h, this.startPos.c);
    } else {
      this.canvas.fillRect(
        this.startPos.x - 10,
        this.startPos.y - 5,
        this.startPos.w + 5,
        this.startPos.h + 10,
        WiresConstants.BORDER.COLOUR
      );
      this.canvas.fillRect(this.startPos.x - 5, this.startPos.y, this.startPos.w, this.startPos.h, this.startPos.c);
    }
    if (this.endPos.w > this.endPos.h)
      this.canvas.fillRect(
        this.endPos.x - 5,
        this.endPos.y,
        this.endPos.w + 10,
        this.endPos.h + 5,
        WiresConstants.BORDER.COLOUR
      );
    else
      this.canvas.fillRect(
        this.endPos.x,
        this.endPos.y - 5,
        this.endPos.w + 5,
        this.endPos.h + 10,
        WiresConstants.BORDER.COLOUR
      );
    this.canvas.fillRect(this.endPos.x, this.endPos.y, this.endPos.w, this.endPos.h, this.endPos.c);

    cws.Object.values(this.menuTiles).forEach((tile) => {
      tile.redraw(me.canvas);
    });
  }

  resetBounds(this: WiresPage) {

    // get available height
    const totalScreenHeight = window.innerHeight - this.canvas.element.getBoundingClientRect().y;
    const availableHeight = totalScreenHeight - this.menuTiles.livesCounter.h - this.menuTiles.solve.h - WiresConstants.BORDER.WIDTH * 4 - WiresConstants.BOTTOM_MARGIN;
    const availableWidth = this.canvas.width - this.startPos.w - this.endPos.w - WiresConstants.BORDER.WIDTH * 4 - 2 * WiresConstants.SIDE_MARGIN - this.menuTiles.highScore.w;
    WiresState.maxW = Math.floor(availableWidth / WiresState.tileWidth);
    WiresState.maxH = Math.floor(availableHeight / WiresState.tileWidth);

    // recalculating boundaries

    if (this.restrictSize) {
      WiresState.minW = 3;
      WiresState.minH = 3;
    } else if (WiresState.isCompetitive) {
      WiresState.minW = Math.floor(WiresState.maxW * 0.6);
      WiresState.minH = Math.floor(WiresState.maxH * 0.6);
    } else {
      WiresState.minW = Math.floor(WiresState.maxW / 3);
      WiresState.minH = Math.floor(WiresState.maxH / 3);
    }
  }

  /**
   * Resets the location of the solve button
   */
  resetBottomButtons(this: WiresPage): void {
    this.menuTiles.solve.x = WiresTile.tiles[0][WiresTile.tiles[0].length - 1].x;
    this.menuTiles.solve.y = WiresTile.tiles[0][WiresTile.tiles[0].length - 1].bottom + WiresConstants.BORDER.WIDTH;

    // this.menuTiles.highScore.x = this.menuTiles.solve.x + this.menuTiles.solve.w + WiresConstants.BORDER.WIDTH; // to the right
    this.menuTiles.highScore.x = this.menuTiles.solve.x - this.menuTiles.highScore.w - WiresConstants.BORDER.WIDTH; // to the left
    this.menuTiles.highScore.y = this.menuTiles.solve.y;
  }

  // checks if the player has solved the puzzle

  solve(x: number, y: number, ent: number, start?: boolean) {
    const me = this;

    let t = WiresTile.tiles[x][y];
    let exit: number;

    if (start) WiresState.stopTime = WiresState.now;

    t.isPowered = true;
    for (let i = 0; i < 4; i++) {
      if (t.exits[i] === true && i !== ent) {
        exit = i;
      }
    }

    if (start && t.exits[3] === false) {
      t.dontPower = true;
      WiresState.isWon = WiresWinStateEnum.loss;
      return;
    }

    let s = 50;

    switch (exit) {
      case 0:
        try {
          if (WiresTile.tiles[x][y - 1].exits[2] === true) {
            setTimeout(function () {
              me.solve(x, y - 1, 2);
            }, s);
          } else {
            WiresState.isWon = 0;
            return;
          }
        } catch (e) {
          if (x === this.endTile[0] && y === this.endTile[1]) {
            WiresState.isWon = 1;
            return;
          } else {
            WiresState.isWon = 0;
            return;
          }
        }
        break;
      case 1:
        try {
          if (WiresTile.tiles[x + 1][y].exits[3] === true) {
            setTimeout(function () {
              me.solve(x + 1, y, 3);
            }, s);
          } else {
            WiresState.isWon = 0;
            return;
          }
        } catch (e) {
          if (x === this.endTile[0] && y === this.endTile[1]) {
            WiresState.isWon = 1;
            return;
          } else {
            WiresState.isWon = 0;
            return;
          }
        }
        break;
      case 2:
        try {
          if (WiresTile.tiles[x][y + 1].exits[0] === true) {
            setTimeout(function () {
              me.solve(x, y + 1, 0);
            }, s);
          } else {
            WiresState.isWon = 0;
            return;
          }
        } catch (e) {
          if (x === this.endTile[0] && y === this.endTile[1]) {
            WiresState.isWon = 1;
            return;
          } else {
            WiresState.isWon = 0;
            return;
          }
        }
        break;
      case 3:
        try {
          if (WiresTile.tiles[x - 1][y].exits[1] === true) {
            setTimeout(function () {
              me.solve(x - 1, y, 1);
            }, s);
          } else {
            WiresState.isWon = 0;
            return;
          }
        } catch (e) {
          if (x === this.endTile[0] && y === this.endTile[1]) {
            WiresState.isWon = 1;
            return;
          } else {
            WiresState.isWon = 0;
            return;
          }
        }
        break;
      default:
        console.log(exit);
    }
  }

  /**
   * does various tasks every frame
   */

  update() {
    this.canvas.clearColour = window.getComputedStyle(document.getElementById(
      "main"
    )).backgroundColor;

    if (WiresState.isCompetitive && WiresState.deadline - WiresState.now <= 32 && !WiresTile.tiles[this.startTile[0]][this.startTile[1]].isPowered) {
      this.solve(this.startTile[0], this.startTile[1], 3, true);
    }

    for (let i = 0; i < WiresTile.tiles.length; i++) {
      for (let j = 0; j < WiresTile.tiles[i].length; j++) {
        let tile = WiresTile.tiles[i][j];
        let speed = this.isMobile ? 6 : 4;
        if (tile.rotateTimer > 0) {
          tile.rotateTimer--;
        }

        if (tile.rotation > 0) {
          tile.rotation += speed;
          if (tile.rotation >= 90) {
            tile.permarotation += 90;
            tile.rotates--;
            if (tile.rotates < 0) tile.rotation = -1;
            else if (tile.rotates > 0) tile.rotation = 1;
            else tile.rotation = 0;
          }
        } else if (tile.rotation < 0) {
          tile.rotation -= speed;
          if (tile.rotation <= -90) {
            tile.permarotation -= 90;
            tile.rotates++;
            if (tile.rotates < 0) tile.rotation = -1;
            else if (tile.rotates > 0) tile.rotation = 1;
            else tile.rotation = 0;
          }
        }
      }
    }
  }

  // sets every tile's image

  setImgs() {
    for (let i = 0; i < WiresTile.tiles.length; i++) {
      for (let j = 0; j < WiresTile.tiles[i].length; j++) {
        let t = WiresTile.tiles[i][j];
        let imgNC = Math.floor(Math.random() * 4);
        let imgNS = 4 + Math.floor(Math.random() * 2);
        switch (t.exits.join()) {
          case "true,true,false,false":
            t.img = WiresTile.sprites[1][imgNC];
            t.imgp = WiresTile.sprites[2][imgNC];
            t.imgr = WiresTile.sprites[5][imgNC];
            break;
          case "false,true,true,false":
            t.img = WiresTile.sprites[1][imgNC];
            t.imgp = WiresTile.sprites[2][imgNC];
            t.imgr = WiresTile.sprites[5][imgNC];
            t.permarotation = 90;
            break;
          case "false,false,true,true":
            t.img = WiresTile.sprites[1][imgNC];
            t.imgp = WiresTile.sprites[2][imgNC];
            t.imgr = WiresTile.sprites[5][imgNC];
            t.permarotation = 180;
            break;
          case "true,false,false,true":
            t.img = WiresTile.sprites[1][imgNC];
            t.imgp = WiresTile.sprites[2][imgNC];
            t.imgr = WiresTile.sprites[5][imgNC];
            t.permarotation = 270;
            break;
          case "true,false,true,false":
            t.img = WiresTile.sprites[1][imgNS];
            t.imgp = WiresTile.sprites[2][imgNS];
            t.imgr = WiresTile.sprites[5][imgNS];
            break;
          case "false,true,false,true":
            t.img = WiresTile.sprites[1][imgNS];
            t.imgp = WiresTile.sprites[2][imgNS];
            t.imgr = WiresTile.sprites[5][imgNS];
            t.permarotation = 90;
            break;
        }
      }
    }
  }

  // shuffles exits of every tile

  rotateAllImgs() {
    for (let x = 0; x < WiresTile.tiles.length; x++) {
      for (let y = 0; y < WiresTile.tiles[0].length; y++) {
        // tiles[x][y].permarotation = 0;
        let roNo = Math.floor(Math.random() * 4);
        WiresTile.tiles[x][y].rotate(roNo);
        WiresTile.tiles[x][y].permarotation -= roNo * 90;
      }
    }
  }

  winLevel() {
    const me = this;
    WiresState.isWon = WiresWinStateEnum.ongoing;
    me.endPos.c = "#00F5F5";
    WiresState.score++;
    WiresState.elapsedWins = WiresState.score;

    if (WiresState.isCompetitive) {
      if (WiresState.elapsedCompetitiveWinsHighScore < WiresState.score)
        WiresState.elapsedCompetitiveWinsHighScore = WiresState.score;
    }

    setTimeout(function () {
      me.makeNewPuzzle();
      WiresState.showRed = false;
      me.endPos.c = "#FF8800";
      if (WiresState.remainingAttempts < 3)
        if (WiresState.isCompetitive) WiresState.remainingAttempts += 0.25;
        else WiresState.remainingAttempts++;
    }, 1500);
  }

  // General

  addSprite(src: string) {
    var newimg = document.createElement("img");
    var truesrc = "../siteimages/energy/" + src + ".png";
    newimg.setAttributeNode(cws.betterCreateAttr("src", truesrc));
    newimg.setAttributeNode(cws.betterCreateAttr("id", truesrc));
    document.getElementById("imgs").appendChild(newimg);
    return newimg;
  }
}

function loadPageInit() {
  // HTML initialization

  document.getElementById("casual").addEventListener("click", () => {
    new WiresPage(false);
  });

  document.getElementById("comp").addEventListener("click", () => {
    new WiresPage(true);
  });

  Array.from(document.getElementsByClassName('orange-span')).forEach((span: HTMLSpanElement) => {
    span.style.color = WiresConstants.COLOURS.ORANGE;
  });
  Array.from(document.getElementsByClassName('cyan-span')).forEach((span: HTMLSpanElement) => {
    span.style.color = WiresConstants.COLOURS.POWER;
  });
}

loadPageInit();
