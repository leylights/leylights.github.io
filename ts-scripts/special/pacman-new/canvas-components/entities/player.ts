import { Canvas } from "../../../components/canvas.component.js";
import { PacmanEntityEnum, PacmanDirectionEnum, PacmanStateEnum } from "../../helper.js";
import { PacmanCharacter } from "./character.js";
import { PacmanConstants } from "../constants.js";
import { PacmanMapNode } from "../map-node.js";
import { PacmanSprites } from "../sprites.js";
import { PacmanState } from "../state.js";
import { PacmanRestartTypesEnum } from "../../pacman.page.js";

export class PacmanPlayer extends PacmanCharacter {
  deathTime: number = null;
  remainingRevives: number = 2;

  constructor() {
    super({
      name: PacmanEntityEnum.PLAYER,
      x: PacmanConstants.NODE_COLS[5],
      y: PacmanConstants.NODE_ROWS[7],
      colour: "yellow",
      startNodeID: "bn",
      unfreezeAtStart: true,
      initialDirection: PacmanDirectionEnum.STILL,
    });
  }

  /**
   * Sets the character's new destination node
   */
  direct(this: PacmanPlayer): void {
    const currentNode: PacmanMapNode = PacmanMapNode.getNodeByID(this.currentNodeID);

    // determine exit
    const exitID = currentNode.exitAt(this.aimDirection);
    const exitValid = !(this.currentNodeID == "bp" && exitID == "bo" && !this.isDead);

    if (exitValid
      && exitID != null) {
      this.destinationNodeID = exitID;
      this.direction = this.aimDirection;

      this.distanceToDest = currentNode.distanceToNode(exitID);
    } else { // player defaults to going through
      const throughID = currentNode.exitAt(this.direction);
      if (throughID != null) {
        this.destinationNodeID = throughID;

        this.distanceToDest = currentNode.distanceToNode(throughID);
      } else {
        // side passages: go through
        if (this.currentNodeID == "bl") {
          this.currentNodeID = "bm";
          this.direct();
          return;
        } else if (this.currentNodeID == "bm") {
          this.currentNodeID = "bl";
          this.direct();
          return;
        } else { // no passage in through direction or aimed direction: go motionless
          this.destinationNodeID = this.currentNodeID;
          this.direction = PacmanDirectionEnum.STILL;

          this.distanceToDest = 0;
        }
      }
    }

    this.distanceTravelledToDest = 0;
  }

  drawPlayer(this: PacmanPlayer, canvas: Canvas): void {
    if (PacmanState.gameState === PacmanStateEnum.GHOST_DEATH_PAUSE)
      return;

    this.isDead ? this.drawDeathImage(canvas) : this.draw(canvas);
  }

  drawDeathImage(this: PacmanPlayer, canvas: Canvas): void {
    const elapsedTimeSinceDeath = PacmanState.now - this.deathTime;

    if (elapsedTimeSinceDeath <= 500) {
      this._drawNormal(canvas, PacmanSprites.spritesTree.getValue('pacman/default.png'));
      return;
    } else {
      const deathImageIndex = Math.ceil((elapsedTimeSinceDeath - 500) / 100);

      if (deathImageIndex <= 10) {
        this._drawNormal(canvas, PacmanSprites.spritesTree.getValue(`pacd/${deathImageIndex}.png`));
        PacmanState.gameState = PacmanStateEnum.PLAYER_DEATH_ANIMATING;
      } else if (deathImageIndex > 15) {
        PacmanState.gameState = PacmanStateEnum.PLAYER_DEATH_END;
      }


      return;
    }
  }

  kill(this: PacmanPlayer): void {
    this.isDead = true;
    this.deathTime = PacmanState.now;
  }

  revivePlayer(this: PacmanPlayer, restartType: PacmanRestartTypesEnum): void {
    this.revive(true);
    this.deathTime = null;

    if (restartType === PacmanRestartTypesEnum.FULL)
      this.remainingRevives = PacmanConstants.BASE_REVIVES;
    else if (restartType === PacmanRestartTypesEnum.PLAYER_DEATH)
      this.remainingRevives--;
  }

  static player = new PacmanPlayer();
}