import {cws} from "../cws.js";

const ARROW = {
  w: 5,
  h: 8
}

const COLOURS = ["#FF0000", "#00CC00", "#0000FF", "#FF00FF", "#00CCCC", "#ff4000", "#40ff00", "#00eebe", "#8000ff", "#009926", "#004d99", "#1a0066", "#660066", "#00664d", "#336600", "#663300"];

const AXIS_WIDTH: number = 1;
const VECTOR_WIDTH: number = 10;

// Program-specific variables

var graphOrigin = {
  x: 0,
  y: 0
};

var vectors: Vector[] = [];

// debug

const MINSTARTVECTORS: number = 1;
const MAXSTARTVECTORS: number = 3;
const MAXSTARTVECTORLENGTH: number = 10;

/**
 * The z axis
 * 
 * @param angle: The angle between the x axis and the z axis, in RADIANS
 */

var zAxis = {
  angle: (16) / 180 * Math.PI,
  components: {
    x: 0,
    y: 0
  } // defined in init()
};

var scaleInterval: number = 5; // number at which to mark the scale
var numTicks: number = 40;
var unitLength: number; // pixels per unit
var tickLength: number = 8;
var drawnTicks: number = 1; // every *drawnticks*th tick will be drawn
var scaleColour: string = "#999999";
var altScaleColour: string = "#000000";

var currentDraggedObject: HTMLElement;

var infoTabs: number = 0;

var showScaleNumbers: boolean = true;

// General Canvas Variables

const CANVAS_WIDTH_PERCENTAGE: number = 0.8;

var animator: number;
var now: number = Date.now();
var usePointer: boolean = false;

var doResize: boolean = false;
var lastResize: number = now; //causes an instant restart, but it fixes the canvas size
var lastMenuSize: number = document.getElementById("side-menu").getBoundingClientRect().width;

var myCanvas = {
  canvas: document.createElement("canvas"),

  keys: [],
  mouseX: null,
  mouseY: null,
  clickTime: null,
  recentClick: null,
  clickLeft: null,
  bgC: null,

  start: function () {
    resizeCanvas(); // centralizes canvas sizing
    this.canvas.style.backgroundColor = "white";
    this.canvas.style.transition = "all 0.5s linear";
    this.canvas.setAttributeNode(
      cws.betterCreateAttr("oncontextmenu", "return false;")
    );

    this.isClicking = false;
    this.recentClick = false;
    this.clickLeft = true;
    this.bgC = window.getComputedStyle(this.canvas).backgroundColor;

    this.context = this.canvas.getContext("2d", {
      alpha: false
    });

    document.getElementById("canvasBox").appendChild(this.canvas);

    window.addEventListener("keydown", function (e) {
      myCanvas.keys = myCanvas.keys || [];
      myCanvas.keys[e.keyCode] = true;
    });
    window.addEventListener("keyup", function (e) {
      myCanvas.keys[e.keyCode] = false;
    });
    myCanvas.canvas.addEventListener(
      "click",
      function (evt) {
        let canvasArea = myCanvas.canvas.getBoundingClientRect();
        myCanvas.mouseX = evt.clientX - canvasArea.left;
        myCanvas.mouseY = evt.clientY - canvasArea.top;
        myCanvas.clickTime = now;
        myCanvas.recentClick = true;
        myCanvas.clickLeft = true;
      },
      false
    );
    myCanvas.canvas.addEventListener(
      "touchend",
      function (evt) {
        let canvasArea = myCanvas.canvas.getBoundingClientRect();
        let touch = evt.changedTouches[evt.changedTouches.length - 1];
        myCanvas.mouseX = touch.screenX - canvasArea.left;
        myCanvas.mouseY = touch.screenY - canvasArea.top;
        myCanvas.clickTime = now;
        myCanvas.recentClick = true;
        myCanvas.clickLeft = true;
      },
      false
    );
    myCanvas.canvas.addEventListener(
      "mousemove",
      function (evt) {
        let canvasArea = myCanvas.canvas.getBoundingClientRect();
        myCanvas.mouseX = evt.clientX - canvasArea.left;
        myCanvas.mouseY = evt.clientY - canvasArea.top;
      },
      false
    );
    myCanvas.canvas.addEventListener(
      "contextmenu",
      function (evt) {
        let canvasArea = myCanvas.canvas.getBoundingClientRect();
        myCanvas.mouseX = evt.clientX - canvasArea.left;
        myCanvas.mouseY = evt.clientY - canvasArea.top;
        myCanvas.clickTime = now;
        myCanvas.recentClick = true;
        myCanvas.clickLeft = false;
      },
      false
    );
  },

  clear: function () {
    this.drawRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height,
      "white"
    );
  },

  /**
   * Draws an image to the canvas
   * @param {Element} img The image element
   * @param {Number} x The top-left x-coordinate of the image.
   * @param {Number} y The top-left y-coordinate of the image.
   * @param {Number} w (optional) The width of the image.
   * @param {Number} h (optional) The height of the image.
   */

  drawImg: function (img, x, y, w, h) {
    if (h === null) this.context.drawImage(img, x, y);
    else this.context.drawImage(img, x, y, w, h);
  },

  /**
   * Draws a line to the canvas between two points
   * @param {Number} x1 The x coordinate of the start point
   * @param {Number} y1 The y coordinate of the start point
   * @param {Number} x2 The x coordinate of the end point
   * @param {Number} y2 The y coordinate of the end point
   * @param {String} newColour The colour of the line.  If left null, the colour of the last line drawn will be used.
   * @param {Number} newWidth The width of the line.  If left null, the width of the last line drawn will be used.
   */

  drawLine: function (x1: number, y1: number, x2: number, y2: number, newColour: string, newWidth?: number) {
    if (typeof newColour !== "undefined")
      this.context.strokeStyle = newColour;
    if (typeof newWidth !== "undefined")
      this.context.strokeStyle = newWidth;

    this.context.beginPath();
    this.context.moveTo(Math.round(x1), Math.round(y1));
    this.context.lineTo(Math.round(x2), Math.round(y2));
    this.context.stroke();
  },

  /**
   * Draws a rectangle to the canvas
   * @param {*} x The top-left x-coordinate of the rectangle.
   * @param {*} y The top-left y-coordinate of the rectangle.
   * @param {*} w The width of the rectangle.
   * @param {*} h The height of the rectangle.
   * @param {*} colour The colour of the rectangle.  If left null, the colour of the last line drawn will be used.
   */

  drawRect: function (x: number, y: number, w: number, h: number, colour?: string, filled?: boolean) {
    this.context.fillStyle = colour;
    if (filled === false)
      this.context.strokeRect(x, y, w, h);
    else
      this.context.fillRect(x, y, w, h);
  },

  /**
   * Draws text to the canvas
   * @param {*} text The text to be drawn
   * @param {*} x The x-coordinate
   * @param {*} y The y-coordinate
   * @param {*} colour The text's colour
   * @param {*} centered Whether to center the text upon the x and y coordinate
   * @param {*} size pt of font
   * @param {*} type bold?
   */

  drawText: function (text, x, y, colour, centered, size, type) {
    this.context.fillStyle = colour;
    if (type !== null) this.context.font = size + "px " + type;
    if (centered) this.context.textAlign = "center";
    else this.context.textAlign = "left";
    this.context.fillText(text, x, y);
  },

  /**
   * Draws an isoceles triangle to the canvas
   * @param {Number} x 
   * @param {Number} y 
   * @param {Number} w 
   * @param {Number} h
   * @param {Boolean} center Centers the triangle around (x, y)
   * @param {Number} angle (DEGREES) The angle from vertical at which to draw the triangle.  Only works correctly if center == true.
   */

  drawTriangle: function (x, y, w, h, colour, center, angle) {
    let canvas = this.context;
    angle = cws.toRadians(angle);

    canvas.beginPath();
    canvas.fillStyle = colour;
    canvas.strokeStyle = colour;

    if (center) {
      let a = { x: x - w / 2, y: y + h / 2 };
      let b = { x: x, y: y - h / 2 };
      let c = { x: x + w / 2, y: y + h / 2 };

      if (!isNaN(angle) && angle !== 0) {
        canvas.translate(x, y);
        canvas.rotate(
          angle
        );

        canvas.moveTo(a.x - x, a.y - y);
        canvas.lineTo(b.x - x, b.y - y);
        canvas.lineTo(c.x - x, c.y - y);
        canvas.lineTo(a.x - x, a.y - y);

        canvas.rotate(
          -angle
        );
        canvas.translate(-x, -y);
      } else {
        canvas.moveTo(a.x, a.y);
        canvas.lineTo(b.x, b.y);
        canvas.lineTo(c.x, c.y);
        canvas.lineTo(a.x, a.y);
      }
      canvas.fill();
    } else { // x,y = top left of the triangle
      canvas.moveTo(x, y + h);
      canvas.lineTo(x + w / 2, y);
      canvas.lineTo(x + w, y + h);
      canvas.lineTo(x, y + h);
      canvas.fill();
    }
  },

  /**
   * Stops the animation loop of the canvas
   */

  stop: function () {
    window.cancelAnimationFrame(animator);
  }
};

function init(firstTime: boolean, fullRestart?: boolean) {
  if (firstTime) {
    console.log("initializing");
    window.addEventListener("resize", () => { doResize = true; });
  } else console.log("(re)initializing");

  myCanvas.start();
  document.documentElement.style.overflow = "hidden";

  // reset graphOrigin position, zAxis

  graphOrigin.x = myCanvas.canvas.width / 2;
  graphOrigin.y = myCanvas.canvas.height / 2;

  zAxis.components.x = myCanvas.canvas.width / 2;
  zAxis.components.y = (myCanvas.canvas.width / 2) * Math.tan(zAxis.angle);

  // reset vectors array

  if (fullRestart) {
    setScale(40);
    vectors = [];
    infoTabs = 0;
    document.getElementById("existingVectors").innerHTML = "";


    for (let i = 0; i < Math.round(Math.random() * (MAXSTARTVECTORS - MINSTARTVECTORS)) + MINSTARTVECTORS; i++)
      newVector(0, 0, 0, Math.round(Math.random() * MAXSTARTVECTORLENGTH * 2) - MAXSTARTVECTORLENGTH, Math.round(Math.random() * MAXSTARTVECTORLENGTH * 2) - MAXSTARTVECTORLENGTH, Math.round(Math.random() * MAXSTARTVECTORLENGTH * 2) - MAXSTARTVECTORLENGTH, null, VECTOR_WIDTH);
  }

  for (let v in vectors) {
    vectors[v].setCosmetics();
  }

  if (firstTime) {
    // creating wheel listener

    let multiplier = 1.1;

    window.addEventListener("wheel", function (e) {
      if (e.deltaY < 0)
        setScale(numTicks / multiplier);
      else if (e.deltaY > 0)
        setScale(numTicks * multiplier);
    });

    // creating many listeners

    document.getElementById("vectorCreator").querySelector(".vectorColour").addEventListener("click", createVector);

    let dropSpaces = document.getElementsByClassName("vectorDropArea");
    for (let i = 0; i < dropSpaces.length; i++) {
      dropSpaces[i].addEventListener("drop", (evt) => { dragDrop(evt, (evt.target as HTMLElement)) });
      dropSpaces[i].addEventListener("dragover", (evt) => { dragAllowDrop(evt) });
    }

    document.getElementById("scalarProjectionLink").addEventListener("click", () => { calculationInput('vectorProjection') });
    document.getElementById("crossProductLink").addEventListener("click", () => { calculationInput('cross') });

    window.requestAnimationFrame(main);
  }
}

function main() {
  // resets

  now = Date.now();

  if (doResize) {
    resizeCanvas();
    doResize = false;
    lastResize = now + 50;
  } else if (lastMenuSize !== document.getElementById("side-menu").getBoundingClientRect().width) {
    resizeCanvas();
    lastMenuSize = document.getElementById("side-menu").getBoundingClientRect().width;
    init(false, false);
  }

  if (now > lastResize && lastResize > 0) {
    init(false, false);
    lastResize = -1;
  }

  // step 4: draw

  redraw();

  myCanvas.canvas.style.backgroundColor = document.getElementById(
    "main"
  ).style.backgroundColor;

  // step 5: input

  getIn();

  // step 6: work

  // canvas stuff

  if (usePointer) myCanvas.canvas.style.cursor = "pointer";
  else myCanvas.canvas.style.cursor = "default";

  myCanvas.recentClick = false;
  usePointer = false;
  animator = window.requestAnimationFrame(main);
}

/**
 * Builds an information element and appends it to the screen
 * 
 * @param vector The vector to build the info element for
 */

function buildInfo(vector: Vector) {
  // element creation, filling
  let info: HTMLElement = document.createElement("div");
  info.setAttributeNode(cws.betterCreateAttr("class", "infoTab"));
  info.setAttributeNode(cws.betterCreateAttr("id", "infoTab" + infoTabs));

  let inner: string = "<div class='vectorColour' draggable = 'true' onclick='setVectorVisibility(this.parentElement)' \
  style = 'background-color: " + vector.colour + "; border: 2px solid" + vector.colour + "' > \
  \
  " + infoTabs + "</div > \
  <div class='coordinates'>\
  <p> x: <input></input> y: <input></input> z: <input></input> </p>   \
  </div>\
  <div class = 'closeInfoTab'>x</div> ";

  info.innerHTML = inner;
  info.querySelector(".vectorColour").addEventListener("dragstart", (evt) => { dragStart((evt.target as HTMLElement).parentElement); });

  let inputs = info.querySelectorAll("input");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener("blur", updateVectors);
  }

  info.querySelector(".closeInfoTab").addEventListener("click", () => { closeInfoTab(this.parentElement) });

  // set values of input elements
  for (let i = 0; i < info.children[1].children[0].children.length; i++) {
    (info.children[1].children[0].children[i] as HTMLInputElement).value = cws.Object.entries(vector.components)[i][1] + '';
  }

  document.getElementById("existingVectors").appendChild(info); // append to screen

  vector.infoTab = infoTabs;
  infoTabs++;
}

/**
 * Gets user input for the cross product, makes a cross product vector
 * 
 * @param type The type of calculation being inputted
 */

function calculationInput(type: "cross" | "dot" | "magnitude" | "scalarProjection" | "tsp" | "vectorProjection") {
  let factors, a: Vector, b: Vector, c: Vector;
  switch (type) {
    case 'cross':
      factors = [document.getElementById(type).children[1].children[0], document.getElementById(type).children[1].children[2]]; // get vectorColour elements
      a = vectors[factors[0].id];
      b = vectors[factors[1].id];

      makeCrossProduct(a, b, true);
      break;
    case 'dot':
      factors = [document.getElementById(type).children[1].children[0], document.getElementById(type).children[1].children[2]]; // get vectorColour elements
      a = vectors[factors[0].id];
      b = vectors[factors[1].id];

      if (a == undefined || b == undefined)
        break;

      document.getElementById(type).children[0].innerHTML = "Dot Product: " + getDotProduct(a, b) + " units"; // change h3 tag
      break;
    case 'magnitude':
      let v = vectors[document.getElementById(type).children[0].children[0].id];

      document.getElementById(type).children[0].children[1].innerHTML = "Magnitude: <br>" + Math.round(v.magnitude * 1000) / 1000 + " units";
      break;
    case "scalarProjection":
      factors = [document.getElementById("projection").children[1].children[0], document.getElementById("projection").children[1].children[2]]; // get vectorColour elements
      a = vectors[factors[0].id];
      b = vectors[factors[1].id];

      document.getElementById("projection").children[2].innerHTML = "Scalar Projection: <br>" + Math.round(getScalarProjection(a, b) * 1000) / 1000 + " units";
      break;
    case "tsp":
      factors = [document.getElementById("tsp").children[1].children[0], document.getElementById("tsp").children[1].children[3], document.getElementById("tsp").children[1].children[5]]; // get vectorColour elements
      a = vectors[factors[0].id];
      b = vectors[factors[1].id];
      c = vectors[factors[2].id];

      let cross = makeCrossProduct(b, c, false) as Vector;
      document.getElementById(type).children[2].innerHTML = getDotProduct(a, cross) + " units"; // change h3 tag

      break;
    case "vectorProjection":
      factors = [document.getElementById("projection").children[1].children[0], document.getElementById("projection").children[1].children[2]]; // get vectorColour elements
      a = vectors[factors[0].id];
      b = vectors[factors[1].id];

      makeVectorProjection(a, b);
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

function closeInfoTab(tab) {
  tab.style.display = "none";
  setVectorVisibility(tab);
}

/**
 * Takes input from the vectorCreator element
 */

function createVector() {
  // @ts-ignore
  let data = (document.getElementById("vectorCreator").children[1].children[0].children[0].children as HTMLInputElement[]);

  for (let i = 0; i < data.length; i++) {
    if (data[i].value == "" || isNaN(parseInt(data[i].value))) {
      console.log("invalid input");
      return;
    }
  }

  newVector(0, 0, 0, parseFloat(data[0].value), parseFloat(data[1].value), parseFloat(data[2].value), COLOURS[infoTabs % COLOURS.length], VECTOR_WIDTH);
  data[0].value = "";
  data[1].value = "";
  data[2].value = "";
}

/**
 * Draws the arrow with its tip at the end of a Vector
 * @param {Vector} vector The Vector to cap
 */

function drawArrow(vector: Vector) {
  let tip = { x: vector.cosmeticgraphOrigin.x + vector.cosmeticComponents.x, y: vector.cosmeticgraphOrigin.y + vector.cosmeticComponents.y }; // the top point of the triangle (when upright)
  let triangle = { // the arrow
    x: tip.x - (ARROW.h / 2) * Math.sin(vector.angle2d * Math.PI / 180),
    y: tip.y + (ARROW.h / 2) * Math.cos(vector.angle2d * Math.PI / 180),
    w: ARROW.w,
    h: ARROW.h,
    a: vector.angle2d
  };

  // if vector is TINY, don't draw arrow

  if (Math.abs((ARROW.w / 2) * Math.sin(vector.angle2d * Math.PI / 180) * 1) > Math.abs(cws.pythagorean(vector.cosmeticComponents.x, vector.cosmeticComponents.y, null))
    || Math.abs((ARROW.h / 2) * Math.sin(vector.angle2d * Math.PI / 180) * 1) > Math.abs(cws.pythagorean(vector.cosmeticComponents.x, vector.cosmeticComponents.y, null)))
    return;

  myCanvas.drawTriangle(triangle.x, triangle.y, triangle.w, triangle.h, vector.colour, true, triangle.a);
}

/**
 * Important function - among many things, it gives the cursor its appearance when hovering over the drop area 
 * @param {*} evt 
 */

function dragAllowDrop(evt) {
  evt.preventDefault();
}

/**
 * "Drops" a vectorColour element into its slot
 * @param {Event} event The drop event
 * @param {Element} dropZone The vector slot
 */

function dragDrop(event: Event, dropZone: HTMLElement) {
  // dropping the vectorColour

  dropZone.style.backgroundColor = (currentDraggedObject.children[0] as HTMLElement).style.backgroundColor;
  dropZone.id = currentDraggedObject.id.substring(7);

  dropZone.innerHTML = currentDraggedObject.children[0].innerHTML;

  switch (dropZone.parentElement.parentElement.id) {
    case "dot":
    case "magnitude":
      calculationInput(dropZone.parentElement.parentElement.id);
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
        calculationInput("scalarProjection");
      }
      break;
    case "tsp":
      // if all three dropzones are filled
      if (window.getComputedStyle(dropZone.parentElement.children[0]).backgroundColor != "rgba(0, 0, 0, 0)"
        && window.getComputedStyle(dropZone.parentElement.children[3]).backgroundColor != "rgba(0, 0, 0, 0)"
        && window.getComputedStyle(dropZone.parentElement.children[5]).backgroundColor != "rgba(0, 0, 0, 0)") {
        calculationInput("tsp");
      }
      break;
  }
}

/**
 * Registers a vector colour as being dragged
 */

function dragStart(el: HTMLElement) {
  currentDraggedObject = el;
}

/**
 * Draws the scale to the axes
 */

function drawScale() {

  // x axis

  for (let x = graphOrigin.x + unitLength; x < myCanvas.canvas.width; x += unitLength) { // positive  
    if ((x - graphOrigin.x) % (unitLength * scaleInterval) == 0 && x !== graphOrigin.x) {
      if (showScaleNumbers)
        myCanvas.drawText((x - graphOrigin.x) / unitLength, x, graphOrigin.y - tickLength, "black", true, 14, "bold");
      myCanvas.drawLine(x, graphOrigin.y - tickLength / 2, x, graphOrigin.y + tickLength / 2, altScaleColour, 1);
    } else if (((x - graphOrigin.x) / unitLength) % drawnTicks === 0)
      myCanvas.drawLine(x, graphOrigin.y - tickLength / 2, x, graphOrigin.y + tickLength / 2, scaleColour, 1);
  }

  for (let x = graphOrigin.x - unitLength; x > 0; x -= unitLength) { // negative
    if ((x - graphOrigin.x) % (unitLength * scaleInterval) == 0 && x !== graphOrigin.x) {
      if (showScaleNumbers)
        myCanvas.drawText((x - graphOrigin.x) / unitLength, x, graphOrigin.y - tickLength, "black", true, 14, "bold");
      myCanvas.drawLine(x, graphOrigin.y - tickLength / 2, x, graphOrigin.y + tickLength / 2, altScaleColour, 1);
    } else if (((x - graphOrigin.x) / unitLength) % drawnTicks === 0)
      myCanvas.drawLine(x, graphOrigin.y - tickLength / 2, x, graphOrigin.y + tickLength / 2, scaleColour, 1);
  }

  // y axis

  for (let y = graphOrigin.y + unitLength; y < myCanvas.canvas.height; y += unitLength) { // negative
    if ((y - graphOrigin.y) % (unitLength * scaleInterval) == 0 && y !== graphOrigin.y) {
      if (showScaleNumbers)
        myCanvas.drawText(-(y - graphOrigin.y) / unitLength, graphOrigin.x + tickLength * 2 + 4, y + 4, "black", true, 14, "bold");
      myCanvas.drawLine(graphOrigin.x - tickLength / 2, y, graphOrigin.x + tickLength / 2, y, altScaleColour, 1);
    } else if (((y - graphOrigin.y) / unitLength) % drawnTicks === 0)
      myCanvas.drawLine(graphOrigin.x - tickLength / 2, y, graphOrigin.x + tickLength / 2, y, scaleColour, 1);
  }

  for (let y = graphOrigin.y - unitLength; y > 0; y -= unitLength) { // positive
    if ((y - graphOrigin.y) % (unitLength * scaleInterval) == 0 && y !== graphOrigin.y) {
      if (showScaleNumbers)
        myCanvas.drawText(-(y - graphOrigin.y) / unitLength, graphOrigin.x + tickLength * 2, y + 4, "black", true, 14, "bold");
      myCanvas.drawLine(graphOrigin.x - tickLength / 2, y, graphOrigin.x + tickLength / 2, y, altScaleColour, 1);
    } else if (((y - graphOrigin.y) / unitLength) % drawnTicks === 0)
      myCanvas.drawLine(graphOrigin.x - tickLength / 2, y, graphOrigin.x + tickLength / 2, y, scaleColour, 1);
  }

  // z axis 

  // where z is iterator

  for (let z = 1; z < (myCanvas.canvas.width / Math.cos(zAxis.angle) / 2) / unitLength; z++) { // negative (looks to be in q1)
    let zScalePoint = { x: (unitLength) * Math.cos(zAxis.angle), y: (unitLength) * Math.sin(zAxis.angle) };

    if (z % drawnTicks !== 0) // only draw certain ticks
      continue;

    let c = scaleColour;
    if (z % scaleInterval == 0) // make bold
      c = altScaleColour;


    myCanvas.drawLine(graphOrigin.x + z * zScalePoint.x - ((tickLength / 2) * Math.sin(zAxis.angle)),
      graphOrigin.y - z * zScalePoint.y - ((tickLength / 2) * Math.cos(zAxis.angle)),
      graphOrigin.x + z * zScalePoint.x + ((tickLength / 2) * Math.sin(zAxis.angle)),
      graphOrigin.y - z * zScalePoint.y + ((tickLength / 2) * Math.cos(zAxis.angle)), c, 1); // scale marker
  }

  for (let z = -1; z > (-myCanvas.canvas.width / Math.cos(zAxis.angle) / 2) / unitLength; z--) { // positive (looks to be in q3)
    let zScalePoint = { x: (unitLength) * Math.cos(zAxis.angle), y: (unitLength) * Math.sin(zAxis.angle) };

    if (z % drawnTicks !== 0) // only draw certain ticks
      continue;

    let c = scaleColour;
    if (z % scaleInterval == 0)
      c = altScaleColour;


    myCanvas.drawLine(graphOrigin.x + z * zScalePoint.x - ((tickLength / 2) * Math.sin(zAxis.angle)),
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

function getDotProduct(a: Vector, b: Vector): number {
  let x = a.components.x * b.components.x;
  let y = a.components.y * b.components.y;
  let z = a.components.z * b.components.z;

  return x + y + z;
}

/**
 * Gets the scalar projection of a on b
 * @param {Vector} a Vector a
 * @param {Vector} b Vector b
 */

function getScalarProjection(a: Vector, b: Vector) {
  return Math.abs(getDotProduct(a, b) / b.magnitude);
}

/**
 * Gets the cross product of two vectors, then adds it to the vectors array
 * 
 * @param {Vector} a The first vector to multiply
 * @param {Vector} b The second vector to multiply
 * 
 * @returns {Vector} The cross product of a and b
 */

function makeCrossProduct(a: Vector, b: Vector, createVector: boolean): Vector | void {
  let x = a.components.y * b.components.z - a.components.z * b.components.y;
  let y = a.components.z * b.components.x - a.components.x * b.components.z;
  let z = a.components.x * b.components.y - a.components.y * b.components.x;

  if (createVector)
    return newVector(0, 0, 0, x, y, z, null, VECTOR_WIDTH);
  else
    return new Vector(0, 0, 0, x, y, z, "#000000", VECTOR_WIDTH);
}

/**
 * Gets the vector projection of a on b, then adds it to the vectors array
 * @param {Vector} a Vector a
 * @param {Vector} b Vector b
 */

function makeVectorProjection(a: Vector, b: Vector): void {
  let multiplier = Math.round((getScalarProjection(a, b) / b.magnitude) * 1000) / 1000;

  newVector(0, 0, 0, b.components.x * multiplier, b.components.y * multiplier, b.components.z * multiplier, null, VECTOR_WIDTH);
}


/**
 * Collects input
 */

function getIn() { }

/**
 * Makes a Vector object and adds it to the vectors array
 */

function newVector(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, colour?: string, width?: number) {
  if (colour == undefined)
    colour = COLOURS[infoTabs % COLOURS.length];

  vectors[vectors.length] = new Vector(x1, y1, z1, x2, y2, z2, colour, width);
  buildInfo(vectors[vectors.length - 1]);
}

/**
 * Clears, redraws the canvas
 */

function redraw(): void {
  myCanvas.clear();

  let c = myCanvas;

  // draw axes

  c.drawLine(0, graphOrigin.y, c.canvas.width, graphOrigin.y, "#000000", AXIS_WIDTH);
  c.drawLine(graphOrigin.x, 0, graphOrigin.x, c.canvas.height, "#000000", AXIS_WIDTH);
  c.drawLine(0, graphOrigin.y + zAxis.components.y, myCanvas.canvas.width, graphOrigin.y - zAxis.components.y, "#000000", AXIS_WIDTH); // z axis
  drawScale();

  // draw vectors

  for (let i = 0; i < vectors.length; i++)
    vectors[i].draw();
}

function resizeCanvas(): void {
  // canvas

  myCanvas.canvas.width = document.getElementById("main").getBoundingClientRect().width - document.getElementById("controls").getBoundingClientRect().width;
  myCanvas.canvas.height = document.body.clientHeight - 64;

  // controls

  document.getElementById("vectorTabs").style.maxHeight = ""
    + (document.getElementById("controls").getBoundingClientRect().height
      - document.getElementById("calculations").getBoundingClientRect().height - 50 - 25);

  // scale

  setScale(numTicks);
}

/**
 * Changes the size of the unitLength, then updates vector cosmetic locations accordingly
 * @param {*} newNumTicks 
 */

function setScale(newNumTicks: number): void {
  if (newNumTicks < 1)
    return;

  unitLength = Math.round(myCanvas.canvas.width / newNumTicks);
  if (unitLength === 1) {
    unitLength = 2;
    console.log("zoom limit reached")
    return;
  }

  numTicks = newNumTicks;

  if (numTicks / drawnTicks > 60) // lowering number of ticks onscreen
    drawnTicks = Math.ceil(numTicks / 50);

  if (numTicks / drawnTicks < 40 && drawnTicks > 1) // lowering number of ticks onscreen
    drawnTicks = Math.floor(numTicks / 50);

  scaleInterval = drawnTicks * 5;

  for (let v in vectors)
    vectors[v].setCosmetics();
}

/**
 * Makes a vector visible or invisible and changes its infoTab accordingly. 
 * 
 * @param {*} el the infoTab
 * @param {*} visible true if the vector is to be visible, false if not
 */

function setVectorVisibility(el): void {
  let vector;

  for (let i = 0; i < vectors.length; i++) { // finding corresponding vector
    if (vectors[i].infoTab == el.id.substring(7))
      vector = vectors[i]; // passed by reference
  }

  vector.isVisible = !vector.isVisible;

  if (vector.isVisible) {
    console.log("now visible");
    el.children[0].style.border = "2px solid" + vector.colour;
    el.children[0].style.backgroundColor = vector.colour;
  } else {
    console.log("now invisible");
    el.children[0].style.border = "2px solid " + vector.colour;
    el.children[0].style.backgroundColor = "";
  }

}

/**
 * Updates vector data based on user input
 */

function updateVectors() {
  for (let i = 0; i < vectors.length; i++) {
    let tab = document.getElementById("infoTab" + vectors[i].infoTab);
    // @ts-ignore
    let data = (tab.children[1].children[0].children as HTMLInputElement[]);

    vectors[i].setComponents(
      parseFloat(data[0].value),
      parseFloat(data[1].value),
      parseFloat(data[2].value));
  }
}

interface Vector {
  graphOrigin: {
    x: number,
    y: number,
    z: number
  },
  components: {
    x: number,
    y: number,
    z: number
  },
  cosmeticgraphOrigin: {
    x: number,
    y: number,
    z: number
  },
  cosmeticComponents: {
    x: number,
    y: number,
    z: number
  },
  magnitude: number,
  colour: string,
  lineWidth: number,
  isVisible: boolean,
  angle2d: number,
  infoTab: number,
  setCosmetics: () => void,
  draw: () => void,
  setComponents: (x: number, y: number, z: number) => void,
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

function Vector(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, colour: string, width: number): void {
  this.graphOrigin = { x: x1, y: y1, z: z1 }; // graphOrigin of the vector
  this.components = { x: x2, y: y2, z: z2 }; // endpoint of the vector
  this.magnitude = Math.sqrt(Math.pow(x2, 2) + Math.pow(y2, 2) + Math.pow(z2, 2));

  this.colour = colour;
  this.lineWidth = width;
  this.isVisible = true;

  this.cosmeticgraphOrigin = null;
  this.cosmeticComponents = null;

  this.angle2d;

  // visual coordinate setting

  this.setCosmetics = function () {
    let k = { // unit vector along the positive z axis, [0,0,1]
      x: -unitLength * Math.cos(zAxis.angle),
      y: unitLength * Math.sin(zAxis.angle)
    }

    this.cosmeticgraphOrigin = {
      x: this.graphOrigin.x * unitLength + graphOrigin.x + (k.x * this.graphOrigin.z),
      y: -this.graphOrigin.y * unitLength + graphOrigin.y + (k.y * this.graphOrigin.z)
    }
    this.cosmeticComponents = { // visual placement of the vector on the [2] screen
      x: this.components.x * unitLength + graphOrigin.x + this.graphOrigin.x * unitLength + (k.x * this.components.z) - this.cosmeticgraphOrigin.x,
      y: -this.components.y * unitLength + graphOrigin.y - this.graphOrigin.y * unitLength + (k.y * this.components.z) - this.cosmeticgraphOrigin.y
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

  this.setCosmetics(); // called here

  this.infoTab = -1;

  this.draw = function (this: Vector) {
    if (!this.isVisible)
      return;

    myCanvas.drawLine(this.cosmeticgraphOrigin.x, this.cosmeticgraphOrigin.y, this.cosmeticgraphOrigin.x + this.cosmeticComponents.x, this.cosmeticgraphOrigin.y + this.cosmeticComponents.y, this.colour, VECTOR_WIDTH);
    drawArrow(this);
  }

  /**
   * Resets the components of the Vector with new data, then updates the cosmetics
   */

  this.setComponents = function (x: number, y: number, z: number) {
    this.components.x = x;
    this.components.y = y;
    this.components.z = z;
    this.magnitude = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
    this.setCosmetics();
  }
}

function Vector2D(x1: number, y1: number, x2: number, y2: number, colour: string, width: number) {
  return new Vector(x1, y1, 0, x2, y2, 0, colour, width);
}

init(true, true);
