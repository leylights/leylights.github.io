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

const SHOW_INTERNALS: boolean = false;

class NodesPage {
  static mousePos: { x: number; y: number } = { x: 0, y: 0 };

  static canvas: Canvas = new Canvas({
    parentElement: document.getElementById("canvasContainer"),
  });

  static nodes: NodesNode[] = [
    new NodesNode(0, 0, "orange"),
    new NodesNode(Math.random() * 100, -Math.random() * 100, "cyan"),
    new NodesNode(-Math.random() * 300, -Math.random() * 100, "green"),
    new NodesNode(-Math.random() * 200, -Math.random() * 100, "pink"),
    new NodesNode(-Math.random() * 200, -Math.random() * 100, "yellow"),
    new NodesNode(-Math.random() * 200, -Math.random() * 100, "aqua"),
    new NodesNode(Math.random() * 100, -Math.random() * 100, "cyan"),
    new NodesNode(-Math.random() * 300, -Math.random() * 100, "green"),
    new NodesNode(-Math.random() * 200, -Math.random() * 100, "pink"),
    new NodesNode(-Math.random() * 200, -Math.random() * 100, "yellow"),
    new NodesNode(-Math.random() * 200, -Math.random() * 100, "aqua"),
  ];

  static assistantNodes: NodesNode[] = [
    new NodesNode(0, 0, "DarkCyan"),
    new NodesNode(0, 0, "FireBrick"),
  ];

  static init() {
    this.canvas.clearColour = null;
    this.canvas.start(() => {
      this.mainLoop();
    });
    this.canvas.addEventListener("mousemove", (e) => {
      this.mousePos.x = e.x - this.canvas.width / 2;
      this.mousePos.y =
        e.y -
        this.canvas.height / 2 -
        this.canvas.element.getBoundingClientRect().top;
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

  static getMotionNode1() {
    const period = 7000;
    const halfWidth = this.canvas.width / 2;
    const halfHeight = this.canvas.height / 2;
    const now = Date.now();
    return new NodesNode(
      halfWidth * Math.sin((Math.PI * now) / period),
      halfHeight * Math.cos((Math.PI * (now - period)) / period),
      "blue"
    );
  }

  static getMotionNode2() {
    const period = 10000;
    const widthBound = this.canvas.width * 0.4;
    const heightBound = this.canvas.height * 0.4;
    const now = Date.now();
    return new NodesNode(
      widthBound * Math.cos((Math.PI * (now - period)) / period),
      heightBound * Math.sin((Math.PI * now) / period),
      "blue"
    );
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
    const motionNode1 = this.getMotionNode1();
    const motionNode2 = this.getMotionNode2();

    if (SHOW_INTERNALS) {
      motionNode1.redraw(this.canvas, this.canvas);
      motionNode2.redraw(this.canvas, this.canvas);
    }

    this.nodes.forEach((node) => {
      const vectorSum = node.getAttractiveVectorTo(originNode);
      if (SHOW_INTERNALS) node.drawVector(vectorSum, this.canvas, "blue");

      const mouseRepellant = node
        .getRepulsiveVectorTo(mouseNode)
        .scalarMultiply(1.5);
      vectorSum.add(mouseRepellant);

      if (SHOW_INTERNALS) node.drawVector(mouseRepellant, this.canvas, "red");

      const motionRepellant1 = node.getRepulsiveVectorTo(motionNode1);
      vectorSum.add(motionRepellant1);

      const motionRepellant2 = node.getRepulsiveVectorTo(motionNode2);
      vectorSum.add(motionRepellant2);

      for (const vector of node.appliedForces) {
        if (SHOW_INTERNALS) node.drawVector(vector, this.canvas, "red");
        vectorSum.add(vector);
      }

      node.x += vectorSum.x;
      node.y += vectorSum.y;

      if (SHOW_INTERNALS) node.drawVector(vectorSum, this.canvas, "black");

      node.appliedForces = [];
    });
  }
}

NodesPage.init();
