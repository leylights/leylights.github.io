/**
 * A second attempt at recreating BANDAI-NAMCO's Pac-Man
 * @author River Stanley
 * 
 * Start Date: April 30th, 2021
 * End Date: September 7th, 2021
 */

import { Molasses } from "../../molasses.js";
import { Canvas } from "../../components/canvas.component.js";
import { PacmanCharacter } from "./canvas-components/entities/character.js";
import { PacmanConstants } from "./canvas-components/constants.js";
import { PacmanGhost } from "./canvas-components/entities/ghost.js";
import { PacmanMapNode } from "./canvas-components/map-node.js";
import { PacmanPickup } from "./canvas-components/entities/pickup.js";
import { PacmanPlayer } from "./canvas-components/entities/player.js";
import { PacmanSprites } from "./canvas-components/sprites.js";
import { PacmanState } from "./canvas-components/state.js";
import { PacmanDirectionEnum, PacmanHelper, PacmanStateEnum } from "./helper.js";
import { PacmanPowerPellet } from "./canvas-components/entities/power-pellet.js";
import { PacmanNormalPellet } from "./canvas-components/entities/normal-pellet.js";
import { PacmanFruit } from "./canvas-components/entities/fruit.js";

export enum PacmanRestartTypesEnum {
  FULL,
  PLAYER_DEATH,
  LEVEL_UP
}

export class PacmanPage {
  canvas: Canvas = new Canvas({
    parentElement: document.getElementById('canvas-container'),
    disableArrowKeyPageMovement: true,
    clearColour: 'black'
  });
  maxPelletCount: number;
  stupidiferInterval: number;

  constructor() {
    PacmanMapNode.generateMap(this.canvas);
    this.restartGame(PacmanRestartTypesEnum.FULL);

    this.canvas.start(() => { this.main() });
  }

  /**
   * May award the player a bonus life
   */
  attemptBonusLife(this: PacmanPage) {
    if (PacmanState.next1UpScore && PacmanState.score >= PacmanState.next1UpScore) {
      PacmanPlayer.player.remainingRevives++;
      PacmanState.next1UpScore = null;
    }
  }

  /**
   * May spawn a fruit
   */
  attemptFruitSpawn(this: PacmanPage) {
    if (!PacmanState.hasFruitSpawned && PacmanState.pellets.length < this.maxPelletCount / 2 && Math.random() < 0.1) {
      PacmanState.hasFruitSpawned = true;
      PacmanState.fruits.push(new PacmanFruit());
    }
  }

  /**
   * May move on to the next level
   */
  attemptNextLevel(this: PacmanPage) {
    if (PacmanState.pellets.length === 0 && PacmanState.fruits.length === 0 && PacmanState.hasFruitSpawned) {
      PacmanState.levelCompletionTime = PacmanState.now;

      PacmanState.gameState = PacmanStateEnum.LEVEL_END;
      PacmanState.freezeAnimation();

      setTimeout(() => {
        this.restartGame(PacmanRestartTypesEnum.LEVEL_UP);
      }, PacmanConstants.LEVEL_END_FLASHING_TIME + PacmanConstants.LEVEL_END_FLASH_DELAY);
    }
  }

  /**
   * Determines the path the player should take
   */
  determinePlayerPath(this: PacmanPage) {
    const me = this,
      player = PacmanPlayer.player;

    if (this.canvas.keys.isKeyDown("w") || this.canvas.keys.isKeyDown("ArrowUp")) {
      setDirection(PacmanDirectionEnum.UP);
    } else if (this.canvas.keys.isKeyDown("a") || this.canvas.keys.isKeyDown("ArrowLeft")) {
      setDirection(PacmanDirectionEnum.LEFT);
    } else if (this.canvas.keys.isKeyDown("s") || this.canvas.keys.isKeyDown("ArrowDown")) {
      setDirection(PacmanDirectionEnum.DOWN);
    } else if (this.canvas.keys.isKeyDown("d") || this.canvas.keys.isKeyDown("ArrowRight")) {
      setDirection(PacmanDirectionEnum.RIGHT);
    }

    if (PacmanHelper.areOppositeDirection(PacmanPlayer.player.aimDirection, PacmanPlayer.player.direction)) {
      player.currentNodeID = player.destinationNodeID;
      player.direct();
      player.distanceToDest = Math.sqrt(Math.pow(player.destinationNode.x - player.x, 2) + Math.pow(player.destinationNode.y - player.y, 2));
    }

    function setDirection(direction: PacmanDirectionEnum) {
      PacmanPlayer.player.aimDirection = direction;

      if (PacmanState.gameState === PacmanStateEnum.WAITING_FOR_PLAYER) {
        PacmanState.gameState = PacmanStateEnum.NORMAL;
        PacmanState.lifeStartTime = PacmanState.now;
      }
    }
  }

  /**
   * Generates all pellets
   */
  generatePellets(this: PacmanPage): void {
    PacmanState.pellets = [];

    const len = PacmanMapNode.map.length;
    const pelletlessNodes = ["v", "w", "bp", "x", "y", "z", "ab", "ac", "ad", "bl", "bt", "bo", "bw", "bm", "bn", "bu"];
    for (let i = 0; i < len; i++) {
      const start = PacmanMapNode.map[i];
      if (start == undefined) {
        continue;
      }

      if (Molasses.anyEqual([start.ID], pelletlessNodes)) {
        continue;
      }

      PacmanState.pellets.push(
        generatePellet(
          start.x + PacmanConstants.HALL_WIDTH / 2 - PacmanPickup.BASE_WIDTH / 2,
          start.y + PacmanConstants.HALL_WIDTH / 2 - PacmanPickup.BASE_WIDTH / 2));

      for (let j = 0; j < start.exits.length; j++) {
        const end = PacmanMapNode.getNodeByID(start.exits[j]);

        if (Molasses.anyEqual([start.ID, end.ID], pelletlessNodes)) {
          continue;
        }

        if (start.ID >= end.ID) {
          continue;
        }

        let dx = 0;
        let dy = 0;
        const totalDistance = start.distanceToNode(end.ID);
        const direction = start.directionTo(end.ID);

        for (let k = 0; k < totalDistance - 1; k += PacmanConstants.DISTANCE_BETWEEN_PELLETS) {
          if (k > 0)
            PacmanState.pellets.push(generatePellet(start.x + PacmanConstants.HALL_WIDTH / 2 - PacmanPickup.BASE_WIDTH / 2 + dx, start.y + PacmanConstants.HALL_WIDTH / 2 - PacmanPickup.BASE_WIDTH / 2 + dy));

          switch (direction) {
            case PacmanDirectionEnum.UP:
              dy -= PacmanConstants.DISTANCE_BETWEEN_PELLETS;
              break;
            case PacmanDirectionEnum.LEFT:
              dx -= PacmanConstants.DISTANCE_BETWEEN_PELLETS;
              break;
            case PacmanDirectionEnum.DOWN:
              dy += PacmanConstants.DISTANCE_BETWEEN_PELLETS;
              break;
            case PacmanDirectionEnum.RIGHT:
              dx += PacmanConstants.DISTANCE_BETWEEN_PELLETS;
              break;
          }
        }
      }
    }

    this.maxPelletCount = PacmanState.pellets.length;

    /**
     * Creates a new pellet
     * @param {Number} x 
     * @param {Number} y 
     * @param {Boolean} isChasePellet 
     */
    function generatePellet(x: number, y: number): PacmanPowerPellet | PacmanNormalPellet {
      let isChasePellet = false;

      if ((x == 22 && y == 102) || (x == 422 && y == 102)
        || (x == 22 && y == 423) || (x == 422 && y == 423)) {
        isChasePellet = true;
        x -= (PacmanPickup.CHASE_WIDTH - PacmanPickup.BASE_WIDTH) / 2
        y -= (PacmanPickup.CHASE_WIDTH - PacmanPickup.BASE_WIDTH) / 2
      }

      if (isChasePellet) {
        return new PacmanPowerPellet(x, y);
      } else {
        return new PacmanNormalPellet(x, y);
      }
    }
  }

  main(this: PacmanPage) {
    PacmanState.now = Date.now();

    if (PacmanConstants.GOD_MODE) {
      if (this.canvas.keys.isKeyDown('p'))
        PacmanState.pellets = [];
    }

    this.redraw();

    switch (PacmanState.gameState) {
      case PacmanStateEnum.PLAYER_DEATH_PAUSE:
      case PacmanStateEnum.PLAYER_DEATH_ANIMATING:
      case PacmanStateEnum.PAUSE_BEFORE_WAITING_FOR_PLAYER:
      case PacmanStateEnum.LEVEL_END:
        break;
      case PacmanStateEnum.PLAYER_DEATH_END:
        if (PacmanPlayer.player.remainingRevives === 0) this.restartGame(PacmanRestartTypesEnum.FULL);
        else this.restartGame(PacmanRestartTypesEnum.PLAYER_DEATH);
        break;
      case PacmanStateEnum.GHOST_DEATH_PAUSE:
        this.moveSprites();
        this.updateGhosts();
        break;
      case PacmanStateEnum.WAITING_FOR_PLAYER:
        this.determinePlayerPath();
        break;
      case PacmanStateEnum.CHASE:
        if (PacmanState.now > PacmanState.chaseStartTime + PacmanConstants.CHASE_LEN && !PacmanPlayer.player.isDead) {
          PacmanState.gameState = PacmanStateEnum.NORMAL;
          PacmanState.ghostsKilledInChase = 0;
        }
      default:
        this.moveSprites();
        this.attemptBonusLife();
        this.attemptFruitSpawn();
        this.attemptNextLevel();
        this.determinePlayerPath();
        this.pickupCollision();
        this.updateGhosts();
    }
  }

  moveSprites(this: PacmanPage): void {
    if (Molasses.Array.includes([PacmanStateEnum.NORMAL, PacmanStateEnum.CHASE], PacmanState.gameState))
      PacmanPlayer.player.move(() => { PacmanPlayer.player.direct() });

    PacmanGhost.array.forEach((ghost: PacmanGhost) => {
      ghost.move(() => { ghost.direct() });
    });
  }

  pickupCollision(this: PacmanPage): void {
    for (let i = 0; i < PacmanState.pellets.length; i++) {
      if (PacmanPlayer.player.isCollidingWithCircle(PacmanState.pellets[i])) {
        if (PacmanState.pellets[i] instanceof PacmanPowerPellet) {
          PacmanState.score += PacmanConstants.POWER_PELLET_SCORE;
          PacmanState.gameState = PacmanStateEnum.CHASE;
          PacmanState.chaseStartTime = PacmanState.now;
        } else {
          PacmanState.score += PacmanConstants.NORMAL_PELLET_SCORE;
        }

        // delete the pellet
        PacmanState.pellets.splice(i, 1);
        i -= 1;
      }
    }

    for (let i = 0; i < PacmanState.fruits.length; i++) {
      if (PacmanPlayer.player.isCollidingWithCircle(PacmanState.fruits[i])) {
        PacmanState.fruits[i].eat();
        PacmanState.fruits.splice(i, 1);
        i -= 1;
      }
    }
  }

  /**
   * Clears, redraws the this.canvas
   * effects: changes the this.canvas
   */

  redraw(this: PacmanPage) {
    const me = this;
    this.canvas.clear();

    const map: HTMLImageElement = (
      PacmanState.isLevelEndFlashing()
      && ((PacmanState.now - PacmanState.levelCompletionTime) % (PacmanConstants.LEVEL_END_FLASHING_INTERVAL * 2)) < PacmanConstants.LEVEL_END_FLASHING_INTERVAL
    )
      ? PacmanSprites.spritesTree.getValue("precise_map_flash.png")
      : PacmanSprites.spritesTree.getValue("precise_map.png");
    this.canvas.drawImage(map, 0, 0);

    // score

    this.canvas.drawText("SCORE: ", 12, 20, "white", false, 16);
    this.canvas.drawText(PacmanState.score + "", 12, 36, "white", false, 16);

    // ready!

    if (Molasses.Array.includes([PacmanStateEnum.PAUSE_BEFORE_WAITING_FOR_PLAYER, PacmanStateEnum.WAITING_FOR_PLAYER], PacmanState.gameState)) {
      const readyImage: HTMLImageElement = PacmanSprites.spritesTree.getValue("ready.png");
      const topMargin: number = (PacmanConstants.HALL_WIDTH - readyImage.height) / 2;
      this.canvas.drawImage(readyImage, (this.canvas.width / 2) - (readyImage.width / 2), PacmanConstants.NODE_ROWS[5] + topMargin);
    }

    // lives

    for (let i = 0; i < PacmanPlayer.player.remainingRevives; i++) {
      this.canvas.drawImage(
        PacmanSprites.spritesTree.getValue('pacman/l1.png'),
        PacmanConstants.NODE_COLS[1] + (i * (PacmanConstants.LIVES_DISPLAY_WIDTH + PacmanConstants.LIVES_DISPLAY_SPACING)),
        PacmanConstants.LIVES_DISPLAY_Y,
        PacmanConstants.LIVES_DISPLAY_WIDTH,
        PacmanConstants.LIVES_DISPLAY_WIDTH,
      );
    }

    // collected fruits
    for (let i = 1; i <= Math.min(PacmanState.collectedFruitCount, 8); i++) {
      this.canvas.drawImage(
        PacmanSprites.spritesTree.getValue(`fruits/${i}.png`),
        PacmanConstants.NODE_COLS[9] - (i * (PacmanConstants.FRUITS_DISPLAY_WIDTH + PacmanConstants.FRUITS_DISPLAY_SPACING)),
        PacmanConstants.LIVES_DISPLAY_Y,
        PacmanConstants.FRUITS_DISPLAY_WIDTH,
        PacmanConstants.FRUITS_DISPLAY_WIDTH,
      );
    }

    // drawing nodes
    const nodeColour = "#ddffff"
    if (PacmanConstants.DRAW_NODES) {
      PacmanMapNode.map.forEach((node: PacmanMapNode) => {
        if (node == undefined)
          return;

        this.canvas.drawRect(node.x, node.y, 32, 32, nodeColour);

        for (let j = 0; j < node.exits.length; j++) {
          if (PacmanMapNode.getNodeByID(node.exits[j]) == undefined) continue;
          const colour = nodeColour;
          // if (node.canSpawnFruit && PacmanMapNode.getNodeByID(node.exits[j]).canSpawnFruit) colour = 'red';
          this.canvas.drawLine(node.x + 12, node.y + 12,
            PacmanMapNode.getNodeByID(node.exits[j]).x + 20,
            PacmanMapNode.getNodeByID(node.exits[j]).y + 20, colour, 2);
        }
      });

      PacmanMapNode.map.forEach((node: PacmanMapNode) => {
        this.canvas.fillRect(node.x + 1, node.y + 1, 30, 30, 'black');
        this.canvas.drawText(node.ID.toUpperCase(),
          node.x + PacmanConstants.HALL_WIDTH / 2,
          node.y + PacmanConstants.HALL_WIDTH / 2,
          "white",
          true,
          PacmanConstants.HALL_WIDTH / 2,
          null);
      })

      if (PacmanPlayer.player.hasDestination) {
        this.canvas.fillRect(PacmanPlayer.player.destinationNode.x + 12, PacmanPlayer.player.destinationNode.y + 12, 8, 8, "#bbbb00");
        this.canvas.fillRect(PacmanPlayer.player.currentNode.x + 12, PacmanPlayer.player.currentNode.y + 12, 8, 8, "#0000bb");
      }
    }

    // entities
    PacmanState.pellets.forEach((pellet: PacmanPowerPellet | PacmanNormalPellet) => {
      pellet.draw(me.canvas);
    });

    PacmanState.fruits.forEach((fruit: PacmanFruit) => {
      fruit.draw(me.canvas);
    });

    PacmanPlayer.player.drawPlayer(me.canvas);
    PacmanGhost.array.forEach((ghost: PacmanGhost) => {
      ghost.drawGhost(me.canvas);
    });
  }

  restartGame(this: PacmanPage, restartType: PacmanRestartTypesEnum) {
    if (Molasses.Array.includes([PacmanRestartTypesEnum.FULL, PacmanRestartTypesEnum.LEVEL_UP], restartType)) {
      this.generatePellets();

      PacmanGhost.array.forEach((g: PacmanCharacter) => {
        g = null;
      });
    }

    PacmanGhost.list.red.home.x = PacmanGhost.list.pink.home.x;
    PacmanGhost.list.red.home.y = PacmanGhost.list.pink.home.y;

    this.resetStupidifyInterval();

    PacmanPlayer.player.revivePlayer(restartType);
    PacmanPlayer.player.moveToHome();
    PacmanGhost.forEach((ghost) => {
      ghost.reviveGhost(true);
    });

    PacmanState.gameState = PacmanStateEnum.PAUSE_BEFORE_WAITING_FOR_PLAYER;

    PacmanState.lifeStartTime = PacmanState.now;
    PacmanState.levelCompletionTime = null;

    if (restartType === PacmanRestartTypesEnum.FULL) {
      PacmanState.score = 0;
      PacmanState.fruits = [];
      PacmanState.collectedFruitCount = 0;
      PacmanState.next1UpScore = 10000;
    }

    if (Molasses.Array.includes([PacmanRestartTypesEnum.FULL, PacmanRestartTypesEnum.LEVEL_UP], restartType)) {
      PacmanState.levelStartTime = PacmanState.now;
      PacmanState.hasFruitSpawned = false;
    }
    PacmanState.ghostsKilledInChase = 0;
    PacmanState.unfreezeAnimation();

    setTimeout(() => {
      PacmanState.gameState = PacmanStateEnum.WAITING_FOR_PLAYER;
    }, PacmanConstants.START_DELAY);
  }


  /**
   * Stupidifies the ghosts
   * @requires 0 <= modifier <= 1, where 1 removes all ability for the ghosts to make coherent decisions 
   */
  stupidify(this: PacmanPage, modifiers: number | [number, number, number, number]): void {
    if (!Array.isArray(modifiers))
      modifiers = [modifiers, modifiers, modifiers, modifiers];

    for (let i = 0; i < PacmanGhost.array.length; i++) {
      PacmanGhost.list.red.stupidifier = modifiers[i]
    }
  }

  /**
   * Stupidifies the ghosts on a periodic cycle
   */
  resetStupidifyInterval(this: PacmanPage): void {
    const me = this;

    clearInterval(this.stupidiferInterval);
    this.stupidiferInterval = setInterval(() => {
      me.stupidify(modifierSineFn(PacmanState.now));
    });

    function modifierSineFn(n: number): number {
      const amplitude = PacmanConstants.STUPIDIFIER_AMPLITUDE,
        period = PacmanConstants.STUPIDIFER_CYCLE_LENGTH_MS,
        k = (2 * Math.PI) / period;

      return amplitude * Math.sin(k * n) + amplitude;
    }
  }

  /**
   * Handles ghost-related tasks
   */
  updateGhosts(this: PacmanPage): void {
    PacmanGhost.array.forEach((g: PacmanGhost) => {
      // unfreezing    
      if (g.isFrozen && PacmanState.gameState !== PacmanStateEnum.WAITING_FOR_PLAYER && PacmanState.now > g.startDelay + PacmanState.lifeStartTime) {
        g.isFrozen = false;
        g.direct();
      }

      // player collision
      if (g.isCollidingWithCircle(PacmanPlayer.player)) {
        if (PacmanState.gameState == PacmanStateEnum.CHASE && !g.isDead && g.isFleeing) {
          g.kill();
        } else if (!PacmanConstants.GOD_MODE && !g.isFleeing && !g.isDead) {
          PacmanState.gameState = PacmanStateEnum.PLAYER_DEATH_PAUSE;
          PacmanState.freezeAnimation();
          PacmanPlayer.player.kill();
        }
      }
    });
  }
}

new PacmanPage();
