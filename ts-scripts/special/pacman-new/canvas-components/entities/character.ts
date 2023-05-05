import { Molasses } from "../../../../molasses";
import { Canvas } from "../../../../components/canvas.component";
import { PacmanEntityEnum, PacmanDirectionEnum, PacmanStateEnum } from "../../helper";
import { PacmanConstants } from "../constants";
import { PacmanEntity } from "./entity";
import { PacmanMapNode } from "../map-node";
import { PacmanSprites } from "../sprites";
import { PacmanState } from "../state";

interface PacmanCharacterCreationData {
  name: PacmanEntityEnum;
  x: number;
  y: number;
  colour: string;
  startNodeID: string;
  unfreezeAtStart?: boolean;
  startDelay?: number;
  initialDirection: PacmanDirectionEnum;
}

export class PacmanCharacter extends PacmanEntity {
  home: {
    x: number,
    y: number,
  };
  homeNodeID: string;
  initialDirection: PacmanDirectionEnum;
  currentNodeID: string;
  destinationNodeID: string;

  distanceTravelledToDest: number = 0;
  distanceToDest: number = 0;

  aimDirection: PacmanDirectionEnum = null;
  direction: PacmanDirectionEnum = PacmanDirectionEnum.STILL;
  stupidifier: number = 0;

  isFrozen: boolean;
  initialFrozen: boolean;

  isDead: boolean = false;
  startDelay: number = 0;
  respawnTime: number = -1;

  constructor(data: PacmanCharacterCreationData) {
    super(data.x, data.y, PacmanCharacter.WIDTH, PacmanCharacter.WIDTH, data.colour, data.name);
    this.home = { x: data.x, y: data.y };

    this.currentNodeID = data.startNodeID;
    this.destinationNodeID = this.currentNodeID;
    this.startDelay = data.startDelay || 0;

    this.homeNodeID = data.startNodeID;
    this.initialDirection = data.initialDirection;

    this.isFrozen = !data.unfreezeAtStart;
    this.initialFrozen = !data.unfreezeAtStart;

    this.revive(false);
  }

  get displayPos() {
    let centerer = (PacmanConstants.HALL_WIDTH - this.width) / 2;
    return { x: this.x + centerer, y: this.y + centerer }
  }

  get homeNode(): PacmanMapNode {
    return PacmanMapNode.getNodeByID(this.homeNodeID);
  }

  get isFleeing(): boolean {
    return (
      this.name != PacmanEntityEnum.PLAYER
      && Molasses.orEquals(PacmanState.gameState, [PacmanStateEnum.CHASE, PacmanStateEnum.GHOST_DEATH_PAUSE])
      && (this.respawnTime < PacmanState.chaseStartTime
        || PacmanState.lifeStartTime + this.startDelay > PacmanState.chaseStartTime)
      && !this.isDead)
  }


  get isPlayer(): boolean {
    return this.name === PacmanEntityEnum.PLAYER;
  }

  get speed(): number {
    if (this.isDead)
      return PacmanCharacter.BASE_RETURN_SPEED;
    if (this.isFleeing)
      return PacmanCharacter.CHASE_SPEED;
    else
      return PacmanCharacter.BASE_SPEED;
  }

  getImage() {
    return PacmanSprites.spritesTree.getValue(this.getImageSource());
  }

  getImageSource(): string {
    let src = "";

    // folder
    if (this.isFleeing) {
      src = "chase";
    } else if (this.isDead) {
      if (this.name === PacmanEntityEnum.PLAYER) {
        src = "pacd";
      } else {
        src = "death";
      }
    } else {
      switch (this.name) {
        case PacmanEntityEnum.PLAYER:
          src = "pacman";
          break;
        case PacmanEntityEnum.RED:
          src = "red";
          break;
        case PacmanEntityEnum.PINK:
          src = "pink";
          break;
        case PacmanEntityEnum.CYAN:
          src = "cyan";
          break;
        case PacmanEntityEnum.ORANGE:
          src = "orange";
          break;
      }
    }

    src += "/"

    // state (normally direction)
    if (this.isFleeing) {
      if ((PacmanState.chaseStartTime + PacmanConstants.CHASE_LEN * 0.75) < PacmanState.animationNow) {
        if ((PacmanState.animationNow - PacmanState.chaseStartTime) % (4 * PacmanConstants.CHARACTER_ANIMATION_UPDATE_INTERVAL) < 2 * PacmanConstants.CHARACTER_ANIMATION_UPDATE_INTERVAL) {
          src += "b";
        } else {
          src += "w";
        }
      } else {
        src += "b";
      }
    } else {
      switch (this.direction) {
        case PacmanDirectionEnum.UP:
          src += "u";
          break;
        case PacmanDirectionEnum.LEFT:
          src += "l";
          break;
        case PacmanDirectionEnum.DOWN:
          src += "d";
          break;
        case PacmanDirectionEnum.RIGHT:
          src += "r";
          break;
        default:
          if (this.isPlayer) {
            src = "pacman/default.png";
            return src;
          } else {
            src += "u";
          }
      }
    }


    // animation
    if (!this.isDead) {
      if (this.isPlayer) {
        const interval = PacmanConstants.CHARACTER_ANIMATION_UPDATE_INTERVAL / 2,
          frame = PacmanState.animationNow % (4 * interval);

        if (frame < interval) {
          src += "1";
        } else if (frame < 2 * interval) {
          src += "2";
        } else if (frame < 3 * interval) {
          src += "1";
        } else {
          src = "pacman/default.png";
          return src;
        }
      } else {
        if (PacmanState.animationNow % (2 * PacmanConstants.CHARACTER_ANIMATION_UPDATE_INTERVAL) < PacmanConstants.CHARACTER_ANIMATION_UPDATE_INTERVAL) {
          src += "1";
        } else {
          src += "2";
        }
      }
    }

    src += ".png";

    return src;
  }

  draw(this: PacmanCharacter, canvas: Canvas) {
    this._drawNormal(canvas, this.getImage());
  }

  protected _drawNormal(this: PacmanCharacter, canvas: Canvas, image: HTMLImageElement) {
    let pos = this.displayPos;
    canvas.drawImage(image, pos.x, pos.y, null, null);
  }

  equals(this: PacmanCharacter, character: PacmanCharacter) {
    return this.EntityID === character.EntityID;
  }

  /**
   * Moves this character by its speed
   */
  move(this: PacmanCharacter, directFn: () => void): void {
    if (!this.isFrozen && (Molasses.Array.contains([PacmanStateEnum.NORMAL, PacmanStateEnum.CHASE], PacmanState.gameState))) {
      switch (this.direction) {
        case PacmanDirectionEnum.UP:
          this.y -= this.speed;
          break;
        case PacmanDirectionEnum.DOWN:
          this.y += this.speed;
          break;
        case PacmanDirectionEnum.LEFT:
          this.x -= this.speed;
          break;
        case PacmanDirectionEnum.RIGHT:
          this.x += this.speed;
          break;
      }

      this.distanceTravelledToDest += this.speed;
    }

    // if character has reached the destination
    if (this.distanceTravelledToDest >= this.distanceToDest) {
      this.currentNodeID = this.destinationNodeID;
      if (!this.isFrozen) {
        directFn();
        // (this as PacmanGhost & PacmanCharacter).direct();
      };
      this.moveToNode(this.currentNodeID);
    }
  }

  /**
   * Moves this character back to its home
   */
  moveToHome(this: PacmanCharacter) {
    this.moveToNode(this.homeNodeID);

    this.currentNodeID = this.homeNodeID;
    this.destinationNodeID = this.homeNodeID;
    this.distanceTravelledToDest = 0;
    this.distanceToDest = 0;
  }

  /**
   * Moves this character to the indicated node
   */
  moveToNode(this: PacmanCharacter, nodeID: string): void {
    const node = PacmanMapNode.getNodeByID(nodeID);

    this.x = node.x;
    this.y = node.y;
  }

  /**
   * Resets this Character's home to its current position
   */
  resetHome = function (): void {
    this.home.x = this.x;
    this.home.y = this.y;
  }

  /**
   * Revives this Character
   */
  protected revive(this: PacmanCharacter, moveHome: boolean): void {
    this.respawnTime = PacmanState.now;
    this.isDead = false;
    this.direction = this.initialDirection;
    this.aimDirection = null;
    if (moveHome)
      this.moveToHome();
  }

  get currentNode(): PacmanMapNode {
    return PacmanMapNode.getNodeByID(this.currentNodeID);
  }

  get destinationNode(): PacmanMapNode {
    return PacmanMapNode.getNodeByID(this.destinationNodeID);
  }

  get hasDestination(): Boolean {
    return (this.destinationNodeID != null && this.destinationNodeID != undefined);
  }

  static WIDTH: number = PacmanConstants.CHARACTER_DIAMETER;
  static BASE_SPEED: number = PacmanConstants.CHARACTER_SPEED;
  static BASE_RETURN_SPEED: number = PacmanConstants.RETURN_SPEED;
  static CHASE_SPEED: number = PacmanConstants.CHASE_SPEED;
}
