/**
 * A node of a BST
 */

class BSTNode {
  left: BSTNode;
  right: BSTNode;
  value: any;
  key: string;
  ID: number;

  /**
   * A new BSTNode
   * @param {String} key 
   * @param {*} value 
   */
  constructor(key: string, value: any) {
    this.left = null;
    this.right = null;
    this.key = key;
    this.value = value;
    this.ID = BSTNode.runningID;
    BSTNode.runningID++;
  }

  static runningID: number = 0;
}

/**
 * A binary search tree of strings, sorted in lexicographical order, 
 * where every key is a string
 * @author Cole Stanley
 */

export class BST<T = any> {
  root: BSTNode;

  constructor() {
    this.root = null;
  }

  get depth(): number {
    return BST.getNodeChildDepth(this.root);
  }

  get maxKeyLength(): number {
    return BST.getMaxKeyChild(this.root);
  }

  /**
   * Adds a new node to the bst.  If it already exists, sets the value of that key to the given value.
   * @param {String} key The value to sort the element by 
   * @param {*} value The value to store
   */
  add = function (this: BST<T>, key: string, value: T): void {
    if (typeof key != "string") {
      throw new Error(this.getErrorMessages(key).notAString);
    }

    let newNode = new BSTNode(key, value);
    let current = this.root;

    if (current == null) { // empty BST
      this.root = newNode;
      return;
    }

    while (true) {
      if (current == null) {
        throw new Error(this.getErrorMessages(key).shouldNotBeNull);
      } else {
        let cmp = current.key.localeCompare(key);
        if (cmp < 0) { // current = 'a', str = 'b', go right
          if (current.right == null) {
            current.right = newNode;
            break;
          } else {
            current = current.right;
          }
        } else if (cmp > 0) {
          if (current.left == null) {
            current.left = newNode;
            break;
          } else {
            current = current.left;
          }
        } else if (cmp == 0) { // already existed in the tree
          current.value = value;
          break;
        }
      }
    }
  }

  /**
   * Determines whether the BST contains a node with the given key
   * @param {String} key The key to search for
   * @returns {Boolean}
   */

  containsKey = function (this: BST, key: string): boolean {
    if (typeof key != "string") {
      throw new Error(this.getErrorMessages(key).notAString);
    }

    let current = this.root;

    if (current == null) { // empty BST
      return false;
    }

    while (true) {
      let cmp = current.key.localeCompare(key);
      if (cmp < 0) { // current = 'a', str = 'b', go right
        if (current.right == null) {
          return false;
        } else {
          current = current.right;
        }
      } else if (cmp > 0) {
        if (current.left == null) {
          return false;
        } else {
          current = current.left;
        }
      } else if (cmp == 0) { // found it
        return true;
      }
    }
  }

  getErrorMessages(key: string) {
    return {
      notAString: `${key} is not a string`,
      notInTree: `${key} is not in the tree`,
      shouldNotBeNull: `should not have been null`,
    }
  }

  /**
   * Returns the value at the key. 
   * @requires The key is present in the BST
   * @param {String} key 
   */
  getValue = function (this: BST, key: string): T {
    if (typeof key != "string") {
      throw new Error(this.getErrorMessages(key).notAString);
    } else if (!this.containsKey(key)) {
      throw new Error(this.getErrorMessages(key).notInTree);
    }

    let current = this.root;
    while (true) {
      if (current == null) {
        throw new Error(this.getErrorMessages(key).shouldNotBeNull);
      } else {
        let cmp = current.key.localeCompare(key);
        if (cmp < 0) {
          current = current.right;
        } else if (cmp > 0) {
          current = current.left;
        } else if (cmp == 0) { // already existed in the tree
          return current.value;
        }
      }
    }
  }

  /**
   * Sets the value at the key to the given new value. 
   * @requires The key is present in the BST
   * @param {String} key 
   * @param {*} value 
   */

  setValue = function (this: BST, key: string, newValue: T): void {
    if (typeof key != "string") {
      throw new Error(this.getErrorMessages(key).notAString);
    } else if (!this.containsKey(key)) {
      throw new Error(this.getErrorMessages(key).notInTree);
    }

    let current = this.root;
    while (true) {
      let cmp = current.key.localeCompare(key);
      if (cmp < 0) {
        current = current.right;
      } else if (cmp > 0) {
        current = current.left;
      } else if (cmp == 0) { // already existed in the tree
        current.value = newValue;
        return;
      }
    }
  }

  /**
   * Removes a node from the bst
   * @param {String} key 
   * @author credit to Dave Tompkins, University of Waterloo Instructor, for the node removal algorithm
   */
  remove = function (this: BST, key: string): void {
    // 1: FIND THE STRING IN THE BST
    if (typeof key != "string") {
      throw new Error(this.getErrorMessages(key).notAString);
    }

    if (!this.containsKey(key)) {
      return; // there's nothing to remove
    }

    let parent = null;
    let current = this.root;
    let directionToCurrent = 0;
    while (true) {
      let cmp = current.key.localeCompare(key);
      if (cmp < 0) {
        parent = current;
        current = current.right;
        directionToCurrent = 1;
      } else if (cmp > 0) {
        parent = current;
        current = current.left;
        directionToCurrent = -1;
      } else if (cmp == 0) { // found the node!
        break;
      }
    }

    // WATERLOO CS 136 BST NODE REMOVAL STRATEGY:
    //  (credit to Dave Tompkins, University of Waterloo Instructor)

    // If the target has no children, remove it
    // If the target only has one child, replace the target with its child
    // If the target has two children, replace it with the leftmost node of the right subtree (THE "REPLACER" NODE)
    //   Then, replace the REPLACER node with its right child.  If that is null, great.  Note that as the leftmost node of the subtree,
    //     it will not have a left child.

    if (current.left == null && current.right == null) {
      if (parent == null) {
        this.root = null; // removing the final node of the tree
      } else {
        if (directionToCurrent == 1) {
          parent.right = null;
        } else if (directionToCurrent == -1) {
          parent.left = null;
        }
      }
    } else if (current.left == null) {
      if (parent == null) {
        this.root = current.right; // removing the root node of the tree
      } else {
        if (directionToCurrent == 1) {
          parent.right = current.right;
        } else if (directionToCurrent == -1) {
          parent.left = current.right;
        }
      }
    } else if (current.right == null) {
      if (parent == null) {
        this.root = current.left; // removing the root node of the tree
      } else {
        if (directionToCurrent == 1) {
          parent.right = current.left;
        } else if (directionToCurrent == -1) {
          parent.left = current.left;
        }
      }
    } else { // both children exist
      let replacer = current.right;
      let replacerParent = current;
      while (true) {
        if (replacer.left != null) {
          replacerParent = replacer;
          replacer = replacer.left;
        } else {
          break;
        }
      }
      // update the children of the replacer and its parent
      replacer.left = current.left;
      if (current.ID != replacerParent.ID) {
        replacerParent.left = replacer.right;
        replacer.right = current.right;
      }

      // replace
      if (parent == null) {
        this.root = replacer;
      } else if (directionToCurrent == 1) {
        parent.right = replacer;
      } else {
        parent.left = replacer;
      }
    }

    current = null;
  }

  // Displaying

  // Logs the BST to the console as a list and an object
  log = function (): void {
    console.log(this);
    let printed = this.print();
    if (printed == "") {
      console.log("[empty]")
    } else {
      console.log(printed);
    }
  }

  /**
   * Logs the BST as a tree-styled list
   */
  logTree = function (): void {
    console.log(this);
    let printed = BST.printBranch(this.root, 0, this.depth, this.maxKeyLength);
    // let printed = "currently unoperational";
    if (printed == "") {
      console.log("[empty]")
    } else {
      console.log(printed);
    }
  }

  /**
   * Returns the BST as a list
   * @returns {String} the BST, as a sorted list
   */

  print = function (): string {
    return BST.printNode(this.root);
  }

  /**
   * Prints the values of node and all of its children, in order
   * @param {BSTNode} node 
   */

  static printNode = function (node: BSTNode): string {
    if (node == null) {
      return "";
    } else {
      return BST.printNode(node.left) + node.key + ": " + node.value + "\n" + BST.printNode(node.right);
    }
  }

  /**
   * Creates a string of the values of node and all of its children, in order, with branch decorations
   * @param {BSTNode} node 
   * @param {Number} nodeDepth 
   * @param {Number} treeDepth
   * @param {Number} keyLen
   * @returns {String}
   */

  static printBranch = function (node: BSTNode, nodeDepth: number, treeDepth: number, keyLen: number): string {
    if (node == null) {
      return "";
    } else {
      let lengthEqualizer = keyLen - node.key.length;
      let branchLen = (keyLen) * nodeDepth;
      let content = "-".repeat(branchLen) + "_".repeat(lengthEqualizer) + node.key;

      return BST.printBranch(node.left, nodeDepth + 1, treeDepth, keyLen) + content + "\n" + BST.printBranch(node.right, nodeDepth + 1, treeDepth, keyLen);
    }
  }

  /**
   * Returns the length of the longest key in the node's subtree, node included.
   * @param {BSTNode} node 
   * @returns {Number}
   */
  static getMaxKeyChild = function (node: BSTNode): number {
    if (node == null) {
      return 0;
    } else {
      return Math.max(BST.getMaxKeyChild(node.left), BST.getMaxKeyChild(node.right), node.key.length);
    }
  }

  /**
   * Returns the depth of the node's largest subtree, + 1 
   * @param {BSTNode} node 
   * @returns {Number}
   */
  static getNodeChildDepth = function (node: BSTNode): number {
    if (node == null) {
      return 0;
    } else {
      return Math.max(BST.getNodeChildDepth(node.left), BST.getNodeChildDepth(node.right)) + 1;
    }
  }
}
