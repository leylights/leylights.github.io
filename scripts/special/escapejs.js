import { cws } from "../cws.js";
var player;
var obs = [];
var en = [];
var proj = [];
var maxObs = 2;
var minEn = 1;
var maxEn = 0;
var worldSpeed = 5;
var thisRound = 0;
var playing = false;
var stopSpawns = false;
var upgrading = false;
var godMode = false;
var mobile = false;
var isFiring = true;
var animator;
var controls = ["white", "white", "white", "white", "white", "white"];
// players, lasers, obstacles, other, bg
var sprites = [[], [], [], [], []];
var bgx = [0, 0, 0];
var now = Date.now();
var roundStart;
var roundTimer = 0;
var myCanvas = {
    canvas: document.createElement("canvas"),
    keys: null,
    context: null,
    mouseX: null,
    mouseY: null,
    clickTime: null,
    isClicking: null,
    start: function () {
        this.canvas.width = 800;
        if (document.body.clientWidth < 800)
            this.canvas.width = document.body.clientWidth;
        this.canvas.height = 600;
        if (document.body.clientHeight < 600)
            if (document.body.clientHeight < 350) {
                this.canvas.height = 350;
            }
            else
                this.canvas.height = document.body.clientHeight;
        this.isClicking = false;
        this.context = this.canvas.getContext("2d", {
            alpha: false
        });
        document
            .getElementById("canvasBox")
            .insertBefore(this.canvas, document.getElementById("canvasFoundation"));
        window.addEventListener("keydown", function (e) {
            myCanvas.keys = myCanvas.keys || [];
            myCanvas.keys[e.keyCode] = true;
        });
        window.addEventListener("keyup", function (e) {
            myCanvas.keys[e.keyCode] = false;
        });
        myCanvas.canvas.addEventListener("click", function (evt) {
            let canvasArea = myCanvas.canvas.getBoundingClientRect();
            myCanvas.mouseX = evt.clientX - canvasArea.left;
            myCanvas.mouseY = evt.clientY - canvasArea.top;
            myCanvas.clickTime = now;
        }, false);
        myCanvas.canvas.addEventListener("touchmove", function (evt) {
            let canvasArea = myCanvas.canvas.getBoundingClientRect();
            myCanvas.mouseX = evt.touches[0].clientX - canvasArea.left;
            myCanvas.mouseY = evt.touches[0].clientY - canvasArea.top;
            myCanvas.clickTime = now;
        }, false);
    },
    stop: function () {
        window.cancelAnimationFrame(animator);
        this.clear();
    },
    clear: function () {
        rect(0, 0, this.canvas.width, this.canvas.height, "#000000");
    }
};
function Component(x, y, w, h, c, type, name, isImage) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.colour = c;
    this.name = name;
    this.hp;
    this.isImage = isImage;
    if (type == "entity") {
        this.xvel = 0;
        this.yvel = 0;
        this.speed = 0;
        this.maxSpeed = 3;
        this.shootTimer = 0;
        this.dmgMod = 1;
        if (name === "proj") {
            this.user;
        }
        else if (name === "player") {
            this.hp = 100;
            this.weapon = "gunner";
        }
        else {
            this.weapon = this.name;
        }
    }
    this.setEVars = function (s, ms) {
        this.speed = s;
        if (typeof ms === "object") {
            this.maxSpeedX = ms[0];
            this.maxSpeedY = ms[1];
        }
    };
    this.move = function () {
        if (cws.orEquals(this.name, ["gunner", "laser", "heavy", "baller"])) {
            if (this.y + this.h / 2 < player.y + player.h / 2)
                this.yvel += this.speed / 10;
            else if (this.y + this.h / 2 > player.y + player.h / 2)
                this.yvel -= this.speed / 10;
            if (this.x < myCanvas.canvas.width * 0.75)
                this.xvel += this.speed / 20;
            else if (this.x > myCanvas.canvas.width * 0.85)
                this.xvel -= this.speed / 20;
        }
        this.x += this.xvel;
        this.y += this.yvel;
    };
    this.resets = function () {
        if (this.shootTimer > 0)
            this.shootTimer--;
        if (this === player) {
            this.xvel -= this.xvel / 5;
            this.yvel -= this.yvel / 5;
        }
        if (typeof this.maxSpeedX === "number") {
            if (this.xvel < 0.25 && this.xvel > 0.25)
                this.xvel = 0;
            else if (this.xvel > this.maxSpeedX)
                this.xvel = this.maxSpeedX;
            else if (this.xvel < -this.maxSpeedX)
                this.xvel = -this.maxSpeedX;
            if (this.yvel < 0.25 && this.yvel > 0.25)
                this.yvel = 0;
            else if (this.yvel > this.maxSpeedY)
                this.yvel = this.maxSpeedY;
            else if (this.yvel < -this.maxSpeedY)
                this.yvel = -this.maxSpeedY;
        }
    };
    this.draw = function () {
        if (this.isImage) {
            // if(orEquals(this.name,["gunner","laser","heavy","baller"]) && now % 300 < 16)
            //   switch(this.name){
            //     case "gunner":
            //       this.colour = sprites[0][1+Math.floor(Math.random()*3)];
            //       break;
            //     case "laser":
            //       this.colour = sprites[0][4+Math.floor(Math.random()*3)];
            //       break;
            //     case "heavy":
            //       this.colour = sprites[0][7+Math.floor(Math.random()*3)];
            //       break;
            //     case "baller":
            //       this.colour = sprites[0][10+Math.floor(Math.random()*3)];
            //       break;
            //   }
            myCanvas.context.drawImage(this.colour, Math.round(this.x), Math.round(this.y), this.w, this.h);
        }
        else {
            myCanvas.context.fillStyle = this.colour;
            myCanvas.context.fillRect(Math.round(this.x), Math.round(this.y), this.w, this.h);
        }
    };
    this.findCollision = function (it, direction) {
        if ((this.x < it.x + it.w &&
            this.y < it.y + it.h &&
            it.x < this.x + this.w &&
            it.y < this.y + this.h) ||
            direction) {
            var vDir = "";
            var hDir = "";
            // Vertical
            if (this.y + this.h / 2 > it.y + it.h) {
                vDir = "above";
            }
            else if (this.y + this.h / 2 < it.y) {
                vDir = "below";
            }
            // Horizontal
            if (it.x < this.x + this.w / 2) {
                hDir = "left";
            }
            else if (it.x > this.x + this.w / 2) {
                hDir = "right";
            }
            switch (vDir) {
                case "above":
                    switch (hDir) {
                        case "left":
                            if (Math.abs(this.y - (it.y + it.h)) <
                                Math.abs(this.x - (it.x + it.w))) {
                                return "above"; // above
                            }
                            else {
                                return "left"; // left
                            }
                        case "right":
                            if (Math.abs(this.y - (it.y + it.h)) <
                                Math.abs(this.x + this.w - it.x))
                                return "above";
                            else
                                return "right";
                        default:
                            return vDir;
                    }
                case "below":
                    switch (hDir) {
                        case "left":
                            if (Math.abs(this.y + this.h - it.y) <
                                Math.abs(this.x - (it.x + it.w))) {
                                return "below"; // below
                            }
                            else {
                                return "left"; // left
                            }
                        case "right":
                            if (Math.abs(this.y + this.h - it.y) <
                                Math.abs(this.x + this.w - it.x))
                                return "below"; // below
                            else
                                return "right"; // right
                        default:
                            return vDir;
                    }
                default:
                    return hDir;
            }
        }
        else {
            return "none";
        }
    };
}
function init() {
    getSprites();
    player = new Component(-100, 260, 48, 80, sprites[0][0], "entity", "player", true);
    player.setEVars(3, [4, 7]);
    player.maxHP = 100;
    myCanvas.start();
    window.requestAnimationFrame(main);
}
function main() {
    getInput();
    // resets
    now = Date.now();
    if (!playing) {
        if (upgrading) {
            rect(200, 215, 120, 120, "#dddde4");
            rect(480, 215, 120, 120, "#dddde4");
            drawImg(sprites[3][4], 210, 225, 100, 100);
            drawImg(sprites[3][5], 490, 225, 100, 100);
            if (isClicked(200, 215, 120, 120) ||
                (myCanvas.keys && myCanvas.keys[81])) {
                player.maxHP += 40;
                upgrading = false;
            }
            else if (isClicked(480, 215, 120, 120) ||
                (myCanvas.keys && myCanvas.keys[69])) {
                player.dmgMod += 0.4;
                upgrading = false;
            }
        }
        else if (thisRound === 0) {
            drawEntry();
            for (var i = 0; i < controls.length; i++) {
                if (controls[i] === "white")
                    break;
                else if (i === controls.length - 1)
                    thisRound++;
            }
            if (mobile) {
                thisRound++;
            }
        }
        else if (player.hp <= 0 && player.hp !== -9000) {
            // player death
            redraw();
            player.y += 3;
            obsChecks();
            enChecks();
            projChecks();
            if (player.y > myCanvas.canvas.height - 50) {
                en = [];
                obs = [];
                proj = [];
                player.x = -100;
                player.y = 270;
                player.hp = -9000;
            }
        }
        else {
            // start of round
            redraw();
            player.xvel += 2 - player.x / 200;
            player.move();
            player.resets();
            if (player.x >= 100) {
                if (player.hp !== -9000) {
                    if (thisRound != 1 || player.hp != player.maxHP)
                        thisRound++;
                    if (maxObs < 10)
                        maxObs++;
                    if (thisRound % 3 === 0)
                        minEn++;
                    maxEn++;
                }
                player.hp = player.maxHP;
                playing = true;
                roundStart = now;
                stopSpawns = false;
            }
        }
    }
    else {
        redraw();
        roundTimer = Math.ceil((now - roundStart) / 1000);
        if (godMode)
            player.hp = player.maxHP;
        if (roundTimer >= 60) {
            stopSpawns = true;
            if (obs.length === 0 && en.length === 0) {
                player.xvel += 5;
                if (player.x > myCanvas.canvas.width) {
                    playing = false;
                    upgrading = true;
                    player.x = -100;
                }
            }
        }
        playerChecks();
        obsChecks();
        enChecks();
        projChecks();
    }
    animator = window.requestAnimationFrame(main);
}
// Draws everything to the screen
function redraw() {
    myCanvas.clear();
    // parallax
    drawImg(sprites[4][0], bgx[2], 0, 800, 600);
    drawImg(sprites[4][1], bgx[1], 0, 800, 600);
    drawImg(sprites[4][2], bgx[0], 0, 800, 600);
    drawImg(sprites[4][0], bgx[2] + 800, 0, 800, 600);
    drawImg(sprites[4][1], bgx[1] + 800, 0, 800, 600);
    drawImg(sprites[4][2], bgx[0] + 800, 0, 800, 600);
    bgx[0]--;
    bgx[1] -= 2;
    bgx[2] -= 3;
    for (var i = 0; i < bgx.length; i++)
        if (bgx[i] < -800)
            bgx[i] += 800;
    for (var o = 0; o < obs.length; o++) {
        obs[o].draw();
    }
    for (var p = 0; p < proj.length; p++) {
        proj[p].draw();
    }
    for (var e = 0; e < en.length; e++) {
        en[e].draw();
    }
    player.draw();
    // gun select
    if (mobile) {
        if (player.y + player.h > myCanvas.canvas.height - 60) {
            rect(288, player.y + player.h, 225, 60, "white");
            if (player.weapon === "gunner")
                rect(290, player.y + player.h + 3, 54, 54, "#00c800");
            drawImg(sprites[3][0], 292, player.y + player.h + 5, 50, 50);
            if (player.weapon === "laser")
                if (player.shootTimer === 0)
                    rect(346, player.y + player.h + 3, 54, 54, "#00c800");
                else
                    rect(346, player.y + player.h + 3, 54, 54, "#ffe100");
            drawImg(sprites[3][1], 348, player.y + player.h + 5, 50, 50);
            if (player.weapon === "heavy")
                rect(401, player.y + player.h + 3, 54, 54, "#00c800");
            drawImg(sprites[3][2], 403, player.y + player.h + 5, 50, 50);
            if (player.weapon === "baller")
                if (player.shootTimer === 0)
                    rect(456, player.y + player.h + 3, 54, 54, "#00c800");
                else
                    rect(456, player.y + player.h + 3, 54, 54, "#ffe100");
            drawImg(sprites[3][3], 458, player.y + player.h + 5, 50, 50);
        }
        else {
            rect(288, myCanvas.canvas.height - 60, 225, 60, "white");
            if (player.weapon === "gunner")
                rect(290, myCanvas.canvas.height - 57, 54, 54, "#00c800");
            drawImg(sprites[3][0], 292, myCanvas.canvas.height - 55, 50, 50);
            if (player.weapon === "laser")
                if (player.shootTimer === 0)
                    rect(346, myCanvas.canvas.height - 57, 54, 54, "#00c800");
                else
                    rect(346, myCanvas.canvas.height - 57, 54, 54, "#ffe100");
            drawImg(sprites[3][1], 348, myCanvas.canvas.height - 55, 50, 50);
            if (player.weapon === "heavy")
                rect(401, myCanvas.canvas.height - 57, 54, 54, "#00c800");
            drawImg(sprites[3][2], 403, myCanvas.canvas.height - 55, 50, 50);
            if (player.weapon === "baller")
                if (player.shootTimer === 0)
                    rect(456, myCanvas.canvas.height - 57, 54, 54, "#00c800");
                else
                    rect(456, myCanvas.canvas.height - 57, 54, 54, "#ffe100");
            drawImg(sprites[3][3], 458, myCanvas.canvas.height - 55, 50, 50);
        }
        if (isClicked(290, myCanvas.canvas.height - 57, 50, 54))
            player.weapon = "gunner";
        else if (isClicked(348, myCanvas.canvas.height - 57, 50, 54))
            player.weapon = "laser";
        else if (isClicked(403, myCanvas.canvas.height - 57, 50, 54))
            player.weapon = "heavy";
        else if (isClicked(458, myCanvas.canvas.height - 57, 50, 54))
            player.weapon = "baller";
        // circles
        if (isFiring)
            circle(0, myCanvas.canvas.height - 200, 200, "#00FF0080");
        else
            circle(0, myCanvas.canvas.height - 200, 200, "#FF000080");
        circle(myCanvas.canvas.width - 200, myCanvas.canvas.height - 200, 200, "#FFFFFF80");
        circle(myCanvas.canvas.width - 110, myCanvas.canvas.height - 110, 20, "#111111");
    }
    else if (!(player.x < 60 && player.y < 225)) {
        rect(0, 0, 60, 225, "white");
        if (player.weapon === "gunner")
            rect(3, 3, 54, 54, "#00c800");
        drawImg(sprites[3][0], 5, 5, 50, 50);
        if (player.weapon === "laser")
            if (player.shootTimer === 0)
                rect(3, 58, 54, 54, "#00c800");
            else
                rect(3, 58, 54, 54, "#ffe100");
        drawImg(sprites[3][1], 5, 60, 50, 50);
        if (player.weapon === "heavy")
            rect(3, 113, 54, 54, "#00c800");
        drawImg(sprites[3][2], 5, 115, 50, 50);
        if (player.weapon === "baller")
            if (player.shootTimer === 0)
                rect(3, 168, 54, 54, "#00c800");
            else
                rect(3, 168, 54, 54, "#ffe100");
        drawImg(sprites[3][3], 5, 170, 50, 50);
    }
    else {
        rect(player.x - 60, 0, 60, 225, "white");
        if (player.weapon === "gunner")
            rect(player.x - 57, 3, 54, 54, "#00c800");
        drawImg(sprites[3][0], player.x - 55, 5, 50, 50);
        if (player.weapon === "laser")
            if (player.shootTimer === 0)
                rect(player.x - 57, 58, 54, 54, "#00c800");
            else
                rect(player.x - 57, 58, 54, 54, "#ffe100");
        drawImg(sprites[3][1], player.x - 55, 60, 50, 50);
        if (player.weapon === "heavy")
            rect(player.x - 57, 113, 54, 54, "#00c800");
        drawImg(sprites[3][2], player.x - 55, 115, 50, 50);
        if (player.weapon === "baller")
            if (player.shootTimer === 0)
                rect(player.x - 57, 168, 54, 54, "#00c800");
            else
                rect(player.x - 57, 168, 54, 54, "#ffe100");
        drawImg(sprites[3][3], player.x - 55, 170, 50, 50);
    }
    if (isClicked(5, 5, 50, 50))
        player.weapon = "gunner";
    else if (isClicked(5, 60, 50, 50))
        player.weapon = "laser";
    else if (isClicked(5, 115, 50, 50))
        player.weapon = "heavy";
    else if (isClicked(5, 170, 50, 50))
        player.weapon = "baller";
    // top / bottom hud
    if (mobile) {
        if (player.y < 50) {
            rect(200, player.y - 50, player.hp / player.maxHP * myCanvas.canvas.width * 0.75, 25, "red");
            rect(200, player.y - 25, Math.round((now - roundStart) / 1000 / 60 * myCanvas.canvas.width * 0.75), 25, "cyan");
            rect(0, player.y - 50, 200, 50, "#888888");
            rect(5, player.y - 45, 190, 40, "#FFFFFF");
            drawText("Round " + thisRound, 100, player.y - 15, "black", true, "Bold 25", "Encode Sans");
        }
        else {
            rect(200, 0, player.hp / player.maxHP * myCanvas.canvas.width * 0.75, 25, "red");
            rect(200, 25, Math.round((now - roundStart) / 1000 / 60 * myCanvas.canvas.width * 0.75), 25, "cyan");
            rect(0, 0, 200, 50, "#888888");
            rect(5, 5, 190, 40, "#FFFFFF");
            drawText("Round " + thisRound, 100, 35, "black", true, "Bold 25", "Encode Sans");
        }
    }
    else {
        rect(0, 550, 800, 50, "white");
        rect(0, 560, player.hp / player.maxHP * myCanvas.canvas.width, 20, "red");
        rect(0, 580, Math.round((now - roundStart) / 1000 / 60 * myCanvas.canvas.width), 20, "cyan");
        drawText("Round " + thisRound, 10, 596, "black", false, "Bold 16", "Encode Sans");
    }
}
function getInput() {
    if (mobile) {
        if (circleIsClicked(0, myCanvas.canvas.height - 200, 200, true))
            isFiring = !isFiring;
        if (circleIsClicked(myCanvas.canvas.width - 200, myCanvas.canvas.height - 200, 200, false)) {
            var a = pathfind([myCanvas.mouseX, myCanvas.mouseY, player.speed], [myCanvas.canvas.width - 100, myCanvas.canvas.height - 100]);
            var speed = (Math.sqrt(Math.pow(Math.abs((myCanvas.canvas.width - 200 + (200 / 2)) - myCanvas.mouseX), 2)
                + Math.pow(Math.abs((myCanvas.canvas.height - 200 + (200 / 2)) - myCanvas.mouseY), 2)) / 100);
            // console.log(a + "   s: " + speed);
            player.xvel -= a[0] * speed;
            player.yvel -= a[1] * speed;
        }
        if (isFiring)
            spawnProj(player);
    }
    else {
        if (thisRound === 0) {
            if (myCanvas.keys && (myCanvas.keys[65] || myCanvas.keys[37]))
                // a
                controls[1] = "#00ff00";
            if (myCanvas.keys && (myCanvas.keys[68] || myCanvas.keys[39]))
                // d
                controls[3] = "#00ff00";
            if (myCanvas.keys && (myCanvas.keys[87] || myCanvas.keys[38]))
                // w
                controls[0] = "#00ff00";
            if (myCanvas.keys && (myCanvas.keys[83] || myCanvas.keys[40]))
                // s
                controls[2] = "#00ff00";
            if (myCanvas.keys && myCanvas.keys[32] && player.shootTimer === 0)
                // space
                controls[4] = "#00ff00";
            if (now < myCanvas.clickTime + 64)
                controls[5] = "#00ff00";
            if (now < myCanvas.clickTime + 64 && isClicked(150, myCanvas.canvas.height - 80, 500, 60)) {
                mobile = true;
                switchToMobile();
            }
        }
        if (myCanvas.keys && (myCanvas.keys[65] || myCanvas.keys[37]))
            // a
            player.xvel -= player.speed;
        if (myCanvas.keys && (myCanvas.keys[68] || myCanvas.keys[39]))
            // d
            player.xvel += player.speed;
        if (myCanvas.keys && (myCanvas.keys[87] || myCanvas.keys[38]))
            // w
            player.yvel -= player.speed;
        if (myCanvas.keys && (myCanvas.keys[83] || myCanvas.keys[40]))
            // s
            player.yvel += player.speed;
        if (myCanvas.keys && myCanvas.keys[32] && player.shootTimer === 0 && playing)
            // space
            spawnProj(player);
        if (myCanvas.keys && myCanvas.keys[16] && godMode) {
            // shift
            en = [];
            obs = [];
            player.x = 700;
            roundStart -= 60000;
        }
    }
}
function playerChecks() {
    player.resets();
    if (player.hp <= 0) {
        stopSpawns = true;
        playing = false;
    }
    else
        player.move();
    if (player.x < 0) {
        player.hp -= 0.25;
        player.xvel += 3;
    }
    else if (player.x + player.w > myCanvas.canvas.width)
        player.x -= 3;
    else if (player.x + player.w > myCanvas.canvas.width * 0.875)
        player.x -= 2;
    else if (player.x + player.w > myCanvas.canvas.width * 0.75)
        player.x -= 1;
    if (player.y < 0)
        player.yvel = 3;
    else if ((mobile && player.y + player.h > myCanvas.canvas.height + 50) || (!mobile && player.y + player.h > myCanvas.canvas.height - 50))
        player.yvel = -3;
    if (player.y < -100) {
        player.y = 50;
        player.yvel = 1;
    }
    else if (player.y > myCanvas.canvas.height + 50) {
        player.y = myCanvas.canvas.height + 50;
        player.yvel = -1;
    }
    if (player.x < -100) {
        player.x = 50;
        player.xvel = 1;
    }
    else if (player.x > myCanvas.canvas.width + 50) {
        player.x = myCanvas.canvas.width;
        player.xvel = -1;
    }
}
function obsChecks() {
    for (var i = 0; i < obs.length; i++) {
        var o = obs[i];
        o.x -= o.speed;
        // circleCollide(o,player);
        collide(player, o);
        if (o.x + o.w < 0) {
            obs.splice(i, 1);
            continue;
        }
    }
    if (obs.length < maxObs && Math.random() < 0.01 && en.length > 0)
        spawnObs();
}
function enChecks() {
    for (var i = 0; i < en.length; i++) {
        var e = en[i];
        // movement
        e.move();
        for (var o = 0; o < obs.length; o++) {
            collide(e, obs[o]);
        }
        // attacks
        if (Math.random() < 0.1)
            spawnProj(e);
        else if (Math.random() < 0.5 && e.name === "heavy")
            spawnProj(e);
        // final checks
        e.resets();
        if (e.x + e.w < 0 || e.hp <= 0) {
            en.splice(i, 1);
            continue;
        }
    }
    // spawning
    if (!stopSpawns) {
        if (en.length < maxEn && Math.random() < 0.01) {
            var newEnNum = Math.random();
            switch (true) {
                case newEnNum < 0.1:
                    spawnEn("baller");
                    break;
                case newEnNum < 0.25:
                    spawnEn("heavy");
                    break;
                case newEnNum < 0.45:
                    spawnEn("laser");
                    break;
                default:
                    spawnEn("gunner");
            }
        }
        else if (en.length < minEn && Math.random() < 0.05) {
            var newEnNum = Math.random();
            switch (true) {
                case newEnNum < 0.05:
                    spawnEn("baller");
                    break;
                case newEnNum < 0.2:
                    spawnEn("heavy");
                    break;
                case newEnNum < 0.4:
                    spawnEn("laser");
                    break;
                default:
                    spawnEn("gunner");
            }
        }
        else if (Math.random() < 0.0003)
            spawnEn("gunner");
    }
}
function projChecks() {
    for (var i = 0; i < proj.length; i++) {
        var p = proj[i];
        p.resets();
        p.move();
        if (p.w === 20 && p.h === 20 && typeof en[0] !== "undefined") {
            if (p.user === "player")
                pathfind(p, en[0]);
            else
                pathfind(p, player);
        }
        else
            p.xvel = p.speed;
        // collisions
        for (var o = 0; o < obs.length; o++) {
            if (p.findCollision(obs[o]) !== "none") {
                obs[o].hp -= p.dmg;
                p.hp = 0;
            }
        }
        for (var e = 0; e < en.length; e++) {
            if (p.findCollision(en[e]) !== "none" && p.user === "player") {
                en[e].hp -= p.dmg;
                if (mobile)
                    en[e].hp -= p.dmg * 0.2;
                p.hp--;
            }
        }
        for (var j = 0; j < proj.length; j++) {
            if (i == j)
                continue;
            if (p.findCollision(proj[j]) !== "none" &&
                !((p.w === 8 || proj[j].w === 8) && Math.random() < 0.8)) {
                // increase random num for less collisions
                p.hp -= proj[j].dmg;
                proj[j].hp -= p.dmg;
            }
        }
        if (p.findCollision(player) !== "none" && p.user !== "player") {
            player.hp -= p.dmg;
            if (mobile)
                player.hp -= p.dmg * -0.2;
            if (p.w === 20)
                p.hp -= 10;
            else if (p.user === "laser")
                p.hp = 0;
            else
                p.hp--;
        }
        // deaths
        if (p.x + p.w < 0 || p.x > myCanvas.canvas.width || p.hp <= 0) {
            drawImg(sprites[3][8], p.x - 5, p.y - 5, p.h + 10, p.h + 10);
            proj.splice(i, 1);
            continue;
        }
    }
}
// Spawns one obstacle
function spawnObs() {
    switch (Math.ceil(Math.random() * 3)) {
        case 1:
            var w = 150;
            var h = 150;
            var c = sprites[2][2];
            break;
        case 2:
            var w = 100;
            var h = 100;
            var c = sprites[2][1];
            break;
        case 3:
        default:
            var w = 50;
            var h = 50;
            var c = sprites[2][0];
            break;
    }
    var newObs = new Component(myCanvas.canvas.width, Math.ceil(Math.random() * myCanvas.canvas.height - 50) - h / 2, w, h, c);
    newObs.isImage = true;
    newObs.speed = worldSpeed + (Math.random() * 2 - 1);
    // newObs.speed = worldSpeed;
    obs.push(newObs);
}
// Spawns one enemy
function spawnEn(name) {
    switch (name) {
        case "gunner":
            var w = 40;
            var h = 60;
            break;
        case "laser":
            var w = 30;
            var h = 50;
            break;
        case "heavy":
            var w = 85;
            var h = 50;
            break;
        case "baller":
            var w = 50;
            var h = 80;
            break;
        default:
            return;
    }
    var newEn = new Component(myCanvas.canvas.width, Math.ceil(Math.random() * myCanvas.canvas.height - 50) - h / 2, w, h, "red", "entity", name, true);
    var hp;
    switch (name) {
        case "gunner":
            newEn.setEVars(4, [4, 5]);
            hp = 10;
            newEn.colour = sprites[0][1 + Math.floor(Math.random() * 3)];
            break;
        case "laser":
            if (maxEn < en.length)
                newEn.setEVars(1, [2, 3]);
            else
                newEn.setEVars(3, [4, 6]);
            hp = 4;
            newEn.colour = sprites[0][4 + Math.floor(Math.random() * 3)];
            break;
        case "heavy":
            newEn.setEVars(1, [3, 3]);
            hp = 25;
            newEn.colour = sprites[0][7 + Math.floor(Math.random() * 3)];
            break;
        case "baller":
            newEn.setEVars(1, [2, 3]);
            hp = 40;
            newEn.colour = sprites[0][10 + Math.floor(Math.random() * 3)];
            break;
    }
    newEn.hp = hp * ((9 + thisRound) / 10);
    en.push(newEn);
}
// Spawns one projectile
function spawnProj(user) {
    if (user.shootTimer > 0)
        return;
    var w, h, speed, hp, dmg, colour;
    switch (user.weapon) {
        case "gunner":
            w = 16;
            h = 10;
            speed = 8;
            hp = 1;
            dmg = 8 * user.dmgMod;
            if (user === player) {
                user.shootTimer += 15;
                var colour = sprites[1][0];
            }
            else {
                user.shootTimer += 25;
                if (user.x < player.x)
                    var colour = sprites[1][8];
                else
                    var colour = sprites[1][4];
            }
            break;
        case "laser":
            w = 100;
            h = 8;
            speed = 40;
            hp = 3;
            dmg = 25 * user.dmgMod;
            colour = "yellow";
            user.shootTimer += 80;
            if (user === player) {
                var colour = sprites[1][1];
            }
            else {
                if (user.x < player.x)
                    var colour = sprites[1][9];
                else
                    var colour = sprites[1][5];
            }
            break;
        case "heavy":
            w = 8;
            h = 8;
            speed = 7;
            hp = 1;
            dmg = 1 * user.dmgMod;
            colour = "#5500ff";
            user.shootTimer += 5;
            if (user === player) {
                var colour = sprites[1][2];
            }
            else {
                if (user.x < player.x)
                    var colour = sprites[1][10];
                else
                    var colour = sprites[1][6];
            }
            break;
        case "baller":
            w = 20;
            h = 20;
            speed = 5;
            hp = 18;
            dmg = 16 * user.dmgMod;
            colour = "orange";
            user.shootTimer += 200;
            if (user === player) {
                var colour = sprites[1][3];
            }
            else {
                if (user.x < player.x)
                    var colour = sprites[1][11];
                else
                    var colour = sprites[1][7];
            }
            break;
    }
    var x = user.x + user.w / 2;
    var y = user.y + user.h / 2 - h / 2;
    var newProj = new Component(x, y, w, h, "cyan", "entity", "proj", true);
    if (user.weapon === "baller")
        newProj.setEVars(-speed, [speed, speed]);
    else if (user.x > player.x)
        newProj.setEVars(-speed, [speed, 0]);
    else
        newProj.setEVars(speed, [speed, 0]);
    newProj.hp = hp;
    newProj.dmg = dmg * ((9 + thisRound) / 10);
    newProj.user = user.name;
    newProj.colour = colour;
    proj.push(newProj);
}
// Object A moves around Object B in response to collision
function collide(a, b) {
    var collision = a.findCollision(b);
    if (collision !== "none") {
        switch (collision) {
            case "above":
                a.y = b.y + b.h;
                break;
            case "below":
                a.y = b.y - a.h;
                break;
            case "left":
                a.x = b.x + b.w;
                break;
            case "right":
                a.x = b.x - a.w;
        }
        if (a.type === "gunner")
            a.xvel = 0;
    }
}
function circleCollide(c, r) {
    // NEVERMIND DONT EVER USE THIS EVER
    // direction c is of r
    if (c.findCollision(r) !== "none") {
        // find rectangular collision first
        var xd, yd, rx, ry, ultd;
        if (c.x + c.w / 2 < r.x + r.w / 2) {
            rx = r.x;
            xd = "left";
        }
        else {
            rx = r.x + r.w; // right
            xd = "right";
        }
        if (c.y + c.h / 2 < r.y + r.h / 2) {
            ry = r.y; // above
            yd = "above";
        }
        else {
            ry = r.y + r.h; // below
            yd = "below";
        }
        // collide(r,c);
        if (Math.sqrt(Math.pow(Math.abs(c.x - r.x + r.w), 2) +
            Math.pow(Math.abs(c.y - r.y + r.h), 2)) <
            c.w / 2) {
            collide(r, c);
            console.log("C");
        }
        else {
            console.log(r.x + " " + rx);
        }
    }
}
function getSprites() {
    sprites[0][0] = addSprite("player/1");
    sprites[0][1] = addSprite("gunner/1");
    sprites[0][2] = addSprite("gunner/2");
    sprites[0][3] = addSprite("gunner/3");
    sprites[0][4] = addSprite("laser/1");
    sprites[0][5] = addSprite("laser/2");
    sprites[0][6] = addSprite("laser/3");
    sprites[0][7] = addSprite("heavy/1");
    sprites[0][8] = addSprite("heavy/2");
    sprites[0][9] = addSprite("heavy/3");
    sprites[0][10] = addSprite("baller/1");
    sprites[0][11] = addSprite("baller/2");
    sprites[0][12] = addSprite("baller/3");
    sprites[1][0] = addSprite("proj/pb");
    sprites[1][1] = addSprite("proj/pl");
    sprites[1][2] = addSprite("proj/ph");
    sprites[1][3] = addSprite("proj/pball");
    sprites[1][4] = addSprite("proj/ebl");
    sprites[1][5] = addSprite("proj/ell");
    sprites[1][6] = addSprite("proj/eh");
    sprites[1][7] = addSprite("proj/eball");
    sprites[1][8] = addSprite("proj/ebr");
    sprites[1][9] = addSprite("proj/elr");
    sprites[1][10] = addSprite("proj/eh");
    sprites[1][11] = addSprite("proj/eball");
    sprites[2][0] = addSprite("obs/1");
    sprites[2][1] = addSprite("obs/2");
    sprites[2][2] = addSprite("obs/3");
    sprites[3][0] = addSprite("hud/b");
    sprites[3][1] = addSprite("hud/laser");
    sprites[3][2] = addSprite("hud/h");
    sprites[3][3] = addSprite("hud/ball");
    sprites[3][4] = addSprite("hud/hp");
    sprites[3][5] = addSprite("hud/dmg");
    sprites[3][6] = addSprite("hud/mouse1");
    sprites[3][7] = addSprite("hud/mouse2");
    sprites[3][8] = addSprite("explosion");
    sprites[4][0] = addSprite("bg1");
    sprites[4][1] = addSprite("bg2");
    sprites[4][2] = addSprite("bg3");
}
function drawEntry() {
    myCanvas.clear();
    rect(50, 50, 700, 500, "black");
    drawText("STARSHIP ESCAPE", 400, 200, "white", true, 88, "Times New Roman");
    if (myCanvas.canvas.height >= 600) {
        drawText("Controls:", 400, 236, "white", true, 24, "Times New Roman");
        drawText("Movement", 200, 500, "white", true, 24, "Times New Roman");
        drawText("Attack", 400, 500, "white", true, 24, "Times New Roman");
        drawText("Select", 600, 500, "white", true, 24, "Times New Roman");
        rect(115, 400, 50, 50, controls[1]);
        rect(175, 400, 50, 50, controls[2]);
        rect(235, 400, 50, 50, controls[3]);
        rect(175, 340, 50, 50, controls[0]);
        if (Date.now() % 2000 < 1000) {
            drawText("W", 200, 380, "black", true, 40, "Consolas");
            drawText("A", 140, 440, "black", true, 40, "Consolas");
            drawText("S", 200, 440, "black", true, 40, "Consolas");
            drawText("D", 260, 440, "black", true, 40, "Consolas");
        }
        else {
            drawText("↑", 200, 380, "black", true, 40, "Consolas");
            drawText("←", 140, 440, "black", true, 40, "Consolas");
            drawText("↓", 200, 440, "black", true, 40, "Consolas");
            drawText("→", 260, 440, "black", true, 40, "Consolas");
        }
        rect(320, 400, 160, 50, controls[4]);
        drawText("SPACE", 400, 440, "black", true, 40, "Consolas");
        if (controls[5] === "white")
            drawImg(sprites[3][6], 540, 275, 120, 175);
        else
            drawImg(sprites[3][7], 540, 275, 120, 175);
    }
    rect(150, myCanvas.canvas.height - 80, 500, 60, "white");
    drawText("Press here for mobile edition", 400, myCanvas.canvas.height - 40, "black", true, 28, "Consolas");
}
function addSprite(src) {
    var newimg = document.createElement("img");
    var truesrc = "/siteimages/escape/" + src + ".png";
    newimg.setAttributeNode(cws.betterCreateAttr("src", truesrc));
    newimg.setAttributeNode(cws.betterCreateAttr("id", truesrc));
    document.getElementById("imgs").appendChild(newimg);
    return newimg;
}
function isClicked(x, y, w, h) {
    if (myCanvas.mouseX < x + w &&
        myCanvas.mouseY < y + h &&
        x < myCanvas.mouseX &&
        y < myCanvas.mouseY &&
        now < myCanvas.clickTime + 64)
        return true;
    else
        return false;
}
function circleIsClicked(x, y, diameter, checkTime) {
    if ((now < myCanvas.clickTime + 16 || !checkTime) && Math.sqrt(Math.pow(Math.abs((x + diameter / 2) - myCanvas.mouseX), 2) + Math.pow(Math.abs((y + diameter / 2) - myCanvas.mouseY), 2)) < diameter / 2)
        return true;
    else
        return false;
}
// Sets a component's speeds in relation to its target
function pathfind(me, it) {
    var xDistance, yDistance, total;
    var rawCoords = false;
    if (typeof me[0] !== "undefined") {
        me = { x: me[0], y: me[1], speed: me[2] };
        rawCoords = true;
    }
    if (typeof it[0] !== "undefined") {
        it = { x: it[0], y: it[1] };
        rawCoords = true;
    }
    xDistance = it.x - me.x;
    yDistance = it.y - me.y;
    total = Math.abs(xDistance) + Math.abs(yDistance);
    if (rawCoords) {
        return [Math.round(xDistance / total * Math.abs(me.speed)), Math.round(yDistance / total * Math.abs(me.speed))];
    }
    else {
        me.xvel = Math.round(xDistance / total * Math.abs(me.speed));
        me.yvel = Math.round(yDistance / total * Math.abs(me.speed));
    }
}
// General
function rect(x, y, w, h, colour) {
    cws.fillRect(x, y, w, h, colour, myCanvas.context);
}
function drawText(text, x, y, colour, centered, size, type) {
    myCanvas.context.fillStyle = colour;
    if (type != null)
        myCanvas.context.font = size + "px " + type;
    if (centered)
        myCanvas.context.textAlign = "center";
    else
        myCanvas.context.textAlign = "left";
    myCanvas.context.fillText(text, x, y);
}
function drawImg(img, x, y, w, h) {
    if (h === null)
        myCanvas.context.drawImage(img, x, y);
    else
        myCanvas.context.drawImage(img, x, y, w, h);
}
function drawRotatedImg(img, x, y, w, h, angle) {
    myCanvas.context.translate(x + img.width / 2, y + img.height / 2);
    myCanvas.context.rotate(angle * (Math.PI / 180));
    if (h === null)
        // gameBox.context.drawImage(img,-img.width/2,-img.height/2,img.width,img.height);
        myCanvas.context.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
    else
        myCanvas.context.drawImage(img, -w / 2, -h / 2, w, h);
    myCanvas.context.rotate(-angle * (Math.PI / 180));
    myCanvas.context.translate(-x - img.width / 2, -y - img.height / 2);
}
function circle(x, y, diameter, c) {
    diameter /= 2;
    myCanvas.context.fillStyle = c;
    myCanvas.context.beginPath();
    myCanvas.context.arc(x + diameter, y + diameter, diameter, 0, 2 * Math.PI, false);
    myCanvas.context.fill();
}
function switchToMobile() {
    document.getElementById("main").style.marginTop = "";
    document.getElementById("canvasBox").style.paddingTop = "";
    document.getElementById("header").style.paddingTop = "";
    document.getElementById("header").style.backgroundColor = "rgba(0,0,200,0.5)";
}
init();
//# sourceMappingURL=escapejs.js.map