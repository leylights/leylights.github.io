import { cws } from "../../../../cws.js";
import { MathVector } from "../../../../tools/math/vector.js";
import { Canvas } from "../../../_components/canvas.component.js";
import { PacmanEntityEnum, PacmanDirectionEnum, PacmanHelper, PacmanStateEnum } from "../../helper.js";
import { PacmanCharacter } from "./character.js";
import { PacmanConstants } from "../constants.js";
import { PacmanMapNode } from "../map-node.js";
import { PacmanPlayer } from "./player.js";
import { PacmanState } from "../state.js";

interface PacmanGhostCreationData {
  name: PacmanEntityEnum;
  x: number;
  y: number;
  colour: string;
  startNodeID: string;
  unfreezeAtStart?: boolean;
  startDelay?: number;
  initialDirection: PacmanDirectionEnum;
}

export class PacmanGhost extends PacmanCharacter {
  deadAndFleeingToBase: boolean = false;

  constructor(data: PacmanGhostCreationData) {
    super(data);
  }

  /**
   * Sets the character's new destination node
   */
  direct(this: PacmanGhost): void {
    const currentNode: PacmanMapNode = PacmanMapNode.getNodeByID(this.currentNodeID);

    // re-aim ghosts
    let ghostTargetAngle = -1;
    if (this.currentNodeID != "bm" && this.currentNodeID != "bl") {
      ghostTargetAngle = this.reAimGhost();
    }

    // start box navigation
    if (cws.anyEqual([this.currentNodeID], ["bt", "bo", "bu"])) {
      if (this.isDead) {
        if (((this.currentNodeID == "bt" && this.direction != PacmanDirectionEnum.RIGHT)
          || (this.currentNodeID == "bo" && (cws.anyEqual([this.aimDirection], [PacmanDirectionEnum.DOWN, PacmanDirectionEnum.UP])))
          || (this.currentNodeID == "bu" && this.direction != PacmanDirectionEnum.LEFT))) {
          this.reviveGhost(false);
          this.direction = PacmanDirectionEnum.STILL;
          return;
        }
      } else if (!this.isDead) {
        switch (this.currentNodeID) {
          case "bt":
            this.aimDirection = PacmanDirectionEnum.RIGHT;
            break;
          case "bo":
            this.aimDirection = PacmanDirectionEnum.UP;
            break;
          case "bu":
            this.aimDirection = PacmanDirectionEnum.LEFT;
            break;
        }
      }
    }

    // determine exit

    let exitID = currentNode.exitAt(this.aimDirection);
    let exitValid = true;

    if (this.currentNodeID == "bp" && exitID == "bo" && !this.isDead) {
      exitValid = false;
    }

    if (exitValid
      && exitID != null
      && !PacmanHelper.areOppositeDirection(this.direction, this.aimDirection)
      && (Math.random() <= (1 - this.stupidifier) || cws.anyEqual([this.currentNodeID], ["bt", "bo", "bu"]) || this.isDead)) {
      this.destinationNodeID = exitID;
      this.direction = this.aimDirection;

      this.distanceToDest = currentNode.distanceToNode(exitID);
    } else {
      // handle tunnels
      if (this.currentNodeID == "bl") {
        if (this.direction == PacmanDirectionEnum.LEFT) {
          this.currentNodeID = "bm";
          this.direct();
          return;
        }
      } else if (this.currentNodeID == "bm") {
        if (this.direction == PacmanDirectionEnum.RIGHT) {
          this.currentNodeID = "bl";
          this.direct();
          return;
        }
      }

      // if not in tunnel, try the next best route
      let nextBestDir: PacmanDirectionEnum = PacmanDirectionEnum.STILL;
      switch (this.aimDirection) {
        case PacmanDirectionEnum.UP:
          if (ghostTargetAngle < 0) {
            nextBestDir = PacmanDirectionEnum.LEFT;
          } else {
            nextBestDir = PacmanDirectionEnum.RIGHT;
          }
          break;
        case PacmanDirectionEnum.RIGHT:
          if (ghostTargetAngle < Math.PI / 2) {
            nextBestDir = PacmanDirectionEnum.UP;
          } else {
            nextBestDir = PacmanDirectionEnum.DOWN;
          }
          break;
        case PacmanDirectionEnum.DOWN:
          if (ghostTargetAngle < Math.PI) {
            nextBestDir = PacmanDirectionEnum.RIGHT;
          } else {
            nextBestDir = PacmanDirectionEnum.LEFT;
          }
          break;
        case PacmanDirectionEnum.LEFT:
          if (ghostTargetAngle < (3 * Math.PI) / 2) {
            nextBestDir = PacmanDirectionEnum.DOWN;
          } else {
            nextBestDir = PacmanDirectionEnum.UP;
          }
          break;
        default:
          nextBestDir = PacmanDirectionEnum.UP;
      }

      let nextBestExitID = currentNode.exitAt(nextBestDir);
      if (nextBestExitID != null && !(nextBestExitID == "bo" && currentNode.ID == "bp" && !this.isDead) && !PacmanHelper.areOppositeDirection(this.direction, nextBestDir)) {
        this.destinationNodeID = nextBestExitID;
        this.direction = nextBestDir;

        this.distanceToDest = currentNode.distanceToNode(nextBestExitID);
      } else {// difficult to find a good path, just find a feasible one
        let randomFactor = Math.floor(Math.random() * currentNode.exits.length);
        for (let i = 0; i < currentNode.exits.length; i++) {
          let index = (i + randomFactor) % currentNode.exits.length;
          let exitDir = currentNode.directionTo(currentNode.exits[index]);
          if (PacmanHelper.areOppositeDirection(this.direction, exitDir) || (currentNode.exits[index] == "bo" && currentNode.ID == "bp" && !this.isDead)) {
            if (i == currentNode.exits.length - 1) {
              console.error("problem with Character.direct()");
              break;
            } else {
              continue;
            }
          } else {
            this.destinationNodeID = currentNode.exits[index];

            this.distanceToDest = currentNode.distanceToNode(currentNode.exits[index]);
            this.direction = exitDir;
            break;
          }
        }
      }
    }

    this.distanceTravelledToDest = 0;
  }

  /**
   * Draws a ghost
   */
  drawGhost(this: PacmanGhost, canvas: Canvas) {
    if (PacmanState.gameState === PacmanStateEnum.GHOST_DEATH_PAUSE && this.isDead && !this.deadAndFleeingToBase) {
      canvas.drawText(`${PacmanGhost.getNextDeathScore()}`,
        this.x + this.width / 2,
        this.y + this.width / 2,
        PacmanConstants.CYAN_TEXT_COLOR,
        true,
        16)
      return;
    } else if (cws.orEquals(PacmanState.gameState, [PacmanStateEnum.PLAYER_DEATH_ANIMATING, PacmanStateEnum.PLAYER_DEATH_END]) || PacmanState.isLevelEndFlashing()) {
      return;
    }

    this.draw(canvas);
  }

  kill(this: PacmanGhost) {
    const me = this,
      oldState = PacmanState.gameState;

    this.isDead = true;
    PacmanState.gameState = PacmanStateEnum.GHOST_DEATH_PAUSE;
    PacmanState.score += PacmanGhost.getNextDeathScore();
    PacmanState.freezeAnimation();

    setTimeout(() => {
      me.deadAndFleeingToBase = true;
      PacmanState.gameState = oldState;
      PacmanState.chaseStartTime += PacmanConstants.GHOST_DEATH_PAUSE_TIME;
      PacmanState.ghostsKilledInChase++;
      PacmanState.unfreezeAnimation();
    }, PacmanConstants.GHOST_DEATH_PAUSE_TIME);
  }

  /**
   * Reaims this ghost character to its target
   * 
   * @returns the precise angle to the target
   */
  reAimGhost(this: PacmanCharacter): number {
    const player = PacmanPlayer.player;

    const target = {
      x: player.x,
      y: player.y
    }

    // determine ghost AI

    let tryCutoff = false;

    switch (this.name) {
      case PacmanEntityEnum.RED:
        break;
      case PacmanEntityEnum.PINK:
        tryCutoff = true;
        break;
      case PacmanEntityEnum.CYAN:
      case PacmanEntityEnum.ORANGE:
        tryCutoff = (Math.random() < 0.5);
        break;
    }

    // adjust target based on ghost AI

    if (tryCutoff) {
      switch (player.direction) {
        case PacmanDirectionEnum.UP:
          target.y -= PacmanConstants.GHOST_CUTOFF_DISTANCE;
          break;
        case PacmanDirectionEnum.RIGHT:
          target.x += PacmanConstants.GHOST_CUTOFF_DISTANCE;
          break;
        case PacmanDirectionEnum.DOWN:
          target.y += PacmanConstants.GHOST_CUTOFF_DISTANCE;
          break;
        case PacmanDirectionEnum.LEFT:
          target.x -= PacmanConstants.GHOST_CUTOFF_DISTANCE;
          break;
        default:
          target.x += PacmanConstants.GHOST_CUTOFF_DISTANCE;
      }
    }

    // override to return home when dead

    if (this.isDead) {
      if (cws.anyEqual([this.currentNodeID], ["bp", "bo", "bt", "bu"])) {
        target.x = this.home.x;
        target.y = this.home.y;
      } else {
        target.x = PacmanMapNode.getNodeByID("bp").x;
        target.y = PacmanMapNode.getNodeByID("bp").y;
      }
    }

    // get angle

    let angleToTarget = new MathVector(target.x - this.x, -(target.y - this.y)).direction;

    if ((this.name == PacmanEntityEnum.ORANGE && !this.isDead && this.distanceTo(player) <= PacmanConstants.ORANGE_COWER_DISTANCE) || (this.isFleeing && !this.isDead)) {
      angleToTarget = MathVector.mod2PI(angleToTarget + Math.PI);
    }

    // special cases: entry into maze
    if (!this.isDead) {
      switch (this.currentNodeID) {
        case "bt":
          this.aimDirection = PacmanDirectionEnum.RIGHT;
          break;
        case "bu":
          this.aimDirection = PacmanDirectionEnum.LEFT;
          break;
        case "bo":
          this.aimDirection = PacmanDirectionEnum.UP;
          break;
        default:
          this.aimDirection = PacmanHelper.angleToCompassDirection(angleToTarget);
      }
    } else {
      this.aimDirection = PacmanHelper.angleToCompassDirection(angleToTarget);
    }

    return angleToTarget;
  }

  reviveGhost(this: PacmanGhost, moveHome: boolean): void {
    this.deadAndFleeingToBase = false;
    this.isFrozen = this.initialFrozen;
    this.revive(moveHome);
  }

  static list = {
    red: new PacmanGhost({
      name: PacmanEntityEnum.RED,
      x: PacmanConstants.NODE_COLS[5],
      y: PacmanConstants.NODE_ROWS[3],
      colour: "red",
      startNodeID: "bp",
      initialDirection: PacmanDirectionEnum.LEFT,
    }),
    pink: new PacmanGhost({
      name: PacmanEntityEnum.PINK,
      x: PacmanConstants.NODE_COLS[5],
      y: PacmanConstants.NODE_ROWS[4],
      colour: "pink",
      startNodeID: "bo",
      startDelay: 1 * 1000,
      initialDirection: PacmanDirectionEnum.UP,
    }),
    cyan: new PacmanGhost({
      name: PacmanEntityEnum.CYAN,
      x: PacmanConstants.NODE_COLS[4],
      y: PacmanConstants.NODE_ROWS[4],
      colour: "#00ffff",
      startNodeID: "bt",
      startDelay: 3 * 1000,
      initialDirection: PacmanDirectionEnum.UP,
    }),
    orange: new PacmanGhost({
      name: PacmanEntityEnum.ORANGE,
      x: PacmanConstants.NODE_COLS[6],
      y: PacmanConstants.NODE_ROWS[4],
      colour: "orange", startNodeID: "bu",
      startDelay: 5 * 1000,
      initialDirection: PacmanDirectionEnum.UP,
    }),
  }

  static array = [
    PacmanGhost.list.red,
    PacmanGhost.list.pink,
    PacmanGhost.list.cyan,
    PacmanGhost.list.orange];

  static forEach(fn: (ghost: PacmanGhost) => void) {
    PacmanGhost.array.forEach((ghost) => {
      fn(ghost);
    });
  }

  static getNextDeathScore(): number {
    return PacmanConstants.GHOST_DEATH_SCORE * Math.pow(2, PacmanState.ghostsKilledInChase);
  }
}