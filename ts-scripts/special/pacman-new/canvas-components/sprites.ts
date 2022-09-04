import { Leylights } from "../../../leylights.js";
import { BST } from "../../../tools/bst.js";

const PRIMARY_CONTAINER: HTMLElement = document.getElementById('sprites-container');

export class PacmanSprites extends BST<HTMLImageElement> {
  spritesContainer: HTMLElement;

  constructor(spritesContainer: HTMLElement) {
    super();

    this.spritesContainer = spritesContainer;

    // Pac-man
    this.addSprite("pacman/default.png");
    this.addSprite("pacman/s1.png");

    this.getSpriteSuite("pacman");

    for (let i = 1; i <= 10; i++) {
      this.addSprite("pacd/" + i + ".png");
    }

    for (let i = 0; i <= 2; i++) {
      this.addSprite("pacman/large" + i + ".png");
    }

    this.getSpriteSuite("red");
    this.getSpriteSuite("cyan");
    this.getSpriteSuite("pink");
    this.getSpriteSuite("orange");

    this.addSprite("chase/b1.png");
    this.addSprite("chase/b2.png");
    this.addSprite("chase/w1.png");
    this.addSprite("chase/w2.png");

    this.addSprite("death/u.png");
    this.addSprite("death/r.png");
    this.addSprite("death/l.png");
    this.addSprite("death/d.png");

    this.addSprite("murderpellet.png");
    this.addSprite("transparent.png");

    for (let i = 1; i <= 8; i++) {
      this.addSprite("fruits/" + i + ".png");
    }

    this.addSprite("map.png");
    this.addSprite("ready.png");
    this.addSprite("precise_map.png");
    this.addSprite("precise_map_flash.png")
  }

  /**
   * Appends a new image element to the page of the given image in /siteimages/pac, and adds it to the tree
   * @param {string} name 
   */

  private addSprite(name: string): void {
    const location: string = Leylights.getRelativeUrlPath('siteimages/pac') + "/" + name,
      sprite: HTMLImageElement = Leylights.createElement({
        type: 'img',
        classList: 'sprite',
        id: location,
        otherNodes: [{ type: 'src', value: location }]
      })

    this.spritesContainer.appendChild(sprite);

    this.add(name, sprite)
  }

  /**
   * Adds the many directions of a given sprite (e.g. u1, u2, l1...)
   */
  private getSpriteSuite(src: string): void {
    this.addSprite(src + "/u1.png");
    this.addSprite(src + "/u2.png");
    this.addSprite(src + "/l1.png");
    this.addSprite(src + "/l2.png");
    this.addSprite(src + "/r1.png");
    this.addSprite(src + "/r2.png");
    this.addSprite(src + "/d1.png");
    this.addSprite(src + "/d2.png");
  }

  static spritesTree = new PacmanSprites(PRIMARY_CONTAINER);
}
