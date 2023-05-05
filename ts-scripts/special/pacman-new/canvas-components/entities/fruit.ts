import { Molasses } from "../../../../molasses";
import { Canvas } from "../../../../components/canvas.component";
import { PacmanEntityEnum } from "../../helper";
import { PacmanConstants } from "../constants";
import { PacmanMapNode } from "../map-node";
import { PacmanSprites } from "../sprites";
import { PacmanState } from "../state";
import { PacmanPickup } from "./pickup";

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
    return Molasses.Array.get.randomElement(PacmanMapNode.map.filter((node: PacmanMapNode) => {
      return node.canSpawnFruit;
    }));
  }
}
