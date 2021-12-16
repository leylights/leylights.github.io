import { cws } from "../cws.js";;

/**
 * EM Wave Generator
 * 
 * This program animates an em wave.
 * 
 * Cole Stanley
 * 
 * Start Date: February 20th, 2020
 * Proposal Deadline: March 5th, 2020
 * Beta Deadline: April 23rd, 2020
 * End Date: Saturday, April 12th, 2020
 * Deadline: May 14th, 2020
 */

// Constants

const SHOW_AXIS_NAMES = false;
const Z_AXIS_LEN_ADDITION = 100;

const PRESETS = [
  { // Diagram as given
    AXIS_MULTIPLIER: 1.5,
    BACK_AXES: false,
    BLUE_AMPLITUDE: 145,
    GRIDLINES: 3,
    NAME: "SPH 4U Diagram",
    VECTOR_SPACING: 30,
    WAVES: 3,
    X_ANGLE: 144,
    X_LENGTH: 85,
    Z_ANGLE: 105,
    Z_LENGTH: 720
  },
  { // Thin
    AXIS_MULTIPLIER: 1.5,
    BACK_AXES: true,
    BLUE_AMPLITUDE: 130,
    GRIDLINES: 4,
    NAME: "Thin",
    VECTOR_SPACING: 30,
    WAVES: 4,
    X_ANGLE: 110,
    X_LENGTH: 50,
    Z_ANGLE: 110,
    Z_LENGTH: 600
  },
  { // thirds
    AXIS_MULTIPLIER: 1.5,
    BACK_AXES: true,
    BLUE_AMPLITUDE: 120,
    GRIDLINES: 4,
    NAME: "Thirds",
    VECTOR_SPACING: 30,
    WAVES: 4,
    X_ANGLE: 120,
    X_LENGTH: 90,
    Z_ANGLE: 120,
    Z_LENGTH: 600
  }
]

// the customizable preset

var customPreset = Object.assign({}, PRESETS[PRESETS.length - 1]);
customPreset.NAME = "Custom";

const ARROWCAP = { w: 6, h: 15 }

// Program-specific variables

var graphOrigin = {
  x: 0,
  y: 0
}

var preset = PRESETS[PRESETS.length - 1];
var angles: {
  x?: number;
  y?: number;
  z?: number;
};

var redWave = {
  amplitude: -preset.BLUE_AMPLITUDE,
  phaseShift: 0,
  colour: "red",
  show: true,
  bothHalves: true,
  vectors: true
};

var blueWave = {
  amplitude: preset.BLUE_AMPLITUDE,
  phaseShift: 0,
  colour: "blue",
  show: true,
  bothHalves: true,
  vectors: true
};

var showGridlines: boolean = true;
var showNegativeAxes: boolean;

//// axes

var xAxis;
var yAxis;
var zAxis;

var reverseXAxis;
var reverseYAxis;

var waveSpeed = 1;
var lastWaveChange = 0;
var lastInput = 0;
var inputType = "waveSpeed";

var blueOffsets = {
  x: 0,
  y: 0
}

// General Canvas Variables

var animator: number;
var now = Date.now();
var usePointer = false;

var switchState = 0; // 0 = none; 1 = white; -1 = black;
var bgC = 255;
var bgSwitchTime = 0;

var doResize = false;
var lastResize = now;
var lastMenuSize = document.getElementById("hamMenu").getBoundingClientRect().width;

var consolesLogged = false;

var myCanvas = {
  canvas: document.createElement("canvas"),
  context: null,

  keys: null,
  mouseX: null,
  mouseY: null,
  clickTime: null,
  recentClick: null,
  clickLeft: null,

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

  stop: function () {
    window.cancelAnimationFrame(animator);
    this.clear();
  },

  clear: function () {
    cws.fillRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height,
      "rgb(" + bgC + "," + bgC + "," + bgC + ")",
      myCanvas.context
    );
  }
};

function init(firstTime?: boolean) {
  myCanvas.start();

  // set origin

  let diagramW = (preset.Z_LENGTH + Z_AXIS_LEN_ADDITION - preset.X_LENGTH * preset.AXIS_MULTIPLIER);
  let diagramH = (ARROWCAP.h / 2)
    + preset.BLUE_AMPLITUDE * preset.AXIS_MULTIPLIER
    + preset.Z_LENGTH * Math.tan((preset.Z_ANGLE - 90) * Math.PI / 180)
    + preset.BLUE_AMPLITUDE;

  graphOrigin.x = Math.round((myCanvas.canvas.width - document.getElementById("controls").getBoundingClientRect().width * 0) / 2) - diagramW / 2;
  if (graphOrigin.x < 50)
    graphOrigin.x = 50;

  graphOrigin.y = Math.round(myCanvas.canvas.height / 2) - diagramH / 2
    + (ARROWCAP.h / 2)
    + preset.BLUE_AMPLITUDE * preset.AXIS_MULTIPLIER;

  // set axes

  angles = { x: preset.X_ANGLE, z: preset.Z_ANGLE };
  blueWave.amplitude = preset.BLUE_AMPLITUDE;
  redWave.amplitude = -preset.BLUE_AMPLITUDE;
  reAngle();
  showNegativeAxes = preset.BACK_AXES;

  /* Customization Tab of Controls */

  (document.getElementById("axisStretchInput") as HTMLInputElement).placeholder = "" + customPreset.AXIS_MULTIPLIER * 100;
  (document.getElementById("electricAmplitudeText") as HTMLInputElement).placeholder = "" + customPreset.BLUE_AMPLITUDE;
  (document.getElementById("backAxesInput") as HTMLInputElement).checked = customPreset.BACK_AXES;
  (document.getElementById("gridlinesText") as HTMLInputElement).placeholder = "" + customPreset.GRIDLINES;
  (document.getElementById("vectorText") as HTMLInputElement).placeholder = "" + customPreset.VECTOR_SPACING;
  (document.getElementById("xAngleInput") as HTMLInputElement).placeholder = "" + customPreset.X_ANGLE;
  (document.getElementById("xLenInput") as HTMLInputElement).placeholder = "" + customPreset.X_LENGTH;
  (document.getElementById("wavesText") as HTMLInputElement).placeholder = "" + Math.round((customPreset.Z_LENGTH / customPreset.WAVES) * 100) / 100;
  (document.getElementById("zAngleInput") as HTMLInputElement).placeholder = "" + customPreset.Z_ANGLE;
  (document.getElementById("zLenInput") as HTMLInputElement).placeholder = "" + Math.round(customPreset.Z_LENGTH / Math.cos((customPreset.Z_ANGLE - 90) / 180 * Math.PI));

  if (firstTime) {
    generatePresetButtons();

    window.addEventListener("resize", () => {
      doResize = true;
      resizeControlsBox();
    });

    (document.getElementById("waveSpeedInput") as HTMLInputElement).value = "" + waveSpeed;

    cws.getInputElementById("axisStretchInput").value = "" + customPreset.AXIS_MULTIPLIER * 100;
    cws.getInputElementById("electricAmplitudeText").value = "" + customPreset.BLUE_AMPLITUDE;
    cws.getInputElementById("gridlinesText").value = "" + customPreset.GRIDLINES;
    cws.getInputElementById("vectorText").value = "" + customPreset.VECTOR_SPACING;
    cws.getInputElementById("xAngleInput").value = "" + customPreset.X_ANGLE;
    cws.getInputElementById("xLenInput").value = "" + customPreset.X_LENGTH;
    cws.getInputElementById("wavesText").value = "" + Math.round((customPreset.Z_LENGTH / customPreset.WAVES) * 100) / 100;
    cws.getInputElementById("zAngleInput").value = "" + customPreset.Z_ANGLE;
    cws.getInputElementById("zLenInput").value = "" + Math.round(customPreset.Z_LENGTH / Math.cos((customPreset.Z_ANGLE - 90) / 180 * Math.PI));

    document.getElementById("general-button").addEventListener("click", () => {
      handleDropdownOpener(document.getElementById("general-button"));
    });
    document.getElementById("electric-field-dropdown").addEventListener("click", () => {
      handleDropdownOpener(document.getElementById("electric-field-dropdown"));
    });
    document.getElementById("magnetic-field-dropdown").addEventListener("click", () => {
      handleDropdownOpener(document.getElementById("magnetic-field-dropdown"));
    });
    document.getElementById("preset-selector-dropdown").addEventListener("click", () => {
      handleDropdownOpener(document.getElementById("preset-selector-dropdown"));
    });

    document.getElementById("hide-gridlines-button").addEventListener("click", () => {
      let me = document.getElementById("hide-gridlines-button");
      showGridlines = !showGridlines;

      if (showGridlines) me.innerHTML = 'Hide gridlines';
      else me.innerHTML = 'Show gridlines'
    });

    document.getElementById("waveSpeedInput").addEventListener("blur", () => {
      setNumFromInput(document.getElementById("waveSpeedInput"), 'waveSpeed')
    });

    document.getElementById("electric-hide-vectors").addEventListener("click", () => {
      let me = document.getElementById("electric-hide-vectors");
      blueWave.vectors = !blueWave.vectors;
      if (blueWave.vectors)
        me.innerHTML = 'Hide vectors';
      else
        me.innerHTML = 'Show vectors';
    });

    document.getElementById("electric-hide-wave").addEventListener("click", () => {
      let me = document.getElementById("electric-hide-wave");

      blueWave.show = !blueWave.show;
      if (blueWave.show) me.innerHTML = 'Hide wave';
      else me.innerHTML = 'Show wave'
    });

    document.getElementById("electric-half-wave").addEventListener("click", () => {
      let me = document.getElementById("electric-half-wave");

      blueWave.bothHalves = !blueWave.bothHalves;
      if (blueWave.bothHalves) me.innerHTML = 'Display half wave';
      else me.innerHTML = 'Display full wave'
    });

    document.getElementById("magnetic-hide-vectors").addEventListener("click", () => {
      let me = document.getElementById("magnetic-hide-vectors");
      redWave.vectors = !redWave.vectors;
      if (redWave.vectors)
        me.innerHTML = 'Hide vectors';
      else
        me.innerHTML = 'Show vectors';
    });

    document.getElementById("magnetic-hide-wave").addEventListener("click", () => {
      let me = document.getElementById("magnetic-hide-wave");

      redWave.show = !redWave.show;
      if (redWave.show) me.innerHTML = 'Hide wave';
      else me.innerHTML = 'Show wave'
    });

    document.getElementById("magnetic-half-wave").addEventListener("click", () => {
      let me = document.getElementById("magnetic-half-wave");

      redWave.bothHalves = !redWave.bothHalves;
      if (redWave.bothHalves) me.innerHTML = 'Display half wave';
      else me.innerHTML = 'Display full wave'
    });


    document.getElementById("customizer-dropdown").addEventListener("click", () => {
      let me: HTMLElement = document.getElementById("customizer-dropdown");

      for (let i = 1; i < me.parentElement.children.length; i++) {
        if ((me.parentElement.children[i] as HTMLElement).style.display == 'none') {
          (me.parentElement.children[i] as HTMLElement).style.display = 'table';
          (me.parentElement.children[i - 1] as HTMLElement).style.borderBottom = '1px #555555 solid'
        } else {
          (me.parentElement.children[i] as HTMLElement).style.display = 'none';
          (me.parentElement.children[i - 1] as HTMLElement).style.borderBottom = 'none';
        }
      }
    });

    document.getElementById("controlsOpener").addEventListener("click", () => { console.log("fired"); controlsToggle(); });
    document.getElementById("applyCustomizations").addEventListener("click", () => { checkCustomInput() });

    resizeControlsBox();

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
  } else if (lastMenuSize !== document.getElementById("hamMenu").getBoundingClientRect().width) {
    resizeCanvas();
    lastMenuSize = document.getElementById("hamMenu").getBoundingClientRect().width;
  }

  if (now > lastResize && lastResize > 0) {
    init(false);
    lastResize = -1;
  }

  // step 4: draw

  redraw();

  myCanvas.canvas.style.backgroundColor = document.getElementById(
    "main"
  ).style.backgroundColor;

  if (parseInt(document.getElementById("canvasBox").style.paddingTop) !== 0 && document.getElementById("canvasBox").style.paddingTop !== "") {
    document.getElementById("canvasBox").style.paddingTop = "0px";
  }

  // step 5: input

  getIn();

  // step 6: work

  blueWave.phaseShift += waveSpeed;
  redWave.phaseShift += waveSpeed;

  // canvas stuff

  if (usePointer) myCanvas.canvas.style.cursor = "pointer";
  else myCanvas.canvas.style.cursor = "default";

  myCanvas.recentClick = false;
  usePointer = false;
  consolesLogged = true;
  animator = window.requestAnimationFrame(main);
}

/**
 * Checks for errors in the custom preset input
 */

function checkCustomInput() {

  // axis stretch
  setNumFromInput(document.getElementById("axisStretchInput"), "axis");

  // back axes
  customPreset.BACK_AXES = cws.getInputElementById("backAxesInput").checked;

  // gridlines
  setNumFromInput(document.getElementById("gridlinesText"), "gridlines");

  // vectors
  setNumFromInput(document.getElementById("vectorText"), "vectors");

  // x-axis angle
  setNumFromInput(document.getElementById("xAngleInput"), "x-angle");

  // x-axis length
  setNumFromInput(document.getElementById("xLenInput"), "x-length");

  // y-axis length
  setNumFromInput(document.getElementById("electricAmplitudeText"), "y-height");

  // z-axis angle
  setNumFromInput(document.getElementById("zAngleInput"), "z-angle");

  // z-axis length
  setNumFromInput(document.getElementById("zLenInput"), "z-length");

  // waves
  setNumFromInput(document.getElementById("wavesText"), "waves");

  preset = customPreset;

  // change placeholders

  cws.getInputElementById("axisStretchInput").placeholder = "" + customPreset.AXIS_MULTIPLIER * 100;
  cws.getInputElementById("electricAmplitudeText").placeholder = "" + customPreset.BLUE_AMPLITUDE;
  cws.getInputElementById("backAxesInput").checked = customPreset.BACK_AXES;
  cws.getInputElementById("gridlinesText").placeholder = "" + customPreset.GRIDLINES;
  cws.getInputElementById("vectorText").placeholder = "" + customPreset.VECTOR_SPACING;
  cws.getInputElementById("xAngleInput").placeholder = "" + customPreset.X_ANGLE;
  cws.getInputElementById("xLenInput").placeholder = "" + customPreset.X_LENGTH;
  cws.getInputElementById("wavesText").placeholder = "" + customPreset.WAVES;
  cws.getInputElementById("zAngleInput").placeholder = "" + customPreset.Z_ANGLE;
  cws.getInputElementById("zLenInput").placeholder = "" + customPreset.Z_LENGTH;

  // reinitialize

  init(false);
}

/**
 * Toggles the controls bar open or closed
 * 
 * @param {*} open True to open, false to close
 */

function controlsToggle(open?: boolean) {
  let controls = document.getElementById("controls");
  let w = controls.getBoundingClientRect().width - parseInt(window.getComputedStyle(controls).borderRightWidth);
  let fullWidth = document.getElementById("main").getBoundingClientRect().width * 0.15;
  if (fullWidth < 200)
    fullWidth = 200;

  if (open == undefined) {
    if (w == 0)
      open = true;
    else if (controls.style.width == "")
      open = false;
    else {
      return;
    }
  }

  let speed = 12;
  if (!open)
    speed *= -1;

  // the recursive loop
  setTimeout(function () {
    // change the width
    w += speed;

    // set the width
    controls.style.minWidth = w + "px";
    controls.style.width = w + "px";

    // determining whether to end, if not, recurse
    if (!open && w <= 0) {
      controls.style.width = "0px";
      controls.style.minWidth = "0px";
      init(false);
    } else if (open && w >= fullWidth + parseInt(window.getComputedStyle(controls).borderRightWidth)) {
      controls.style.width = "";
      controls.style.minWidth = "";
      init(false);
    } else {
      init(false);
      controlsToggle(open);
    }
  }, 16);
}

/**
 * Draws an arrow at the end of a line
 * @param {Line} line The line to cap 
 * @param {number} angle the angle from the vertical to draw the arrow at, in DEGREES
 * @param {boolean} bothEnds Boolean value: True to draw an arrow at both ends.  If so, do not fill the x and y parameters
 * @param {number} angle the x of the arrow, if it differs from the endX value of the line.
 * @param {number} angle the y of the arrow, if it differs from the endY value of the line.
 */

function drawArrowCap(line, angle, bothEnds, x?, y?) {
  let ax, ay;
  let w = ARROWCAP.w;
  let h = ARROWCAP.h;

  if (typeof x === "undefined") {
    ax = line.cosmeticEndX;
    ay = line.cosmeticEndY;
  } else {
    ax = x;
    ay = y;
  }

  cws.fillTriangle(ax, ay, w, h, line.colour, true, angle, myCanvas.context);
  if (bothEnds)
    cws.fillTriangle(line.startX, line.startY, w, h, line.colour, true, 180 - angle, myCanvas.context);
}

function drawGridlines() {

  if (!showGridlines)
    return;

  let c = myCanvas.context;
  let len = zAxis.endX - zAxis.startX;

  // sine variables

  c.beginPath();
  c.lineWidth = "1";
  c.strokeStyle = "grey";

  // draws the gridlines

  for (let x = (zAxis.endX - zAxis.startX) / preset.GRIDLINES; x <= len; x += (zAxis.endX - zAxis.startX) / preset.GRIDLINES) {
    let startPoint = { x: x + zAxis.startX, y: getYComponent(x) };

    // y-axis

    c.moveTo(startPoint.x, startPoint.y);
    c.lineTo(
      Math.round(x + zAxis.startX),
      Math.round(getYComponent(x) + (yAxis.endY - yAxis.startY) * preset.AXIS_MULTIPLIER)
    )
    c.stroke();
    c.beginPath();

    // x-axis

    c.moveTo(startPoint.x, startPoint.y);
    c.lineTo(
      Math.round(x + zAxis.startX + (xAxis.endX - xAxis.startX) * 1),
      Math.round(getYComponent(x) + (xAxis.endY - xAxis.startY) * 1)
    )
    c.stroke();
    c.beginPath();
  }

  c.stroke();
  c.beginPath();
}

/**
 * Draws the sine wave to the canvas
 * 
 * Steps:
 *  1) get sine value
 *  2) fix to z-axis
 *  3) tilt
 */

function drawSine(axis, wave) {
  let c = myCanvas.context;
  let len = axis.endX - axis.startX;

  let drawingLine = true;

  // sine variables

  let period = (2 * Math.PI) / (len / (preset.WAVES / 2));

  c.beginPath();
  c.lineWidth = "2";
  c.strokeStyle = wave.colour;

  // removes the wave from the far side of the z-axis

  if (wave.bothHalves === false && getYComponent(0) < zAxis.startY)
    c.moveTo(axis.startX, -wave.amplitude * Math.sin(period * (-wave.phaseShift)) + getYComponent(0));

  // draws the wave

  for (let x = 0; x <= len; x++) {
    let waveY = -wave.amplitude * Math.sin(period * (x - wave.phaseShift));
    if (drawingLine && wave.bothHalves === false && ((waveY > 0 && wave.colour == blueWave.colour) || (waveY <= 0 && wave.colour == redWave.colour))) {
      drawingLine = false;
      c.stroke();
      continue;
    } else if (!drawingLine) {
      drawingLine = true;
      c.beginPath();
    }

    let finalX = x + axis.startX;
    let finalY = waveY + getYComponent(x);
    if (wave.colour == redWave.colour) {
      finalX += getXOffset(waveY);
      finalY += getYOffset(waveY);
    }

    c.lineTo(
      Math.round(finalX),
      Math.round(finalY)
    )
  }

  c.stroke();
  c.beginPath();
}

/**
 * Draws the vectors
 */

function drawVectors(axis, wave) {

  if (!wave.vectors)
    return;

  let c = myCanvas.context;
  let len = axis.endX - axis.startX;

  // sine variables

  let period = (2 * Math.PI) / (len / (preset.WAVES / 2));

  c.beginPath();
  c.lineWidth = "1";
  c.strokeStyle = wave.colour;

  // draws the wave

  let startPt = preset.VECTOR_SPACING;

  // draw vectors at the start of the wave
  if (!showNegativeAxes && ((wave.colour == redWave.colour && -wave.amplitude * Math.sin(period * (0 - wave.phaseShift)) < 0) || (wave.colour == blueWave.colour && -wave.amplitude * Math.sin(period * (0 - wave.phaseShift)) > 0)))
    startPt = 0;

  for (let x = startPt; x <= len; x += preset.VECTOR_SPACING) {
    let waveY = -wave.amplitude * Math.sin(period * (x - wave.phaseShift));

    let finalX = x + axis.startX;
    let finalY = waveY + getYComponent(x);

    let startPoint = { x: finalX, y: getYComponent(x) };

    if (wave.colour == redWave.colour) {
      finalX += getXOffset(waveY);
      finalY += getYOffset(waveY);
      if (wave.bothHalves === false && waveY < 0) {
        continue;
      }
    } else if (wave.bothHalves === false && waveY > 0) {
      continue;
    }

    c.moveTo(startPoint.x, startPoint.y);
    c.lineTo(
      Math.round(finalX),
      Math.round(finalY)
    )
    c.stroke();
    c.beginPath();

    // arrow drawing

    let angle = 0;
    let arrow = { w: 4, h: 10 };
    let arrowOffsets = { x: 0, y: 0 };

    // angle of arrow

    if (wave.colour == blueWave.colour) {
      if (waveY < -arrow.h)
        angle = 0;
      else if (waveY > arrow.h)
        angle = 180;
      else
        angle = -1;
      arrowOffsets.y = arrow.h / 2 * Math.cos(cws.toRadians(angle));
    } else {
      if (waveY < -arrow.h)
        angle = 180 - preset.X_ANGLE;
      else if (waveY > arrow.h)
        angle = 360 - preset.X_ANGLE;
      else
        angle = -1;
      arrowOffsets.x = -arrow.h / 2 * Math.sin(cws.toRadians(angle));
      arrowOffsets.y = arrow.h / 2 * Math.cos(cws.toRadians(angle));
    }

    // draws the arrow

    if (angle >= 0) { // do not draw if too close to axis (based on earlier setting of angle = -1)

      if (wave.colour == redWave.colour) { // ensuring no wave overlap

        // calculating the locations of the bottom-right corner of the triangle 
        let bottomRightCornerAngle = Math.atan((arrow.h / 2) / (arrow.w / 2)) / (2 * Math.PI) * 360;
        let bottomCornerLen = cws.pythagorean(arrow.w / 2, arrow.h / 2, null);
        let bottomRight = { x: finalX + arrowOffsets.x + Math.round((bottomCornerLen) * Math.cos(cws.toRadians(bottomRightCornerAngle + angle))), y: finalY + arrowOffsets.y + Math.round((bottomCornerLen) * Math.sin(cws.toRadians(bottomRightCornerAngle + angle))) };

        // determining if overlap is occurring
        if (angle > 180 && getYComponent(bottomRight.x - graphOrigin.x) > bottomRight.y) { // SW arrows
          continue;
        } else if (angle < 180 && getYComponent(bottomRight.x - graphOrigin.x) < bottomRight.y) { // NE arrows
          continue;
        }
      }
      cws.fillTriangle(finalX + arrowOffsets.x, finalY + arrowOffsets.y, arrow.w, arrow.h, wave.colour, true, angle, myCanvas.context);
    }
  }

  c.stroke();
  c.beginPath();
}

/**
 * Finds the angle between line OY and line OZ
 * 
 * @param {*} useX Find the 
 */

function findOriginAngle(useX) {

  let axis;

  if (useX)
    axis = xAxis;
  else
    axis = zAxis;

  // notation: line variables represent the magnitude of their line vectors

  // 1) get length of line YZ with pythagorean theorum

  let lineYZx = Math.abs(Math.round(axis.endX - axis.startX));
  let lineYZy = Math.abs(Math.round(axis.endY - (axis.startY - blueWave.amplitude)));

  // YZ = |sqrt(YZx^2 + YZy^2)|

  let lineYZ = Math.sqrt(Math.pow(lineYZx, 2) + Math.pow(lineYZy, 2));

  // 2) get length of z axis with pythagorean theorum

  let lineOZx = Math.abs(Math.round(axis.endX - axis.startX));
  let lineOZy = Math.abs(Math.round(axis.endY - axis.startY));

  // OZ = |sqrt(OZx^2 + OZy^2)|

  let lineOZ = Math.sqrt(Math.pow(lineOZx, 2) + Math.pow(lineOZy, 2));

  // 3) get line OY 

  let lineOY = Math.abs(Math.round(axis.startY - (axis.startY - blueWave.amplitude))) // just gets -redwave.amplitude; expanded for clarity

  // 3) get angle YOZ with cosine law

  let angleYOZ = Math.acos(
    (Math.pow(lineYZ, 2) - Math.pow(lineOZ, 2) - Math.pow(lineOY, 2))
    /
    (-2 * lineOZ * lineOY)
  );

  // convert angle YOZ to degrees

  angleYOZ *= (180 / Math.PI);

  return angleYOZ;

}

/**
 * Adds a button to the controls bar for each preset
 */

function generatePresetButtons() {
  let original = document.getElementsByClassName("wavePreset")[0];
  for (let i = 0; i < PRESETS.length; i++) {
    let data = PRESETS[i];

    let newButton = (original.cloneNode(true) as HTMLElement);
    newButton.innerHTML = data.NAME;
    newButton.onclick = function () { preset = PRESETS[i]; init(false); };

    document.getElementById("presetMenu").appendChild(newButton);
  }

  // append custom preset

  let data = customPreset;

  let newButton = (original.cloneNode(true) as HTMLElement);
  newButton.innerHTML = data.NAME;
  newButton.onclick = function () { preset = customPreset; init(false); };

  document.getElementById("presetMenu").appendChild(newButton);
}

/**
 * Gets the equation of the axis
 */

function getAxisEquation(axis) {
  let m = (axis.endY - axis.startY) / (axis.endX - axis.startX);
  let b = axis.startY;
  return { slope: m, yIntercept: b }
}

/**
 * Collects input
 */

function getIn() {

  // key input

  if (myCanvas.keys) {
    switch (inputType) {
      case "waveSpeed":
        if (myCanvas.keys[38] && now > lastWaveChange + 500) {
          waveSpeed++;
          lastWaveChange = now;
        } else if (myCanvas.keys[40] && now > lastWaveChange + 500) {
          waveSpeed--;
          lastWaveChange = now;
        }
        break;
      case "xAngle":
        if (myCanvas.keys[38] && now > lastWaveChange + 50) {
          angles.x++;
          lastWaveChange = now;
          reAngle();
        } else if (myCanvas.keys[40] && now > lastWaveChange + 50) {
          angles.x--;
          lastWaveChange = now;
          reAngle();
        }
        break;
      case "zAngle":
        if (myCanvas.keys[38] && now > lastWaveChange + 50) {
          angles.z++;
          lastWaveChange = now;
          reAngle();
        } else if (myCanvas.keys[40] && now > lastWaveChange + 50) {
          angles.z--;
          lastWaveChange = now;
          reAngle();
        }
        break;
    }

    if (myCanvas.keys[82] && now > lastInput + 500) {
      init(false);
      lastInput = now;
    } else if (myCanvas.keys[88] && now > lastInput + 250) {
      inputType = "xAngle";
      lastInput = now;
    } else if (myCanvas.keys[79] && now > lastInput + 250) {
      inputType = "origin";
      lastInput = now;
    } else if (myCanvas.keys[90] && now > lastInput + 250) {
      inputType = "zAngle";
      lastInput = now;
      // } else if (myCanvas.keys[39] && now > lastWaveChange + 50) {
      //   zAxis.endX += 5;
      //   lastWaveChange = now;
      //   reAngle();
      // } else if (myCanvas.keys[37] && now > lastWaveChange + 50) {
      //   zAxis.endX -= 5;
      //   lastWaveChange = now;
      //   reAngle();
    }
  }

}

/**
 * Gets the displacement of the red wave's maximums (minimums?)
 */

function getBlueWaveTilt() {

  let pointA = { x: xAxis.startX, y: xAxis.startY + blueWave.amplitude };
  let pointB = { x: xAxis.endX, y: xAxis.endY };

  // STEP ONE: X AXIS MAGNITUDE

  blueOffsets.x = pointB.x - pointA.x;
  blueOffsets.y = pointB.y - pointA.y;
}

/**
 * Gets the x offset used to tilt the red wave
 */

function getXOffset(y) {
  let output = -(y / redWave.amplitude) * blueOffsets.x;

  return output;
}

/**
 * Gets the x offset used to tilt the red wave
 */

function getYOffset(y) {
  return -(y / redWave.amplitude) * blueOffsets.y;
}

/**
 * Gets the y modifier of the sine wave, based on the coordinates of the z-axis
 * 
 * NOTE: although not working in the manner intended, it still works
 * 
 * @param {*} x The x-coordinate of the current point of the wave, origin: top left of the canvas
 */

function getYComponent(x) {
  return getAxisEquation(zAxis).slope * x + getAxisEquation(zAxis).yIntercept;
}

function handleDropdownOpener(opener: HTMLElement) {
  for (let i = 1; i < opener.parentElement.children.length; i++) {
    if ((opener.parentElement.children[i] as HTMLElement).style.display == 'none') {
      (opener.parentElement.children[i] as HTMLElement).style.display = 'table';
      (opener.parentElement.children[i - 1] as HTMLElement).style.borderBottom = '1px #555555 solid'
    } else {
      (opener.parentElement.children[i] as HTMLElement).style.display = 'none';
      (opener.parentElement.children[i - 1] as HTMLElement).style.borderBottom = 'none';
    }
  }
}

/**
 * Makes a line object
 * 
 * @param {*} x1 
 * @param {*} y1 
 * @param {*} x2 
 * @param {*} y2 
 * @param {*} w Line Width 
 * @param {*} c Line Colour
 * @param {*} angle The angle the line makes with the origin
 **/

function Line(x1, y1, x2, y2, w, c, angle, lenFixed) {
  this.startX = x1;
  this.startY = y1;
  this.endX = x2;
  this.endY = y2;
  this.cosmeticEndX = this.endX;
  this.cosmeticEndY = this.endY;
  this.lengthIsFixed = lenFixed;

  this.colour = c;
  this.width = w;
  this.angleToOrigin = angle;

  this.m;
  this.b;

  setTimeout(function () {
    getAxisEquation(xAxis).slope;
    xAxis.b = getAxisEquation(xAxis).yIntercept;
  }, 100);

  /**
   * Draws the line
   */

  this.draw = function () {
    myCanvas.context.beginPath();
    myCanvas.context.lineWidth = this.width;
    myCanvas.context.strokeStyle = this.colour;

    myCanvas.context.moveTo(this.startX, this.startY);
    myCanvas.context.lineTo(this.cosmeticEndX, this.cosmeticEndY);
    myCanvas.context.stroke();
  }

  /**
   * Recalculates the position of the line's cosmetic end coordinates
   */

  this.recalcCosmeticEnd = function () {
    this.cosmeticEndX = this.startX + (this.endX - this.startX) * preset.AXIS_MULTIPLIER;
    this.cosmeticEndY = this.startY + (this.endY - this.startY) * preset.AXIS_MULTIPLIER;
  }

  if (!this.lengthIsFixed) this.recalcCosmeticEnd();
}

/**
 * Redraws the angles of the axes
 */

function reAngle() {

  xAxis = new Line(graphOrigin.x, graphOrigin.y, graphOrigin.x - preset.X_LENGTH, graphOrigin.y + preset.X_LENGTH * Math.tan((angles.x - 90) / 180 * Math.PI), 2, "black", angles.x, false);
  yAxis = new Line(graphOrigin.x, graphOrigin.y, graphOrigin.x, graphOrigin.y - preset.BLUE_AMPLITUDE, 2, "black", null, false); // this one remains untouched
  if (now < lastWaveChange + 50) { // USED FOR DEBUGGER Z-LENGTH CHANGES
    let oldLength = zAxis.endX;
    zAxis = new Line(graphOrigin.x, graphOrigin.y, oldLength, graphOrigin.y, 2, "black", angles.z, true);
  } else zAxis = new Line(graphOrigin.x, graphOrigin.y, graphOrigin.x + preset.Z_LENGTH, graphOrigin.y + preset.Z_LENGTH * Math.tan((angles.z - 90) / 180 * Math.PI), 2, "black", angles.z, true);

  // cosmetic axes

  reverseXAxis = Object.assign({}, xAxis);
  reverseXAxis.endX += 2 * preset.X_LENGTH;
  reverseXAxis.endY = reverseXAxis.endY + 2 * (graphOrigin.y - xAxis.endY);
  reverseXAxis.recalcCosmeticEnd();

  reverseYAxis = Object.assign({}, yAxis);
  reverseYAxis.endY += 2 * preset.BLUE_AMPLITUDE;
  reverseYAxis.recalcCosmeticEnd();

  zAxis.cosmeticEndX += Z_AXIS_LEN_ADDITION;
  zAxis.cosmeticEndY += getAxisEquation(zAxis).slope * Z_AXIS_LEN_ADDITION;

  getBlueWaveTilt();
}

/**
 * Clears, redraws the canvas
 */

function redraw() {
  myCanvas.clear();

  let c = myCanvas.context;

  // image underlay

  // c.drawImage(IMAGES[0], 0, 0);

  // y axis

  yAxis.draw();
  drawArrowCap(yAxis, 0, false);

  // blue wave

  if (blueWave.show) {
    drawSine(zAxis, blueWave);
    drawVectors(zAxis, blueWave);
  }

  // red wave

  if (redWave.show) {
    drawSine(zAxis, redWave);
    drawVectors(zAxis, redWave);

    // drawing the blue wave to overlap correctly
    if (blueWave.show && blueWave.bothHalves === true) {
      blueWave.bothHalves = false;
      drawSine(zAxis, blueWave);
      drawVectors(zAxis, blueWave);
      blueWave.bothHalves = true;
    }
  }

  // gridlines

  drawGridlines();

  // x axis
  xAxis.draw();
  drawArrowCap(xAxis, 360 - preset.X_ANGLE, false);

  // z axis

  zAxis.draw();

  // cosmetic axes

  if (showNegativeAxes) {
    reverseXAxis.draw();
    reverseYAxis.draw();
    drawArrowCap(reverseXAxis, 180 - preset.X_ANGLE, false);
    drawArrowCap(reverseYAxis, 180, false);
  }

  drawArrowCap(zAxis, preset.Z_ANGLE, false);

  // letters

  if (SHOW_AXIS_NAMES) {
    cws.drawText("x", Math.round(xAxis.cosmeticEndX * 0.95), Math.round(xAxis.cosmeticEndY * 1.05), "black", true, 16, null, myCanvas.context);
    cws.drawText("y", Math.round(yAxis.cosmeticEndX), Math.round(-ARROWCAP.h / 2 + yAxis.cosmeticEndY * 0.85), "black", true, 16, null, myCanvas.context);
    cws.drawText("z", Math.round(zAxis.cosmeticEndX * 1.02), Math.round(zAxis.cosmeticEndY * 1.02), "black", true, 16, null, myCanvas.context);
  }
}

function resizeCanvas() {
  myCanvas.canvas.width = document.getElementById("main").getBoundingClientRect().width - document.getElementById("controls").getBoundingClientRect().width;
  myCanvas.canvas.height = document.body.clientHeight - 64;
}

/**
 * Verifies validity of input, then sets the appropriate variables
 */

function setNumFromInput(element, targetName) {
  let valid = true;
  let num = parseFloat(element.value);

  // general checks

  if (isNaN(num))
    valid = false;

  // specific checks to each input field

  if (valid) {
    switch (targetName) {
      case "axis":
        if (num < 100)
          valid = false;
        if (valid)
          customPreset.AXIS_MULTIPLIER = num / 100;
        break;
      case "y-height":
        if (num < 0 || num > myCanvas.canvas.height * 0.4)
          valid = false;
        if (valid)
          customPreset.BLUE_AMPLITUDE = num;
        break;
      case "gridlines":
        if (num < 0)
          valid = false;
        if (valid)
          customPreset.GRIDLINES = num;
        break;
      case "vectors":
        if (num < ARROWCAP.w)
          valid = false;
        if (valid)
          customPreset.VECTOR_SPACING = num;
        break;
      case "waves": // actually asks for wavelength, is converted to waves
        if (num < 0)
          valid = false;
        if (valid)
          customPreset.WAVES = Math.round((customPreset.Z_LENGTH / num) * 100) / 100;
        break;
      case "waveSpeed":
        if (Math.abs(num) > 21)
          valid = false;
        if (valid)
          waveSpeed = num;
        break;
      case "x-angle":
        if (num < 90 || num > 180)
          valid = false;
        if (valid)
          customPreset.X_ANGLE = num;
        break;
      case "x-length":
        if (num < 0)
          valid = false;
        if (valid)
          customPreset.X_LENGTH = num;
        break;
      case "z-angle":
        if (num < 90 || num > 180)
          valid = false;
        if (valid)
          customPreset.Z_ANGLE = num;
        break;
      case "z-length":
        if (num < 0)
          valid = false;
        if (valid)
          customPreset.Z_LENGTH = Math.round(num * Math.cos(cws.toRadians(preset.Z_ANGLE - 90)));
        break;
      default:
        console.log("unrecognized input:" + element.value);
        return;
    }
  }

  // error reporting

  if (!valid) {
    console.log(element.value + " interpreted as: " + num);
    element.parentElement.parentElement.style.backgroundColor = "#fff0f0";

    setTimeout(function () { element.parentElement.parentElement.style.backgroundColor = "" }, 3000);
  }
}

/*
 * 
 * controls height
 * 
 * sept 2021
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

function resizeControlsBox(): void {
  const controlsBox = document.getElementById('controls-inner'),
    opener = document.getElementById('controlsOpener');

  controlsBox.style.height = (opener.getBoundingClientRect().y - controlsBox.getBoundingClientRect().y) + 'px';
}

init(true);