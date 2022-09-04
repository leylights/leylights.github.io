import { Leylights } from "../../../../leylights.js";
import { Canvas } from "../../../../components/canvas.component.js";
import { PacmanEntityEnum } from "../../helper.js";
import { PacmanConstants } from "../constants.js";
import { PacmanMapNode } from "../map-node.js";
import { PacmanSprites } from "../sprites.js";
import { PacmanState } from "../state.js";
import { PacmanPickup } from "./pickup.js";

export class PacmanFruit extends PacmanPickup {
  fruitId: number;

  constructor() {
    const node = PacmanFruit.getRandomFruitSpawnNode();

    super(node.x, node.y, PacmanConstants.FRUIT_RADIUS, 'red', PacmanEntityEnum.FRUIT);

    this.fruitId = Math.min(PacmanState.collectedFruitCount + 1, 8);
  }

  draw(this: PacmanFruit, canvas: Canvas): void {
    canvas.drawImage(PacmanSprites.spritesTree.getValue(`fruits/${this.fruitId}.png`), this.x, this.y);
  }

  eat(this: PacmanFruit): void {
    PacmanState.score += PacmanConstants.FRUIT_POINTS[this.fruitId - 1];
    PacmanState.collectedFruitCount++;
  }

  private static getRandomFruitSpawnNode(): PacmanMapNode {
    return Leylights.Array.get.randomElement(PacmanMapNode.map.filter((node: PacmanMapNode) => {
      return node.canSpawnFruit;
    }));
  }
}
