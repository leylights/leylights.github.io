import { Canvas } from "../../components/canvas.component";
import { MathVector } from "../../tools/math/vector";

const NODE_ATTRACTIVE_DIVISOR = 4;
const NODE_REPULSIVE_FORCE = 800;

const NODE_COLOURS = [
  "aqua",
  "aquamarine",
  "blue",
  "blueviolet",
  "brown",
  "chartreuse",
  "green",
  "chocolate",
  "coral",
  "cornflowerblue",
  "crimson",
  "cyan",
  "darkblue",
  "deepskyblue",
  "deeppink",
  "fuchsia",
  "gold",
  "greenyellow",
  "indianred",
  "indigo",
  "lawngreen",
  "lime",
  "magenta",
  "maroon",
  "mediumblue",
  "mediumspringgreen",
  "navy",
  "olive",
  "orange",
  "orangered",
  "purple",
  "saddlebrown",
  "seagreen",
  "springgreen",
  "yellow",
];

export class NodesNode {
  x: number = 0;
  y: number = 0;
  radius: number = 20;
  colour: string;

  appliedForces: MathVector[] = [];
  boundNodes: NodesNode[] = [];

  isBeingEdited: boolean = false;

  constructor(x?: number, y?: number, colour?: string) {
    if (x) {
      this.x = x;
    }
    if (y) {
      this.y = y;
    }
    this.colour = colour ? colour : NodesNode.getColour();
  }

  addBondTo(node: NodesNode) {
    this.boundNodes.push(node);
  }

  draw(
    canvas: Canvas,
    canvasDimensions: { width: number; height: number },
    mousePosition: { x: number; y: number }
  ) {
    const x = this.x + canvasDimensions.width / 2;
    const y = this.y + canvasDimensions.height / 2;

    if (this.isMouseHovering(mousePosition)) {
      canvas.usePointerCursorThisFrame();
    }

    if (this.isMouseHovering(mousePosition) || this.isBeingEdited) {
      canvas.fillCircle(x, y, this.radius + 3, "#888", true);
    }

    canvas.fillCircle(x, y, this.radius, this.colour, true);
  }

  drawVector(vector: MathVector, canvas: Canvas, colour: string) {
    const multiplier = 15;
    canvas.drawLine(
      canvas.width / 2 + this.x,
      canvas.height / 2 + this.y,
      canvas.width / 2 + this.x + vector.x * multiplier,
      canvas.height / 2 + this.y + vector.y * multiplier,
      colour,
      1
    );
  }

  drawVectorToNode(node: NodesNode, canvas: Canvas) {
    canvas.drawLine(
      canvas.width / 2 + this.x,
      canvas.height / 2 + this.y,
      canvas.width / 2 + node.x,
      canvas.height / 2 + node.y,
      '#888',
      2
    );
  }

  getAttractiveVectorTo(node: NodesNode): MathVector {
    // = force / (dx^2) * (dx/|dx|) = force / (dx|dx|)
    const dx = node.x == this.x ? Math.random() * 10 : node.x - this.x;
    const dy = node.y == this.y ? Math.random() * 10 : node.y - this.y;

    const direction = new MathVector(dx, dy).setMagnitude(2);

    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    const magnitude = distance / NODE_ATTRACTIVE_DIVISOR;

    direction.setMagnitude(magnitude);

    return direction;
  }

  getRepulsiveVectorTo(node: NodesNode): MathVector {
    // = force / (dx^2) * (dx/|dx|) = force / (dx|dx|)
    const dx = node.x == this.x ? Math.random() * 10 : node.x - this.x;
    const dy = node.y == this.y ? Math.random() * 10 : node.y - this.y;

    const direction = new MathVector(dx, dy).setMagnitude(2).scalarMultiply(-1);

    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    const magnitude = NODE_REPULSIVE_FORCE / distance;

    direction.setMagnitude(magnitude);

    return direction;
  }

  isMouseHovering(mousePosition: { x: number; y: number }): boolean {
    const dx = mousePosition.x - this.x;
    const dy = mousePosition.y - this.y;
    return Math.sqrt(dx ** 2 + dy ** 2) < this.radius;
  }

  static getColour(): string {
    return NODE_COLOURS[Math.floor(NODE_COLOURS.length * Math.random())];
  }
}
