import { MathVector } from "../../../tools/math/vector.js";
import { PacmanHelper } from "../helper.js";
import { PacmanCharacter } from "./entities/character.js";
import { PacmanConstants } from "./constants.js";
/**
 * A node representing a navigational node on the map
 * @author Cole Stanley
 */
export class PacmanMapNode {
    /**
     * @param {String} id
     * @param {Array<String>} exitIDs
     * @param {Number} x The x coordinate of the MapNode
     * @param {Number} y The y coordinate of the MapNode
     * @returns {PacmanMapNode}
     */
    constructor(id, exitIDs, canSpawnFruit) {
        this.exits = [];
        /**
         * Returns the direction to the node indicated by exitID
         * @param {String} exitID the ID of the exit
         * @requires The exit has a valid (x,y)
         */
        this.directionTo = function (exitID) {
            let exit = PacmanMapNode.getNodeByID(exitID);
            let preciseDir = new MathVector(exit.x - this.x, -(exit.y - this.y)).direction;
            return PacmanHelper.angleToCompassDirection(preciseDir);
        };
        /**
         * Returns the ID of the exit in the given direction, or null if none exists.
         * @requires this node has a maximum of one exit node in each direction
         * @param {Number} direction (1-4, see DIRECTION constant)
         * @returns {String | null} the ID of the exit in the given direction, or null if none exists
         */
        this.exitAt = function (direction) {
            for (let i = 0; i < this.exits.length; i++) {
                if (this.directionTo(this.exits[i]) == direction) {
                    return this.exits[i];
                }
            }
            return null;
        };
        /**
         * Returns the straight-line distance between this node and another
         * @param {String} nodeID The ID of the node distnace is to be calculated to
         * @returns {Number}
         */
        this.distanceToNode = function (nodeID) {
            let node = PacmanMapNode.getNodeByID(nodeID);
            return Math.sqrt(Math.pow(node.x - this.x, 2) + Math.pow(node.y - this.y, 2));
        };
        /**
         * Sets the position of the MapNode
         * @param {Number} x the top-left x coordinate
         * @param {Number} y the top-left y coordinate
         */
        this.setPos = function (x, y) {
            this.x = x;
            this.y = y;
        };
        this.ID = id;
        this.canSpawnFruit = canSpawnFruit || false;
        for (let i = 0; i < exitIDs.length; i++) {
            this.exits[i] = exitIDs[i];
        }
    }
    get index() {
        return PacmanMapNode.translateAlpha(this.ID);
    }
    /**
     * Returns the IDs of all adjacent fruit-spawning nodes
     */
    getAdjacentFruitSpawnIDs() {
        const fruitExits = [];
        this.exits.forEach((exit) => {
            if (PacmanMapNode.getNodeByID(exit).canSpawnFruit)
                fruitExits.push(exit);
        });
        return fruitExits;
    }
    /**
     * Adds a new node to the navigation map
     * @param {String} id
     * @param {Array<String>} exits
     */
    static addNode(id, exits, canSpawnFruit) {
        PacmanMapNode.map[PacmanMapNode.translateAlpha(id)] = new PacmanMapNode(id, exits, canSpawnFruit);
    }
    /**
     * Generates the navigation map
     */
    static generateMap(canvas) {
        // DEVELOPING THE GRAPH
        // row 1
        PacmanMapNode.addNode("a", ["b", "g"]);
        PacmanMapNode.addNode("b", ["a", "h", "c"]);
        PacmanMapNode.addNode("c", ["b", "bj"]);
        PacmanMapNode.addNode("d", ["bk", "e"]);
        PacmanMapNode.addNode("e", ["d", "k", "f"]);
        PacmanMapNode.addNode("f", ["e", "l"]);
        // row 2
        PacmanMapNode.addNode("g", ["a", "h", "m"]);
        PacmanMapNode.addNode("h", ["b", "i", "n", "g"], true);
        PacmanMapNode.addNode("i", ["h", "o", "bj"], true);
        PacmanMapNode.addNode("bj", ["c", "bk", "i"], true);
        PacmanMapNode.addNode("bk", ["bj", "d", "j"], true);
        PacmanMapNode.addNode("j", ["bk", "r", "k"], true);
        PacmanMapNode.addNode("k", ["j", "e", "l", "s"], true);
        PacmanMapNode.addNode("l", ["k", "f", "t"]);
        // row 3
        PacmanMapNode.addNode("m", ["g", "n"]);
        PacmanMapNode.addNode("n", ["m", "h", "u"], true);
        PacmanMapNode.addNode("o", ["i", "p"], true);
        PacmanMapNode.addNode("p", ["o", "w"], true);
        PacmanMapNode.addNode("q", ["r", "x"], true);
        PacmanMapNode.addNode("r", ["q", "j"], true);
        PacmanMapNode.addNode("s", ["k", "t", "aa"], true);
        PacmanMapNode.addNode("t", ["s", "l"]);
        // row 4
        PacmanMapNode.addNode("v", ["ab", "w"], true);
        PacmanMapNode.addNode("w", ["v", "p", "bp"], true);
        PacmanMapNode.addNode("bp", ["w", "bo", "x"]);
        PacmanMapNode.addNode("x", ["bp", "q", "y"], true);
        PacmanMapNode.addNode("y", ["x", "z"], true);
        // row 5
        PacmanMapNode.addNode("bl", ["u"]);
        PacmanMapNode.addNode("u", ["bl", "n", "ab", "af"], true);
        PacmanMapNode.addNode("ab", ["u", "v", "ac"], true);
        PacmanMapNode.addNode("bt", ["bo"]);
        PacmanMapNode.addNode("bo", ["bp", "bt", "bu"]);
        PacmanMapNode.addNode("bu", ["bo"]);
        PacmanMapNode.addNode("z", ["y", "ad", "aa"], true);
        PacmanMapNode.addNode("aa", ["s", "bm", "ai", "z"], true);
        PacmanMapNode.addNode("bm", ["aa"]);
        // row 6
        PacmanMapNode.addNode("ac", ["ab", "ad", "bq"], true);
        PacmanMapNode.addNode("ad", ["z", "ac", "br"], true);
        // row 7
        PacmanMapNode.addNode("ae", ["af", "ak"]);
        PacmanMapNode.addNode("af", ["u", "ae", "am", "bq"], true);
        PacmanMapNode.addNode("bq", ["af", "ac", "ag"], true);
        PacmanMapNode.addNode("ag", ["bq", "ao"], true);
        PacmanMapNode.addNode("ah", ["ap", "br"], true);
        PacmanMapNode.addNode("br", ["ah", "ad", "ai"], true);
        PacmanMapNode.addNode("ai", ["aa", "br", "ar", "aj"], true);
        PacmanMapNode.addNode("aj", ["ai", "bs"]);
        // row 7
        PacmanMapNode.addNode("ak", ["ae", "al"]);
        PacmanMapNode.addNode("al", ["ak", "at"]);
        PacmanMapNode.addNode("am", ["af", "aw", "an"], true);
        PacmanMapNode.addNode("an", ["am", "ax", "ao"], true);
        PacmanMapNode.addNode("ao", ["an", "ag", "bn"], true);
        PacmanMapNode.addNode("bn", ["ao", "ap"]);
        PacmanMapNode.addNode("ap", ["bn", "ah", "aq"], true);
        PacmanMapNode.addNode("aq", ["ap", "ba", "ar"], true);
        PacmanMapNode.addNode("ar", ["aq", "ai", "bb"], true);
        PacmanMapNode.addNode("as", ["bs", "bc"]);
        PacmanMapNode.addNode("bs", ["aj", "as"]);
        // row 8
        PacmanMapNode.addNode("be", ["at", "bf"]);
        PacmanMapNode.addNode("at", ["be", "al", "aw"]);
        PacmanMapNode.addNode("aw", ["at", "am"], true);
        PacmanMapNode.addNode("ax", ["an", "ay"], true);
        PacmanMapNode.addNode("ay", ["ax", "bg"], true);
        PacmanMapNode.addNode("az", ["bh", "ba"], true);
        PacmanMapNode.addNode("ba", ["az", "aq"], true);
        PacmanMapNode.addNode("bb", ["ar", "bc"], true);
        PacmanMapNode.addNode("bc", ["bb", "as", "bd"]);
        PacmanMapNode.addNode("bd", ["bc", "bi"]);
        // row 8
        PacmanMapNode.addNode("bf", ["be", "bg"]);
        PacmanMapNode.addNode("bg", ["bf", "ay", "bh"]);
        PacmanMapNode.addNode("bh", ["bg", "az", "bi"]);
        PacmanMapNode.addNode("bi", ["bh", "bd"]);
        // POSITIONING THE GRAPH
        // row 1
        PacmanMapNode.setPosOf("a", 0, 0);
        PacmanMapNode.setPosOf("b", 2, 0);
        PacmanMapNode.setPosOf("c", 4, 0);
        PacmanMapNode.setPosOf("d", 6, 0);
        PacmanMapNode.setPosOf("e", 8, 0);
        PacmanMapNode.setPosOf("f", 10, 0);
        // row 2
        PacmanMapNode.setPosOf("g", 0, 1);
        PacmanMapNode.setPosOf("h", 2, 1);
        PacmanMapNode.setPosOf("i", 3, 1);
        PacmanMapNode.setPosOf("bj", 4, 1);
        PacmanMapNode.setPosOf("bk", 6, 1);
        PacmanMapNode.setPosOf("j", 7, 1);
        PacmanMapNode.setPosOf("k", 8, 1);
        PacmanMapNode.setPosOf("l", 10, 1);
        // row 3
        PacmanMapNode.setPosOf("m", 0, 2);
        PacmanMapNode.setPosOf("n", 2, 2);
        PacmanMapNode.setPosOf("o", 3, 2);
        PacmanMapNode.setPosOf("p", 4, 2);
        PacmanMapNode.setPosOf("q", 6, 2);
        PacmanMapNode.setPosOf("r", 7, 2);
        PacmanMapNode.setPosOf("s", 8, 2);
        PacmanMapNode.setPosOf("t", 10, 2);
        // row 4
        PacmanMapNode.setPosOf("v", 3, 3);
        PacmanMapNode.setPosOf("w", 4, 3);
        PacmanMapNode.setPosOf("bp", 5, 3);
        PacmanMapNode.setPosOf("x", 6, 3);
        PacmanMapNode.setPosOf("y", 7, 3);
        // row 5
        PacmanMapNode.setPosOf("bl", 0, 4);
        PacmanMapNode.setPosOf("u", 2, 4);
        PacmanMapNode.setPosOf("ab", 3, 4);
        PacmanMapNode.setPosOf("bt", 4, 4);
        PacmanMapNode.setPosOf("bo", 5, 4);
        PacmanMapNode.setPosOf("bu", 6, 4);
        PacmanMapNode.setPosOf("z", 7, 4);
        PacmanMapNode.setPosOf("aa", 8, 4);
        PacmanMapNode.setPosOf("bm", 10, 4);
        PacmanMapNode.getNodeByID("bl").x = -PacmanCharacter.WIDTH;
        PacmanMapNode.getNodeByID("bm").x = canvas.width;
        PacmanMapNode.getNodeByID("bt").x -= 8;
        PacmanMapNode.getNodeByID("bu").x += 8;
        // row 6
        PacmanMapNode.setPosOf("ac", 3, 5);
        PacmanMapNode.setPosOf("ad", 7, 5);
        // row 7
        PacmanMapNode.setPosOf("ae", 0, 6);
        PacmanMapNode.setPosOf("af", 2, 6);
        PacmanMapNode.setPosOf("bq", 3, 6);
        PacmanMapNode.setPosOf("ag", 4, 6);
        PacmanMapNode.setPosOf("ah", 6, 6);
        PacmanMapNode.setPosOf("br", 7, 6);
        PacmanMapNode.setPosOf("ai", 8, 6);
        PacmanMapNode.setPosOf("aj", 10, 6);
        // row 8
        PacmanMapNode.setPosOf("ak", 0, 7);
        PacmanMapNode.setPosOf("al", 1, 7);
        PacmanMapNode.setPosOf("am", 2, 7);
        PacmanMapNode.setPosOf("an", 3, 7);
        PacmanMapNode.setPosOf("ao", 4, 7);
        PacmanMapNode.setPosOf("bn", 5, 7);
        PacmanMapNode.setPosOf("ap", 6, 7);
        PacmanMapNode.setPosOf("aq", 7, 7);
        PacmanMapNode.setPosOf("ar", 8, 7);
        PacmanMapNode.setPosOf("as", 9, 7);
        PacmanMapNode.setPosOf("bs", 10, 7);
        // row 9
        PacmanMapNode.setPosOf("be", 0, 8);
        PacmanMapNode.setPosOf("at", 1, 8);
        PacmanMapNode.setPosOf("aw", 2, 8);
        PacmanMapNode.setPosOf("ax", 3, 8);
        PacmanMapNode.setPosOf("ay", 4, 8);
        PacmanMapNode.setPosOf("az", 6, 8);
        PacmanMapNode.setPosOf("ba", 7, 8);
        PacmanMapNode.setPosOf("bb", 8, 8);
        PacmanMapNode.setPosOf("bc", 9, 8);
        PacmanMapNode.setPosOf("bd", 10, 8);
        // row 10
        PacmanMapNode.setPosOf("bf", 0, 9);
        PacmanMapNode.setPosOf("bg", 4, 9);
        PacmanMapNode.setPosOf("bh", 6, 9);
        PacmanMapNode.setPosOf("bi", 10, 9);
    }
    /**
     * Gets the given MapNode from the map
     * @param {String} id
     * @returns {PacmanMapNode}
     */
    static getNodeByID(id) {
        return PacmanMapNode.map[PacmanMapNode.translateAlpha(id)];
    }
    /**
     * Sets the position of the MapNode of the given ID
     * @param {String} id the ID of the MapNode
     * @param {Number} x the x coordinate in the map grid, as defined in the NODE_COLS, NODE_ROWS constants
     * @param {Number} y the y coordinate in the map grid, as defined in the NODE_COLS, NODE_ROWS constants
     */
    static setPosOf(id, x, y) {
        PacmanMapNode.getNodeByID(id).x = PacmanConstants.NODE_COLS[x];
        PacmanMapNode.getNodeByID(id).y = PacmanConstants.NODE_ROWS[y];
    }
}
PacmanMapNode.map = [];
/**
 * Translates a value in A,B,C,...,X,Y,Z,AA,AB... notation to a number (A = 0, AA = 26)
 * @param {String} str
 * Time: O(n) where n is strlen(str)
 */
PacmanMapNode.translateAlpha = function (str) {
    str = str.toUpperCase();
    let len = str.length;
    let out = 0;
    for (let i = 0; i < len; i++) {
        let col = len - i - 1;
        out += (str.charCodeAt(i) - "A".charCodeAt(0) + 1) * Math.pow(26, col);
    }
    return out - 1;
};
//# sourceMappingURL=map-node.js.map