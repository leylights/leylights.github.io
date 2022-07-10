/* eslint-disable */
import { cws } from "../cws.js";
/**
 * Infection Spread Modeller
 *
 * This program models the spread of a virus through a population.
 *
 * @author Cole Stanley
 *
 * Start Date: April 21st, 2021
 * End Date: April 27th, 2021
 */
// Constants
const CELL_RADIUS = 8; // 8
const CELL_DOT_RADIUS = CELL_RADIUS * 0.675;
const CELL_SPEED = 1;
const CANVAS_ID = "infectionCanvas";
const ISOLATION_BAR_HEIGHT = 40;
const ISOLATION_BAR_TEXT_SIZE = 16;
const INFECT_ANY = true;
const MAKE_BACKUPS = false;
const POPULATION_BACKUP_INTERVAL = 5 * 1000;
var next_population_backup = -1;
var backupPopulation = [];
var breakUponCollision = {
    cell: -1,
    collider: -1,
    cellcell: null,
    collidercell: null,
};
var populationSpacing = 30; // 1 = canvas is packed full; < 1 = cells overlapping; > 1 = space between cells
const AUTO_POPULATE = true;
const STAT_UPDATE_INTERVAL = 0.2 * 1000;
const INF_STATES = {
    UNINFECTED: 0,
    CASE: 1,
    ASYMPTOMATIC: 2,
    SYMPTOMATIC: 3,
    SURVIVED: 4,
    VACCINATED: 5,
    DEAD: 6
};
// Chart constants
const GRIDLINE_COLOUR = "#dddddd";
const GRIDLINE_SPACING = {
    W: 40,
    H: 40
};
const DATAPOINT_RADIUS = 4;
// Chart variables
var keepRight = true;
var shownStatistics = [];
// Global Variables
var population = [];
var completed = false;
var nextCellID = 0;
var secondsToAsymptomatic = 0;
var secondsToSymptomatic = 1;
var secondsToSurvival = 10;
var mortalityRate = 0;
var asymptomaticRate = 0;
var showNonContagious = false;
var vaccinationRate = 0;
var isolateSymptomatic = false;
// Statistics Tracking
var counts = [];
var stats = [];
let num_states = Object.keys(INF_STATES).length;
for (let i = 0; i < num_states; i++) {
    counts[i] = 0;
    stats[i] = [];
    shownStatistics[i] = document.getElementById("showLines").children[0].children[i].children[0].children[0].checked;
}
var nextStatUpdate = now;
// General Canvas Variables
var animator;
var now = Date.now();
var consolesLogged = false;
const canvas = {
    element: document.getElementById(CANVAS_ID),
    keys: [],
    context: null,
    start: function () {
        this.element.style.backgroundColor = "white";
        this.element.style.transition = "all 0.5s linear";
        this.element.width = this.element.getBoundingClientRect().width;
        this.element.height = this.element.getBoundingClientRect().height;
        this.element.setAttributeNode(cws.betterCreateAttr("oncontextmenu", "return false;"));
        this.context = this.element.getContext("2d", {
            alpha: false
        });
        this.context.font = window.getComputedStyle(document.getElementById(CANVAS_ID)).font;
        window.addEventListener("resize", function (e) {
            // @ts-ignore
            canvas.element.width = canvas.element.getBoundingClientRect().width;
            // @ts-ignore
            canvas.element.height = canvas.element.getBoundingClientRect().height;
            canvas.isolationBar.reset();
        });
    },
    isolationBar: {
        innerHeight: ISOLATION_BAR_HEIGHT,
        borderWidth: -1,
        borderColour: "#000",
        get innerY() {
            return canvas.outerHeight - this.outerHeight + this.borderWidth;
        },
        get width() {
            return canvas.width;
        },
        get outerHeight() {
            return this.innerHeight + this.borderWidth;
        },
        reset: function () {
            this.borderWidth = parseInt(window.getComputedStyle(document.getElementById(CANVAS_ID)).borderWidth);
            this.borderColour = window.getComputedStyle(document.getElementById(CANVAS_ID)).borderColor;
        },
        draw: function () {
            cws.fillRect(0, canvas.outerHeight - this.outerHeight, this.width, this.borderWidth, this.borderColour, canvas.context);
            cws.fillRect(0, this.innerY, this.width, this.innerHeight, canvas.element.style.backgroundColor, canvas.context);
            cws.drawText("Symptomatic Isolation:", 10, this.innerY + ((this.innerHeight + ISOLATION_BAR_TEXT_SIZE) / 2), "#000", false, ISOLATION_BAR_TEXT_SIZE, null, canvas.context);
        }
    },
    get width() {
        return this.element.width;
    },
    get outerHeight() {
        return this.element.height;
    },
    get bodyHeight() {
        if (isolateSymptomatic) {
            return this.element.height - this.isolationBar.outerHeight;
        }
        else {
            return this.element.height;
        }
    },
    stop: function () {
        window.cancelAnimationFrame(animator);
    },
    clear: function () {
        cws.fillRect(0, 0, this.element.width, this.element.height, "white", canvas.context);
    }
};
const chart = {
    element: document.getElementById("infectionChart"),
    context: null,
    start: function () {
        this.element.style.backgroundColor = "white";
        this.element.width = this.element.getBoundingClientRect().width;
        this.element.height = this.element.getBoundingClientRect().height;
        this.context = this.element.getContext("2d", {
            alpha: false
        });
        window.addEventListener("resize", function (e) {
            // @ts-ignore
            chart.element.height = chart.element.getBoundingClientRect().height;
        });
    },
    /**
     * When necessary, expands the chart
     * @requires User should clear the chart and redraw it after use
     * @param {Number} newWidth
     */
    expand: function (newWidth) {
        if (this.width < newWidth) {
            this.element.style.width = newWidth + "px";
            this.context.canvas.width = newWidth;
            if (keepRight) {
                this.element.parentElement.scrollLeft = this.element.getBoundingClientRect().width -
                    this.element.parentElement.getBoundingClientRect().width + 2 * parseInt(window.getComputedStyle(this.element.parentElement).borderWidth);
            }
        }
    },
    get width() {
        return this.element.width;
    },
    get height() {
        return this.element.height;
    },
    get gridlineSpace() {
        let w = GRIDLINE_SPACING.W;
        let h = GRIDLINE_SPACING.H;
        return { horizontal: w, vertical: h };
    },
    stop: function () {
        window.cancelAnimationFrame(animator);
    },
    clear: function () {
        cws.fillRect(0, 0, this.element.width, this.element.height, "white", this.context);
    }
};
/**
 * A representation of an individual in the World
 * @author Cole Stanley
 */
class Cell {
    /**
     * @param {Number} x Cell x (top-left)
     * @param {Number} y Cell y (top-left)
     * @param {Number} velocityMag Magnitude of the cell's velocity
     * @param {Number} velocityDir Direction of the cell's velocity
     */
    constructor(x, y, velocityMag, velocityDir) {
        // mathematics
        /**
         * Note: cell cannot collide with itself
         * @param {Cell} collider
         * @returns {Boolean} Whether this cell and collider overlap
         */
        this.collidingWith = function (collider) {
            let dx = this.x - collider.x;
            let dy = this.y - collider.y;
            if (this.ID == collider.ID) {
                return false;
            }
            if (this.collidable && collider.collidable && Math.sqrt(dx * dx + dy * dy) < 2 * Cell.radius) {
                return true;
            }
            return false;
        };
        // mechanics
        this.draw = function () {
            if (!this.isolating) {
                if (showNonContagious && this.infection == INF_STATES.UNINFECTED && this.dateOfProgression != -1) { // infected, not contagious yet
                    Cell.drawCell(this.x, this.y, this.colour, Cell.colours[INF_STATES.ASYMPTOMATIC]);
                }
                else {
                    Cell.drawCell(this.x, this.y, this.colour);
                }
            }
        };
        /**
         * Concludes the illness of this cell, whether that conclusion be surival or death.
         */
        this.conclude = function () {
            if (Math.random() <= mortalityRate) {
                this.infection = INF_STATES.DEAD;
                this.speed = 0;
                this.velocity.setMagnitude(this.speed);
                counts[INF_STATES.DEAD]++;
            }
            else {
                this.infection = INF_STATES.SURVIVED;
                counts[INF_STATES.SURVIVED]++;
            }
            this.dateOfProgression = -1;
        };
        /**
         * Copies all attributes of the given cell into this Cell
         * @param {Cell} cell the cell to copy from
         */
        this.copyFrom = function (cell) {
            this.x = cell.x;
            this.y = cell.y;
            this.velocity.setDirection(cell.velocity.direction);
            this.velocity.setMagnitude(cell.velocity.magnitude);
            this.speed = cell.speed;
            this.colour = cell.colour;
            this.infection = cell.infection;
            this.collidable = cell.collidable;
            this.isolating = cell.isolating;
            this.permanentAsymptomatic = cell.permanentAsymptomatic;
            this.dateOfProgression = cell.dateOfProgression;
        };
        /**
         * @returns a copy of this cell
         */
        this.makeCopy = function () {
            let out = new Cell(this.x, this.y, this.velocity.magnitude, this.velocity.direction);
            out.copyFrom(this);
            return out;
        };
        /**
         * Infects the cell
         */
        this.infect = function () {
            if (this.infection == INF_STATES.UNINFECTED && this.infection != INF_STATES.VACCINATED) {
                this.dateOfProgression = now + secondsToAsymptomatic * 1000;
                if (secondsToAsymptomatic == 0) {
                    this.progressInfection();
                }
            }
        };
        this.progressInfection = function () {
            if (this.dateOfProgression != -1 && this.dateOfProgression <= now) {
                switch (this.infection) {
                    case INF_STATES.UNINFECTED:
                        this.infection = INF_STATES.ASYMPTOMATIC;
                        this.dateOfProgression = now + secondsToSymptomatic * 1000;
                        counts[INF_STATES.ASYMPTOMATIC]++;
                        counts[INF_STATES.CASE]++;
                        counts[INF_STATES.UNINFECTED]--;
                        break;
                    case INF_STATES.ASYMPTOMATIC:
                        this.dateOfProgression = now + secondsToSurvival * 1000;
                        if (this.permanentAsymptomatic) {
                            // conclude the illness
                            this.conclude();
                            counts[INF_STATES.ASYMPTOMATIC]--;
                        }
                        else {
                            if (Math.random() <= asymptomaticRate) {
                                this.permanentAsymptomatic = true;
                                // asymptomatic count remains constant
                            }
                            else {
                                this.infection = INF_STATES.SYMPTOMATIC;
                                this.permanentAsymptomatic = false;
                                if (isolateSymptomatic) {
                                    this.isolate();
                                }
                                counts[INF_STATES.SYMPTOMATIC]++;
                                counts[INF_STATES.ASYMPTOMATIC]--;
                            }
                        }
                        break;
                    case INF_STATES.SYMPTOMATIC:
                        counts[INF_STATES.SYMPTOMATIC]--;
                        this.conclude();
                        if (isolateSymptomatic) {
                            this.isolate();
                            Cell.reinsert(this);
                        }
                        break;
                }
                this.recolour();
            }
        };
        this.isolate = function () {
            if (this.isolating == false) {
                this.isolating = true;
                this.collidable = false;
            }
            else {
                this.isolating = false;
                this.collidable = true;
            }
        };
        this.recolour = function () {
            this.colour = Cell.colours[this.infection];
        };
        /**
         * Where applicable, spreads the infection to the victim
         * @param {Cell} victim
         */
        this.spreadTo = function (victim) {
            if (this.infection == INF_STATES.ASYMPTOMATIC) {
                victim.infect();
            }
            else if (this.infection == INF_STATES.SYMPTOMATIC) {
                victim.infect();
            }
        };
        /**
         * Vaccinates this cell
         */
        this.vaccinate = function () {
            this.infection = INF_STATES.VACCINATED;
            this.recolour();
        };
        this.ID = nextCellID;
        nextCellID += Math.round(Math.random() * 10);
        this.x = x;
        this.y = y;
        this.infection = INF_STATES.UNINFECTED;
        this.permanentAsymptomatic = false;
        this.dateOfProgression = -1;
        this.recolour();
        this.speed = CELL_SPEED;
        this.velocity = new MathVector(0, 0);
        if (velocityDir != null)
            this.velocity.resetToUnit(velocityDir);
        if (velocityMag != null)
            this.velocity.setMagnitude(velocityMag);
        this.collidable = true;
        this.isolating = false;
    }
    /**
     * Returns true if this cell is safe and will continue to be safe, ceteris paribus
     */
    get isSafe() {
        return this.dateOfProgression == -1;
    }
    static get width() {
        return 2 * Cell.radius;
    }
    /**
     * Draws a cell to the canvas.  Does not necessarily need to correspond with a Cell object
     * @param {Number} x The left side of the cell
     * @param {Number} y The top of the cell
     * @param {String} colour
     */
    static drawCell(x, y, colour, dotColour) {
        cws.fillCircle(x, y, Cell.radius, colour, false, canvas.context);
        if (dotColour != null) {
            cws.fillCircle(x + Cell.radius - Cell.dotRadius, y + Cell.radius - Cell.dotRadius, Cell.dotRadius, dotColour, false, canvas.context);
        }
    }
    static infectCell(cell) {
        cell.infect();
    }
    /**
     * Reinserts the cell onto the canvas
     * @param {Cell} cell
     */
    static reinsert(cell) {
        for (let i = 0; i < 100; i++) {
            cell.x = Math.random() * (canvas.width - 2 * Cell.radius);
            cell.y = Math.random() * (canvas.bodyHeight - 2 * Cell.radius);
            let retry = false;
            for (let j = 0; j < population.length; j++) {
                if (cell.collidingWith(population[j])) {
                    retry = true;
                    break;
                }
            }
            if (retry) {
                continue;
            }
            else {
                return;
            }
        }
        console.error("could not reinsert the cell.");
    }
}
// statics
Cell.radius = CELL_RADIUS;
Cell.dotRadius = CELL_DOT_RADIUS;
Cell.colours = [];
/**
 * A class to handle two-dimensional Euclidean vectors
 * @author Cole Stanley
 */
class MathVector {
    constructor(ix, iy) {
        /**
         * Changes the coordinates of the vector to align with the new magnitude
         * @param {Number} newMag the new magnitude
         */
        this.setMagnitude = function (newMag) {
            let direction = this.direction;
            this.x = newMag * Math.sin(direction);
            this.y = newMag * Math.cos(direction);
        };
        /**
         * Resets the vector to a unit vector, in the given direction
         * @param {Number} direction the new direction in RADIANS
         */
        this.resetToUnit = function (direction) {
            // reset direction such that 0 <= dir'n <= 2pi
            direction = MathVector.mod2PI(direction);
            // update x, y
            this.x = Math.sin(direction);
            this.y = Math.cos(direction);
        };
        /**
         * Shaves off any 0.00000000000001s from the vector components
         */
        this.roundNegligible = function () {
            let placesOfNegligibility = 10;
            this.x = Math.round(this.x * placesOfNegligibility) / placesOfNegligibility;
            this.y = Math.round(this.y * placesOfNegligibility) / placesOfNegligibility;
        };
        /**
         * Rotates the direction of the vector
         * @param {Number} direction the new direction
         */
        this.setDirection = function (direction) {
            // reset direction such that 0 <= dir'n <= 2pi
            direction = MathVector.mod2PI(direction);
            let mag = this.magnitude;
            this.x = mag * Math.sin(direction);
            this.y = mag * Math.cos(direction);
            this.roundNegligible();
        };
        this.x = ix;
        this.y = iy;
    }
    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    ;
    /**
     * Returns the direction of the vector, as rotated CW from North, in Radians.
     * For a zero vector, returns 0.
    */
    get direction() {
        if (this.x > 0) {
            if (this.y > 0) {
                return Math.atan(Math.abs(this.x / this.y));
            }
            else if (this.y < 0) {
                return (Math.PI / 2) + Math.atan(Math.abs(this.y / this.x));
            }
            else {
                return Math.PI / 2;
            }
        }
        else if (this.x < 0) {
            if (this.y > 0) {
                return ((3 * Math.PI) / 2) + Math.atan(Math.abs(this.y / this.x));
            }
            else if (this.y < 0) {
                return Math.PI + Math.atan(Math.abs(this.x / this.y));
            }
            else {
                return (3 * Math.PI) / 2;
            }
        }
        else {
            if (this.y < 0) {
                return Math.PI;
            }
            else {
                return 0;
            }
        }
    }
}
/**
 * Returns the mathematical result of (direction mod 2pi)
 * @param {Number} direction
 */
MathVector.mod2PI = function (direction) {
    if (direction < 0) {
        direction = (direction % (2 * Math.PI)) + (2 * Math.PI);
    }
    else if (direction >= 2 * Math.PI) {
        direction = (direction % (2 * Math.PI));
    }
    return direction;
};
/**
 * Returns the mathematical result of (direction mod pi)
 * @param {Number} direction
 */
MathVector.modPI = function (direction) {
    if (direction < 0) {
        direction = (direction % Math.PI) + Math.PI;
    }
    else if (direction >= Math.PI) {
        direction = (direction % Math.PI);
    }
    return direction;
};
/**
 * Returns a new MathVector, developed from a magnitude and direction instead of x and y
 * @param {Number} mag the magnitude of the new MathVector
 * @param {Number} dirn the direction of the new MathVector
 */
MathVector.newFromDirection = function (mag, dirn) {
    let newVector = new MathVector(1, 1);
    newVector.resetToUnit(dirn);
    newVector.setMagnitude(mag);
    return newVector;
};
/**
 * A class to handle the collision of two Cells against each other
 * @author Cole Stanley
 */
class Reflection {
}
/**
 * Gets the angle of the line dividing cells a and b
 * @param {Cell} a
 * @param {Cell} b
 */
Reflection.getPerpendicular = function (a, b) {
    return MathVector.mod2PI(Reflection.getAngleTo(a, b) + (Math.PI) / 2);
};
/**
 * Gets the angle from a to b
 * @param {Cell} a
 * @param {Cell} b
 */
Reflection.getAngleTo = function (a, b) {
    // y made negative to account for y values being counted from top of screen, not bottom left (cartesian plane)
    return new MathVector(b.x - a.x, -(b.y - a.y)).direction;
};
/**
 * Produces the angle pointing to the sum of the "x" components of a and b velocities, (where the "x" axis is defined as being perpendicular to the line of perpendicularity)
 * @requires a should supercharge b or b should supercharge a
 * @param {Cell} a The supercharged cell
 * @param {Cell} b The supercharger cell
 * @returns {Number}
 */
Reflection.getSuperchargedAngle = function (charged, charger) {
    let normal = MathVector.modPI(Reflection.getAngleTo(charger, charged));
    let perp = MathVector.modPI(Reflection.getPerpendicular(charger, charged));
    // for loop used to ensure this actually works
    for (let i = 0; i < 10; i++) {
        // if |normal - dir'ns| < 90deg, then normal is on the right side.  Otherwise flip it.
        if (Reflection.within90deg(normal, charged.velocity.direction) &&
            Reflection.within90deg(normal, charger.velocity.direction)) {
            break; // all good
        }
        else {
            normal = MathVector.mod2PI(normal + Math.PI);
        }
        if (i == 9) {
            console.error("cannot find normal for " + charged.velocity.direction + " and " + charger.velocity.direction
                + ".  Current attempt is either " + normal + " or " + MathVector.mod2PI(normal + Math.PI));
        }
    }
    // console.log("normal: " + normal);
    let chargedToNorm = normal - charged.velocity.direction;
    let chargerToNorm = normal - charger.velocity.direction;
    let xSum = charger.velocity.magnitude * Math.cos(chargerToNorm) + charged.velocity.magnitude * Math.cos(chargedToNorm);
    let chargedY = charged.velocity.magnitude * Math.sin(chargedToNorm);
    let sumAngle = Math.atan(chargedY / xSum);
    return normal - sumAngle;
};
/**
 * Determines whether a's contact with b should supercharge b, bouncing a, so a is the supercharger of b
 * @requires a is colliding with b
 * @param {Cell} a The potential supercharger cell
 * @param {Cell} b The potential supercharged cell
 * @returns {Boolean}
 */
Reflection.isSupercharger = function (a, b) {
    let angleTo = Reflection.getAngleTo(a, b);
    let aDir = a.velocity.direction;
    if (MathVector.mod2PI(angleTo - aDir) <= Math.PI / 2 || MathVector.mod2PI(angleTo - aDir) >= (3 * Math.PI) / 2) {
        return true;
    }
    else {
        return false;
    }
};
/**
 * Determines whether a's contact with b should supercharge one of a or b
 * @requires a is colliding with b
 * @param {Cell} a
 * @param {Cell} b
 * @returns {Boolean}
 */
Reflection.shouldSupercharge = function (a, b) {
    let perp = MathVector.modPI(Reflection.getPerpendicular(a, b));
    let perpTail = perp + Math.PI;
    if (perpTail >= 2 * Math.PI) {
        console.error("MathVector.modPI function failed, produced " + perp);
    }
    // if a and b's velocities are on the same side of the line of perpendicularity, return true
    let aDir = a.velocity.direction;
    let bDir = b.velocity.direction;
    if ((perp <= aDir && aDir <= perpTail) && (perp <= bDir && bDir <= perpTail)) { // if perpendicular is the y axis, 0 <= a and b directions <= 180
        return true;
    }
    else if ((perp <= MathVector.mod2PI(aDir - Math.PI) && MathVector.mod2PI(aDir - Math.PI) <= perpTail)
        && (perp <= MathVector.mod2PI(bDir - Math.PI) && MathVector.mod2PI(bDir - Math.PI) <= perpTail)) { // if perpendicular is the y axis, 180 <= a and b directions <= 360
        return true;
    }
    else {
        return false;
    }
};
/**
 * Returns if a is within Math.PI / 2 of b
 * @param {Number} a
 * @param {Number} b
 */
Reflection.within90deg = function (a, b) {
    if ((Math.abs(a - b) <= (Math.PI / 2)) || (Math.abs(a - b) >= (3 * Math.PI / 2))) {
        return true;
    }
    else {
        return false;
    }
};
/**
 * Functions to handle the controls bar
 * @author Cole Stanley
 */
class Controls {
}
/**
 * Opens or closes an accordion
 * @param {HTMLElement} head The header of the accordion
 */
Controls.accordionInteract = function (head) {
    let bodyIndex = -1;
    // find body element to open
    for (let i = 0; i < head.parentElement.children.length; i++) {
        if (head == head.parentElement.children[i]) {
            bodyIndex = i + 1;
            break;
        }
        else if (i == head.parentElement.children.length - 1) {
            console.error("no corresponding body element found for element: ");
            console.error(head);
            return;
        }
    }
    // close all other body elements
    for (let i = 0; i < head.parentElement.children.length; i++) {
        if (head.parentElement.children[i].className == "accordionBody" && i != bodyIndex) {
            head.parentElement.children[i].style.display = "none";
        }
    }
    let accordBody = head.parentElement.children[bodyIndex];
    if (accordBody.style.display == "none") {
        accordBody.style.display = "";
    }
    else {
        accordBody.style.display = "none";
    }
};
/**
 * Initializes the controls
 */
Controls.prepare = function (firstTime) {
    cws.getInputElementById("secondsUntilAsymptomatic").value = secondsToAsymptomatic + "";
    cws.getInputElementById("secondsUntilSymptomatic").value = secondsToSymptomatic + "";
    cws.getInputElementById("secondsUntilConclusion").value = secondsToSurvival + "";
    cws.getInputElementById("mortalityRate").value = (mortalityRate * 100) + "";
    document.getElementById("mortalityDisplay").innerText = (mortalityRate * 100) + "";
    cws.getInputElementById("asymptomaticRate").value = (asymptomaticRate * 100) + "";
    document.getElementById("asymptomaticDisplay").innerText = (asymptomaticRate * 100) + "";
    cws.getInputElementById("isolateSymptomatic").checked = isolateSymptomatic;
    cws.getInputElementById("showNonContagious").checked = showNonContagious;
    if (firstTime) {
        let accordionHeads = document.getElementsByClassName("accordionHead");
        for (let i = 0; i < accordionHeads.length; i++) {
            accordionHeads[i].addEventListener("click", (e) => {
                let target = e.target;
                if (target.className !== "accordionHead")
                    target = target.parentElement;
                Controls.accordionInteract(target);
            });
        }
        document.getElementById("mortalityRate").addEventListener("change", function (e) {
            document.getElementById("mortalityDisplay").innerText = Math.round(parseFloat(cws.getInputElementById("mortalityRate").value)) + "";
        });
        document.getElementById("asymptomaticRate").addEventListener("change", function (e) {
            document.getElementById("asymptomaticDisplay").innerText = Math.round(parseFloat(cws.getInputElementById("asymptomaticRate").value)) + "";
        });
        document.getElementById("restartNoCovid").addEventListener("click", () => { restartSimulation(false); });
        document.getElementById("restartCovid").addEventListener("click", () => { restartSimulation(true); });
    }
    // anti-infection measures
    cws.getInputElementById("vaccinationRate").value = (vaccinationRate * 100) + "";
    document.getElementById("vaccinationDisplay").innerText = (vaccinationRate * 100) + "";
    cws.getInputElementById("physDistancing").value = (populationSpacing - 1) + "";
    if (firstTime) {
        document.getElementById("vaccinationRate").addEventListener("change", function (e) {
            document.getElementById("vaccinationDisplay").innerText = Math.round(parseFloat(cws.getInputElementById("vaccinationRate").value)) + "";
        });
    }
    // update the legend
    if (firstTime) {
        document.getElementById("neverdot").style.backgroundColor = Cell.colours[INF_STATES.UNINFECTED];
        document.getElementById("gestdot").style.backgroundColor = Cell.colours[INF_STATES.UNINFECTED];
        document.getElementById("gestdot").children[0].style.backgroundColor = Cell.colours[INF_STATES.ASYMPTOMATIC];
        document.getElementById("asympdot").style.backgroundColor = Cell.colours[INF_STATES.ASYMPTOMATIC];
        document.getElementById("sympdot").style.backgroundColor = Cell.colours[INF_STATES.SYMPTOMATIC];
        document.getElementById("deaddot").style.backgroundColor = Cell.colours[INF_STATES.DEAD];
        document.getElementById("vaxdot").style.backgroundColor = Cell.colours[INF_STATES.VACCINATED];
        document.getElementById("surviveddot").style.backgroundColor = Cell.colours[INF_STATES.SURVIVED];
    }
};
/**
 * Updates values based on input from the controls
 */
Controls.collect = function () {
    secondsToAsymptomatic = Controls.numOrZero(document.getElementById("secondsUntilAsymptomatic"));
    secondsToSymptomatic = Controls.numOrZero(document.getElementById("secondsUntilSymptomatic"));
    secondsToSurvival = Controls.numOrZero(document.getElementById("secondsUntilConclusion"));
    mortalityRate = Controls.numOrZero(document.getElementById("mortalityRate")) / 100;
    asymptomaticRate = Controls.numOrZero(document.getElementById("asymptomaticRate")) / 100;
    vaccinationRate = Controls.numOrZero(document.getElementById("vaccinationRate")) / 100;
    populationSpacing = parseInt(cws.getInputElementById("physDistancing").value) + 1;
    isolateSymptomatic = cws.getInputElementById("isolateSymptomatic").checked;
    showNonContagious = cws.getInputElementById("showNonContagious").checked;
};
/**
 * Returns the non-negative numeric value of the input element, or zero if not a non-negative number
 * @param {Element} el An <input> element
 */
Controls.numOrZero = function (el) {
    if (isNaN(el.value)) {
        return 0;
    }
    else if (el.value <= 0) {
        return 0;
    }
    else {
        return el.value;
    }
};
function init(firstTime) {
    if (firstTime) {
        canvas.start();
        chart.start();
        // set up the colours array
        Cell.colours[INF_STATES.UNINFECTED] = "#444444";
        Cell.colours[INF_STATES.CASE] = "#37089c";
        Cell.colours[INF_STATES.ASYMPTOMATIC] = "#b978ff";
        Cell.colours[INF_STATES.SYMPTOMATIC] = "#7b00ff";
        Cell.colours[INF_STATES.SURVIVED] = "#52a36e";
        Cell.colours[INF_STATES.VACCINATED] = "#54bbf7";
        Cell.colours[INF_STATES.DEAD] = "#888888";
    }
    // populate with cells
    if (AUTO_POPULATE) {
        populate((canvas.width * canvas.bodyHeight / Math.pow(Cell.width, 2)) / populationSpacing);
        if (INFECT_ANY) {
            population[0].infect();
        }
    }
    else {
        population.push(new Cell(300.75745355944133, 341.5845587259044, 1, 1.2793395323170296));
        population.push(new Cell(304.20080585573265, 356.60142939775426, 1, 6.183516654688424));
    }
    nextStatUpdate = now;
    // set up controls
    Controls.prepare(firstTime);
    canvas.isolationBar.reset();
    if (firstTime) {
        window.requestAnimationFrame(main);
    }
}
/**
 * Determines if the simulation has completed
 */
function checkForCompletion() {
    if (!completed && counts[INF_STATES.ASYMPTOMATIC] == 0 && counts[INF_STATES.SYMPTOMATIC] == 0) {
        let safetyCheck = true;
        for (let i = 0; i < population.length; i++) {
            safetyCheck = safetyCheck && population[i].isSafe;
        }
        if (!safetyCheck) {
            return;
        }
        completed = true;
        document.getElementById("infectionStatus").innerText = "Complete";
        document.getElementById("infectionStatus").className = "infectionStatusComplete";
        console.log("Simulation complete");
    }
}
function main() {
    // resets
    now = Date.now();
    // redraw
    redrawCanvas();
    redrawChart();
    // step 6: work
    updateCells();
    updateStats();
    if (completed) {
        updateChart();
    }
    checkForCompletion();
    if (MAKE_BACKUPS && next_population_backup < now) {
        makeBackup();
    }
    // loop!
    animator = window.requestAnimationFrame(main);
}
/**
 * Backs up the current population
 */
function makeBackup() {
    for (let i = 0; i < population.length; i++) {
        backupPopulation[i] = population[i].makeCopy();
    }
    next_population_backup = now + POPULATION_BACKUP_INTERVAL;
    cws.fillRect(0, canvas.bodyHeight - 20, 20, 20, "orange", canvas.context);
    cws.drawText("B", 10, canvas.bodyHeight - 10, "white", true, 20, null, canvas.context);
}
/**
 * Infects evert cell
 */
function massInfect() {
    population.forEach(element => element.infect());
}
/**
 * Populates the world with Cells
 * @param {Number} popCount the number of Cells to create
 */
function populate(popCount) {
    for (let i = 0; i < popCount; i++) {
        population.push(new Cell(Math.random() * (canvas.width - 2 * Cell.radius), Math.random() * (canvas.bodyHeight - 2 * Cell.radius)));
        population[population.length - 1].velocity.resetToUnit(Math.random() * (2 * Math.PI));
        population[population.length - 1].velocity.setMagnitude(population[population.length - 1].speed);
    }
    // ensure no spawning overlap
    for (let i = 0; i < population.length; i++) {
        for (let j = i + 1; j < population.length; j++) {
            if (population[i].collidingWith(population[j])) {
                population.splice(j, 1);
                i--;
                j--;
                if (i < 0) {
                    i = 0;
                }
                if (j < 0) {
                    j = 0;
                }
            }
        }
    }
    counts[INF_STATES.UNINFECTED] = population.length;
    // vaccinations
    let numVaccinated = Math.round(population.length * vaccinationRate);
    for (let i = 1; i < numVaccinated && i < population.length; i++) {
        population[i].vaccinate();
        counts[INF_STATES.VACCINATED]++;
        counts[INF_STATES.UNINFECTED]--;
    }
}
/**
 * Clears, redraws the canvas
 * effects: changes the canvas
 */
function redrawCanvas() {
    canvas.clear();
    if (isolateSymptomatic) {
        canvas.isolationBar.draw();
    }
    // redraw the population
    population.forEach(element => element.draw());
    // draw the isolated population
    if (isolateSymptomatic) {
        let y = canvas.isolationBar.innerY + (canvas.isolationBar.innerHeight / 2) - Cell.radius;
        let padding = 3;
        for (let i = 0; i < counts[INF_STATES.SYMPTOMATIC]; i++) {
            let x = canvas.width - (i + 1) * (2 * Cell.radius + 10);
            if (x < 20 + canvas.context.measureText("Symptomatic Isolation").width) {
                cws.drawLine(x + (2 * Cell.radius + 10) + padding, y + Cell.radius, x + (4 * Cell.radius + 10) - padding, y + Cell.radius, "white", 2, canvas.context);
                cws.drawLine(x + (3 * Cell.radius + 10), y + padding, x + (3 * Cell.radius + 10), y + (2 * Cell.radius) - padding, "white", 2, canvas.context);
                break;
            }
            else {
                Cell.drawCell(x, y, Cell.colours[INF_STATES.SYMPTOMATIC]);
            }
        }
    }
}
/**
 * Clears, redraws the chart
 * effects: changes the chart
 */
function redrawChart() {
    // expand the chart if necessary 
    chart.expand(stats[0].length * chart.gridlineSpace.horizontal);
    chart.clear();
    // gridlines
    let chartRect = { w: chart.width, h: chart.height };
    let gridSpace = chart.gridlineSpace;
    for (let x = 0; x < chartRect.w; x += gridSpace.horizontal) {
        cws.drawLine(x, 0, x, chart.height, GRIDLINE_COLOUR, 1, chart.context);
    }
    for (let y = chartRect.h; y > 0; y -= gridSpace.horizontal) {
        cws.drawLine(0, y, chart.width, y, GRIDLINE_COLOUR, 1, chart.context);
    }
    // redraw the statistics
    for (let i = 0; i < stats.length; i++) {
        if (shownStatistics[i]) {
            for (let j = 0; j < stats[i].length; j++) {
                cws.fillCircle(j * chart.gridlineSpace.horizontal, chart.height - chart.height * (stats[i][j] / population.length), DATAPOINT_RADIUS, Cell.colours[i], true, chart.context);
                if (j > 0) {
                    cws.drawLine((j - 1) * chart.gridlineSpace.horizontal, chart.height - chart.height * (stats[i][j - 1] / population.length), j * chart.gridlineSpace.horizontal, chart.height - chart.height * (stats[i][j] / population.length), Cell.colours[i], 1, chart.context);
                }
            }
        }
    }
}
/**
 * Restarts the simulation
 * @param covid Uses COVID-19 basic variant modelling
 */
function restartSimulation(covid) {
    if (covid) {
        Controls.collect(); // get any stats that aren't about to be overwritten
        secondsToAsymptomatic = 5; // WHO: most cases develop within 5-6 days of exposure (maximum: 14 days); using the average
        secondsToSymptomatic = 2; // WHO: most cases test positive 1-3 days before symptom development
        mortalityRate = 2.1 / 100; // Google Global Tracker: 3.1M deaths out of 147M cases
        secondsToSurvival = 10; // Google: most cases conclude within 1-2 weeks
        asymptomaticRate = 0.3; // Healthline, HartfordHealthcare
    }
    else {
        Controls.collect();
    }
    Controls.prepare(false);
    completed = false;
    document.getElementById("infectionStatus").innerText = "Running";
    document.getElementById("infectionStatus").className = "";
    console.log("restarting...");
    population = [];
    for (let i = 0; i < num_states; i++) {
        counts[i] = 0;
        stats[i] = [];
        shownStatistics[i] = document.getElementById("showLines").children[0].children[i].children[0].children[0].checked;
    }
    let baseChartWidth = chart.element.parentElement.getBoundingClientRect().width - 2 * parseInt(window.getComputedStyle(chart.element.parentElement).borderWidth);
    chart.element.style.width = baseChartWidth + "px";
    chart.context.canvas.width = baseChartWidth;
    canvas.clear();
    chart.clear();
    init(false);
}
/**
 * Runs frame-by-frame updates on the Cells
 */
function updateCells() {
    for (let i = 0; i < population.length; i++) {
        let cell = population[i];
        // infection
        cell.progressInfection();
        // canvas boundary collision
        if (cell.x <= 0) {
            cell.velocity.x *= -1;
            cell.x = 0;
        }
        else if (cell.x + Cell.width > canvas.width) {
            cell.velocity.x *= -1;
            cell.x = canvas.width - Cell.width;
        }
        if (cell.y <= 0) {
            cell.velocity.y *= -1;
            cell.y = 0;
        }
        else if (cell.y + Cell.width > canvas.bodyHeight) {
            cell.velocity.y *= -1;
            cell.y = canvas.bodyHeight - Cell.width;
        }
        // inter-cell collision
        // time: O(nlog(n))
        for (let j = i + 1; j < population.length; j++) {
            let collider = population[j];
            if (cell.collidingWith(collider)) {
                if (breakUponCollision.cell == i && breakUponCollision.collider == j) {
                    console.log("cellcell:");
                    breakUponCollision.cellcell = cell.makeCopy();
                    console.log(breakUponCollision.cellcell);
                    console.log("collidercell:");
                    breakUponCollision.collidercell = collider.makeCopy();
                    console.log(breakUponCollision.collidercell);
                }
                // spread infection
                cell.spreadTo(collider);
                collider.spreadTo(cell);
                // first, shunt out of each other's space (when cells are not dead)
                let norm = Reflection.getAngleTo(cell, collider);
                if (collider.infection != INF_STATES.DEAD) {
                    collider.x = cell.x + (2 * Cell.radius) * Math.sin(norm);
                    collider.y = cell.y - (2 * Cell.radius) * Math.cos(norm);
                }
                else if (cell.infection != INF_STATES.DEAD) {
                    norm = Reflection.getAngleTo(collider, cell);
                    cell.x = collider.x + (2 * Cell.radius) * Math.sin(norm);
                    cell.y = collider.y - (2 * Cell.radius) * Math.cos(norm);
                }
                else {
                    break;
                }
                let cellVAngle = cell.velocity.direction;
                let collVAngle = collider.velocity.direction;
                // set up the area (lines, grey dot)
                // Cell.drawCell(cell.x, cell.y, "green");
                // cws.drawText("cell: " + i + " collider: " + j, cell.x, cell.y + 30, "black", true, 12);
                // // normal angle
                // drawLine(cell.x + Cell.radius, cell.y + Cell.radius, cell.x + Cell.radius + 30 * Math.sin(Reflection.getNormal(cell, collider)),
                //   cell.y + Cell.radius - 30 * Math.cos(Reflection.getNormal(cell, collider)), "red");
                // drawText(Math.round(Reflection.getNormal(cell, collider) * 180 / Math.PI), cell.x + Cell.radius, cell.y + Cell.radius, "black", true, 16); // angle 
                // perpendicular angle
                let planeOfReflection = MathVector.modPI(Reflection.getPerpendicular(cell, collider));
                // cws.drawLine(cell.x + Cell.radius - 15 * Math.sin(planeOfReflection), cell.y + Cell.radius + 15 * Math.cos(planeOfReflection), cell.x + Cell.radius + 15 * Math.sin(planeOfReflection),
                //   cell.y + Cell.radius - 15 * Math.cos(planeOfReflection), "purple");
                // // // velocities
                // cws.drawLine(cell.x + Cell.radius, cell.y + Cell.radius, cell.x + Cell.radius + 20 * Math.sin(cellVAngle),
                //   cell.y + Cell.radius - 40 * Math.cos(cellVAngle), "#446644");
                // cws.drawLine(collider.x + Cell.radius, collider.y + Cell.radius, collider.x + Cell.radius + 20 * Math.sin(collVAngle),
                //   collider.y + Cell.radius - 40 * Math.cos(collVAngle), "#664444");
                if (Reflection.shouldSupercharge(cell, collider)) {
                    if (breakUponCollision.cell == i && breakUponCollision.collider == j) {
                        console.log("supercharging attempted");
                    }
                    // need to supercharge one cell and bounce the other
                    let supercharged, bounced;
                    if (Reflection.isSupercharger(cell, collider)) {
                        bounced = cell;
                        supercharged = collider;
                    }
                    else if (Reflection.isSupercharger(collider, cell)) {
                        bounced = collider;
                        supercharged = cell;
                    }
                    else {
                        console.error("no supercharger found, but one ought to exist");
                    }
                    // DEBUG: Showing the supercharged cell and the bounced cell
                    // Cell.drawCell(supercharged.x, supercharged.y, "#00ffff");
                    // Cell.drawCell(bounced.x, bounced.y, "#ff8800");
                    // cws.drawLine(cell.x + Cell.radius - 0 * Math.sin(planeOfReflection), cell.y + Cell.radius + 0 * Math.cos(planeOfReflection), cell.x + Cell.radius + 70 * Math.sin(planeOfReflection),
                    //   cell.y + Cell.radius - 70 * Math.cos(planeOfReflection), "purple");
                    let superchargedAngle = Reflection.getSuperchargedAngle(supercharged, bounced);
                    supercharged.velocity.setDirection(superchargedAngle);
                    supercharged.velocity.setMagnitude(supercharged.speed);
                    // bounce the bounced cell away
                    let newBounceVelocity = bounced.velocity.direction + 2 * (planeOfReflection - bounced.velocity.direction);
                    bounced.velocity.setDirection(newBounceVelocity);
                    bounced.velocity.setMagnitude(bounced.speed);
                    // DEBUG: Show the new velocities of the cells
                    // cws.drawLine(supercharged.x + Cell.radius, supercharged.y + Cell.radius, supercharged.x + Cell.radius + 40 * Math.sin(supercharged.velocity.direction),
                    //   supercharged.y + Cell.radius - 40 * Math.cos(supercharged.velocity.direction), "#00ffff");
                    // cws.drawLine(bounced.x + Cell.radius, bounced.y + Cell.radius, bounced.x + Cell.radius + 40 * Math.sin(bounced.velocity.direction),
                    //   bounced.y + Cell.radius - 40 * Math.cos(bounced.velocity.direction), "#ff6600");
                }
                else { // normal bounce
                    if (breakUponCollision.cell == i && breakUponCollision.collider == j) {
                        console.log("regular bouncing attempted");
                    }
                    let newCellVelocity = cellVAngle + 2 * (planeOfReflection - cellVAngle);
                    // always bounce the collider away
                    let newCollVelocity = collVAngle + 2 * (planeOfReflection - collVAngle);
                    // cws.drawLine(cell.x + Cell.radius, cell.y + Cell.radius, cell.x + Cell.radius + 40 * Math.sin(newCellVelocity),
                    //   cell.y + Cell.radius - 40 * Math.cos(newCellVelocity), "#00ff00");
                    // cws.drawLine(collider.x + Cell.radius, collider.y + Cell.radius, collider.x + Cell.radius + 40 * Math.sin(newCollVelocity),
                    //   collider.y + Cell.radius - 40 * Math.cos(newCollVelocity), "#ff6600");
                    // set new velocities
                    cell.velocity.setDirection(newCellVelocity);
                    cell.velocity.setMagnitude(cell.speed);
                    collider.velocity.setDirection(newCollVelocity);
                    collider.velocity.setMagnitude(collider.speed);
                }
                // collider.colour = red;
                // if (breakUponCollision.cell == i && breakUponCollision.collider == j) {
                //   collider.colour = red;
                // }
            }
        }
        cell.x += cell.velocity.x;
        cell.y -= cell.velocity.y; // inverts Y so that it can be used mathematically as though it were on a cartesian plane
    }
}
/**
 * Reverts the population to its latest backup
 * Warning: memory leakage is excessive
 */
function revertToBackup() {
    if (backupPopulation.length == 0) {
        console.error("no backup population created yet.");
        return;
    }
    for (let i = 0; i < backupPopulation.length; i++) {
        population[i].copyFrom(backupPopulation[i]);
    }
    next_population_backup = now + 2 * POPULATION_BACKUP_INTERVAL; // gives a delay to allow backup reuse
}
/**
 * Updates the chart canvas with the most updated version of the stats arrays
 * effects: modifies the chart canvas
 */
function updateChart() {
    // determine shown statistics
    for (let i = 0; i < shownStatistics.length; i++) {
        shownStatistics[i] = document.getElementById("showLines").children[0].children[i].children[0].children[0].checked;
    }
    // determine chart locking
    keepRight = !cws.getInputElementById("unlockChart").checked;
}
/**
 * When necessary, updates the statistics array
 */
function updateStats() {
    if (completed) {
        return;
    }
    if (nextStatUpdate < now) {
        let i = stats[INF_STATES.UNINFECTED].length;
        for (let j = 0; j < stats.length; j++) {
            stats[j][i] = counts[j];
        }
        nextStatUpdate = now + STAT_UPDATE_INTERVAL;
    }
    updateChart();
}
init(true);
//# sourceMappingURL=infection.js.map