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
  static isEditable: boolean = false;

  static mousePos: { x: number; y: number } = { x: 0, y: 0 };
  static wasClickedThisFrame: boolean = false;
  static isMouseDown: boolean = false;

  static canvas: Canvas = new Canvas({
    parentElement: document.getElementById("canvasContainer"),
  });

  static nextNodeColour: string = NodesNode.getColour();
  static nodes: NodesNode[] = [
    new NodesNode(Math.random() * 100, -Math.random() * 100, "red"),
    new NodesNode(Math.random() * 100, -Math.random() * 100, "yellow"),
    new NodesNode(Math.random() * 100, -Math.random() * 100, "orange"),
    new NodesNode(Math.random() * 100, -Math.random() * 100, "green"),
    new NodesNode(Math.random() * 100, -Math.random() * 100, "purple"),
    new NodesNode(Math.random() * 100, -Math.random() * 100, "violet"),
    new NodesNode(Math.random() * 100, -Math.random() * 100, "cyan"),
    new NodesNode(Math.random() * 100, -Math.random() * 100, "black"),
  ];

  static assistantNodes: NodesNode[] = [
    new NodesNode(0, 0, "DarkCyan"),
    new NodesNode(0, 0, "FireBrick"),
  ];

  static selectedNode: NodesNode = null;

  static handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    this.isEditable = !this.isEditable;

    const tooltip = document.getElementById("edit-tooltip");

    tooltip.classList.toggle("editing");
    if (tooltip.classList.contains("editing")) {
      tooltip.innerHTML = "Right click to stop editing";
    } else {
      tooltip.innerHTML = "Right click to edit";

      if (this.selectedNode) {
        this.selectedNode.isBeingEdited = false;
        this.selectedNode = null;
      }
    }
  }

  static handleMouseMove(e: MouseEvent) {
    this.mousePos.x = e.x - this.canvas.width / 2;
    this.mousePos.y =
      e.y -
      this.canvas.height / 2 -
      this.canvas.element.getBoundingClientRect().top;
  }

  static handleMouseUp(e: MouseEvent) {
    if (e.button === 0) {
      this.isMouseDown = false;
    }
  }

  static handleMouseDown(e: MouseEvent) {
    if (e.button === 0) {
      this.wasClickedThisFrame = true;
      this.isMouseDown = true;
    }
  }

  static init() {
    this.canvas.clearColour = null;
    this.canvas.start(() => {
      this.mainLoop();
    });

    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("contextmenu", (e) =>
      this.handleContextMenu(e)
    );
    this.canvas.addEventListener("mouseup", (e) => this.handleMouseUp(e));
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
  }

  static mainLoop() {
    this.redraw();

    this.updateNodes();

    this.wasClickedThisFrame = false;
  }

  static redraw() {
    this.canvas.clear();

    const { width, height } = this.canvas;

    // draw bonds
    this.nodes.forEach((node) => {
      node.boundNodes.forEach((boundNode) => {
        node.drawVectorToNode(boundNode, this.canvas);
      });
    });

    // draw nodes
    for (const node of this.nodes) {
      node.draw(this.canvas, { width, height }, this.mousePos);
    }
  }

  static getPotentialNode() {
    return new NodesNode(this.mousePos.x, this.mousePos.y, this.nextNodeColour);
  }

  static getMotionNode1() {
    const closeness = 0.5; // lesser = tighter cycle around the origin
    const period = 6000;
    const halfWidth = this.canvas.width * closeness;
    const halfHeight = this.canvas.height * closeness;
    const now = Date.now();
    return new NodesNode(
      halfWidth * Math.sin((Math.PI * now) / period),
      halfHeight * Math.cos((Math.PI * (now - period)) / period),
      "blue"
    );
  }

  static getMotionNode2() {
    const closeness = 0.35; // lesser = tighter cycle around the origin
    const period = 10000;
    const widthBound = this.canvas.width * closeness;
    const heightBound = this.canvas.height * closeness;
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

        if (node.boundNodes.includes(this.nodes[i])) {
          node.appliedForces.push(
            node.getAttractiveVectorTo(this.nodes[i], 0.25)
          );
        }
      }
    });

    // apply forces and reset them
    const originNode = new NodesNode(0, 0);
    const mouseNode = new NodesNode(this.mousePos.x, this.mousePos.y, "blue");
    const motionNode1 = this.getMotionNode1();
    const motionNode2 = this.getMotionNode2();
    const potentialNode = this.getPotentialNode();

    if (SHOW_INTERNALS) {
      motionNode1.draw(this.canvas, this.canvas, this.mousePos);
      motionNode2.draw(this.canvas, this.canvas, this.mousePos);
    }

    // find the hovered node first
    let hoveredNode: NodesNode = null;
    if (this.isEditable) {
      this.nodes.forEach((node) => {
        if (node.isMouseHovering(this.mousePos)) {
          hoveredNode = node;
        }
      });
    }

    if (!hoveredNode && this.isEditable) {
      potentialNode.draw(this.canvas, this.canvas, this.mousePos);

      if (
        this.wasClickedThisFrame ||
        (this.isMouseDown && Date.now() % 400 < 20)
      ) {
        this.nodes.push(potentialNode);
        this.nextNodeColour = NodesNode.getColour();
      }
    }

    // if the hovered node is clicked, precompute that
    let clickedNode: NodesNode = null;
    if (this.wasClickedThisFrame && hoveredNode) {
      clickedNode = hoveredNode;

      if (!this.selectedNode) {
        // no node selected
        this.selectedNode = clickedNode;
        clickedNode.isBeingEdited = true;
      } else if (clickedNode === this.selectedNode) {
        // clicked currently-selected node
        this.selectedNode = null;
        clickedNode.isBeingEdited = false;
      } else if (this.selectedNode.boundNodes.includes(clickedNode)) {
        // clicked a bonded node
        clickedNode.removeBondTo(this.selectedNode);
        this.selectedNode.removeBondTo(clickedNode);
      } else {
        // clicked an unbonded node
        clickedNode.addBondTo(this.selectedNode);
        this.selectedNode.addBondTo(clickedNode);
      }
    }

    // handle operations relating to the selected node
    if (this.selectedNode) {
      this.canvas.drawLine(
        this.selectedNode.x + this.canvas.width / 2,
        this.selectedNode.y + this.canvas.height / 2,
        this.mousePos.x + this.canvas.width / 2,
        this.mousePos.y + this.canvas.height / 2,
        "#888",
        2
      );
    }

    // main loop
    this.nodes.forEach((node) => {
      const vectorSum = node.getAttractiveVectorTo(originNode);
      if (SHOW_INTERNALS) node.drawVector(vectorSum, this.canvas, "blue");

      if (!this.isEditable) {
        const mouseRepellant = node
          .getRepulsiveVectorTo(mouseNode)
          .scalarMultiply(1.5);
        vectorSum.add(mouseRepellant);

        if (SHOW_INTERNALS) node.drawVector(mouseRepellant, this.canvas, "red");
      }

      // add ambient motion
      if (!this.isEditable) {
        const motionRepellant1 = node.getRepulsiveVectorTo(motionNode1);
        const motionRepellant2 = node.getRepulsiveVectorTo(motionNode2);
        vectorSum.add(motionRepellant1);
        vectorSum.add(motionRepellant2);
      }

      for (const vector of node.appliedForces) {
        if (SHOW_INTERNALS) node.drawVector(vector, this.canvas, "red");
        vectorSum.add(vector);
      }

      node.x += vectorSum.x;
      node.y += vectorSum.y;

      // boundaries
      node.restoreBoundaries(this.canvas);

      if (SHOW_INTERNALS) node.drawVector(vectorSum, this.canvas, "black");

      node.appliedForces = [];
    });

    if (clickedNode) {
      this.nodes.forEach((node) => {
        if (node != clickedNode) {
          node.isBeingEdited = false;
        }
      });
    }
  }
}

NodesPage.init();
