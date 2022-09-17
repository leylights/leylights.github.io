import { Molasses } from "../../molasses.js";

var tiles = [];
var sprites = [];

var startPos = { x: -9000, y: -9000, w: 24, h: 40, c: "#00F5F5" };
var endPos = { x: -9000, y: -9000, w: 0, h: 0, c: "#FF8800" };
var solveButton = { x: -9000, y: -9000, w: 0, h: 0, c: "#000000" };

var tileW = 64;

var startTile;
var endTile;

var minW = 3;
var minH = 3;
var maxW = 0;
var maxH = 0;
var lastResize = [false, 0, [0, 0]];

var tries = 3;
var score = 0;
var isWon = -1;
var showRed = false;

var lastSolution = 0;
var lastRotation = 0;
var deadline;
var stopTime;

var comp = false;
var showAns = false;
var restrictSize = true;

var animator;
var now = Date.now();
var usePointer = false;
var mobile = false;

var switchState = 0; // 0 = none; 1 = white; -1 = black;
var bgC = 255;
var bgSwitchTime = 0;

var myCanvas = {
  canvas: document.createElement("canvas"),

  isClicking: false,
  recentClick: false,
  clickTime: null,
  clickLeft: null,

  mouseX: null,
  mouseY: null,
  keys: null,

  context: null,
  bg: null,

  start: function () {
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight - 64;
    this.canvas.style.backgroundColor = "white";
    this.canvas.style.transition = "all 0.5s linear";
    this.canvas.setAttributeNode(
      Molasses.betterCreateAttr("oncontextmenu", "return false;")
    );

    this.isClicking = false;
    this.recentClick = false;
    this.clickLeft = true;

    this.context = this.canvas.getContext("2d", {
      alpha: false
    });

    document
      .getElementById("canvasBox")
      .insertBefore(this.canvas, document.getElementById("canvasFoundation"));

    this.bg = window.getComputedStyle(document.getElementById("main")).backgroundColor;

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
        mobile = true;
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
    myCanvas.canvas.addEventListener(
      "touchmove",
      function (evt) {
        let canvasArea = myCanvas.canvas.getBoundingClientRect();
        myCanvas.mouseX = evt.touches[0].clientX - canvasArea.left;
        myCanvas.mouseY = evt.touches[0].clientY - canvasArea.top;
        myCanvas.clickTime = now;
      },
      false
    );
  },

  stop: function () {
    window.cancelAnimationFrame(animator);
    this.clear();
  },

  clear: function () {
    Molasses.fillRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height,
      this.bg,
      this.context
    );
    // rect(0, 0, this.canvas.width, this.canvas.height, myCanvas.canvas.style.backgroundColor);
    // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
};

function tile(x: number, y: number, w: number, h: number, img?) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.img = img;
  this.imgp = img;
  this.imgr = img;

  // up, right, down, left
  this.potential = [true, true, true, true];
  this.exits = [false, false, false, false];
  this.used = false;
  this.filled = false;
  this.powered = false;

  this.hovering = false;

  this.rotation = 0;
  this.permarotation = 0;
  this.rotateTimer = 0;
  this.rotates = 0;

  this.dontPower = false;

  this.draw = function (img) {
    myCanvas.context.translate(this.x + this.w / 2, this.y + this.h / 2);
    myCanvas.context.rotate(
      (this.permarotation + this.rotation) * (Math.PI / 180)
    );

    if (showRed && this.isPowered)
      drawImg(this.imgr, -this.w / 2, -this.h / 2, this.w, this.h);
    else if (this.isPowered && !this.dontPower)
      drawImg(this.imgp, -this.w / 2, -this.h / 2, this.w, this.h);
    else drawImg(this.img, -this.w / 2, -this.h / 2, this.w, this.h);

    if (this.hovering)
      rect(-this.w / 2, -this.h / 2, this.w, this.h, "#00000033");
    if (showAns && !this.used)
      rect(-this.w / 2, -this.h / 2, this.w, this.h, "#FF000033");
    else if (showAns)
      rect(-this.w / 2, -this.h / 2, this.w, this.h, "#00FF0033");

    myCanvas.context.rotate(
      (-this.permarotation - this.rotation) * (Math.PI / 180)
    );
    myCanvas.context.translate(-this.x - this.w / 2, -this.y - this.h / 2);
  };
}

function init(inComp: boolean) {
  myCanvas.start();
  document.documentElement.style.overflow = "hidden";
  document.getElementById("insWrap").outerHTML = "";
  getSprites();

  comp = inComp;

  // setting the score

  score = 0;

  try {
    if (comp) {
      if (localStorage.getItem("wiresCompScore") === null) score = 0;
      else score = parseInt(localStorage.getItem("wiresCompScore"));
    } else {
      if (localStorage.getItem("wiresScore") === null) score = 0;
      else score = parseInt(localStorage.getItem("wiresScore"));
    }
  } catch (e) {
    score = 0;
  }

  // building 1st map

  resetBounds();
  buildTiles(4, 4);
  if (comp) calcTime();
  if ((maxW / 2 < 3 || maxH / 2 < 3) && tileW > 32) {
    switch (tileW) {
      case 64:
        tileW = 48;
        break;
      case 48:
        tileW = 32;
        break;
    }
    resetBounds();
  }
  startPos.x = tiles[startTile[0]][startTile[1]].x - startPos.w;

  window.requestAnimationFrame(main);
}

function main() {
  // resets

  now = Date.now();
  getIn();
  redraw();

  doThings();

  myCanvas.canvas.style.backgroundColor = document.getElementById(
    "main"
  ).style.backgroundColor;
  if (mobile && document.getElementById("canvasBox").style.paddingTop !== "")
    document.getElementById("canvasBox").style.paddingTop = "0px";

  let c;

  switch (switchState) {
    case 1:
      if (bgC === 255) {
        switchState = 0;
        break;
      } else c = Math.floor((now - bgSwitchTime) / (1.96078431373 * 1));
      if (c > 255) c = 255;
      bgC = c;
      break;
    case -1:
      if (bgC === 0) {
        switchState = 0;
        break;
      } else c = 255 - Math.floor((now - bgSwitchTime) / (1.96078431373 * 1));
      if (c < 0) c = 0;
      bgC = c;
      break;
  }

  if (isWon === 1) {
    isWon = -1;
    endPos.c = "#00F5F5";
    score++;
    if (typeof localStorage !== "undefined") {
      if (comp) localStorage.setItem("wiresCompScore", score + "");
      else localStorage.setItem("wiresScore", score + "");
    }

    if (comp) {
      if (score > parseInt(localStorage.getItem("wiresCompHS")))
        localStorage.setItem("wiresCompHS", score + "");
    }

    setTimeout(function () {
      makeNewPuzzle();
      showRed = false;
      endPos.c = "#FF8800";
      if (tries < 3)
        if (comp) tries += 0.25;
        else tries++;
    }, 1500);
  } else if (isWon === 0) {
    isWon = -1;
    setTimeout(function () {
      showRed = true;
      startPos.c = "#DD0000";
      setTimeout(function () {
        startPos.c = "#00F5F5";
        clearPower();
        lastSolution = now + 500;
        showRed = false;
        if (deadline - now < 0) {
          makeNewPuzzle();
        }
        if (tries < 1 && comp) {
          lastSolution = now + 1000;
          tries = 3;
          let setNewHS = true;
          try {
            if (parseInt(localStorage.getItem("wiresCompHS")) > score)
              setNewHS = false;
          } catch (e) { }
          localStorage.setItem("wiresCompScore", 0 + "");
          localStorage.setItem("wiresCompHS", score + "");
          score = 0;
          makeNewPuzzle();
        }
      }, 900);
    }, 100);
    if (tries > 0) tries--;
  }

  // canvas stuff

  if (usePointer) myCanvas.canvas.style.cursor = "pointer";
  else myCanvas.canvas.style.cursor = "default";

  myCanvas.recentClick = false;
  usePointer = false;
  animator = window.requestAnimationFrame(main);
}

function getIn() {
  let compw = 0;
  if (comp) compw = 55;
  else compw = 0;
  // Clicks

  if (myCanvas.recentClick) {
    for (let x = 0; x < tiles.length; x++) {
      for (let y = 0; y < tiles[0].length; y++) {
        let t = tiles[x][y];
        if (isClicked(t.x, t.y, t.w, t.h)) {
          if (myCanvas.clickLeft) {
            t.rotates--;
            t.rotation--;
            roTile(x, y, 1);
          } else {
            t.rotates++;
            t.rotation++;
            roTile(x, y, -1);
          }
        }
      }
    }
    if (
      isClicked(solveButton.x, solveButton.y, solveButton.w, solveButton.h) &&
      !tiles[startTile[0]][startTile[1]].isPowered &&
      lastSolution < now &&
      tiles[startTile[0]][startTile[1]].exits[3] === true
    ) {
      solve(startTile[0], startTile[1], 3, true);
    }
    if (!comp) {
      if (isClicked(40 + tiles[0][0].x + compw, tiles[0][0].y - 40, 35, 35)) {
        showAns = !showAns;
      } else if (
        isClicked(80 + tiles[0][0].x + compw, tiles[0][0].y - 40, 35, 35)
      ) {
        makeNewPuzzle();
      } else if (
        isClicked(120 + tiles[0][0].x + compw, tiles[0][0].y - 40, 35, 35)
      ) {
        restrictSize = !restrictSize;
      } else if (
        isClicked(160 + tiles[0][0].x + compw, tiles[0][0].y - 40, 35, 35)
      ) {
        switch (tileW) {
          case 64:
            tileW = 48;
            break;
          case 48:
            tileW = 32;
            break;
          case 32:
            tileW = 64;
            break;
          case 16:
            tileW = 64;
            break;
        }
        makeNewPuzzle();
        fillTiles();
      }
    } else {
      if (isClicked(40 + tiles[0][0].x + compw, tiles[0][0].y - 40, 35, 35)) {
        switch (tileW) {
          case 64:
            tileW = 48;
            break;
          case 48:
            tileW = 32;
            break;
          case 32:
            tileW = 64;
            break;
          case 16:
            tileW = 64;
            tries = 1;
            break;
        }
        makeNewPuzzle();
        if (tries < 1) {
          score = 0;
          tries = 3;
        }
        fillTiles();
      }
    }
  }

  // Hover

  for (let x = 0; x < tiles.length; x++) {
    for (let y = 0; y < tiles[0].length; y++) {
      let t = tiles[x][y];
      if (isHovering(t.x, t.y, t.w, t.h) && !mobile) {
        if (myCanvas.keys && myCanvas.keys[69] && t.rotateTimer === 0) {
          t.rotates++;
          t.rotation++;
          t.rotateTimer = 33;
          roTile(x, y, -1);
        }
        if (myCanvas.keys && myCanvas.keys[81] && t.rotateTimer === 0) {
          t.rotates--;
          t.rotation--;
          t.rotateTimer = 33;
          roTile(x, y, 1);
        }
        t.hovering = true;
        usePointer = true;
      } else t.hovering = false;
    }
  }

  if (isHovering(solveButton.x, solveButton.y, solveButton.w, solveButton.h)) {
    solveButton.c = "#000009";
    usePointer = true;
  } else solveButton.c = "#000022";

  if (
    ((isHovering(40 + tiles[0][0].x + compw, tiles[0][0].y - 40, 35, 35) ||
      isHovering(80 + tiles[0][0].x + compw, tiles[0][0].y - 40, 35, 35) ||
      isHovering(120 + tiles[0][0].x + compw, tiles[0][0].y - 40, 35, 35) ||
      isHovering(160 + tiles[0][0].x + compw, tiles[0][0].y - 40, 35, 35)) &&
      !comp) ||
    (isHovering(40 + tiles[0][0].x + compw, tiles[0][0].y - 40, 35, 35) && comp)
  ) {
    usePointer = true;
  } // Question Mark || Redo || Restrict Size || Tile Size

  // Keys

  if (
    myCanvas.keys &&
    myCanvas.keys[13] &&
    !tiles[startTile[0]][startTile[1]].isPowered &&
    lastSolution < now &&
    tiles[startTile[0]][startTile[1]].exits[3] === true
  )
    // Enter
    solve(startTile[0], startTile[1], 3, true);

  // if(myCanvas.keys && myCanvas.keys[32])
  // makeNewPuzzle()
}

function redraw() {
  let compw = 0;
  if (comp) compw = 55;
  else compw = 0;

  myCanvas.clear();

  rect(
    tiles[0][0].x - 5,
    tiles[0][0].y - 5,
    tiles[0][0].w * tiles.length + 10,
    tiles[0][0].w * tiles[0].length + 10,
    "rgb(" + (255 - bgC) + "," + (255 - bgC) + "," + (255 - bgC) + ")"
  ); // outline
  rect(
    tiles[0][0].x,
    tiles[0][0].y,
    tiles[0][0].w * tiles.length,
    tiles[0][0].w * tiles[0].length,
    "black"
  ); // backdrop
  if (!comp) {
    rect(
      tiles[0][0].x - 5,
      tiles[0][0].y - 45,
      205 + compw,
      45,
      "rgb(" + (255 - bgC) + "," + (255 - bgC) + "," + (255 - bgC) + ")"
    ); // top HUD outline
  } else {
    rect(
      tiles[0][0].x - 5,
      tiles[0][0].y - 45,
      125 + compw,
      45,
      "rgb(" + (255 - bgC) + "," + (255 - bgC) + "," + (255 - bgC) + ")"
    ); // top HUD outline
  }
  if (comp) {
    rect(tiles[0][0].x, tiles[0][0].y - 40, 50, 35, "#111122"); // lives box
    for (let i = 0; i < 3; i++) {
      let c = "#DD0000";
      if (i < tries) c = "#00DDDD";
      rect(i * 15 + tiles[0][0].x + 5, tiles[0][0].y - 35, 10, 25, c);
    } // lives
  }
  topTile(0 + compw);
  topTile(40 + compw);
  topTile(80 + compw);
  if (!comp) {
    topTile(120 + compw);
    topTile(160 + compw);
  }

  drawText(
    score,
    17 + tiles[0][0].x + compw,
    tiles[0][0].y - 15,
    "white",
    true,
    24,
    "Encode Sans"
  );
  if (!comp) {
    drawText(
      "?",
      57 + tiles[0][0].x + compw,
      tiles[0][0].y - 15,
      "white",
      true,
      24,
      "Encode Sans"
    );
    drawText(
      "\u27F2",
      97 + tiles[0][0].x + compw,
      tiles[0][0].y - 15,
      "white",
      true,
      24,
      "Encode Sans"
    );
    if (!restrictSize)
      drawImg(
        sprites[0],
        121 + tiles[0][0].x + 6 + compw,
        tiles[0][0].y - 34,
        21,
        21
      );
    else
      drawText(
        "\u221E",
        137 + tiles[0][0].x + compw,
        tiles[0][0].y - 15,
        "white",
        true,
        24,
        "Encode Sans"
      );
  } else {
    if (tiles[startTile[0]][startTile[1]].isPowered)
      drawText(
        Math.floor((deadline - stopTime) / 1000),
        97 + tiles[0][0].x + compw,
        tiles[0][0].y - 15,
        "white",
        true,
        24,
        "Encode Sans"
      );
    else
      drawText(
        Math.floor((deadline - now) / 1000),
        97 + tiles[0][0].x + compw,
        tiles[0][0].y - 15,
        "white",
        true,
        24,
        "Encode Sans"
      );
  }

  {
    let sz;
    switch (tileW) {
      case 64:
        sz = "⅟₁";
        break;
      case 48:
        sz = "\u00BE";
        break;
      case 32:
        sz = "\u00BD";
        break;
      case 16:
        sz = "\u00BC";
        break;
    }
    if (comp)
      drawText(
        sz,
        57 + tiles[0][0].x + compw,
        tiles[0][0].y - 15,
        "white",
        true,
        24,
        "Times New Roman"
      );
    else
      drawText(
        sz,
        177 + tiles[0][0].x + compw,
        tiles[0][0].y - 15,
        "white",
        true,
        24,
        "Times New Roman"
      );
  }

  for (let i = 0; i < tiles.length; i++) {
    for (let j = 0; j < tiles[i].length; j++) {
      tiles[i][j].draw(true);
    }
  }

  if (tiles[startTile[0]][startTile[1]].isPowered) {
    rect(
      startPos.x - 5,
      startPos.y - 5,
      startPos.w + 5,
      startPos.h + 10,
      "rgb(" + (255 - bgC) + "," + (255 - bgC) + "," + (255 - bgC) + ")"
    );
    rect(startPos.x, startPos.y, startPos.w, startPos.h, startPos.c);
  } else {
    rect(
      startPos.x - 10,
      startPos.y - 5,
      startPos.w + 5,
      startPos.h + 10,
      "rgb(" + (255 - bgC) + "," + (255 - bgC) + "," + (255 - bgC) + ")"
    );
    rect(startPos.x - 5, startPos.y, startPos.w, startPos.h, startPos.c);
  }
  if (endPos.w > endPos.h)
    rect(
      endPos.x - 5,
      endPos.y,
      endPos.w + 10,
      endPos.h + 5,
      "rgb(" + (255 - bgC) + "," + (255 - bgC) + "," + (255 - bgC) + ")"
    );
  else
    rect(
      endPos.x,
      endPos.y - 5,
      endPos.w + 5,
      endPos.h + 10,
      "rgb(" + (255 - bgC) + "," + (255 - bgC) + "," + (255 - bgC) + ")"
    );
  rect(endPos.x, endPos.y, endPos.w, endPos.h, endPos.c);

  rect(
    solveButton.x - 5,
    solveButton.y,
    solveButton.w + 10,
    solveButton.h + 5,
    "rgb(" + (255 - bgC) + "," + (255 - bgC) + "," + (255 - bgC) + ")"
  );
  rect(
    solveButton.x,
    solveButton.y,
    solveButton.w,
    solveButton.h,
    solveButton.c
  );
  if (comp) {
    rect(
      solveButton.x + solveButton.w + 5,
      solveButton.y - 5,
      95,
      45,
      "rgb(" + (255 - bgC) + "," + (255 - bgC) + "," + (255 - bgC) + ")"
    );
    rect(solveButton.x + solveButton.w + 5, solveButton.y, 90, 35, "#111122");

    let hs = 0;

    try {
      hs = parseInt(localStorage.getItem("wiresCompHS"));
    } catch (e) {
      hs = 0;
      localStorage.setItem("wiresCompHS", 0 + "");
    }

    drawText(
      "TOP: " + hs,
      solveButton.x + solveButton.w + 5 + 45,
      solveButton.y + 25,
      "white",
      true,
      24,
      "Encode Sans"
    );
  }

  drawText(
    "\u2713",
    solveButton.x + solveButton.w / 2,
    solveButton.y + solveButton.h * 0.8,
    "white",
    true,
    Math.floor(solveButton.w * 0.75),
    "Times New Roman"
  );
}

// does various tasks every frame

function doThings() {
  // if (lastResize[0] && lastResize[1] < now) {
  //   buildTiles(
  //     Math.ceil(Math.random() * (maxW - 3)) + 3,
  //     Math.ceil(Math.random() * (maxH - 3)) + 3
  //   );
  //   lastResize[0] = false;
  // }
  if (deadline - now <= 32 && !tiles[startTile[0]][startTile[1]].isPowered) {
    solve(startTile[0], startTile[1], 3, true);
  }

  for (let i = 0; i < tiles.length; i++) {
    for (let j = 0; j < tiles[i].length; j++) {
      let t = tiles[i][j];
      let m = mobile ? 6 : 3;
      if (t.rotateTimer > 0) t.rotateTimer--;

      if (t.rotation > 0) {
        t.rotation += m;
        if (t.rotation >= 90) {
          t.permarotation += 90;
          t.rotates--;
          if (t.rotates < 0) t.rotation = -1;
          else if (t.rotates > 0) t.rotation = 1;
          else t.rotation = 0;
        }
      } else if (t.rotation < 0) {
        t.rotation -= m;
        if (t.rotation <= -90) {
          t.permarotation -= 90;
          t.rotates++;
          if (t.rotates < 0) t.rotation = -1;
          else if (t.rotates > 0) t.rotation = 1;
          else t.rotation = 0;
        }
      }
    }
  }
}

function getSprites() {
  sprites[0] = addSprite("limiter");
  sprites[1] = [];
  sprites[2] = [];
  sprites[5] = [];
  for (let i = 1; i < 5; i++) {
    sprites[1][i - 1] = addSprite("c" + i);
    sprites[2][i - 1] = addSprite("cp" + i);
    sprites[5][i - 1] = addSprite("rc" + i);
  }
  for (let i = 1; i < 3; i++) {
    sprites[1][4 + i - 1] = addSprite("s" + i);
    sprites[2][4 + i - 1] = addSprite("sp" + i);
    sprites[5][4 + i - 1] = addSprite("rs" + i);
  }
}

function resetBounds() {
  // recalculating boundaries

  maxW = 0;
  maxH = 0;
  while (true) {
    if (
      (maxW + 1) * tileW + 80 > myCanvas.canvas.width ||
      (restrictSize && maxW >= 9)
    )
      break;
    maxW++;
  }
  while (true) {
    if (
      (maxH + 1) * tileW + (60 + tileW) > myCanvas.canvas.height ||
      (restrictSize && maxH >= 6)
    )
      break;
    maxH++;
  }

  let skip = false;
  // if((maxW/2 < 3 || maxH/2 < 3) && tileW > 32 && false) {
  //   skip = true;
  //   switch(tileW){
  //     case 64:
  //       tileW = 48;
  //       break;
  //     case 48:
  //       tileW = 32;
  //       break;
  //   }
  //   resetBounds();
  // }
  if (restrictSize && !skip) {
    minW = 3;
    minH = 3;
  } else if (comp && !skip) {
    minW = Math.floor(maxW * 0.6);
    minH = Math.floor(maxH * 0.6);
  } else if (!skip) {
    minW = Math.floor(maxW / 3);
    minH = Math.floor(maxH / 3);
  }
}

// creates the grid

function buildTiles(columns: number, rows: number) {
  // tile creation

  tiles = [];
  showAns = false;
  let totalW = tileW * columns;
  let lMargin = (myCanvas.canvas.width - totalW) / 2;
  for (let i = 0; i < columns; i++) {
    tiles[i] = [];
    for (let j = 0; j < rows; j++) {
      tiles[i][j] = newTile(lMargin + i * tileW, 50 + j * tileW);
    }
  }

  // removing border potential
  for (let i = 0; i < tiles.length; i++) {
    tiles[i][0].potential[0] = false; // prevent top row from exiting up
    tiles[i][tiles[i].length - 1].potential[2] = false; // prevent bottom row from exiting down
  }
  for (let i = 0; i < tiles[0].length; i++) {
    tiles[0][i].potential[3] = false; // prevent left column from exiting left
    tiles[tiles.length - 1][i].potential[1] = false; // prevent right column from exiting right
  }

  solveButton = {
    x: tiles[tiles.length - 1][tiles[0].length - 1].x,
    y:
      tiles[tiles.length - 1][tiles[0].length - 1].y +
      tiles[tiles.length - 1][tiles[0].length - 1].h +
      5,
    w: tileW,
    h: tileW,
    c: "#000022"
  };

  buildPath(0, Math.floor(Math.random() * rows), true, 0);
}

// calculates the time limit in competitive mode

function calcTime() {
  let numoftiles = 0;
  let usedTiles = 0;

  for (let i = 0; i < tiles.length; i++) {
    for (let j = 0; j < tiles[i].length; j++) {
      numoftiles++;
      if (tiles[i][j].used) usedTiles++;
    }
  }

  if (mobile)
    deadline = now + (numoftiles * 0.6 + usedTiles * 1.4) * (1300 - score * 16);
  else
    deadline = now + (numoftiles * 0.3 + usedTiles * 1.2) * (1000 - score * 36);
}

// checks if the player has solved the puzzle

function solve(x, y, ent, start?) {
  let t = tiles[x][y];
  let exit;

  if (start) stopTime = now;

  t.isPowered = true;
  for (let i = 0; i < 4; i++) {
    if (t.exits[i] === true && i !== ent) {
      exit = i;
    }
  }

  if (start && t.exits[3] === false) {
    t.dontPower = true;
    isWon = 0;
    return;
  }

  let s = 50;

  switch (exit) {
    case 0:
      try {
        if (tiles[x][y - 1].exits[2] === true) {
          setTimeout(function () {
            solve(x, y - 1, 2);
          }, s);
        } else {
          isWon = 0;
          return;
        }
      } catch (e) {
        if (x === endTile[0] && y === endTile[1]) {
          isWon = 1;
          return;
        } else {
          isWon = 0;
          return;
        }
      }
      break;
    case 1:
      try {
        if (tiles[x + 1][y].exits[3] === true) {
          setTimeout(function () {
            solve(x + 1, y, 3);
          }, s);
        } else {
          isWon = 0;
          return;
        }
      } catch (e) {
        if (x === endTile[0] && y === endTile[1]) {
          isWon = 1;
          return;
        } else {
          isWon = 0;
          return;
        }
      }
      break;
    case 2:
      try {
        if (tiles[x][y + 1].exits[0] === true) {
          setTimeout(function () {
            solve(x, y + 1, 0);
          }, s);
        } else {
          isWon = 0;
          return;
        }
      } catch (e) {
        if (x === endTile[0] && y === endTile[1]) {
          isWon = 1;
          return;
        } else {
          isWon = 0;
          return;
        }
      }
      break;
    case 3:
      try {
        if (tiles[x - 1][y].exits[1] === true) {
          setTimeout(function () {
            solve(x - 1, y, 1);
          }, s);
        } else {
          isWon = 0;
          return;
        }
      } catch (e) {
        if (x === endTile[0] && y === endTile[1]) {
          isWon = 1;
          return;
        } else {
          isWon = 0;
          return;
        }
      }
      break;
    default:
      console.log(exit);
  }
}

// creates a solvable path

function buildPath(x, y, start, iteration) {
  iteration++;
  if (iteration > 400) {
    buildTiles(4, 4);
    // buildTiles(maxW/2,maxH/2);
    console.log("Taking too long to load.  Restarting build process.");
    return;
  }
  let t = tiles[x][y];
  if (start) {
    try {
      t.exits[3] = true;
    } catch (e) {
      console.log(
        "buildPath(): Cannot read property 'exits' of undefined at " +
        x +
        " " +
        y
      );
    }
    startTile = [x, y];
  }
  t.used = true;

  // determining if there are any more potential exits

  for (let i = 0; i < 4; i++) {
    if (t.potential[i]) break;
    else if (i === 3) {
      t.used = false;
      // if there's technically a chance to exit right
      if (x === tiles.length - 1) {
        console.log(iteration);
        t.exits[1] = true;
        t.used = true;
        // console.log("exit right");
        endPos.x = t.x + t.w;
        endPos.y = t.y + Math.floor(t.h * 0.2);
        endPos.w = Math.floor(t.w * 0.4);
        endPos.h = Math.floor(t.h * 0.6);
        endTile = [x, y];
        // fillTiles();
        return null;
      } else if (
        y === tiles[0].length - 1 &&
        (x >= tiles.length * 0.2 || (x > 1 && tiles.length < 10))
      ) {
        console.log(iteration);
        t.exits[2] = true;
        t.used = true;
        // console.log("exit down");
        endPos.x = t.x + Math.floor(t.w * 0.2);
        endPos.y = t.y + t.h;
        endPos.w = Math.floor(t.w * 0.6);
        endPos.h = Math.floor(t.h * 0.4);

        if (x === tiles.length - 1) {
          solveButton = {
            x: tiles[0][tiles[0].length - 1].x,
            y:
              tiles[0][tiles[0].length - 1].y +
              tiles[0][tiles[0].length - 1].h +
              5,
            w: 60,
            h: 60,
            c: undefined
          };
          redraw();
          tiles[0][111].x = "e";
        }

        endTile = [x, y];
        // fillTiles();
        return null;
      }
      // if neither exit is possible, back up and try again
      for (let e = 0; e < 4; e++) {
        if (t.exits[e] === true) {
          var backExit = e;
          // console.log("redo at:" + x + " " +  y);
          switch (backExit) {
            case 0:
              tiles[x][y - 1].potential[2] = false;
              tiles[x][y - 1].exits[2] = false;
              buildPath(x, y - 1, false, iteration);
              break;
            case 1:
              tiles[x + 1][y].potential[3] = false;
              tiles[x + 1][y].exits[3] = false;
              buildPath(x + 1, y, false, iteration);
              break;
            case 2:
              tiles[x][y + 1].potential[0] = false;
              tiles[x][y + 1].exits[0] = false;
              buildPath(x, y + 1, false, iteration);
              break;
            case 3:
              try {
                tiles[x - 1][y].potential[1] = false;
                tiles[x - 1][y].exits[1] = false;
                buildPath(x - 1, y, false, iteration);
              } catch (e) {
                buildTiles(tiles.length, tiles[0].length);
              }
              break;
          }
          break;
        }
      }
      t.exits = [false, false, false, false];
      t.potential = [false, false, false, false];
      return true;
    }
  }

  let i = Math.floor(Math.random() * 4);

  while (true) {
    if (i > 3) i = 0;
    if (t.potential[i]) {
      // console.log([x, y], i, t.potential);
      t.exits[i] = true;
      t.potential = [false, false, false, false];
      if (typeof tiles[x][y - 1] !== "undefined")
        tiles[x][y - 1].potential[2] = false;
      if (typeof tiles[x + 1] !== "undefined")
        tiles[x + 1][y].potential[3] = false;
      if (typeof tiles[x][y + 1] !== "undefined")
        tiles[x][y + 1].potential[0] = false;
      if (typeof tiles[x - 1] !== "undefined")
        tiles[x - 1][y].potential[1] = false;
      switch (i) {
        case 0:
          if (typeof tiles[x][y - 1] !== "undefined") {
            tiles[x][y - 1].exits[2] = true;
            tiles[x][y - 1].potential[2] = false;
            buildPath(x, y - 1, false, iteration);
          }
          break;
        case 1:
          if (typeof tiles[x + 1] !== "undefined") {
            tiles[x + 1][y].exits[3] = true;
            tiles[x + 1][y].potential[3] = false;
            buildPath(x + 1, y, false, iteration);
          }
          break;
        case 2:
          if (typeof tiles[x][y + 1] !== "undefined") {
            tiles[x][y + 1].exits[0] = true;
            tiles[x][y + 1].potential[0] = false;
            buildPath(x, y + 1, false, iteration);
          }
          break;
        case 3:
          if (typeof tiles[x - 1] !== "undefined") {
            tiles[x - 1][y].exits[1] = true;
            tiles[x - 1][y].potential[1] = false;
            buildPath(x - 1, y, false, iteration);
          }
          break;
      }
      // console.log(x,y);
      if (start) {
        // BASE CASE(?)

        fillTiles();
        setImgs();
        rotateAllImgs();

        startPos.w = Math.floor(tileW * 0.4);
        startPos.y =
          tiles[startTile[0]][startTile[1]].y + Math.floor(tileW * 0.2);
        startPos.h = Math.floor(tileW * 0.6);
      }
      return;
    }
    i++;
  }
}

// makes a settings tile

function makeNewPuzzle() {
  resetBounds();
  buildTiles(
    Math.ceil(Math.random() * (maxW - minW)) + minW,
    Math.ceil(Math.random() * (maxH - minH)) + minH
  );
  if (comp) calcTime();
}

function topTile(x) {
  rect(tiles[0][0].x + x, tiles[0][0].y - 40, 35, 35, "#111122");
}

// sets every tile.isPowered to false

function clearPower() {
  for (let i = 0; i < tiles.length; i++) {
    for (let j = 0; j < tiles[i].length; j++) {
      tiles[i][j].isPowered = false;
      tiles[i][j].dontPower = false;
    }
  }
  endPos.c = "#FF8800";
}

// sets every tile's image

function setImgs() {
  for (let i = 0; i < tiles.length; i++) {
    for (let j = 0; j < tiles[i].length; j++) {
      let t = tiles[i][j];
      let imgNC = Math.floor(Math.random() * 4);
      let imgNS = 4 + Math.floor(Math.random() * 2);
      switch (t.exits.join()) {
        case "true,true,false,false":
          t.img = sprites[1][imgNC];
          t.imgp = sprites[2][imgNC];
          t.imgr = sprites[5][imgNC];
          break;
        case "false,true,true,false":
          t.img = sprites[1][imgNC];
          t.imgp = sprites[2][imgNC];
          t.imgr = sprites[5][imgNC];
          t.permarotation = 90;
          break;
        case "false,false,true,true":
          t.img = sprites[1][imgNC];
          t.imgp = sprites[2][imgNC];
          t.imgr = sprites[5][imgNC];
          t.permarotation = 180;
          break;
        case "true,false,false,true":
          t.img = sprites[1][imgNC];
          t.imgp = sprites[2][imgNC];
          t.imgr = sprites[5][imgNC];
          t.permarotation = 270;
          break;
        case "true,false,true,false":
          t.img = sprites[1][imgNS];
          t.imgp = sprites[2][imgNS];
          t.imgr = sprites[5][imgNS];
          break;
        case "false,true,false,true":
          t.img = sprites[1][imgNS];
          t.imgp = sprites[2][imgNS];
          t.imgr = sprites[5][imgNS];
          t.permarotation = 90;
          break;
      }
    }
  }
}

// shuffles exits of every tile

function rotateAllImgs() {
  for (let x = 0; x < tiles.length; x++) {
    for (let y = 0; y < tiles[0].length; y++) {
      // tiles[x][y].permarotation = 0;
      let roNo = Math.floor(Math.random() * 4);
      roTile(x, y, roNo);
      tiles[x][y].permarotation -= roNo * 90;
    }
  }
}

// rotates a tile

function roTile(x, y, amt) {
  let oldE = [];
  let t = tiles[x][y];
  for (let i = 0; i < t.exits.length; i++) oldE[i] = t.exits[i];
  for (let i = 0; i < 4; i++) t.exits[i] = oldE[(i + amt + 4) % 4];
}

// fills the path of previously empty tiles

function fillTiles() {
  // return;

  startPos.x = tiles[startTile[0]][startTile[1]].x - startPos.w;
  startPos.y = tiles[startTile[0]][startTile[1]].y + 12;

  for (let x = 0; x < tiles.length; x++) {
    for (let y = 0; y < tiles[0].length; y++) {
      let t = tiles[x][y];
      let tocontinue = false;
      for (let i = 0; i < 4; i++) {
        if (t.exits[i] === true) tocontinue = true;
      }
      if (tocontinue) continue;
      if (true) {
        t.filled = true;
        switch (Math.floor(Math.random() * 2)) {
          case 0:
            t.exits[0] = true;
            t.exits[1] = true;
            break;
          case 1:
            t.exits[0] = true;
            t.exits[2] = true;
            break;
        }
      }
    }
  }
}

// makes a new tile

function newTile(x, y) {
  return new tile(x, y, tileW, tileW);
}

// resizes the canvas to the available screen size

function resizeCanvas() {
  myCanvas.canvas.width = document.body.clientWidth;
  myCanvas.canvas.height = document.body.clientHeight - 64;
  // lastResize[0] = true;
  lastResize[1] = now + 200;

  lastResize[2][0] = myCanvas.canvas.width;
  lastResize[2][1] = myCanvas.canvas.height;
}

// HTML initialization

document.getElementById("casual").addEventListener("click", () => {
  init(false);
});

document.getElementById("comp").addEventListener("click", () => {
  init(true);
  console.log("go");
});

window.addEventListener("resize", resizeCanvas);

// General

function addSprite(src) {
  var newimg = document.createElement("img");
  var truesrc = "/siteimages/energy/" + src + ".png";
  newimg.setAttributeNode(Molasses.betterCreateAttr("src", truesrc));
  newimg.setAttributeNode(Molasses.betterCreateAttr("id", truesrc));
  document.getElementById("imgs").appendChild(newimg);
  return newimg;
}

//   function betterCreateAttr(type, value) {
//     var attr = document.createAttribute(type);
//     attr.value = value;
//     return attr;
//   }

function drawImg(img, x, y, w, h) {
  Molasses.drawImg(img, x, y, w, h, myCanvas.context);
}

function drawText(text, x, y, colour, centered, size, type) {
  Molasses.drawText(text, x, y, colour, centered, size, type, myCanvas.context);
}

function isClicked(x, y, w, h) {
  if (
    myCanvas.mouseX < x + w &&
    myCanvas.mouseY < y + h &&
    x < myCanvas.mouseX &&
    y < myCanvas.mouseY &&
    myCanvas.recentClick
  )
    return true;
  else return false;
}

function isHovering(x, y, w, h) {
  if (
    myCanvas.mouseX < x + w &&
    myCanvas.mouseY < y + h &&
    x < myCanvas.mouseX &&
    y < myCanvas.mouseY
  )
    return true;
  else return false;
}

function mouseDown() {
  myCanvas.isClicking = true;
  console.log("DOWN");
}

function mouseUp() {
  myCanvas.isClicking = false;
  console.log("UP");
}

//   function orEquals(a, b) {
//     for (var i = 0; i < b.length; i++) {
//       if (a === b[i]) {
//         return true;
//       }
//     }
//     return false;
//   }

function rect(x: number, y: number, w: number, h: number, colour: string) {
  Molasses.fillRect(x, y, w, h, colour, myCanvas.context);
}

//   function switchToMobile() {
//     document.getElementById("main").style.marginTop = "0px";
//     document.getElementById("canvasBox").style.paddingTop = "0px";
//     document.getElementById("header").style.paddingTop = "0px";
//     document.getElementById("header").style.backgroundColor =
//       "rgba(0,0,200,0.5)";
//   }
