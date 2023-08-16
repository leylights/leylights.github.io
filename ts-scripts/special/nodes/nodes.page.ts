/**
 * Nodes
 *
 * @author River Stanley
 *
 * Start Date: August 15th, 2023
 * End Date: April 27th, 2021
 */

import { Canvas } from "../../components/canvas.component";
import { NodesNode } from "./node";

class NodesPage {
  static mousePos: { x: number; y: number } = { x: 0, y: 0 };

  static canvas: Canvas = new Canvas({
    parentElement: document.getElementById("canvasContainer"),
    clearColour: "black",
  });

  static nodes = [
    new NodesNode(0, 0, "orange"),
    new NodesNode(Math.random() * 100, -Math.random() * 100, "cyan"),
    new NodesNode(-Math.random() * 300, -Math.random() * 100, "green"),
    new NodesNode(-Math.random() * 200, -Math.random() * 100, "pink"),
  ];

  static init() {
    this.canvas.clearColour = "white";
    this.canvas.start(() => {
      this.mainLoop();
    });
    this.canvas.addEventListener("mousemove", (e) => {
      this.mousePos.x = e.x - this.canvas.width / 2;
      this.mousePos.y = e.y - this.canvas.height / 2 - this.canvas.element.getBoundingClientRect().top;
    });
  }

  static mainLoop() {
    this.redraw();
    this.updateNodes();
  }

  static redraw() {
    this.canvas.clear();

    const { width, height } = this.canvas;

    for (const node of this.nodes) {
      node.redraw(this.canvas, { width, height });
    }
  }

  static updateNodes() {
    // get node relative forces on each other
    this.nodes.forEach((node, index) => {
      for (let i = index + 1; i < this.nodes.length; i++) {
        const relativeVector = node.getRepulsiveVectorTo(this.nodes[i]);
        node.appliedForces.push(relativeVector);
        this.nodes[i].appliedForces.push(
          relativeVector.clone().scalarMultiply(-1)
        );
      }
    });

    // apply forces and reset them
    const originNode = new NodesNode(0, 0);
    const mouseNode = new NodesNode(this.mousePos.x, this.mousePos.y, "blue");

    this.nodes.forEach((node) => {
      const vectorSum = node.getAttractiveVectorTo(originNode);
      node.drawVector(vectorSum, this.canvas, "blue");

      const mouseRepellant = node.getRepulsiveVectorTo(mouseNode).scalarMultiply(1.5);
      vectorSum.add(mouseRepellant);
      node.drawVector(mouseRepellant, this.canvas, "red");

      for (const vector of node.appliedForces) {
        node.drawVector(vector, this.canvas, "red");
        vectorSum.add(vector);
      }

      node.x += vectorSum.x;
      node.y += vectorSum.y;

      node.drawVector(vectorSum, this.canvas, "black");

      node.appliedForces = [];
    });
  }
}

NodesPage.init();
