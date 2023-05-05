var player;
var playerMargin;
var blinkyMargin;

var walls = [];
var entities = [];
var fruits = [];

var sprites = [[], [], [], [], [], [], [], []];

var animator;
var currentTime: number;
var previousFrame: number;
var fruitSpawnTime: number;
var lifeElapsedTime: number;
var totalElapsedTime: number;
var longChaseStartTime: number;
var chaseStartTime = 0;
var chaseSwitchTime = 0;
var playerHasEntered = false;
var lifeStartTime = new Date().getTime();
var totalStartTime = new Date().getTime();

var scorePause = false;
var stopCheckingScorePause = false;

var lives = 3;
var score = 0;
var highScore = 0;
var roundNo = 1;
var fruitNum = 0;
var godMode = false;
var roundWon = false;
var gameState = "start";
var ghostCollateral = 0;

var murderImg = document.getElementById("/siteimages/pac/murderpellet.png");
var transparent = document.getElementById("/siteimages/pac/transparent.png");

// PAC MAN GAME

function startGame() {
  gameBox.start(); // Initializes the Canvas
  createSprites();
  createMap();
  lives = 3;
  // Starts the animation loop
  requestAnimationFrame(updateGameArea);
}
var gameBox = {
  canvas: document.createElement("canvas"),
  keys: [],
  context: null,

  start: function() {
    this.canvas.width = 448;
    this.canvas.height = 576;
    this.context = this.canvas.getContext("2d", {
      alpha: false
    });
    document
      .getElementById("canvasBox")
      .insertBefore(this.canvas, document.getElementById("canvasFoundation"));
    // this.interval = setInterval(updateGameArea, 16);
    window.addEventListener("keydown", function(e) {
      gameBox.keys[e.keyCode] = true;
    });
    window.addEventListener("keyup", function(e) {
      gameBox.keys[e.keyCode] = false;
    });
  },
  stop: function() {
    // clearInterval(this.interval);
    cancelAnimationFrame(animator);
    gameBox.erase();
  },
  erase: function() {
    rect(0, 0, this.canvas.width, this.canvas.height, "#000000");
  }
};

function component(width: number, height: number, inputColour, x: number, y: number, type?, extraType?) {
  //variable calls
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.speedX = 0;
  this.speedY = 0;
  this.colour = inputColour;
  this.timer = 0;
  this.type = type;
  if (type == "image" || extraType == "image") {
    this.image = this.colour;
  }
  if (type == "entity") {
    this.name = null;
    this.aiType = null;
    this.safeUp = true;
    this.safeDown = true;
    this.safeLeft = true;
    this.safeRight = true;
    this.hasAi = false;
    this.movementDirection = null;
    this.intendedDirection = null;
    this.decisionTimer = 0;
    this.ghostTimer = 0;
    this.movementSpeed = 2;
    this.isDead = false;
    this.deathAnimation = null;
    this.margining = null;
    this.white = false;
  }
  var ctx = gameBox.context;
  this.imageReset = function() {
    // Used to change images, call sparingly to avoid lag
    // this.image = document.getElementById(this.colour);
  };

  this.redraw = function() {
    // Draws components to the screen
    if (this.type == "text") {
      ctx.font = this.width + " " + this.height;
      ctx.fillStyle = this.colour;
      ctx.fillText(this.text, Math.floor(this.x), Math.floor(this.y));
    } else if (type == "image" || extraType == "image") {
      if (this === player && this.isDead === true) {
        switch (this.movementDirection) {
          case "left":
            drawRotatedImg(
              this.image,
              Math.floor(this.x),
              Math.floor(this.y),
              Math.floor(this.width),
              Math.floor(this.height),
              270
            );
            break;
          case "down":
            drawRotatedImg(
              this.image,
              Math.floor(this.x),
              Math.floor(this.y),
              Math.floor(this.width),
              Math.floor(this.height),
              180
            );
            break;
          case "right":
            drawRotatedImg(
              this.image,
              Math.floor(this.x),
              Math.floor(this.y),
              Math.floor(this.width),
              Math.floor(this.height),
              90
            );
            break;
          default:
            drawRotatedImg(
              this.image,
              Math.floor(this.x),
              Math.floor(this.y),
              Math.floor(this.width),
              Math.floor(this.height),
              0
            );
            break;
        }
      } else if (this.image !== null) {
        ctx.drawImage(
          this.image,
          Math.floor(this.x),
          Math.floor(this.y),
          this.width,
          this.height
        );
      }
    } else {
      ctx.fillStyle = this.colour;
      ctx.fillRect(
        Math.floor(this.x),
        Math.floor(this.y),
        this.width,
        this.height
      );
    }
  };

  this.newPos = function() {
    var dTimer = 10;
    // Alters Component Positions
    if (
      this.aiType == "blinky" ||
      this.aiType == "pinky" ||
      this.aiType == "clyde" ||
      this.aiType == "starting" ||
      this.aiType === "chaseAi" ||
      this.aiType === "deadGhost"
    ) {
      if (this.aiType === "chaseAi") this.movementSpeed = 1;

      switch (this.movementDirection) {
        case "up":
          if (!this.safeUp && this.decisionTimer === 0) {
            if (findDirection(this, player)[0] == "right" && this.safeRight) {
              this.movementDirection = "right";
              this.speedX += this.movementSpeed;
            } else if (
              findDirection(this, player)[0] == "left" &&
              this.safeLeft
            ) {
              this.movementDirection = "left";
              this.speedX -= this.movementSpeed;
            } else if (
              this.safeRight &&
              findDirection(this, player)[1] == "right"
            ) {
              this.movementDirection = "right";
              this.speedX += this.movementSpeed;
            } else if (
              this.safeLeft &&
              findDirection(this, player)[1] == "left"
            ) {
              this.movementDirection = "left";
              this.speedX -= this.movementSpeed;
            } else {
              this.movementDirection = "down";
              this.speedY += this.movementSpeed;
            }
            this.decisionTimer = dTimer;
          } else if (this.decisionTimer === 0) {
            if (this.safeRight && findDirection(this, player)[0] == "right") {
              this.movementDirection = "right";
              this.speedX += this.movementSpeed;
              this.decisionTimer = dTimer;
            } else if (
              this.safeLeft &&
              findDirection(this, player)[0] == "left"
            ) {
              this.movementDirection = "left";
              this.speedX -= this.movementSpeed;
              this.decisionTimer = dTimer;
            } else {
              this.speedY -= this.movementSpeed;
            }
          } else {
            this.speedY -= this.movementSpeed;
          }
          if (this.aiType !== "deadGhost" && this.aiType !== "chaseAi")
            switch (this.name) {
              case "blinky":
                this.image = sprites[1][Math.floor((currentTime % 200) / 100)];
                break;
              case "pinky":
                this.image = sprites[2][Math.floor((currentTime % 200) / 100)];
                break;
              case "inky":
                this.image = sprites[3][Math.floor((currentTime % 200) / 100)];
                break;
              case "clyde":
                this.image = sprites[4][Math.floor((currentTime % 200) / 100)];
                break;
            }
          else if (this.aiType === "chaseAi") {
            if (this.white)
              this.image =
                sprites[5][2 + Math.floor((currentTime % 200) / 100)];
            else this.image = sprites[5][Math.floor((currentTime % 200) / 100)];
          } else {
            this.image = sprites[5][4];
          }
          break;
        case "down":
          if (!this.safeDown && this.decisionTimer === 0) {
            if (findDirection(this, player)[0] == "left" && this.safeLeft) {
              this.movementDirection = "left";
              this.speedX -= this.movementSpeed;
            } else if (
              findDirection(this, player)[0] == "right" &&
              this.safeRight
            ) {
              this.movementDirection = "right";
              this.speedX += this.movementSpeed;
            } else if (
              this.safeRight &&
              findDirection(this, player)[1] == "right"
            ) {
              this.movementDirection = "right";
              this.speedX += this.movementSpeed;
            } else if (
              this.safeLeft &&
              findDirection(this, player)[1] == "left"
            ) {
              this.movementDirection = "left";
              this.speedX -= this.movementSpeed;
            } else {
              this.movementDirection = "up";
              this.speedY -= this.movementSpeed;
            }
            this.decisionTimer = dTimer;
          } else if (this.decisionTimer === 0) {
            if (this.safeRight && findDirection(this, player)[0] == "right") {
              this.movementDirection = "right";
              this.speedX += this.movementSpeed;
              this.decisionTimer = dTimer;
            } else if (
              this.safeLeft &&
              findDirection(this, player)[0] == "left"
            ) {
              this.movementDirection = "left";
              this.speedX -= this.movementSpeed;
              this.decisionTimer = dTimer;
            } else {
              this.speedY += this.movementSpeed;
            }
          } else {
            this.speedY += this.movementSpeed;
          }
          if (this.aiType !== "deadGhost" && this.aiType !== "chaseAi")
            switch (this.name) {
              case "blinky":
                this.image =
                  sprites[1][4 + Math.floor((currentTime % 200) / 100)];
                break;
              case "pinky":
                this.image =
                  sprites[2][4 + Math.floor((currentTime % 200) / 100)];
                break;
              case "inky":
                this.image =
                  sprites[3][4 + Math.floor((currentTime % 200) / 100)];
                break;
              case "clyde":
                this.image =
                  sprites[4][4 + Math.floor((currentTime % 200) / 100)];
                break;
            }
          else if (this.aiType === "chaseAi") {
            if (this.white)
              this.image =
                sprites[5][2 + Math.floor((currentTime % 200) / 100)];
            else this.image = sprites[5][Math.floor((currentTime % 200) / 100)];
          } else {
            this.image = sprites[5][6];
          }
          break;
        case "left":
          if (!this.safeLeft && this.decisionTimer === 0) {
            if (findDirection(this, player)[0] == "up" && this.safeUp) {
              this.movementDirection = "up";
              this.speedY -= this.movementSpeed;
            } else if (
              findDirection(this, player)[0] == "down" &&
              this.safeDown
            ) {
              this.movementDirection = "down";
              this.speedY += this.movementSpeed;
            } else if (this.safeUp && findDirection(this, player)[1] == "up") {
              this.movementDirection = "up";
              this.speedY -= this.movementSpeed;
            } else if (
              this.safeDown &&
              findDirection(this, player)[1] == "down"
            ) {
              this.movementDirection = "down";
              this.speedY += this.movementSpeed;
            } else {
              this.movementDirection = "right";
              this.speedX += this.movementSpeed;
            }
            this.decisionTimer = dTimer;
          } else if (this.decisionTimer === 0) {
            if (this.safeUp && findDirection(this, player)[0] === "up") {
              this.movementDirection = "up";
              this.speedY -= this.movementSpeed;
              this.decisionTimer = dTimer;
            } else if (
              this.safeDown &&
              findDirection(this, player)[0] == "down"
            ) {
              this.movementDirection = "down";
              this.speedY += this.movementSpeed;
              this.decisionTimer = dTimer;
            } else {
              this.speedX -= this.movementSpeed;
            }
          } else {
            this.speedX -= this.movementSpeed;
          }
          if (this.aiType !== "deadGhost" && this.aiType !== "chaseAi")
            switch (this.name) {
              case "blinky":
                this.image =
                  sprites[1][2 + Math.floor((currentTime % 200) / 100)];
                break;
              case "pinky":
                this.image =
                  sprites[2][2 + Math.floor((currentTime % 200) / 100)];
                break;
              case "inky":
                this.image =
                  sprites[3][2 + Math.floor((currentTime % 200) / 100)];
                break;
              case "clyde":
                this.image =
                  sprites[4][2 + Math.floor((currentTime % 200) / 100)];
                break;
            }
          else if (this.aiType === "chaseAi") {
            if (this.white)
              this.image =
                sprites[5][2 + Math.floor((currentTime % 200) / 100)];
            else this.image = sprites[5][Math.floor((currentTime % 200) / 100)];
          } else {
            this.image = sprites[5][5];
          }
          break;
        case "right":
          if (!this.safeRight && this.decisionTimer === 0) {
            if (findDirection(this, player)[0] == "down" && this.safeDown) {
              this.movementDirection = "down";
              this.speedY += this.movementSpeed;
            } else if (findDirection(this, player)[0] == "up" && this.safeUp) {
              this.movementDirection = "up";
              this.speedY -= this.movementSpeed;
            } else if (
              this.safeDown &&
              findDirection(this, player)[1] == "down"
            ) {
              this.movementDirection = "down";
              this.speedY += this.movementSpeed;
            } else if (this.safeUp && findDirection(this, player)[1] == "up") {
              this.movementDirection = "up";
              this.speedY -= this.movementSpeed;
            } else {
              this.movementDirection = "left";
              this.speedX -= this.movementSpeed;
            }
            this.decisionTimer = dTimer;
          } else if (this.decisionTimer === 0) {
            if (this.safeUp && findDirection(this, player)[0] == "up") {
              this.movementDirection = "up";
              this.speedY -= this.movementSpeed;
              this.decisionTimer = dTimer;
            } else if (
              this.safeDown &&
              findDirection(this, player)[0] == "down"
            ) {
              this.movementDirection = "down";
              this.speedY += this.movementSpeed;
              this.decisionTimer = dTimer;
            } else {
              this.speedX += this.movementSpeed;
            }
          } else {
            this.speedX += this.movementSpeed;
          }
          if (this.aiType !== "deadGhost" && this.aiType !== "chaseAi")
            switch (this.name) {
              case "blinky":
                this.image =
                  sprites[1][6 + Math.floor((currentTime % 200) / 100)];
                break;
              case "pinky":
                this.image =
                  sprites[2][6 + Math.floor((currentTime % 200) / 100)];
                break;
              case "inky":
                this.image =
                  sprites[3][6 + Math.floor((currentTime % 200) / 100)];
                break;
              case "clyde":
                this.image =
                  sprites[4][6 + Math.floor((currentTime % 200) / 100)];
                break;
            }
          else if (this.aiType === "chaseAi") {
            if (this.white)
              this.image =
                sprites[5][2 + Math.floor((currentTime % 200) / 100)];
            else this.image = sprites[5][Math.floor((currentTime % 200) / 100)];
          } else {
            this.image = sprites[5][7];
          }
          break;
      }
      if (this.decisionTimer > 0) {
        this.decisionTimer--;
      }
      this.safeUp = true;
      this.safeDown = true;
      this.safeLeft = true;
      this.safeRight = true;
    } else if (this === player) {
      var aniFrame = Math.floor(currentTime % 250);
      if (this.isDead === false) {
        switch (this.movementDirection) {
          case "up":
            this.speedY -= this.movementSpeed;
            if (aniFrame < 63) player.image = sprites[0][0];
            else if (aniFrame > 125 && aniFrame < 183)
              player.image = sprites[0][2];
            else player.image = sprites[0][1];
            break;
          case "down":
            this.speedY += this.movementSpeed;
            if (aniFrame < 63) player.image = sprites[0][0];
            else if (aniFrame > 125 && aniFrame < 183)
              player.image = sprites[0][6];
            else player.image = sprites[0][5];
            break;
          case "left":
            this.speedX -= this.movementSpeed;
            if (aniFrame < 63) player.image = sprites[0][0];
            else if (aniFrame > 125 && aniFrame < 183)
              player.image = sprites[0][4];
            else player.image = sprites[0][3];
            break;
          case "right":
            this.speedX += this.movementSpeed;
            if (aniFrame < 63) player.image = sprites[0][0];
            else if (aniFrame > 125 && aniFrame < 183)
              player.image = sprites[0][8];
            else player.image = sprites[0][7];
            break;
        }
      }
    }
    if (this.margining !== null) {
      var margin = this;
      var obj = margin.margining;
      var totalPadding = 2;

      if (obj.aiType === "deadGhost") totalPadding = 4;

      margin.speedX = 0;
      margin.speedY = 0;
      if (obj.isSlowed || margin.isSlowed) {
        obj.movementSpeed = 1.6;
      }
      margin.movementSpeed = obj.movementSpeed;

      switch (obj.movementDirection) {
        case "up":
          margin.speedY -= obj.movementSpeed;
          break;
        case "down":
          margin.speedY += obj.movementSpeed;
          break;
        case "left":
          margin.speedX -= obj.movementSpeed;
          break;
        case "right":
          margin.speedX += obj.movementSpeed;
          break;
      }

      switch (obj.movementDirection) {
        case "up":
        case "down":
          if (margin.width !== obj.width) {
            if (obj.oldMovementDirection == "left") {
              obj.x -= totalPadding / 2;
              margin.x -= totalPadding / 2;
            } else if (obj.oldMovementDirection == "right") {
              obj.x += totalPadding / 2;
              margin.x += totalPadding / 2;
            }
          }
          margin.width = obj.width;
          margin.height = obj.height - totalPadding;
          break;
        case "left":
        case "right":
          if (margin.height !== obj.height) {
            if (obj.oldMovementDirection == "up") {
              obj.y -= totalPadding / 2;
              margin.y -= totalPadding / 2;
            } else if (obj.oldMovementDirection == "down") {
              obj.y += totalPadding / 2;
              margin.y += totalPadding / 2;
            }
          }
          margin.width = obj.width - totalPadding;
          margin.height = obj.height;
          break;
      }
      if (obj.aiType !== null || margin.margining === player) {
        obj.oldMovementDirection = obj.movementDirection;
        margin.x += margin.speedX;
        margin.y += margin.speedY;
      }
    } else {
      this.x += this.speedX;
      this.y += this.speedY;
    }
  };
  this.collideWith = function(otherEntity) {
    var thisLeft = this.x;
    var thisRight = this.x + this.width;
    var thisTop = this.y;
    var thisBottom = this.y + this.height;
    var thisHalfW = this.width / 2;
    var thatLeft = otherEntity.x;
    var thatRight = otherEntity.x + otherEntity.width;
    var thatTop = otherEntity.y;
    var thatBottom = otherEntity.y + otherEntity.height;
    var isThereCollision = [];
    var directionX;
    var directionY;
    var directionPure;
    if (
      thisLeft > thatRight ||
      thisRight < thatLeft ||
      thisTop > thatBottom ||
      thisBottom < thatTop
    ) {
      isThereCollision.push(false);
    } else {
      isThereCollision.push(true);
    }
    if (thatTop < thisTop) {
      directionY = "above";
    } else if (thatBottom > thisBottom) {
      directionY = "below";
    }
    if (thisLeft + thisHalfW >= thatRight) {
      directionX = "left";
    } else if (thisRight - thisHalfW <= thatLeft) {
      directionX = "right";
    }
    switch (true) {
      case directionX == "left" && directionY == "below":
        switch (true) {
          case Math.abs(thisLeft - thatRight) < Math.abs(thisBottom - thatTop):
            directionPure = "left";
            break;
          case Math.abs(thisLeft - thatRight) > Math.abs(thisBottom - thatTop):
            directionPure = "below";
            break;
        }
        break;
      case directionX == "left" && directionY == "above":
        switch (true) {
          case Math.abs(thisTop - thatBottom) < Math.abs(thisLeft - thatRight):
            directionPure = "above";
            break;
          case Math.abs(thisTop - thatBottom) > Math.abs(thisLeft - thatRight):
            directionPure = "left";
            break;
        }
        break;
      case directionX == "right" && directionY == "below":
        switch (true) {
          case Math.abs(thisBottom - thatTop) < Math.abs(thatLeft - thisRight):
            directionPure = "below";
            break;
          case Math.abs(thisBottom - thatTop) > Math.abs(thatLeft - thisRight):
            directionPure = "right";
            break;
        }
        break;
      case directionX == "right" && directionY == "above":
        switch (true) {
          case Math.abs(thisRight - thatLeft) > Math.abs(thisTop - thatBottom):
            directionPure = "above";
            break;
          case Math.abs(thisRight - thatLeft) < Math.abs(thisTop - thatBottom):
            directionPure = "right";
            break;
        }
        break;
      case directionX == "left":
        directionPure = "left";
        break;
      case directionX == "right":
        directionPure = "right";
        break;
      case directionY == "above":
        directionPure = "above";
        break;
      case directionY == "below":
        directionPure = "below";
        break;
    }
    isThereCollision.push(directionX);
    isThereCollision.push(directionY);
    isThereCollision.push(directionPure);
    return isThereCollision;
  };
}

function updateGameArea() {
  // Step 2: Redraws

  gameBox.erase();
  player.redraw();

  drawText("SCORE: " + score, 10, 32, "white", false, 20, "Courier New");
  drawText("HIGHSCORE: " + highScore, 230, 32, "white", false);

  for (var e = 0; e < entities.length; e += 2) {
    // if(entities[e].isMargin) entities[e].redraw();
    // entities[e].redraw();
    if (
      !entities[e].isMargin &&
      (entities[e + 1] !== "murderPellet" ||
        currentTime % 400 < 200 ||
        !playerHasEntered)
    )
      entities[e].redraw();
  }

  for (var w = 0; w < walls.length; w += 2) {
    walls[w].redraw();
  }

  // Time Resets

  currentTime = new Date().getTime();
  totalElapsedTime = Math.floor((currentTime - totalStartTime) / 1000);
  lifeElapsedTime = Math.floor((currentTime - lifeStartTime) / 1000);
  previousFrame = new Date().getTime();

  // Score

  if (score > highScore) highScore = score;

  // Key Detections

  if (currentTime - enterTime > 500 && enterTime !== 0) {
    if (gameBox.keys && (gameBox.keys[87] || gameBox.keys[38])) {
      // w
      player.intendedDirection = "up";
      playerHasEntered = true;
      totalStartTime = currentTime;
    }
    if (gameBox.keys && (gameBox.keys[68] || gameBox.keys[39])) {
      // d
      player.intendedDirection = "right";
      playerHasEntered = true;
      totalStartTime = currentTime;
    }
    if (gameBox.keys && (gameBox.keys[65] || gameBox.keys[37])) {
      // a
      player.intendedDirection = "left";
      playerHasEntered = true;
      totalStartTime = currentTime;
    }
    if (gameBox.keys && (gameBox.keys[83] || gameBox.keys[40])) {
      // s
      player.intendedDirection = "down";
      playerHasEntered = true;
      totalStartTime = currentTime;
    }
  }
  //   SHIFT KEY
  if (gameBox.keys && gameBox.keys[16]) {
    // console.log(currentTime - enterTime);
  }

  player.newPos();
  playerMargin.newPos();

  if (gameState == "game" && playerHasEntered === true) {
    // Tap Button Functionality

    if (
      (player.safeUp &&
        player.intendedDirection == "up" &&
        player.movementDirection !== "up") ||
      (player.safeDown &&
        player.intendedDirection == "down" &&
        player.movementDirection !== "down") ||
      (player.safeLeft &&
        player.intendedDirection == "left" &&
        player.movementDirection !== "left") ||
      (player.safeRight &&
        player.intendedDirection == "right" &&
        player.movementDirection !== "right")
    ) {
      player.movementDirection = player.intendedDirection;
    }

    // Round Win Detection

    if (roundWon) {
      gameState = "next";
    }

    // Fruit Spawns

    if (
      lifeElapsedTime !== 0 &&
      lifeElapsedTime % 25 === 0 &&
      entities[entities.length - 1] !== "fruit" &&
      fruits.length === 0 &&
      fruitNum + 1 <= roundNo
    ) {
      createFruit();
      console.log("FRUIT " + fruitNum);
      fruitSpawnTime = lifeElapsedTime;
    } else if (
      fruitSpawnTime + 6 === lifeElapsedTime &&
      entities[entities.length - 1] === "fruit"
    ) {
      entities.splice(entities.length - 2, 2);
    }

    // Chase Ending

    if (currentTime - longChaseStartTime > 6000 && chaseStartTime !== 0) {
      if ((currentTime - longChaseStartTime) % 500 < 250) {
        entities[entities.length - 4].white = true;
        entities[entities.length - 8].white = true;
        entities[entities.length - 12].white = true;
        entities[entities.length - 16].white = true;
      } else if (currentTime - longChaseStartTime > 8000) {
        switchColours(true);
        if (
          entities[entities.length - 4].aiType !== "starting" &&
          entities[entities.length - 4].aiType !== null &&
          entities[entities.length - 4].aiType !== "deadGhost"
        ) {
          entities[entities.length - 4].aiType = "blinky";
        }
        if (
          entities[entities.length - 8].aiType !== "starting" &&
          entities[entities.length - 8].aiType !== null &&
          entities[entities.length - 8].aiType !== "deadGhost"
        ) {
          entities[entities.length - 8].aiType = "pinky";
        } else if (
          entities[entities.length - 8].aiType === null &&
          lifeElapsedTime > 5
        ) {
          entities[entities.length - 8].aiType = "starting";
        }
        if (
          entities[entities.length - 12].aiType !== "starting" &&
          entities[entities.length - 12].aiType !== null &&
          entities[entities.length - 12].aiType !== "deadGhost"
        ) {
          entities[entities.length - 12].aiType = "blinky";
        } else if (
          entities[entities.length - 12].aiType === null &&
          lifeElapsedTime > 10
        ) {
          entities[entities.length - 12].aiType = "starting";
        }
        if (
          entities[entities.length - 16].aiType !== "starting" &&
          entities[entities.length - 16].aiType !== null &&
          entities[entities.length - 16].aiType !== "deadGhost"
        ) {
          entities[entities.length - 16].aiType = "blinky";
        } else if (
          entities[entities.length - 16].aiType === null &&
          lifeElapsedTime > 15
        ) {
          entities[entities.length - 16].aiType = "starting";
        }
        chaseStartTime = 0;
        longChaseStartTime = 0;
        ghostCollateral = 0;
        chaseSwitchTime = 0;

        if (entities[entities.length - 4].aiType === "deadGhost") {
          entities[entities.length - 2].x = 216;
          entities[entities.length - 2].y = 270;
          entities[entities.length - 4].x = 216;
          entities[entities.length - 4].y = 270;
        }
        if (entities[entities.length - 8].aiType === "deadGhost") {
          entities[entities.length - 6].x = 216;
          entities[entities.length - 6].y = 270;
          entities[entities.length - 8].x = 216;
          entities[entities.length - 8].y = 270;
        }
        if (entities[entities.length - 12].aiType === "deadGhost") {
          entities[entities.length - 10].x = 216;
          entities[entities.length - 10].y = 270;
          entities[entities.length - 12].x = 216;
          entities[entities.length - 12].y = 270;
        }
        if (entities[entities.length - 16].aiType === "deadGhost") {
          entities[entities.length - 14].x = 216;
          entities[entities.length - 14].y = 270;
          entities[entities.length - 16].x = 216;
          entities[entities.length - 16].y = 270;
        }

        entities[entities.length - 4].white = false;
        entities[entities.length - 8].white = false;
        entities[entities.length - 12].white = false;
        entities[entities.length - 16].white = false;

        entities[entities.length - 4].aiType = "starting";
        entities[entities.length - 8].aiType = "starting";
        entities[entities.length - 12].aiType = "starting";
        entities[entities.length - 16].aiType = "starting";

        entities[entities.length - 4].movementSpeed = 2;
        entities[entities.length - 8].movementSpeed = 2;
        entities[entities.length - 12].movementSpeed = 2;
        entities[entities.length - 16].movementSpeed = 2;
      } else {
        entities[entities.length - 4].white = false;
        entities[entities.length - 8].white = false;
        entities[entities.length - 12].white = false;
        entities[entities.length - 16].white = false;
      }
    }

    // Ghost Starts

    if (lifeElapsedTime < 12 && chaseStartTime === 0) {
      if (
        lifeElapsedTime > 1 &&
        Math.random() < 0.02 &&
        entities[entities.length - 12].aiType === null
      ) {
        entities[entities.length - 12].aiType = "starting";
      } else if (
        lifeElapsedTime > 3 &&
        Math.random() < 0.02 &&
        entities[entities.length - 8].aiType === null &&
        entities[entities.length - 12].aiType !== null
      ) {
        entities[entities.length - 8].aiType = "starting";
      } else if (
        lifeElapsedTime > 5 &&
        Math.random() < 0.02 &&
        entities[entities.length - 4].aiType === null &&
        entities[entities.length - 8].aiType !== null
      ) {
        entities[entities.length - 4].aiType = "starting";
      }
    }

    // Player Teleporting Between Sides

    switch (true) {
      case player.x + player.width < 0:
        player.x = gameBox.canvas.width;
        playerMargin.x = gameBox.canvas.width;
        break;
      case player.x > gameBox.canvas.width:
        player.x = 0 - player.width;
        playerMargin.x = 0 - playerMargin.width;
        break;
    }

    //collision detections
    // player-wall collisions
    for (var w = 0; w < walls.length; w += 2) {
      // walls with player
      var wallCollisionData = walls[w].collideWith(playerMargin);
      if (wallCollisionData[0] === true && walls[w + 1] !== "slow") {
        switch (wallCollisionData[3]) {
          case "above":
            if (player.movementDirection == "down") {
              if (player.speedX < 0 || player.intendedDirection == "left") {
                player.movementDirection = "left";
              } else if (
                player.speedX > 0 ||
                player.intendedDirection == "right"
              ) {
                player.movementDirection = "right";
              }
            }
            player.y = walls[w].y - player.height;
            playerMargin.y = walls[w].y - playerMargin.height;
            break;
          case "left":
            if (player.movementDirection == "right") {
              if (player.speedY < 0 || player.intendedDirection == "up") {
                player.movementDirection = "up";
              } else if (
                player.speedY > 0 ||
                player.intendedDirection == "down"
              ) {
                player.movementDirection = "down";
              }
            }
            player.x = walls[w].x - player.width;
            playerMargin.x = walls[w].x - playerMargin.width;
            break;
          case "right":
            if (player.movementDirection == "left") {
              if (player.speedY < 0 || player.intendedDirection == "up") {
                player.movementDirection = "up";
              } else if (
                player.speedY > 0 ||
                player.intendedDirection == "down"
              ) {
                player.movementDirection = "down";
              }
            }
            player.x = walls[w].x + walls[w].width;
            playerMargin.x = walls[w].x + walls[w].width;
            break;
          case "below":
            if (player.movementDirection == "up") {
              if (player.speedX < 0 || player.intendedDirection == "left") {
                player.movementDirection = "left";
              } else if (
                player.speedX > 0 ||
                player.intendedDirection == "right"
              ) {
                player.movementDirection = "right";
              }
            }
            player.y = walls[w].y + walls[w].height;
            playerMargin.y = walls[w].y + walls[w].height;
            break;
        }
      }
    }

    playerMargin.movementDirection = player.movementDirection;
    
    // fruits

    for (var f = 0; f < fruits.length; f += 1) {
      fruits[f].redraw();

      if (fruits[f].isDead) {
        fruits.splice(f, 1);
        continue;
      }

      fruits[f].newPos();

      for (var w = 0; w < walls.length; w += 2) {
        // walls with fruit
        var wallCollisionData = walls[w].collideWith(fruits[f]);
        if (wallCollisionData[0] === true && walls[w + 1] !== "slow") {
          switch (wallCollisionData[3]) {
            case "above":
              fruits[f].y = walls[w].y - fruits[f].height;
              break;
            case "left":
              fruits[f].x = walls[w].x - fruits[f].width;
              break;
            case "right":
              fruits[f].x = walls[w].x + walls[w].width;
              break;
            case "below":
              fruits[f].y = walls[w].y + walls[w].height;
              break;
            default:
              fruits[f].x--;
              fruits[f].y--;
              break;
          }
        }
      }

      if (playerMargin.collideWith(fruits[f])[0] === true) {
        score += fruits[f].timer;
        switch (true) {
          case fruitNum >= 8:
            createWall(164, 549, 24, 24, "fruit");
            walls[walls.length - 2].image = sprites[7][7];
          case fruitNum >= 7:
            createWall(196, 549, 24, 24, "fruit");
            walls[walls.length - 2].image = sprites[7][6];
          case fruitNum >= 6:
            createWall(228, 549, 24, 24, "fruit");
            walls[walls.length - 2].image = sprites[7][5];
          case fruitNum >= 5:
            createWall(260, 549, 24, 24, "fruit");
            walls[walls.length - 2].image = sprites[7][4];
          case fruitNum >= 4:
            createWall(292, 549, 24, 24, "fruit");
            walls[walls.length - 2].image = sprites[7][3];
          case fruitNum >= 3:
            createWall(324, 549, 24, 24, "fruit");
            walls[walls.length - 2].image = sprites[7][2];
          case fruitNum >= 2:
            createWall(356, 549, 24, 24, "fruit");
            walls[walls.length - 2].image = sprites[7][1];
          case fruitNum >= 1:
            createWall(388, 549, 24, 24, "fruit");
            walls[walls.length - 2].image = sprites[7][0];
            break;
        }
        fruits[f].isDead = true;
      }
    } // /fruits
    
    // all entity mechanics

    for (var e = 0; e < entities.length; e += 2) {
      if (entities.length == 16) {
        roundWon = true;
      }

      if (entities[e].ghostTimer > 600) {
        entities[e].x = 216;
        entities[e].y = 270;
        // margin
        entities[e + 2].x = 216;
        entities[e + 2].y = 270;
        entities[e].ghostTimer = 0;
      } else if (entities[e].aiType == "deadGhost") {
        entities[e].ghostTimer++;
      }

      if (entities[e + 1] === "ghost" || entities[e + 1] === "margin") {
        entities[e].newPos();
        entities[e].isSlowed = false;

        // Inky/Clyde Switching

        if (
          entities[e].name === "inky" &&
          entities[e].aiType !== null &&
          entities[e].aiType !== "starting" &&
          entities[e].aiType !== "chaseAi" &&
          entities[e].aiType !== "deadGhost"
        ) {
          entities[e].timer++;
          if (entities[e].timer === 75) {
            entities[e].aiType = "pinky";
          } else if (entities[e].timer === 150) {
            entities[e].aiType = "blinky";
            entities[e].timer = 0;
          }
        } else if (
          entities[e].name === "clyde" &&
          entities[e].aiType !== null &&
          entities[e].aiType !== "starting" &&
          entities[e].aiType !== "chaseAi" &&
          entities[e].aiType !== "deadGhost"
        ) {
          if (
            Math.abs(entities[e].x - player.x) < 50 ||
            Math.abs(entities[e].y - player.y) < 50
          ) {
            entities[e].aiType = "clyde";
          }
        }

        // Side Tunnels

        switch (true) {
          case entities[e].x + entities[e].width < 0:
            entities[e].x = gameBox.canvas.width;
            break;
          case entities[e].x > gameBox.canvas.width:
            entities[e].x = 0 - entities[e].width;
            break;
        }
      }
      entities[e].speedX = 0;
      entities[e].speedY = 0;

      // Dead Entity Special Conditions
      if (entities[e].isDead === true) {
        entities.splice(e, 2);
        e -= 2;
        continue;
      }
      // Entity Collision Data
      // Entity collides with Player
      var entityCollisionDataPlayer = entities[e].collideWith(playerMargin);
      if (entityCollisionDataPlayer[0] === true && player.isDead === false) {
        switch (entityCollisionDataPlayer[3]) {
          case "above":
            playerGhostCollision(e);
            break;
          case "left":
            playerGhostCollision(e);
            break;
          case "right":
            playerGhostCollision(e);
            break;
          case "below":
            playerGhostCollision(e);
            break;
        }
      }
      // Entity collides with walls
      if (entities[e].isMargin) {
        // efficiency, pellets don't need wall collision
        for (var w2 = 0; w2 < walls.length; w2 += 2) {
          var entityCollisionDataWalls = walls[w2].collideWith(entities[e]);
          if (
            entityCollisionDataWalls[0] === true &&
            player.isDead === false &&
            walls[w2 + 1] !== "slow"
          ) {
            switch (entityCollisionDataWalls[3]) {
              case "above":
                if (
                  walls[w2 + 1] !== "gate" ||
                  (entities[e].margining.aiType !== "deadGhost" &&
                    entities[e].margining.aiType !== "starting")
                ) {
                  if (entities[e].margining.movementDirection == "down") {
                    if (entities[e].margining.speedX < 0) {
                      entities[e].margining.movementDirection = "left";
                    } else if (player.speedX > 0) {
                      entities[e].margining.movementDirection = "right";
                    }
                  }
                  entities[e].margining.y =
                    walls[w2].y - entities[e].margining.height;
                  entities[e].y = walls[w2].y - entities[e].height;
                  entities[e].margining.safeDown = false;
                }
                break;
              case "left":
                if (entities[e].margining.movementDirection == "right") {
                  if (entities[e].margining.speedY < 0) {
                    entities[e].margining.movementDirection = "up";
                  } else if (entities[e].margining.speedY > 0) {
                    entities[e].margining.movementDirection = "down";
                  }
                }
                entities[e].margining.x =
                  walls[w2].x - entities[e].margining.width;
                entities[e].x = walls[w2].x - entities[e].width;
                entities[e].margining.safeRight = false;
                break;
              case "right":
                if (entities[e].margining.movementDirection == "left") {
                  if (entities[e].margining.speedY < 0) {
                    entities[e].margining.movementDirection = "up";
                  } else if (entities[e].margining.speedY > 0) {
                    entities[e].margining.movementDirection = "down";
                  }
                }
                entities[e].margining.x = walls[w2].x + walls[w2].width;
                entities[e].x = walls[w2].x + walls[w2].width;
                entities[e].margining.safeLeft = false;
                break;
              case "below":
                if (walls[w2 + 1] !== "gate") {
                  if (entities[e].margining.movementDirection == "up") {
                    if (entities[e].margining.speedX < 0) {
                      entities[e].margining.movementDirection = "left";
                    } else if (entities[e].margining.speedX > 0) {
                      entities[e].margining.movementDirection = "right";
                    }
                  }
                  entities[e].margining.y = walls[w2].y + walls[w2].height;
                  entities[e].y = walls[w2].y + walls[w2].height;
                  entities[e].margining.safeUp = false;
                }
                break;
            }
          } else if (
            entityCollisionDataWalls[0] === true &&
            walls[w2 + 1] === "slow"
          ) {
            entities[e].isSlowed = true;
            entities[e].margining.isSlowed = true;
            entities[e].movementSpeed = 1.6;
            entities[e].margining.movementSpeed = 1.6;
          } else if (
            !entities[e].margining.isSlowed &&
            entities[e].margining.aiType != "deadGhost" &&
            chaseStartTime === 0
          ) {
            entities[e].movementSpeed = 2;
            entities[e].margining.movementSpeed = 2;
          }
        }
      }

      if (
        !entities[e].isMargin &&
        !entities[e].isSlowed &&
        entities[e].movementSpeed === 1.6
      )
        entities[e].movementSpeed = 2;
    }
  } else if (gameState === "next") {
    // findnext
    if (player.isDead) {
      if (player.timer < 5) player.image = sprites[0][0];
      else if (player.timer > 25 && player.timer < 125) {
        player.image = sprites[6][Math.floor((player.timer - 25) / 10)];
      } else if (player.timer > 125 && player.timer < 130) {
        player.image = transparent;
      } else if (player.timer > 150) {
        player.image = sprites[0][0];
        player.intendedDirection = null;
        player.movementDirection = null;
        if (lives - 1 > 0) {
          player.x = 208;
          player.y = 411;
          playerMargin.x = 209;
          playerMargin.y = 411;
          player.timer = 0;
          chaseStartTime = 0;
          chaseSwitchTime = 0;
          ghostCollateral = 0;
          player.isDead = false;
          player.colour = "yellow";
          lifeStartTime = new Date().getTime();

          entities[entities.length - 16].x = 208; // blinky
          entities[entities.length - 16].y = 216;
          entities[entities.length - 16].aiType = "blinky";
          entities[entities.length - 16].movementSpeed = 2;
          entities[entities.length - 16].image = sprites[1][0];

          entities[entities.length - 14].x = 209; // blinkyM
          entities[entities.length - 14].y = 216;

          entities[entities.length - 12].x = 208; // pinky
          entities[entities.length - 12].y = 266;
          entities[entities.length - 12].movementSpeed = 2;
          entities[entities.length - 12].aiType = null;
          entities[entities.length - 12].image = sprites[2][0];

          entities[entities.length - 10].x = 209; // pinkyM
          entities[entities.length - 10].y = 266;

          entities[entities.length - 8].x = 176; // inky
          entities[entities.length - 8].y = 266;
          entities[entities.length - 8].movementSpeed = 2;
          entities[entities.length - 8].aiType = null;
          entities[entities.length - 8].image = sprites[3][0];

          entities[entities.length - 6].x = 177; // inkyM
          entities[entities.length - 6].y = 266;

          entities[entities.length - 4].x = 240; // clyde
          entities[entities.length - 4].y = 266;
          entities[entities.length - 4].movementSpeed = 2;
          entities[entities.length - 4].aiType = null;
          entities[entities.length - 4].image = sprites[4][0];

          entities[entities.length - 2].x = 241; // clydeM
          entities[entities.length - 2].y = 267;

          lives--;
          walls.splice(walls.length - 2, 2);
          gameState = "game";
        } else {
          if (
            document.getElementById("usernameBox") === null &&
            !stopCheckingScorePause
          ) {
            if (localStorage.getItem("score5") === null) {
              scorePause = true;
            } else if (parseInt(localStorage.getItem("score5")) < score) {
              scorePause = true;
            }
          }

          if (!scorePause) {
            score = 0;
            lives = 0;
            lives = 3;
            roundNo = 1;
            fruitNum = 0;
            createMap();
            stopCheckingScorePause = false;
            gameState = "game";
          }

          if (
            document.getElementById("usernameBox") === null &&
            gameState !== "game"
          ) {
            row = document.createElement("tr");
            row.setAttributeNode(betterCreateAttr("class", "highScore")); // not technically true, but gets removed by addHighScore()

            var bcell = document.createElement("td");
            var button = document.createElement("button");
            button.setAttributeNode(betterCreateAttr("type", "button"));
            button.setAttributeNode(
              betterCreateAttr("onclick", "buttonInput()")
            );
            button.innerHTML = "Submit";
            bcell.appendChild(button);

            var cell = document.createElement("td");
            var input = document.createElement("input");
            input.setAttributeNode(betterCreateAttr("id", "usernameBox"));
            input.setAttributeNode(betterCreateAttr("type", "text"));
            cell.appendChild(input);

            row.appendChild(cell);
            row.appendChild(bcell);

            document.getElementById("hstbody").appendChild(row);
          }
          if (gameState !== "game") highScoreEntry();
        }
      }
      player.timer++;
    } else {
      // End Animation

      // Redraws

      for (var w = 0; w < walls.length; w += 2) {
        walls[w].redraw();
      }
      for (var e = 0; e < entities.length; e += 2) {
        if (!entities[e].isMargin) entities[e].redraw();
        // entities[e].redraw();
      }

      // Stop Player

      player.movementDirection = null;
      player.intendedDirection = null;

      if (player.timer > 25 && player.timer < 100) {
        player.colour = "white";
      } else if (player.timer > 100) {
        createMap();
        roundNo++;
        roundWon = false;
        player.timer = 0;
        gameState = "game";
      }

      player.timer++;
    }
  } else if (gameState === "start") {
    gameBox.erase();
    mainMenu();
  }
  player.speedX = 0;
  player.speedY = 0;
  // while(previousFrame + 16 > new Date().getTime()){
  //   null;
  // }
  animator = requestAnimationFrame(updateGameArea);
}

// menu variables

var pressed = [false, false, false, false]; // w a s d
var enterTime = 0;

// 448, 576
function mainMenu() {
  rect(
    Math.ceil(gameBox.canvas.width / 10),
    Math.ceil(gameBox.canvas.height / 10),
    Math.ceil(gameBox.canvas.width * 0.8),
    Math.ceil(gameBox.canvas.height * 0.8),
    "blue"
  );
  rect(
    Math.ceil(gameBox.canvas.width / 8),
    Math.ceil(gameBox.canvas.height / 8),
    Math.ceil(gameBox.canvas.width * 0.75),
    Math.ceil(gameBox.canvas.height * 0.75),
    "black"
  );
  drawText(
    "PAC MAN",
    gameBox.canvas.width / 2,
    170,
    "yellow",
    true,
    60,
    "Courier New"
  );
  drawImg(
    sprites[0][9 + Math.ceil((currentTime % 1000) / 250) % 4],
    gameBox.canvas.width / 2 - 100,
    200,
    200,
    200
  );
  drawText(
    "Use W A S D or Arrow",
    gameBox.canvas.width / 2,
    455,
    "yellow",
    true,
    24,
    "Courier New"
  );
  drawText("Keys to Play", gameBox.canvas.width / 2, 485, "yellow", true);

  if (gameBox.keys && (gameBox.keys[87] || gameBox.keys[38])) pressed[0] = true;
  if (gameBox.keys && (gameBox.keys[65] || gameBox.keys[39])) pressed[1] = true;
  if (gameBox.keys && (gameBox.keys[83] || gameBox.keys[37])) pressed[2] = true;
  if (gameBox.keys && (gameBox.keys[68] || gameBox.keys[40])) pressed[3] = true;

  for (var i = 0; i < pressed.length; i++) {
    if (!pressed[i]) break;
    if (i === 3 && gameState !== "game") {
      gameState = "game";
      enterTime = currentTime;
      lifeStartTime = currentTime;
      totalStartTime = currentTime;
    }
  }
}

function rect(x, y, w, h, colour) {
  gameBox.context.fillStyle = colour;
  gameBox.context.fillRect(x, y, w, h);
}

function drawText(text, x, y, colour, centered, size?, type?) {
  gameBox.context.fillStyle = colour;
  if (type != null) gameBox.context.font = size + "px " + type;
  if (centered) gameBox.context.textAlign = "center";
  else gameBox.context.textAlign = "left";
  gameBox.context.fillText(text, x, y);
}

function drawImg(img, x, y, w, h) {
  if (h === null) gameBox.context.drawImage(img, x, y);
  else gameBox.context.drawImage(img, x, y, w, h);
}

function drawRotatedImg(img, x, y, w, h, angle) {
  gameBox.context.translate(x + img.width / 2, y + img.height / 2);
  gameBox.context.rotate(angle * (Math.PI / 180));
  if (h === null)
    // gameBox.context.drawImage(img,-img.width/2,-img.height/2,img.width,img.height);
    gameBox.context.drawImage(
      img,
      -img.width / 2,
      -img.height / 2,
      img.width,
      img.height
    );
  else gameBox.context.drawImage(img, -w / 2, -h / 2, w, h);
  gameBox.context.rotate(-angle * (Math.PI / 180));
  gameBox.context.translate(-x - img.width / 2, -y - img.height / 2);
}

function createSprites() {
  sprites[0][0] = document.getElementById(
    "/siteimages/pac/pacman/default.png"
  );
  for (var i = 0; i < 5; i++) {
    var entity;
    var e;
    switch (i) {
      case 0:
        entity = "pacman";
        break;
      case 1:
        entity = "red";
        break;
      case 2:
        entity = "pink";
        break;
      case 3:
        entity = "cyan";
        break;
      case 4:
        entity = "orange";
        break;
    }
    for (var j = 0; j < 8; j++) {
      var d;
      switch (Math.floor(j / 2)) {
        case 0:
          d = "u";
          break;
        case 1:
          d = "l";
          break;
        case 2:
          d = "d";
          break;
        case 3:
          d = "r";
          break;
      }
      if (i === 0)
        sprites[i][j + 1] = document.getElementById(
          "/siteimages/pac/" + entity + "/" + d + (j % 2 + 1) + ".png"
        );
      else
        sprites[i][j] = document.getElementById(
          "/siteimages/pac/" + entity + "/" + d + (j % 2 + 1) + ".png"
        );
    }
  }
  for (var i = 0; i < 3; i++) {
    sprites[0][9 + i] = document.getElementById(
      "/siteimages/pac/pacman/large" + i + ".png"
    );
  }
  sprites[0][12] = sprites[0][10];
  sprites[0][13] = document.getElementById("/siteimages/pac/pacman/s1.png");

  sprites[5][0] = document.getElementById("/siteimages/pac/chase/b1.png");
  sprites[5][1] = document.getElementById("/siteimages/pac/chase/b2.png");
  sprites[5][2] = document.getElementById("/siteimages/pac/chase/w1.png");
  sprites[5][3] = document.getElementById("/siteimages/pac/chase/w2.png");
  sprites[5][4] = document.getElementById("/siteimages/pac/death/u.png");
  sprites[5][7] = document.getElementById("/siteimages/pac/death/r.png");
  sprites[5][6] = document.getElementById("/siteimages/pac/death/d.png");
  sprites[5][5] = document.getElementById("/siteimages/pac/death/l.png");

  for (var i = 1; i <= 10; i++) {
    sprites[6][i - 1] = document.getElementById(
      "/siteimages/pac/pacd/" + i + ".png"
    );
  }

  for (var i = 1; i <= 8; i++) {
    sprites[7][i - 1] = document.getElementById(
      "/siteimages/pac/fruits/" + i + ".png"
    );
  }
}

function moveLeft(entity, speed) {
  entity.speedX -= speed;
}

function moveRight(entity, speed) {
  entity.speedX += speed;
}

function moveUp(entity, speed) {
  // analogy: pushes the entity
  entity.speedY -= speed;
}

function moveDown(entity, speed) {
  // analogy: pushes the entity
  entity.speedY += speed;
}

function quickWin() {
  entities.splice(0, entities.length - 8);
}

function chase() {
  chaseStartTime = lifeElapsedTime;
  longChaseStartTime = currentTime;
  chaseSwitchTime = null;
  entities[entities.length - 4].white = false;
  entities[entities.length - 8].white = false;
  entities[entities.length - 12].white = false;
  entities[entities.length - 16].white = false;
  if (
    entities[entities.length - 4].aiType !== null
    // && entities[entities.length - 4].aiType !== "starting"
  ) {
    entities[entities.length - 4].aiType = "chaseAi";
    entities[entities.length - 4].movementSpeed = 1;
  }
  if (
    entities[entities.length - 8].aiType !== null
    // && entities[entities.length - 8].aiType !== "starting"
  ) {
    entities[entities.length - 8].aiType = "chaseAi";
    entities[entities.length - 8].movementSpeed = 1;
  }
  if (
    entities[entities.length - 12].aiType !== null
    // && entities[entities.length - 12].aiType !== "starting"
  ) {
    entities[entities.length - 12].aiType = "chaseAi";
    entities[entities.length - 12].movementSpeed = 1;
  }
  if (
    entities[entities.length - 16].aiType !== null
    // && entities[entities.length - 16].aiType !== "starting"
  ) {
    entities[entities.length - 16].aiType = "chaseAi";
    entities[entities.length - 16].movementSpeed = 1;
  }
}

function switchColours(final) {
  // clyde
  if (entities[entities.length - 4].aiType === "chaseAi") {
    if (
      entities[entities.length - 4].image === sprites[5][0] ||
      entities[entities.length - 4].image === sprites[5][1]
    ) {
      // entities[entities.length - 4].image = "orange";
      if (entities[entities.length - 4].movementSpeed === 1 && final)
        entities[entities.length - 4].movementSpeed = 2;
    } else {
      // entities[entities.length - 4].colour = "blue";
    }
  }
  if (entities[entities.length - 8].aiType === "chaseAi") {
    if (entities[entities.length - 8].colour === "blue") {
      // entities[entities.length - 8].colour = "cyan";
      if (entities[entities.length - 8].movementSpeed === 1 && final)
        entities[entities.length - 8].movementSpeed = 2;
    } else {
      // entities[entities.length - 8].colour = "blue";
    }
  }
  if (entities[entities.length - 12].aiType === "chaseAi") {
    if (entities[entities.length - 12].colour === "blue") {
      // entities[entities.length - 12].colour = "pink";
      if (entities[entities.length - 12].movementSpeed === 1 && final)
        entities[entities.length - 12].movementSpeed = 2;
    } else {
      // entities[entities.length - 12].colour = "blue";
    }
  }
  if (entities[entities.length - 16].aiType === "chaseAi") {
    if (entities[entities.length - 16].colour === "blue") {
      // entities[entities.length - 16].colour = "red";
      if (entities[entities.length - 16].movementSpeed === 1 && final)
        entities[entities.length - 16].movementSpeed = 2;
    } else {
      // entities[entities.length - 16].colour = "blue";
    }
  }
}

function playerGhostCollision(e) {
  if (entities[e + 1] !== "ghost") {
    if (entities[e + 1] === "normalPellet") {
      score += 10 * roundNo;
      entities[e].isDead = true;
    } else if (entities[e + 1] === "murderPellet") {
      score += 50 * roundNo;
      entities[e].isDead = true;
      chase();
    }
  } else if (entities[e].aiType === "chaseAi") {
    entities[e].aiType = "deadGhost";
    entities[e].movementSpeed = 4;
    ghostCollateral++;
    score += Math.pow(2, ghostCollateral) * 100 * roundNo;
  } else if (
    entities[e].aiType !== "chaseAi" &&
    entities[e].aiType !== "deadGhost" &&
    entities[e + 1] === "ghost" &&
    !godMode
  ) {
    if (
      Math.sqrt(
        Math.pow(Math.abs(entities[e].x - player.x), 2) +
          Math.pow(Math.abs(entities[e].y - player.y), 2)
      ) < 28
    ) {
      player.isDead = true;
      gameState = "next";
    }
  }
}

function findDirection(me, it) {
  var itsx = it.x;
  var itsy = it.y;
  var verticalResult = me.y - itsy;
  var horizontalResult = me.x - itsx;

  if (
    me.aiType === "clyde" ||
    me.aiType === "chaseAi" ||
    me.aiType === "deadGhost"
  ) {
    if (me.aiType === "chaseAi") {
      itsx = 208;
      itsy = 266;
    } else {
      switch (me.name) {
        case "blinky":
        case "pinky":
          itsx = 216;
          itsy = 270;
          break;
        case "inky":
          itsx = 184;
          itsy = 270;
          break;
        case "clyde":
          itsx = 248;
          itsy = 270;
          break;
      }
    }
    verticalResult = me.y - itsy;
    horizontalResult = me.x - itsx;
    if (
      (Math.abs(verticalResult) < 50 || Math.abs(horizontalResult) < 50) &&
      me.aiType === "clyde"
    ) {
      me.aiType = "blinky";
    } else if (
      Math.abs(verticalResult) < 10 &&
      Math.abs(horizontalResult) < 10 &&
      me.aiType === "deadGhost"
    ) {
      me.movementSpeed = 2;
      me.ghostTimer = 0;
      switch (me.name) {
        case "blinky":
          me.colour = "red";
          break;
        case "pinky":
          me.colour = "pink";
          break;
        case "inky":
          me.colour = "cyan";
          break;
        case "clyde":
          me.colour = "orange";
          break;
      }
      if (chaseStartTime !== 0) me.aiType = null;
      else me.aiType = "starting";
    }
  } else if (me.aiType === "pinky" && it === player) {
    switch (it.movementDirection) {
      case "up":
        verticalResult = me.y - (it.y - 150);
        break;
      case "down":
        verticalResult = me.y - (it.y + 150);
        break;
      case "left":
        horizontalResult = me.x - (it.x - 150);
        break;
      case "right":
        horizontalResult = me.x - (it.x + 150);
        break;
    }
  } else if (me.aiType === "starting") {
    itsx = 224;
    itsy = 0;
    verticalResult = me.y - itsy;
    horizontalResult = me.x - itsx;
    if (me.y <= 220) {
      if (me.name == "pinky") {
        me.aiType = "pinky";
      } else {
        me.aiType = "blinky";
      }
    }
  }

  if (Math.abs(verticalResult) > Math.abs(horizontalResult)) {
    if (verticalResult < 0) {
      // it is below me, therefore I must go down
      if (horizontalResult < 0) {
        return ["down", "right"];
      } else {
        return ["down", "left"];
      }
    } else {
      // it is above me, therefore I must go up
      if (horizontalResult < 0) {
        return ["up", "right"];
      } else {
        return ["up", "left"];
      }
    }
  } else if (Math.abs(verticalResult) < Math.abs(horizontalResult)) {
    if (horizontalResult < 0) {
      // it is right of me, therefore I must go right
      if (verticalResult < 0) {
        return ["right", "down"];
      } else {
        return ["right", "up"];
      }
    } else {
      // it is left of me, therefore I must go left
      if (verticalResult < 0) {
        return ["left", "down"];
      } else {
        return ["left", "up"];
      }
    }
  } else {
    // for when verticalResult and horizontalResult are equal
    if (verticalResult < 0) {
      // it is below me, therefore I must go down
      if (horizontalResult < 0) {
        return ["down", "right"];
      } else {
        return ["down", "left"];
      }
    } else {
      // it is above me, therefore I must go up
      if (horizontalResult < 0) {
        return ["up", "right"];
      } else {
        return ["up", "left"];
      }
    }
  }
  console.log("findDirection error");
  return [null, null]; // default option if something goes wrong
}

function addZeros(number, width) {
  return new Array(width + 1 - (number + "").length).join("0") + number;
}

function setImage(component, img) {
  component.colour = img;
  component.imageReset();
}

function createWall(x, y, w, h, type) {
  if (type == "gate") {
    walls.push(new component(w, h, "pink", x, y));
  } else if (type == "slow") {
    walls.push(new component(w, h, "rgba(0,0,0,0)", x, y));
  } else if (type == "block") {
    walls.push(new component(w, h, "black", x, y));
  } else if (type == "fruit" || type === "lifeIcon") {
    walls.push(new component(w, h, "red", x, y, "image"));
  } else {
    walls.push(new component(w, h, "blue", x, y));
  }
  walls.push(type);
}

function createEntity(w, h, colour, xInput, yInput, type) {
  if (colour === "white") {
    entities.push(new component(w, h, colour, xInput, yInput, "entity"));
  } else {
    entities.push(
      new component(w, h, colour, xInput, yInput, "entity", "image")
    );
  }
  if (type === "ghost") {
    entities[entities.length - 1].hasAi = true;
    entities[entities.length - 1].isSlowed = false;
  }
  entities[entities.length - 1].movementDirection = "left";
  entities.push(type);
}

function createFruit() {
  fruitNum++;
  var x = Math.round(Math.random() * 400) + 8;
  var y = Math.round(Math.random() * 450) + 56;
  var fruitScore = 0;
  var image;
  if (x > 168 && x < 279 && y > 248 && y < 312) {
    // ensuring fruit does not spawn in the ghostBox
    x = 212;
    y = 310;
  }
  console.log(fruitNum);
  switch (fruitNum) {
    case 1: // cherry
      fruitScore = 100;
      image = sprites[7][fruitNum - 1];
      break;
    case 2: // strawberry
      fruitScore = 300;
      image = sprites[7][fruitNum - 1];
      break;
    case 3: // orange
      fruitScore = 500;
      image = sprites[7][fruitNum - 1];
      break;
    case 4: // apple
      fruitScore = 700;
      image = sprites[7][fruitNum - 1];
      break;
    case 5: // melon
      fruitScore = 1000;
      image = sprites[7][fruitNum - 1];
      break;
    case 6: // boss
      fruitScore = 2000;
      image = sprites[7][fruitNum - 1];
      break;
    case 7: // bell
      fruitScore = 3000;
      image = sprites[7][fruitNum - 1];
      break;
    default:
      // key
      fruitScore = 5000;
      image = sprites[7][7];
      break;
  }
  fruits.push(new component(32, 32, image, x, y, "entity", "image"));
  fruits[fruits.length - 1].timer = fruitScore;
}

function createMap() {
  chaseStartTime = 0;
  lifeStartTime = new Date().getTime();

  walls = [];
  entities = [];
  if(fruits.length !== 0 && fruitNum > 0) {
    console.log("--");
    fruitNum--;
  }
  fruits = [];
  player = new component(32, 32, sprites[0][0], 208, 411, "entity", "image");

  playerMargin = new component(
    30,
    32,
    "white",
    player.x + 1,
    player.y,
    "entity"
  );
  playerMargin.margining = player;
  player.oldMovementDirection = null;

  // pellets
  for (var i = 0; i < 24; i++) {
    // left tall column
    if (i == 18 || i == 21) {
      continue;
    }
    createEntity(4, 4, "white", 102, 86 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 24; i++) {
    // right tall column
    if (i == 18 || i == 21) {
      continue;
    }
    createEntity(4, 4, "white", 342, 86 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 6; i++) {
    // top left column
    if (i == 1) createEntity(16, 16, murderImg, 16, 96, "murderPellet");
    else if (i == 3) continue;
    else createEntity(4, 4, "white", 22, 86 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 6; i++) {
    // top right column
    if (i == 1)
      createEntity(16, 16, murderImg, 416, 96, "murderPellet");
      // createEntity(16, 16, murderImg, 416, 96, "murderPellet", "image");
    else if (i == 3) continue;
    else createEntity(4, 4, "white", 422, 86 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 8; i++) {
    // bottom left column
    if (i == 2) {
      createEntity(16, 16, murderImg, 16, 417, "murderPellet");
    }
    if (i >= 2 && i < 5) {
      continue;
    }
    createEntity(4, 4, "white", 22, 391 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 8; i++) {
    // bottom right column
    if (i == 2)
      createEntity(16, 16, murderImg, 416, 417, "murderPellet");
    else if (i >= 2 && i < 5) continue;
    else
      createEntity(4, 4, murderImg, 422, 391 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 12; i++) {
    // top left row
    createEntity(4, 4, "white", 22 + i * 16, 70, "normalPellet");
  }

  for (var i = 0; i < 12; i++) {
    // top right row
    createEntity(4, 4, "white", 246 + i * 16, 70, "normalPellet");
  }

  for (var i = 0; i < 26; i++) {
    // top center row
    if (i == 5 || i == 20) {
      continue;
    }
    createEntity(4, 4, "white", 22 + i * 16, 134, "normalPellet");
  }

  for (var i = 0; i < 26; i++) {
    // top lower row
    if (
      i == 5 ||
      i == 6 ||
      i == 7 ||
      i == 12 ||
      i == 13 ||
      i == 18 ||
      i == 19 ||
      i == 20
    ) {
      continue;
    }
    createEntity(4, 4, "white", 22 + i * 16, 182, "normalPellet");
  }

  for (var i = 0; i < 12; i++) {
    // bottom left row
    createEntity(4, 4, "white", 22 + i * 16, 375, "normalPellet");
  }

  for (var i = 0; i < 12; i++) {
    // bottom right row
    createEntity(4, 4, "white", 246 + i * 16, 375, "normalPellet");
  }

  for (var i = 0; i < 26; i++) {
    // bottom center row
    createEntity(4, 4, "white", 22 + i * 16, 519, "normalPellet");
  }

  for (var i = 0; i < 24; i++) {
    // bottom second row
    if (i == 2 || i == 3 || i == 11 || i == 12 || i == 20 || i == 21) {
      continue;
    }
    createEntity(4, 4, "white", 38 + i * 16, 423, "normalPellet");
  }

  for (var i = 0; i < 26; i++) {
    // bottom third row
    if (i == 6 || i == 7 || i == 12 || i == 13 || i == 18 || i == 19) {
      continue;
    }
    createEntity(4, 4, "white", 22 + i * 16, 471, "normalPellet");
  }

  for (var i = 0; i < 3; i++) {
    // top middle left
    createEntity(4, 4, "white", 198, 86 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 3; i++) {
    // top middle right
    createEntity(4, 4, "white", 246, 86 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 2; i++) {
    // topmid middle left
    createEntity(4, 4, "white", 150, 150 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 2; i++) {
    // topmid middle right
    createEntity(4, 4, "white", 294, 150 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 2; i++) {
    // botmid left
    createEntity(4, 4, "white", 54, 439 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 2; i++) {
    // botmid middle left
    createEntity(4, 4, "white", 150, 439 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 2; i++) {
    // bottop middle left
    createEntity(4, 4, "white", 198, 391 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 2; i++) {
    // bottop middle right
    createEntity(4, 4, "white", 246, 391 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 2; i++) {
    // botmid middle right
    createEntity(4, 4, "white", 294, 439 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 2; i++) {
    // botmid right
    createEntity(4, 4, "white", 390, 439 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 2; i++) {
    // bottom middle left
    createEntity(4, 4, "white", 198, 487 + i * 16, "normalPellet");
  }

  for (var i = 0; i < 2; i++) {
    // bottom middle right
    createEntity(4, 4, "white", 246, 487 + i * 16, "normalPellet");
  }
  // ghosts

  // b
  createEntity(32, 32, sprites[1][0], 208, 216, "ghost");
  entities[entities.length - 2].name = "blinky";
  entities[entities.length - 2].aiType = "blinky";
  // bM
  createEntity(30, 32, "white", 209, 216, "margin");
  entities[entities.length - 2].margining = entities[entities.length - 4];
  entities[entities.length - 2].isMargin = true;

  // p
  createEntity(32, 32, sprites[2][0], 208, 266, "ghost");
  entities[entities.length - 2].name = "pinky";
  // pM
  createEntity(30, 32, "white", 209, 266, "margin");
  entities[entities.length - 2].margining = entities[entities.length - 4];
  entities[entities.length - 2].isMargin = true;

  // i
  createEntity(32, 32, sprites[3][0], 176, 266, "ghost");
  entities[entities.length - 2].name = "inky";
  // iM
  createEntity(30, 32, "white", 177, 266, "margin");
  entities[entities.length - 2].margining = entities[entities.length - 4];
  entities[entities.length - 2].isMargin = true;

  // c
  createEntity(32, 32, sprites[4][0], 242, 266, "ghost");
  entities[entities.length - 2].name = "clyde";
  // cM
  createEntity(30, 32, "white", 243, 266, "margin");
  entities[entities.length - 2].margining = entities[entities.length - 4];
  entities[entities.length - 2].isMargin = true;

  createWall(0, 48, 448, 8, "normal"); // topBorder
  createWall(0, 537, 448, 8, "normal"); // bottomBorder
  createWall(0, 48, 8, 160, "normal"); // leftTopBorder
  createWall(0, 353, 8, 192, "normal"); // leftBottomBorder

  createWall(-50, 200, 138, 8, "normal"); // leftTopTopOutcrop
  createWall(80, 208, 8, 48, "normal"); // leftTopSideOutcrop
  createWall(-50, 256, 138, 8, "normal"); // leftTopBottomOutcrop
  createWall(-50, 296, 138, 8, "normal"); // leftBottomTopOutcrop
  createWall(80, 304, 8, 49, "normal"); // leftBottomSideOutcrop
  createWall(-50, 353, 138, 8, "normal"); // leftBottomBottomOutcrop
  createWall(0, 208, 80, 48, "block"); // leftTopOutcropFruitGenBlocker
  createWall(0, 304, 80, 49, "block"); // leftBottomOutcropFruitGenBlocker

  createWall(40, 88, 48, 32, "normal"); // topLeftLeftThickBlock
  createWall(120, 88, 64, 32, "normal"); // topLeftRightThickBlock
  createWall(40, 152, 48, 16, "normal"); // leftThinBlockTop

  createWall(120, 296, 16, 65, "normal"); // leftMidWall

  createWall(120, 152, 16, 112, "normal"); // leftTshapeVertical
  createWall(136, 200, 48, 16, "normal"); // leftTshapeHorizontal

  createWall(216, 56, 16, 64, "normal"); // topStalactiteVertical

  createWall(40, 393, 32, 16, "normal"); // leftBottomLHorizontal
  createWall(72, 393, 16, 64, "normal"); // leftBottomLVertical

  createWall(120, 393, 64, 16, "normal"); // leftBottomHorizontalStick

  createWall(8, 441, 32, 16, "normal"); // leftBottomOutcrop

  createWall(40, 489, 144, 16, "normal"); // leftBottomInvertedTHorizontal
  createWall(120, 441, 16, 48, "normal"); // leftBottomInvertedTVertical

  createWall(168, 441, 112, 16, "normal"); // midBottomLowerTHorizontal
  createWall(216, 457, 16, 48, "normal"); // midBottomLowerTVertical

  createWall(168, 345, 112, 16, "normal"); // midBottomUpperTHorizontal
  createWall(216, 361, 16, 48, "normal"); // midBottomUpperTVertical

  createWall(168, 152, 112, 16, "normal"); // midTopTshapeHorizontal
  createWall(216, 168, 16, 48, "normal"); // midTopTshapeVertical

  createWall(168, 248, 40, 8, "normal"); // ghostBoxTopLeftHorizontal
  createWall(168, 248, 8, 65, "normal"); // ghostBoxLeftVertical
  createWall(168, 305, 112, 8, "normal"); // ghostBoxBottomHorizontal
  createWall(240, 248, 40, 8, "normal"); // ghostBoxTopRightHorizontal
  createWall(272, 248, 8, 65, "normal"); // ghostBoxRightVertical
  createWall(208, 248, 32, 8, "gate"); // ghostBoxGate

  createWall(440, 48, 8, 160, "normal"); // rightTopBorder
  createWall(440, 353, 8, 192, "normal"); // rightBottomBorder

  createWall(360, 200, 138, 8, "normal"); // rightTopTopOutcrop
  createWall(360, 208, 8, 48, "normal"); // rightTopSideOutcrop
  createWall(360, 256, 138, 8, "normal"); // rightTopBottomOutcrop
  createWall(360, 296, 138, 8, "normal"); // rightBottomTopOutcrop
  createWall(360, 304, 8, 49, "normal"); // rightBottomSideOutcrop
  createWall(360, 353, 138, 8, "normal"); // rightBottomBottomOutcrop
  createWall(368, 208, 80, 48, "block"); // rightTopOutcropFruitGenBlocker
  createWall(368, 304, 80, 49, "block"); // rightBottomOutcropFruitGenBlocker

  createWall(360, 88, 48, 32, "normal"); // topRightLeftThickBlock
  createWall(264, 88, 64, 32, "normal"); // topRightRightThickBlock
  createWall(360, 152, 48, 16, "normal"); // rightThinBlockTop

  createWall(312, 296, 16, 65, "normal"); // rightMidWall

  createWall(312, 152, 16, 112, "normal"); // rightTshapeVertical
  createWall(264, 200, 48, 16, "normal"); // rightTshapeHorizontal

  createWall(376, 393, 32, 16, "normal"); // rightBottomLHorizontal
  createWall(360, 393, 16, 64, "normal"); // rightBottomLVertical

  createWall(264, 393, 64, 16, "normal"); // rightBottomHorizontalStick

  createWall(408, 441, 32, 16, "normal"); // rightBottomOutcrop

  createWall(264, 489, 144, 16, "normal"); // rightBottomInvertedTHorizontal
  createWall(312, 441, 16, 48, "normal"); // rightBottomInvertedTVertical

  createWall(0, 264, 84, 32, "slow"); // leftTunnel
  createWall(364, 264, 84, 32, "slow"); // rightTunnel

  for (var i = 0; i < lives; i++) {
    createWall(38 + i * 32, 549, 22, 22, "lifeIcon");
    walls[walls.length - 2].image = sprites[0][13];
  }
  switch (true) {
    case fruitNum >= 8:
      createWall(164, 549, 24, 24, "fruit");
      walls[walls.length - 2].image = sprites[7][7];
    case fruitNum >= 7:
      createWall(196, 549, 24, 24, "fruit");
      walls[walls.length - 2].image = sprites[7][6];
    case fruitNum >= 6:
      createWall(228, 549, 24, 24, "fruit");
      walls[walls.length - 2].image = sprites[7][5];
    case fruitNum >= 5:
      createWall(260, 549, 24, 24, "fruit");
      walls[walls.length - 2].image = sprites[7][4];
    case fruitNum >= 4:
      createWall(292, 549, 24, 24, "fruit");
      walls[walls.length - 2].image = sprites[7][3];
    case fruitNum >= 3:
      createWall(324, 549, 24, 24, "fruit");
      walls[walls.length - 2].image = sprites[7][2];
    case fruitNum >= 2:
      createWall(356, 549, 24, 24, "fruit");
      walls[walls.length - 2].image = sprites[7][1];
    case fruitNum >= 1:
      createWall(388, 549, 24, 24, "fruit");
      walls[walls.length - 2].image = sprites[7][0];
      break;
  }
}

function highScoreEntry() {
  rect(
    Math.ceil(gameBox.canvas.width / 10),
    Math.ceil(gameBox.canvas.height / 10),
    Math.ceil(gameBox.canvas.width * 0.8),
    Math.ceil(gameBox.canvas.height * 0.8),
    "blue"
  );
  rect(
    Math.ceil(gameBox.canvas.width / 8),
    Math.ceil(gameBox.canvas.height / 8),
    Math.ceil(gameBox.canvas.width * 0.75),
    Math.ceil(gameBox.canvas.height * 0.75),
    "black"
  );
  drawText(
    "HIGH SCORE",
    gameBox.canvas.width / 2,
    140,
    "yellow",
    true,
    48,
    "Courier New"
  );
  drawText(
    "DETECTED",
    gameBox.canvas.width / 2,
    190,
    "yellow",
    true,
    48,
    "Courier New"
  );
  drawText(
    "PLEASE ENTER A NAME",
    gameBox.canvas.width / 2,
    260,
    "yellow",
    true,
    28,
    "Courier New"
  );
  drawText(
    "AT THE SIDE",
    gameBox.canvas.width / 2,
    290,
    "yellow",
    true,
    24,
    "Courier New"
  );
  drawText(
    "OF THE SCREEN",
    gameBox.canvas.width / 2,
    320,
    "yellow",
    true,
    24,
    "Courier New"
  );
}

// HIGH SCORES

if (typeof Storage !== "undefined") {
  var numOfScores;

  if (
    localStorage.getItem("numOfScores") !== null &&
    !isNaN(parseInt(localStorage.getItem("numOfScores")))
  ) {
    numOfScores = parseInt(localStorage.getItem("numOfScores"));
  } else {
    numOfScores = 0;
  }

  var scores = [];

  for (var i = 0; i < numOfScores; i++) {
    scores[i] = [
      localStorage.getItem("name" + (i + 1)),
      parseInt(localStorage.getItem("score" + (i + 1))),
      i + 1
    ];
  }
  console.log(scores);

  scores.sort(sortNumber);

  for (var i = 1; i < 30; i++) {
    localStorage.removeItem("name" + i);
    localStorage.removeItem("score" + i);
  }

  for (var i = scores.length - 1; i >= 0; i--) {
    if(scores[i][0] === null)
      break;
    localStorage.setItem("name" + (scores.length - i), scores[i][0]);
    localStorage.setItem("score" + (scores.length - i), scores[i][1]);

    var row = document.createElement("tr");
    row.setAttributeNode(betterCreateAttr("class", "highScore"));
    var thisname = document.createElement("td");
    var thisscore = document.createElement("td");

    thisname.innerText = scores[i][0];
    thisscore.innerText = scores[i][1];

    row.appendChild(thisname);
    row.appendChild(thisscore);

    document.getElementById("hstbody").appendChild(row);

    if (i === scores.length - 9) break;
  }
  localStorage.setItem("numOfScores", numOfScores);
}

function buttonInput() {
  scorePause = false;
  addHighScore(
    (document.getElementById("usernameBox") as HTMLInputElement).value.toUpperCase(),
    score
  );
}

function sortNumber(a, b) {
  return a[1] - b[1];
}

function betterCreateAttr(type, value) {
  var attr = document.createAttribute(type);
  attr.value = value;
  return attr;
}

function addHighScore(inname, inscore) {
  var lnumOfScores;
  if (
    localStorage.getItem("numOfScores") !== null &&
    !isNaN(parseInt(localStorage.getItem("numOfScores")))
  ) {
    lnumOfScores = parseInt(localStorage.getItem("numOfScores"));
  } else {
    numOfScores = 0;
  }

  lnumOfScores++;

  localStorage.setItem("name" + lnumOfScores, inname);
  localStorage.setItem("score" + lnumOfScores, inscore);

  // sort by numerical value

  scores[scores.length] = [inname, inscore];
  scores.sort(sortNumber);

  // clear the visible list

  var listedScores = document.getElementsByClassName("highScore");

  while (listedScores.length > 0) {
    listedScores[0].outerHTML = "";
  }

  stopCheckingScorePause = true;

  for (var i = 1; i < 30; i++) {
    localStorage.removeItem("name" + i);
    localStorage.removeItem("score" + i);
  }

  // redraw the displayed list

  for (var i = scores.length - 1; i >= 0; i--) {
    if(scores[i][0] === null)
      break;
    localStorage.setItem("name" + (scores.length - i), scores[i][0]);
    localStorage.setItem("score" + (scores.length - i), scores[i][1]);

    var row = document.createElement("tr");
    row.setAttributeNode(betterCreateAttr("class", "highScore"));

    var thisname = document.createElement("td");
    var thisscore = document.createElement("td");

    thisname.innerText = scores[i][0];
    thisscore.innerText = scores[i][1];

    row.appendChild(thisname);
    row.appendChild(thisscore);

    document.getElementById("hstbody").appendChild(row);

    if (i === scores.length - 9) {
      lnumOfScores = 9;
      break;
    }
  }
  localStorage.setItem("numOfScores", lnumOfScores);
}

startGame();
