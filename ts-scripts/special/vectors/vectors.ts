import { Molasses } from "../../molasses";
import { Canvas } from "../../components/canvas.component";

const ARROW = {
  w: 5,
  h: 8
}

const COLOURS = ["#FF0000", "#00CC00", "#0000FF", "#FF00FF", "#00CCCC", "#ff4000", "#40ff00", "#00eebe", "#8000ff", "#009926", "#004d99", "#1a0066", "#660066", "#00664d", "#336600", "#663300"];

const AXIS_WIDTH: number = 1;
const VECTOR_WIDTH: number = 2;

// Program-specific variables

const graphOrigin = {
  x: 0,
  y: 0
};

// debug

const MINSTARTVECTORS: number = 1;
const MAXSTARTVECTORS: number = 3;
const MAXSTARTVECTORLENGTH: number = 10;

/**
 * The z axis
 * 
 * @param angle: The angle between the x axis and the z axis, in RADIANS
 */

const zAxis = {
  angle: (16) / 180 * Math.PI,
  components: {
    x: 0,
    y: 0
  } // defined in init()
};
const tickLength: number = 8;
const scaleColour: string = "#999999";
const altScaleColour: string = "#000000";

let currentDraggedObject: HTMLElement;

let infoTabs: number = 0;

const showScaleNumbers: boolean = true;

class Vectors {
  static vectors: Vector[] = [];

  static recentClick: boolean = false;

  static scaleInterval: number = 5; // number at which to mark the scale
  static numTicks: number = 40;
  static unitLength: number; // pixels per unit
  static drawnTicks: number = 1; // every *drawnticks*th tick will be drawn

  static canvas = new Canvas({
    parentElement: document.getElementById("canvasBox"),
  });

  static init(firstTime: boolean, fullRestart?: boolean) {
    document.documentElement.style.overflow = "hidden";
    Vectors.canvas.rebuildElement();

    Vectors.resetGraphOrigin();
    Vectors.canvas.addResizeListener(Vectors.resetGraphOrigin);

    // reset vectors array

    if (fullRestart) {
      Vectors.setScale(40);
      this.vectors = [];
      infoTabs = 0;
      document.getElementById("existingVectors").innerHTML = "";


      for (let i = 0; i < Math.round(Math.random() * (MAXSTARTVECTORS - MINSTARTVECTORS)) + MINSTARTVECTORS; i++)
        Vectors.newVector(0, 0, 0, Math.round(Math.random() * MAXSTARTVECTORLENGTH * 2) - MAXSTARTVECTORLENGTH, Math.round(Math.random() * MAXSTARTVECTORLENGTH * 2) - MAXSTARTVECTORLENGTH, Math.round(Math.random() * MAXSTARTVECTORLENGTH * 2) - MAXSTARTVECTORLENGTH, null, VECTOR_WIDTH);
    }

    this.vectors.forEach((v: Vector) => v.resetCosmetics());

    if (firstTime) {
      // creating wheel listener

      const multiplier = 1.1;

      window.addEventListener("wheel", function (e) {
        if (e.deltaY < 0)
          Vectors.setScale(Vectors.numTicks / multiplier);
        else if (e.deltaY > 0)
          Vectors.setScale(Vectors.numTicks * multiplier);
      });

      // creating many listeners

      document.getElementById("vectorCreator").querySelector(".vectorColour").addEventListener("click", Vectors.createVector);

      Array.from(document.getElementsByClassName("vectorDropArea")).forEach((dropArea: HTMLElement) => {
        dropArea.addEventListener("drop", (evt) => { Vectors.dragDrop(evt, (evt.target as HTMLElement)) });
        dropArea.addEventListener("dragover", (evt) => { evt.preventDefault(); });
      });

      document.getElementById("scalarProjectionLink").addEventListener("click", () => { Vectors.calculationInput('vectorProjection') });
      document.getElementById("crossProductLink").addEventListener("click", () => { Vectors.calculationInput('cross') });

      this.canvas.start(Vectors.main);
    }
  }

  /**
   * Builds an information element and appends it to the screen
   * 
   * @param vector The vector to build the info element for
   */

  static buildInfo(vector: Vector) {
    // element creation, filling
    const info: HTMLElement = Molasses.createElement({
      type: 'div',
      classList: 'infoTab',
      id: "infoTab" + infoTabs,
    });

    const inner: string =
      `
    <div class = 'closeInfoTab'>x</div>
    <div class='vectorColour' draggable = 'true'
    style = 'background-color: ${vector.colour}; border: 2px solid ${vector.colour}' >
    ${infoTabs}</div > 
    <div class='coordinates'>
    <p> x: <input></input> y: <input></input> z: <input></input> </p>
    </div>`;

    info.innerHTML = inner;
    info.querySelector(".vectorColour").addEventListener("dragstart", (evt) => { Vectors.dragStart((evt.target as HTMLElement).parentElement); });
    info.querySelector(".vectorColour").addEventListener("click", () => { Vectors.setVectorVisibility(info) });

    const inputs = info.querySelectorAll("input");
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener("blur", Vectors.updateVectors);
    }

    info.querySelector(".closeInfoTab").addEventListener("click", () => { Vectors.closeInfoTab(info); });

    // set values of input elements

    info.querySelectorAll('input').forEach((input: HTMLInputElement, index: number) => {
      input.value = Molasses.Object.entries(vector.components)[index][1] + '';
    });

    document.getElementById("existingVectors").appendChild(info); // append to screen

    vector.infoTabIndex = infoTabs;
    infoTabs++;
  }

  /**
   * Gets user input for the cross product, makes a cross product vector
   * 
   * @param type The type of calculation being inputted
   */

  static calculationInput(type: "cross" | "dot" | "magnitude" | "scalarProjection" | "tsp" | "vectorProjection") {
    let factors, a: Vector, b: Vector, c: Vector;
    switch (type) {
      case 'cross':
        factors = [document.getElementById(type).children[1].children[0], document.getElementById(type).children[1].children[2]]; // get vectorColour elements
        a = Vectors.vectors[factors[0].id];
        b = Vectors.vectors[factors[1].id];

        Vectors.makeCrossProduct(a, b, true);
        break;
      case 'dot':
        factors = [document.getElementById(type).children[1].children[0], document.getElementById(type).children[1].children[2]]; // get vectorColour elements
        a = Vectors.vectors[factors[0].id];
        b = Vectors.vectors[factors[1].id];

        if (a == undefined || b == undefined)
          break;

        document.getElementById(type).children[0].innerHTML = "Dot Product: " + Vectors.getDotProduct(a, b) + " units"; // change h3 tag
        break;
      case 'magnitude': {
        const v = Vectors.vectors[document.getElementById(type).children[0].children[0].id];

        document.getElementById(type).children[0].children[1].innerHTML = "Magnitude: <br>" + Math.round(v.magnitude * 1000) / 1000 + " units";
        break;
      } case "scalarProjection":
        factors = [document.getElementById("projection").children[1].children[0], document.getElementById("projection").children[1].children[2]]; // get vectorColour elements
        a = Vectors.vectors[factors[0].id];
        b = Vectors.vectors[factors[1].id];

        document.getElementById("projection").children[2].innerHTML = "Scalar Projection: <br>" + Math.round(Vectors.getScalarProjection(a, b) * 1000) / 1000 + " units";
        break;
      case "tsp": {
        factors = [document.getElementById("tsp").children[1].children[0], document.getElementById("tsp").children[1].children[3], document.getElementById("tsp").children[1].children[5]]; // get vectorColour elements
        a = Vectors.vectors[factors[0].id];
        b = Vectors.vectors[factors[1].id];
        c = Vectors.vectors[factors[2].id];

        const cross = Vectors.makeCrossProduct(b, c, false) as Vector;
        document.getElementById(type).children[2].innerHTML = Vectors.getDotProduct(a, cross) + " units"; // change h3 tag

        break;
      } case "vectorProjection":
        factors = [document.getElementById("projection").children[1].children[0], document.getElementById("projection").children[1].children[2]]; // get vectorColour elements
        a = Vectors.vectors[factors[0].id];
        b = Vectors.vectors[factors[1].id];

        Vectors.makeVectorProjection(a, b);
        break;
      default:
        console.log("unset calculation type");
    }
  }

  /**
   * Closes an infoTab
   * 
   * @param {Element} tab InfoTab element 
   */

  static closeInfoTab(tab: HTMLElement) {
    tab.style.display = "none";
    Vectors.setVectorVisibility(tab);
  }

  /**
   * Takes input from the vectorCreator element
   */

  static createVector() {
    const data = (Array.from(document.getElementById("vectorCreator").children[1].children[0].children[0].children) as HTMLInputElement[]);

    for (let i = 0; i < data.length; i++) {
      if (data[i].value == "" || isNaN(parseInt(data[i].value))) {
        console.log("invalid input");
        return;
      }
    }

    Vectors.newVector(0, 0, 0, parseFloat(data[0].value), parseFloat(data[1].value), parseFloat(data[2].value), COLOURS[infoTabs % COLOURS.length], VECTOR_WIDTH);
    data[0].value = "";
    data[1].value = "";
    data[2].value = "";
  }

  /**
   * Draws the arrow with its tip at the end of a Vector
   * @param {Vector} vector The Vector to cap
   */

  static drawArrow(vector: Vector) {
    const tip = { x: vector.cosmeticgraphOrigin.x + vector.cosmeticComponents.x, y: vector.cosmeticgraphOrigin.y + vector.cosmeticComponents.y }; // the top point of the triangle (when upright)
    const triangle = { // the arrow
      x: tip.x - (ARROW.h / 2) * Math.sin(vector.angle2d * Math.PI / 180),
      y: tip.y + (ARROW.h / 2) * Math.cos(vector.angle2d * Math.PI / 180),
      w: ARROW.w,
      h: ARROW.h,
      a: vector.angle2d
    };

    // if vector is TINY, don't draw arrow

    if (Math.abs((ARROW.w / 2) * Math.sin(vector.angle2d * Math.PI / 180) * 1) > Math.abs(Molasses.pythagorean(vector.cosmeticComponents.x, vector.cosmeticComponents.y, null))
      || Math.abs((ARROW.h / 2) * Math.sin(vector.angle2d * Math.PI / 180) * 1) > Math.abs(Molasses.pythagorean(vector.cosmeticComponents.x, vector.cosmeticComponents.y, null)))
      return;

    Vectors.canvas.drawTriangle(triangle.x, triangle.y, triangle.w, triangle.h, vector.colour, true, triangle.a);
  }

  /**
   * "Drops" a vectorColour element into its slot
   * @param {Event} event The drop event
   * @param {Element} dropZone The vector slot
   */

  static dragDrop(event: Event, dropZone: HTMLElement) {
    // dropping the vectorColour

    console.log(currentDraggedObject);
    dropZone.style.backgroundColor = (currentDraggedObject.querySelector('.vectorColour') as HTMLElement).style.backgroundColor;
    dropZone.id = currentDraggedObject.id.substring(7);

    dropZone.innerHTML = currentDraggedObject.querySelector('.vectorColour').innerHTML;

    switch (dropZone.parentElement.parentElement.id) {
      case "dot":
      case "magnitude":
        Vectors.calculationInput(dropZone.parentElement.parentElement.id);
        break;
      case "cross":
        // if both dropzones are filled
        if (window.getComputedStyle(dropZone.parentElement.children[0]).backgroundColor != "rgba(0, 0, 0, 0)" && window.getComputedStyle(dropZone.parentElement.children[2]).backgroundColor != "rgba(0, 0, 0, 0)") {
          dropZone.parentElement.parentElement.children[2].className = "clickable"; // calculate
        }
        break;
      case "projection":
        // if both dropzones are filled
        if (window.getComputedStyle(dropZone.parentElement.children[0]).backgroundColor != "rgba(0, 0, 0, 0)" && window.getComputedStyle(dropZone.parentElement.children[2]).backgroundColor != "rgba(0, 0, 0, 0)") {
          dropZone.parentElement.parentElement.children[3].className = "clickable"; // calculate
          Vectors.calculationInput("scalarProjection");
        }
        break;
      case "tsp":
        // if all three dropzones are filled
        if (window.getComputedStyle(dropZone.parentElement.children[0]).backgroundColor != "rgba(0, 0, 0, 0)"
          && window.getComputedStyle(dropZone.parentElement.children[3]).backgroundColor != "rgba(0, 0, 0, 0)"
          && window.getComputedStyle(dropZone.parentElement.children[5]).backgroundColor != "rgba(0, 0, 0, 0)") {
          Vectors.calculationInput("tsp");
        }
        break;
    }
  }

  /**
   * Registers a vector colour as being dragged
   */

  static dragStart(el: HTMLElement) {
    currentDraggedObject = el;
  }

  /**
   * Draws the scale to the axes
   */

  static drawScale() {

    // x axis

    for (let x = graphOrigin.x + Vectors.unitLength; x < Vectors.canvas.width; x += Vectors.unitLength) { // positive  
      if ((x - graphOrigin.x) % (Vectors.unitLength * Vectors.scaleInterval) == 0 && x !== graphOrigin.x) {
        if (showScaleNumbers)
          Vectors.canvas.drawText((x - graphOrigin.x) / Vectors.unitLength, x, graphOrigin.y - tickLength, "black", true, 14, "bold");
        Vectors.canvas.drawLine(x, graphOrigin.y - tickLength / 2, x, graphOrigin.y + tickLength / 2, altScaleColour, 1);
      } else if (((x - graphOrigin.x) / Vectors.unitLength) % Vectors.drawnTicks === 0)
        Vectors.canvas.drawLine(x, graphOrigin.y - tickLength / 2, x, graphOrigin.y + tickLength / 2, scaleColour, 1);
    }

    for (let x = graphOrigin.x - Vectors.unitLength; x > 0; x -= Vectors.unitLength) { // negative
      if ((x - graphOrigin.x) % (Vectors.unitLength * Vectors.scaleInterval) == 0 && x !== graphOrigin.x) {
        if (showScaleNumbers)
          Vectors.canvas.drawText((x - graphOrigin.x) / Vectors.unitLength, x, graphOrigin.y - tickLength, "black", true, 14, "bold");
        Vectors.canvas.drawLine(x, graphOrigin.y - tickLength / 2, x, graphOrigin.y + tickLength / 2, altScaleColour, 1);
      } else if (((x - graphOrigin.x) / Vectors.unitLength) % Vectors.drawnTicks === 0)
        Vectors.canvas.drawLine(x, graphOrigin.y - tickLength / 2, x, graphOrigin.y + tickLength / 2, scaleColour, 1);
    }

    // y axis

    for (let y = graphOrigin.y + Vectors.unitLength; y < Vectors.canvas.height; y += Vectors.unitLength) { // negative
      if ((y - graphOrigin.y) % (Vectors.unitLength * Vectors.scaleInterval) == 0 && y !== graphOrigin.y) {
        if (showScaleNumbers)
          Vectors.canvas.drawText(-(y - graphOrigin.y) / Vectors.unitLength, graphOrigin.x + tickLength * 2 + 4, y + 4, "black", true, 14, "bold");
        Vectors.canvas.drawLine(graphOrigin.x - tickLength / 2, y, graphOrigin.x + tickLength / 2, y, altScaleColour, 1);
      } else if (((y - graphOrigin.y) / Vectors.unitLength) % Vectors.drawnTicks === 0)
        Vectors.canvas.drawLine(graphOrigin.x - tickLength / 2, y, graphOrigin.x + tickLength / 2, y, scaleColour, 1);
    }

    for (let y = graphOrigin.y - Vectors.unitLength; y > 0; y -= Vectors.unitLength) { // positive
      if ((y - graphOrigin.y) % (Vectors.unitLength * Vectors.scaleInterval) == 0 && y !== graphOrigin.y) {
        if (showScaleNumbers)
          Vectors.canvas.drawText(-(y - graphOrigin.y) / Vectors.unitLength, graphOrigin.x + tickLength * 2, y + 4, "black", true, 14, "bold");
        Vectors.canvas.drawLine(graphOrigin.x - tickLength / 2, y, graphOrigin.x + tickLength / 2, y, altScaleColour, 1);
      } else if (((y - graphOrigin.y) / Vectors.unitLength) % Vectors.drawnTicks === 0)
        Vectors.canvas.drawLine(graphOrigin.x - tickLength / 2, y, graphOrigin.x + tickLength / 2, y, scaleColour, 1);
    }

    // z axis 

    // where z is iterator

    for (let z = 1; z < (Vectors.canvas.width / Math.cos(zAxis.angle) / 2) / Vectors.unitLength; z++) { // negative (looks to be in q1)
      const zScalePoint = { x: (Vectors.unitLength) * Math.cos(zAxis.angle), y: (Vectors.unitLength) * Math.sin(zAxis.angle) };

      if (z % Vectors.drawnTicks !== 0) // only draw certain ticks
        continue;

      let c = scaleColour;
      if (z % Vectors.scaleInterval == 0) // make bold
        c = altScaleColour;


      Vectors.canvas.drawLine(graphOrigin.x + z * zScalePoint.x - ((tickLength / 2) * Math.sin(zAxis.angle)),
        graphOrigin.y - z * zScalePoint.y - ((tickLength / 2) * Math.cos(zAxis.angle)),
        graphOrigin.x + z * zScalePoint.x + ((tickLength / 2) * Math.sin(zAxis.angle)),
        graphOrigin.y - z * zScalePoint.y + ((tickLength / 2) * Math.cos(zAxis.angle)), c, 1); // scale marker
    }

    for (let z = -1; z > (-Vectors.canvas.width / Math.cos(zAxis.angle) / 2) / Vectors.unitLength; z--) { // positive (looks to be in q3)
      const zScalePoint = { x: (Vectors.unitLength) * Math.cos(zAxis.angle), y: (Vectors.unitLength) * Math.sin(zAxis.angle) };

      if (z % Vectors.drawnTicks !== 0) // only draw certain ticks
        continue;

      let c = scaleColour;
      if (z % Vectors.scaleInterval == 0)
        c = altScaleColour;


      Vectors.canvas.drawLine(graphOrigin.x + z * zScalePoint.x - ((tickLength / 2) * Math.sin(zAxis.angle)),
        graphOrigin.y - z * zScalePoint.y - ((tickLength / 2) * Math.cos(zAxis.angle)),
        graphOrigin.x + z * zScalePoint.x + ((tickLength / 2) * Math.sin(zAxis.angle)),
        graphOrigin.y - z * zScalePoint.y + ((tickLength / 2) * Math.cos(zAxis.angle)), c, 1); // scale marker
    }

  }

  /**
   * Gets the dot product of two vectors
   * 
   * @param {Vector} a The first vector to multiply
   * @param {Vector} b The second vector to multiply
   */

  static getDotProduct(a: Vector, b: Vector): number {
    const x = a.components.x * b.components.x;
    const y = a.components.y * b.components.y;
    const z = a.components.z * b.components.z;

    return x + y + z;
  }

  /**
   * Gets the scalar projection of a on b
   * @param {Vector} a Vector a
   * @param {Vector} b Vector b
   */

  static getScalarProjection(a: Vector, b: Vector) {
    return Math.abs(Vectors.getDotProduct(a, b) / b.magnitude);
  }

  /**
   * Gets the cross product of two vectors, then adds it to the vectors array
   * 
   * @param {Vector} a The first vector to multiply
   * @param {Vector} b The second vector to multiply
   * 
   * @returns {Vector} The cross product of a and b
   */

  static makeCrossProduct(a: Vector, b: Vector, createVector: boolean): Vector | void {
    const x = a.components.y * b.components.z - a.components.z * b.components.y;
    const y = a.components.z * b.components.x - a.components.x * b.components.z;
    const z = a.components.x * b.components.y - a.components.y * b.components.x;

    if (createVector)
      return Vectors.newVector(0, 0, 0, x, y, z, null, VECTOR_WIDTH);
    else
      return new Vector(0, 0, 0, x, y, z, "#000000", VECTOR_WIDTH);
  }

  /**
   * Gets the vector projection of a on b, then adds it to the vectors array
   * @param {Vector} a Vector a
   * @param {Vector} b Vector b
   */

  static makeVectorProjection(a: Vector, b: Vector): void {
    const multiplier = Math.round((Vectors.getScalarProjection(a, b) / b.magnitude) * 1000) / 1000;

    Vectors.newVector(0, 0, 0, b.components.x * multiplier, b.components.y * multiplier, b.components.z * multiplier, null, VECTOR_WIDTH);
  }

  static main() {
    // step 4: draw

    Vectors.redraw();
  }


  /**
   * Makes a Vector object and adds it to the vectors array
   */

  static newVector(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, colour?: string, width?: number) {
    if (colour == undefined)
      colour = COLOURS[infoTabs % COLOURS.length];

    const v: Vector = new Vector(x1, y1, z1, x2, y2, z2, colour, width);
    Vectors.buildInfo(v);
    Vectors.vectors.push(v);
  }

  /**
   * Clears, redraws the canvas
   */

  static redraw(): void {
    Vectors.canvas.clear();

    const c = Vectors.canvas;

    // draw axes

    c.drawLine(0, graphOrigin.y, c.width, graphOrigin.y, "#000000", AXIS_WIDTH);
    c.drawLine(graphOrigin.x, 0, graphOrigin.x, c.height, "#000000", AXIS_WIDTH);
    c.drawLine(0, graphOrigin.y + zAxis.components.y, Vectors.canvas.width, graphOrigin.y - zAxis.components.y, "#000000", AXIS_WIDTH); // z axis
    Vectors.drawScale();

    // draw vectors

    for (let i = 0; i < Vectors.vectors.length; i++)
      Vectors.vectors[i].draw();
  }

  static resetGraphOrigin(): void {
    graphOrigin.x = Vectors.canvas.width / 2;
    graphOrigin.y = Vectors.canvas.height / 2;

    zAxis.components.x = Vectors.canvas.width / 2;
    zAxis.components.y = (Vectors.canvas.width / 2) * Math.tan(zAxis.angle);

    Vectors.vectors.forEach((vector: Vector) => vector.resetCosmetics());
  }

  /**
   * Changes the size of the Vectors.unitLength, then updates vector cosmetic locations accordingly
   * @param {*} newNumTicks 
   */

  static setScale(newNumTicks: number): void {
    if (newNumTicks < 1)
      return;

    Vectors.unitLength = Math.round(Vectors.canvas.width / newNumTicks);
    if (Vectors.unitLength === 1) {
      Vectors.unitLength = 2;
      console.log("zoom limit reached")
      return;
    }

    Vectors.numTicks = newNumTicks;

    if (Vectors.numTicks / Vectors.drawnTicks > 60) // lowering number of ticks onscreen
      Vectors.drawnTicks = Math.ceil(Vectors.numTicks / 50);

    if (Vectors.numTicks / Vectors.drawnTicks < 40 && Vectors.drawnTicks > 1) // lowering number of ticks onscreen
      Vectors.drawnTicks = Math.floor(Vectors.numTicks / 50);

    Vectors.scaleInterval = Vectors.drawnTicks * 5;

    Vectors.vectors.forEach((v: Vector) => v.resetCosmetics());
  }

  /**
   * Makes a vector visible or invisible and changes its infoTab accordingly. 
   * 
   * @param {*} el the infoTab
   * @param {*} visible true if the vector is to be visible, false if not
   */

  static setVectorVisibility(el: HTMLElement): void {
    let vector: Vector;

    for (let i = 0; i < Vectors.vectors.length; i++) { // finding corresponding vector
      if (Vectors.vectors[i].infoTabIndex == parseInt(el.id.substring(7)))
        vector = Vectors.vectors[i]; // passed by reference
    }

    vector.isVisible = !vector.isVisible;

    const numberElement: HTMLElement = (el.querySelector('.vectorColour') as HTMLElement);
    numberElement.style.backgroundColor = vector.isVisible ? vector.colour : '';
    numberElement.style.color = vector.isVisible ? '' : vector.colour;

  }

  /**
   * Updates vector data based on user input
   */

  static updateVectors() {
    Vectors.vectors.forEach((v: Vector) => {
      const tab: HTMLElement = v.getInfoTab();
      const data: HTMLInputElement[] = Array.from(tab.querySelectorAll('input'));

      v.setComponents(
        parseFloat(data[0].value),
        parseFloat(data[1].value),
        parseFloat(data[2].value));

    })
  }
}

class Vector {
  magnitude: number;
  colour: string;
  lineWidth: number;
  isVisible: boolean = true;
  angle2d: number;
  infoTabIndex: number;

  graphOrigin: {
    x: number,
    y: number,
    z: number
  }
  components: {
    x: number,
    y: number,
    z: number
  }
  cosmeticgraphOrigin: {
    x: number,
    y: number,
    z: number
  }
  cosmeticComponents: {
    x: number,
    y: number,
    z: number
  }

  /**
   * The Vector object
   * 
   * @param {*} x1 The x-coordinate of the vector's graphOrigin
   * @param {*} y1 The y-coordinate of the vector's graphOrigin
   * @param {*} z1 The z-coordinate of the vector's graphOrigin
   * @param {*} x2 The x-component of the vector
   * @param {*} y2 The y-component of the vector
   * @param {*} z2 The z-component of the vector
   * @param {*} colour The colour of the vector 
   * @param {*} width The line width of the vector
   */

  constructor(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, colour: string, width: number) {
    this.graphOrigin = { x: x1, y: y1, z: z1 }; // graphOrigin of the vector
    this.components = { x: x2, y: y2, z: z2 }; // endpoint of the vector
    this.magnitude = Math.sqrt(Math.pow(x2, 2) + Math.pow(y2, 2) + Math.pow(z2, 2));

    this.colour = colour;
    this.lineWidth = width;

    this.resetCosmetics(); // called here

    this.infoTabIndex = -1;
  }

  getInfoTab(): HTMLElement {
    return document.getElementById("infoTab" + this.infoTabIndex);
  }

  resetCosmetics() {
    const k = { // unit vector along the positive z axis, [0,0,1]
      x: -Vectors.unitLength * Math.cos(zAxis.angle),
      y: Vectors.unitLength * Math.sin(zAxis.angle)
    }

    this.cosmeticgraphOrigin = {
      x: this.graphOrigin.x * Vectors.unitLength + graphOrigin.x + (k.x * this.graphOrigin.z),
      y: -this.graphOrigin.y * Vectors.unitLength + graphOrigin.y + (k.y * this.graphOrigin.z),
      z: null
    }
    this.cosmeticComponents = { // visual placement of the vector on the [2] screen
      x: this.components.x * Vectors.unitLength + graphOrigin.x + this.graphOrigin.x * Vectors.unitLength + (k.x * this.components.z) - this.cosmeticgraphOrigin.x,
      y: -this.components.y * Vectors.unitLength + graphOrigin.y - this.graphOrigin.y * Vectors.unitLength + (k.y * this.components.z) - this.cosmeticgraphOrigin.y,
      z: null
    };

    this.angle2d = Math.atan(Math.abs((this.cosmeticComponents.y) / (this.cosmeticComponents.x))) * 180 / Math.PI; // [2] angle to x axis 

    if (this.cosmeticComponents.x > 0) {
      if (this.cosmeticComponents.y < 0) {
        this.angle2d = 90 - this.angle2d;
      } else {
        this.angle2d += 90;
      }
    } else {
      if (this.cosmeticComponents.y > 0) {
        this.angle2d = 270 - this.angle2d;
      } else {
        this.angle2d += 270;
      }
    }

    if (this.angle2d === Infinity) {
      if (this.cosmeticComponents.y > 0)
        this.angle2d = 0;
      else
        this.angle2d = 180;
    }
  }

  draw(this: Vector) {
    if (!this.isVisible)
      return;

    Vectors.canvas.drawLine(
      this.cosmeticgraphOrigin.x,
      this.cosmeticgraphOrigin.y,
      this.cosmeticgraphOrigin.x + this.cosmeticComponents.x,
      this.cosmeticgraphOrigin.y + this.cosmeticComponents.y,
      this.colour,
      VECTOR_WIDTH
    );
    Vectors.drawArrow(this);
  }

  /**
   * Resets the components of the Vector with new data, then updates the cosmetics
   */

  setComponents(x: number, y: number, z: number) {
    this.components.x = x;
    this.components.y = y;
    this.components.z = z;
    this.magnitude = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
    this.resetCosmetics();
  }
}

Vectors.init(true, true);
