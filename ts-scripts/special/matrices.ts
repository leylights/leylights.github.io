import { Leylights } from "../leylights.js";
import { MathNum } from "../tools/math/number.js";
import { Button } from "../components/button.component.js";
import { BASE_TEMP_HIGHLIGHT_TIME } from "../components/general.js";

/**
 * A program to handle complex number arithmetic.
 * 
 * Begin Date: May 30th, 2021 
 * End Date: August 2021
 * 
 * @author Cole Stanley
 */

/*
 * CONFIG:
 */

const LOG_AS_LATEX = true;

const MATRIX_FILL_VALUES = [
  ["-2-2i", "-1-5i"],
  ["-3-i", "2+2i"],
  ["5-i", "-2-2i"]];

/*
 * OTHER CONSTANTS: 
 */

const MATRIX_INTERIOR = `
<div class="matrixHeader">
  <h1>MATRIX_TITLE</h1>
  <div class="matrixButtons">
  </div>
</div>
<table class="matrixTable">
  <tr>
    <td contenteditable></td>
  </tr>
</table>
<div class="matrixFooter">
  <div class="matrix-footer-buttons">
  </div>
  <div>
    <p class="matrix-output">
      <span class="matrix-log"></span>
      <span class="matrix-errors"></span>
    </p>
  </div>
</div>`;

const MATRIX_SCALAR_INPUT = `<input class="inputBottomLine footer-input matrix-footer-button-half ADDITIONAL_CLASSES" FOOTER_INPUT_STYLE></input>`;
const MATRIX_PAIR_INPUT = `<div class="matrix-pair-input-container"><p>(
  <input class="smallInputBottomLine footer-input-row ADDITIONAL_CLASSES_ONE" FOOTER_INPUT_STYLE></input>,
  <input class="smallInputBottomLine footer-input-col ADDITIONAL_CLASSES_TWO" FOOTER_INPUT_STYLE></input>
)</p></div>`;

const matrices: Matrix[] = [];

interface MatrixHTMLInitializationData {
  rows: number;
  columns: number;
  hideWhenEmpty: boolean;
  container: HTMLElement;
  isEditable: boolean;
  buttons: string[];
}

const enum MatrixHTMLButtonsEnum {
  addRow = "R+",
  addCol = "C+",
  delRow = "R-",
  delCol = "C-",
  undo = "<-",

  solve = "Solve",
  clear = "Clear",
  fill = "Fill",
  invert = "Invert",
  exec = "Exec",
  scale = "Scale",
  determinant = "Determinant",
  cofactor = "Cofactor",
  adjunct = "Adjunct",
}

/**
 * Holds all user-facing operations
 */
class ComplexOps {
  static add(a: string, b: string) {
    return MathNum.add(MathNum.createFromStr(a), MathNum.createFromStr(b)).prettyPrint();
  }

  static subtract(a: string, b: string) {
    return MathNum.subtract(MathNum.createFromStr(a), MathNum.createFromStr(b)).prettyPrint();
  }

  static multiply(a: string, b: string) {
    return MathNum.multiply(MathNum.createFromStr(a), MathNum.createFromStr(b)).prettyPrint();
  }

  static divide(a: string, b: string) {
    return MathNum.divide(MathNum.createFromStr(a), MathNum.createFromStr(b)).prettyPrint();
  }

  static HTML = {
    matrix: null,
    container: null,
    terms: null,
    footer: null,
    footerText: null,

    add: function (): void {
      ComplexOps.HTML.performCalculation(ComplexOps.add);
    },

    subtract: function (): void {
      ComplexOps.HTML.performCalculation(ComplexOps.subtract);
    },

    multiply: function (): void {
      ComplexOps.HTML.performCalculation(ComplexOps.multiply);
    },

    divide: function (): void {
      ComplexOps.HTML.performCalculation(ComplexOps.divide);
    },

    performCalculation: function (f: (l: string, r: string) => string): void {
      ComplexOps.HTML.footerText.innerText = f(
        ComplexOps.HTML.terms[0].innerText,
        ComplexOps.HTML.terms[1].innerText) + "";
    },

    /**
     * Initializes the HTML object
     */
    init: function (): void {
      this.container = document.getElementById('calculator');
      this.matrix = this.container.querySelector(".matrixTable");
      this.terms = this.matrix.rows[0].children;
      this.footer = this.container.querySelector(".matrixFooter");
      this.footerText = this.footer.querySelector("p");

      // buttons

      Button.createByAttachment(document.getElementById("complexAdd"), ComplexOps.HTML.add, "complexAdd");
      Button.createByAttachment(document.getElementById("complexSub"), ComplexOps.HTML.subtract, "complexSub");
      Button.createByAttachment(document.getElementById("complexMul"), ComplexOps.HTML.multiply, "complexMul");
      Button.createByAttachment(document.getElementById("complexDiv"), ComplexOps.HTML.divide, "complexDiv");
    }
  }
}

/**
 * A matrix of complex numbers
 */
class MatrixValues {
  rows: MatrixRow[];

  determinantMultipliers: MathNum[] = [];

  /**
   * @param inValues An array of row value arrays 
   */
  constructor(inValues: MathNum[][]) {
    this.rows = [];

    for (let i = 0; i < inValues.length; i++) {
      this.rows[i] = new MatrixRow(inValues[i], this);
    }
  }

  get isSquare(): boolean {
    return this.numCols === this.numRows;
  }

  get numRows(): number {
    return this.rows.length;
  }

  get numCols(): number {
    return this.rows[0].values.length;
  }

  get determinant(): MathNum {
    if (!this.isSquare) {
      throw new Error('Matrix must be square');
    }

    const clone: MatrixValues = this.clone();
    clone.solve();

    const baseDeterminant = MathNum.ONE.clone();

    for (let i = 0; i < clone.numRows; i++)
      baseDeterminant.multiplyBy(clone.getValueAt(i, i));

    return baseDeterminant.multiplyBy(clone.determinantChangeProduct);
  }

  get determinantChangeProduct(): MathNum {
    if (this.determinantMultipliers.length == 0)
      return MathNum.ONE.clone();

    const product = this.determinantMultipliers[0].clone();
    for (let i = 1; i < this.determinantMultipliers.length; i++)
      product.multiplyBy(this.determinantMultipliers[i]);

    return product;
  }

  /**
   * @requires This matrix is solved
   */
  get rank(): number {
    let rank = this.numRows;
    this.rows.forEach((row: MatrixRow) => {
      if (row.isZeroRow) rank--;
    });

    return rank;
  }

  clone(this: MatrixValues): MatrixValues {
    const clonedValues: MathNum[][] = [];

    this.rows.forEach((row: MatrixRow) => {
      const rowValues = [];

      row.values.forEach((value: MathNum) => {
        rowValues.push(value.clone());
      });

      clonedValues.push(rowValues);
    });

    return new MatrixValues(clonedValues);
  }

  getValueAt(this: MatrixValues, r: number, c: number): MathNum {
    if (r >= this.rows.length || r < 0)
      throw new Error("Bad row: " + r);

    return this.rows[r].getValueAt(c);
  }

  setValueAt(this: MatrixValues, r: number, c: number, value: MathNum): void {
    if (r >= this.rows.length || r < 0)
      throw new Error("Bad row: " + r);

    this.rows[r].setValueAt(c, value);
  }

  /**
   * Appends the given colValues to the right side of the matrix
   * @requires colValues.length = rows.length
   */
  appendColumn(this: MatrixValues, colValues: MathNum[]) {
    if (colValues.length != this.rows.length)
      throw new Error("number of rows in new column does not equal number of rows in matrix.");

    for (let i = 0; i < this.rows.length; i++) {
      this.rows[i].values.push(colValues[i]);
    }
  }

  /**
   * Executes the Gauss part of the Gauss-Jordan algorithm
   */
  gaussPart(this: MatrixValues) {
    for (let i = 0; i < this.rows.length; i++) {
      this.scaleRowToUnity(i);
      this.log(LOG_AS_LATEX);
      this.clearPivotColBelow(i);
      this.log(LOG_AS_LATEX);
    }
  }

  /**
   * Executes the Jordan part of the Gauss-Jordan algorithm
   */
  jordanPart(this: MatrixValues) {
    for (let i = this.rows.length - 1; i >= 0; i--) {
      this.clearPivotColAbove(i);
      this.log(LOG_AS_LATEX);
    }
  }

  /**
   * Logs the current state of this matrix to the console
   */
  log(this: MatrixValues, asLaTeX?: boolean) {
    console.log(this.print(asLaTeX || false));
  }

  /**
   * Returns a string representation of the matrix
   */
  print(this: MatrixValues, asLaTeX?: boolean): string {
    let output: string = '';
    let maxCellLength = 0;

    // get max field length
    for (const row of this.rows) {
      for (let i = 0; i < row.length; i++) {
        maxCellLength = Math.max(row.getValueAt(i).prettyPrint().length, maxCellLength);
      }
    }

    // produce matrix
    for (const row of this.rows) {
      for (let i = 0; i < row.length; i++) {
        output += Leylights.stringToLength(row.getValueAt(i).prettyPrint(), maxCellLength) + ' ';
        if (i != row.length - 1) {
          if (asLaTeX)
            output += ' & ';
          else
            output += '| ';
        }
      }
      if (asLaTeX)
        output += '\\\\';
      output += '\n';
    }
    return output;
  }

  /**
   * Scales all values by a given amount
   */
  scaleAll(this: MatrixValues, scalar: MathNum): MatrixValues {
    for (let i = 0; i < this.rows.length; i++) {
      for (let j = 0; j < this.rows[0].values.length; j++) {
        this.rows[i].values[j].multiplyBy(scalar);
      }
    }
    return this;
  }

  /**
   * Scales a given row to unity
   * @param rowIndex The index of the row to be scaled
   * 
   * SAFE?: NO
   */
  scaleRowToUnity(this: MatrixValues, rowIndex: number): MatrixValues {
    this.rows[rowIndex].scaleToUnity();
    return this;
  }

  /**
   * Swaps rows a and b
   */
  swapRows(this: MatrixValues, a: number, b: number): MatrixValues {
    if (a < 0 || a >= this.numRows) {
      throw new Error("bad swapped row: " + a);
    } else if (b < 0 || b >= this.numRows) {
      throw new Error("bad swapped row: " + b);
    }

    const tempRow = this.rows[b];
    this.rows[b] = this.rows[a];
    this.rows[a] = tempRow;

    this.determinantMultipliers.push(MathNum.NEG_ONE);

    return this;
  }

  /**
   * Swaps a .solve()d matrix so that its rows are in RREF
   */
  swapToRREF(this: MatrixValues): MatrixValues {
    const ZERO = MathNum.ZERO;

    // for column 0:
    //  check if (0,0) is occupied
    //    if so, continue
    //    else, then check if any (j, 0) rows have a first entry
    //      if so, swap with row 0
    //      else, continue
    // for column c:
    //  check if (c,c) is occupied
    //    if so, continue
    //    else, then check if any (r, c) rows have a cth entry
    //      if so, swap with row c
    //      else, continue

    for (let c = 0; c < this.numCols; c++) {
      if (c >= this.numRows)
        break;
      if (this.getValueAt(c, c).isEqualTo(ZERO)) { // (c,c) is unoccupied
        for (let r = c; r < this.numRows; r++) {
          if (this.getValueAt(r, c).isEqualTo(ZERO)) { // (r,c) has a cth entry
            this.swapRows(c, r);
          }
        }
      }
    }

    return this;
  }

  /**
   * Solves the matrix by applying the Gauss-Jordan algorithm
   */

  solve(this: MatrixValues): MatrixValues {
    this.gaussPart();
    this.jordanPart();
    this.swapToRREF();
    return this;
  }

  /**
   * Gets the submatrix of rows [startRow, endRow), [startColumn, endColumn) 
   */
  submatrixBetween(this: MatrixValues, startRow: number, endRow: number, startColumn: number, endColumn: number): MatrixValues {
    const submatrixValues: MathNum[][] = [];

    for (let i = startRow; i < endRow; i++) {
      const nextRow: MathNum[] = [];
      for (let j = startColumn; j < endColumn; j++) {
        nextRow.push(this.getValueAt(i, j).clone());
      }
      submatrixValues.push(nextRow);
    }

    return new MatrixValues(submatrixValues);
  }

  /**
   * Gets the submatrix of this, with removedRow and removedColumn removed
   */
  submatrixByRemoval(this: MatrixValues, removedRow: number, removedColumn: number): MatrixValues {
    const submatrixValues: MathNum[][] = [];

    for (let i = 0; i < this.rows.length; i++) {
      if (i === removedRow)
        continue;

      const nextRow: MathNum[] = [];

      for (let j = 0; j < this.rows[0].length; j++) {
        if (j === removedColumn)
          continue;

        nextRow.push(this.getValueAt(i, j).clone());
      }

      submatrixValues.push(nextRow);
    }

    return new MatrixValues(submatrixValues);
  }

  clearPivotColAbove(this: MatrixValues, rowIndex: number): MatrixValues {
    const pivotCol: number = this.rows[rowIndex].pivotCol;

    if (pivotCol == -1) { // skip when there's no pivot
      return this;
    }

    for (let i = rowIndex - 1; i >= 0; i--) {
      (this as MatrixValues).rows[i].addRow(
        this.rows[rowIndex].clone().multiplyRowBy(
          MathNum.multiply(this.rows[i].getValueAt(pivotCol), MathNum.NEG_ONE)
        )
      );
    }

    return this;
  }

  clearPivotColBelow(this: MatrixValues, rowIndex: number): MatrixValues {
    const pivotCol: number = this.rows[rowIndex].pivotCol;

    if (pivotCol == -1) { // skip when there's no pivot
      return this;
    }

    for (let i = rowIndex + 1; i < this.rows.length; i++) {
      (this as MatrixValues).rows[i].addRow(
        this.rows[rowIndex].clone().multiplyRowBy(
          MathNum.multiply(this.rows[i].getValueAt(pivotCol), MathNum.NEG_ONE)
        )
      );
    }

    return this;
  }

  /**
   * For a matrix A in M nxn, returns (A|In)
   * 
   * 1 2      =>     1 2 1 0
   * 3 4             3 4 0 1
   */
  static getMatrixAppendedIdentityN(matrix: MatrixValues): MatrixValues {
    const clone = matrix.clone();

    for (let i = 0; i < clone.rows.length; i++) {
      const column: MathNum[] = [];

      for (let j = 0; j < clone.rows.length; j++) {
        if (i == j)
          column.push(MathNum.ONE.clone());
        else
          column.push(MathNum.ZERO.clone());
      }

      clone.appendColumn(column);
    }

    return clone;
  }
}

class MatrixRow {
  values: MathNum[];
  parentMatrix: MatrixValues;

  constructor(values: MathNum[], parentMatrix: MatrixValues) {
    this.values = [];
    this.parentMatrix = parentMatrix;

    for (let i = 0; i < values.length; i++) {
      this.values[i] = values[i].clone();
    }
  }

  get isZeroRow(): boolean {
    for (let i = 0; i < this.values.length; i++) {
      if (!this.values[i].isEqualTo(MathNum.ZERO))
        return false;
    }

    return true;
  }

  get length(): number {
    return this.values.length;
  }

  get pivotCol(): number {
    for (let i = 0; i < this.values.length; i++) {
      if (!this.values[i].isEqualTo(MathNum.ZERO)) {
        return i;
      }
    }

    return -1;
  }

  clone(): MatrixRow {
    return new MatrixRow(this.values, this.parentMatrix);
  }

  /**
   * Adds the given row to this row.
   * 
   * SAFE: NO
   * IDEMPOTENT: NO
   */
  addRow(addedRow: MatrixRow): MatrixRow {
    for (let i = 0; i < this.values.length; i++) {
      this.values[i].add(addedRow.getValueAt(i));
    }

    return this;
  }

  /**
   * Scales the row by the multiplier.
   * @param multiplier 
   * 
   * SAFE: NO
   * IDEMPOTENT: NO
   */
  multiplyRowBy(multiplier: MathNum): MatrixRow {
    for (let i = 0; i < this.values.length; i++) {
      this.values[i].multiplyBy(multiplier);
    }

    return this;
  }

  /**
   * Scales this row to unity
   */
  scaleToUnity(this: MatrixRow): MatrixRow {
    const pivot: number = this.pivotCol;
    if (pivot == -1) {
      return this;
    }

    const multiplier: MathNum = this.values[this.pivotCol].getMultiplicativeInverse();

    for (let i = 0; i < this.values.length; i++) {
      this.values[i].multiplyBy(multiplier);
    }

    this.parentMatrix.determinantMultipliers.push(multiplier.getMultiplicativeInverse());
    return this;
  }

  getValueAt(index: number): MathNum {
    if (index >= this.values.length || index < 0)
      throw new Error("bad column");

    return this.values[index];
  }

  setValueAt(index: number, value: MathNum): void {
    if (index >= this.values.length || index < 0)
      throw new Error("bad column");

    this.values[index] = value;
  }
}

/**
 * Static methods to listen to the HTML DOM
 */
class MatrixDOMListener {
  static addRow(this: MatrixDOMListener, service: MatrixHTML): void {
    service.addRow();
  }

  static delRow(this: MatrixDOMListener, service: MatrixHTML): void {
    service.delRow();
  }

  static addCol(this: MatrixDOMListener, service: MatrixHTML): void {
    service.addCol();
  }

  static delCol(this: MatrixDOMListener, service: MatrixHTML): void {
    service.delCol();
  }

  static undo(this: MatrixDOMListener, service: MatrixHTML): void {
    service.revert();
  }

  static clear(this: MatrixDOMListener, service: MatrixHTML): void {
    service.clear();
  }

  static execute(this: MatrixDOMListener, service: MatrixHTML): void {
    service.matrix.execute();
  }

  static fill(this: MatrixDOMListener, service: MatrixHTML): void {
    service.matrix.fill();
  }

  static getMatrix(this: MatrixDOMListener, service: MatrixHTML): MatrixValues {
    return service.getMatrix();
  }

  static invert(this: MatrixDOMListener, service: MatrixHTML): void {
    service.matrix.invert();
  }

  static scale(this: MatrixDOMListener, service: MatrixHTML): void {
    service.matrix.scale();
  }

  static solve(this: MatrixDOMListener, service: MatrixHTML): void {
    service.matrix.solve();
  }

  static getDeterminant(this: MatrixDOMListener, service: MatrixHTML): void {
    service.matrix.getDeterminant();
  }

  static cofactor(this: MatrixDOMListener, service: MatrixHTML): void {
    service.matrix.getCofactor();
  }

  static adjunct(this: MatrixDOMListener, service: MatrixHTML): void {
    service.matrix.setToAdjunct();
  }
}

/**
 * MatrixHTML
 * 
 * Acts as a child of Matrix objects.
 */
class MatrixHTML {
  matrix: Matrix;
  container: HTMLElement;
  element: HTMLTableElement;
  footer: HTMLElement;
  footerInput: HTMLInputElement;
  footerButtonContainer: HTMLElement;

  lastState: MatrixValues;

  buttons: Button[];

  isEditable: boolean;
  hideWhenEmpty: boolean;

  private cellHighlightTime: number = -1;
  private cellHighlightLength: number = BASE_TEMP_HIGHLIGHT_TIME;

  constructor(data: Matrix, initializationData: MatrixHTMLInitializationData) {
    this.matrix = data;
    this.container = initializationData.container;
    this.isEditable = initializationData.isEditable;
    this.hideWhenEmpty = initializationData.hideWhenEmpty;

    this.buttons = [];
    this.lastState = null;

    this.init(initializationData.buttons);

    if (initializationData.rows >= 1 && initializationData.columns >= 1) {
      for (let i = 0; i < initializationData.rows - 1; i++)
        this.addRow();

      for (let i = 0; i < initializationData.columns - 1; i++)
        this.addCol();
    } else {
      while (this.numRows > 0)
        this.delRow();
    }
  }

  get numRows(): number {
    return this.element.rows.length;
  }

  get numCols(): number {
    if (this.numRows == 0)
      return 0;
    else
      return this.element.rows[0].cells.length;
  }

  addRow(this: MatrixHTML): void {
    const el: HTMLTableElement = this.element;
    const row: HTMLTableRowElement = el.insertRow();
    let numCols: number = el.rows[0].children.length;

    if (numCols === 0) numCols = 1;

    for (let i = 0; i < numCols; i++) {
      const cell = row.insertCell();

      if (this.isEditable)
        cell.setAttributeNode(Leylights.betterCreateAttr('contenteditable', 'true'));
    }

    this.checkDisplay();
  }

  delRow(this: MatrixHTML): void {
    this.element.deleteRow(this.element.rows.length - 1);

    this.checkDisplay();
  }

  addCol(this: MatrixHTML): void {
    const el: HTMLTableElement = this.element;

    if (el.rows.length == 0) {
      el.insertRow();
    }

    for (let i = 0; i < el.rows.length; i++) {
      const cell = el.rows[i].insertCell();
      cell.setAttributeNode(Leylights.betterCreateAttr('contenteditable', 'true'));
    }

    this.checkDisplay();
  }

  delCol(this: MatrixHTML): void {
    const el: HTMLTableElement = this.element;
    if (el.rows.length === 0) {
      this.checkDisplay();
      return;
    }

    for (let i = 0; i < el.rows.length; i++) {
      el.rows[i].deleteCell(el.rows[i].children.length - 1);
    }

    if (el.rows[0].children.length == 0) {
      while (el.rows.length > 0) {
        this.delRow();
      }
    }

    this.checkDisplay();
  }

  /**
   * Deletes all rows and columns
   */
  delAll(this: MatrixHTML): void {
    while (this.numRows > 0)
      this.delRow();
  }

  clear(this: MatrixHTML): void {
    const el: HTMLTableElement = this.element;

    for (let r = 0; r < el.rows.length; r++) {
      for (let c = 0; c < el.rows[r].children.length; c++) {
        (el.rows[r].children[c] as HTMLElement).innerText = "";
      }
    }
  }

  /**
   * Hides the matrix if it should be hidden, shows it if it should be shown
   */
  checkDisplay(this: MatrixHTML): void {
    if (!this.hideWhenEmpty)
      return;

    if (this.numRows === 0)
      this.container.style.display = 'none';
    else
      this.container.style.display = '';
  }

  generateMatrixButton(this: MatrixHTML, content: MatrixHTMLButtonsEnum, listenerFn: () => void, errorAction?: () => void, alternateParent?: HTMLElement | null): void {
    const buttonRow: HTMLElement = alternateParent || this.container.querySelector(".matrixButtons");

    let classNames: string[];
    if (alternateParent != this.footerButtonContainer) {
      classNames = ["matrixButton"];
    } else {
      classNames = ["matrixButton", "matrix-footer-button"]
      if (isHalfButton(content)) {
        classNames.push("matrix-footer-button-half")
      }
    }

    const newButton: Button = Button.createByAppending(
      buttonRow,
      listenerFn,
      content,
      false,
      "matrix-button-" + MatrixHTML.nextMatrixButtonId + "-" + content.toLowerCase().replace(/ /g, "-"),
      classNames,
      content
    );

    if (isHalfButton(content)) {
      switch (content) {
        case MatrixHTMLButtonsEnum.cofactor:
          newButton.element.insertAdjacentHTML('afterend', MATRIX_PAIR_INPUT.replace(
            /ADDITIONAL_CLASSES_ONE/g,
            "cofactor-input-row"
          ).replace(
            /ADDITIONAL_CLASSES_TWO/g,
            "cofactor-input-col"
          ).replace(
            /FOOTER_INPUT_STYLE/g,
            ""
          ));
          break;
        case MatrixHTMLButtonsEnum.scale:
        default:
          newButton.element.insertAdjacentHTML('afterend', MATRIX_SCALAR_INPUT.replace(
            /ADDITIONAL_CLASSES/g,
            "scale-input"
          ).replace(
            /FOOTER_INPUT_STYLE/g,
            ""
          ));
          break;
      }
    }

    newButton.errorAction = (e: Error) => {
      const errorLog: HTMLElement = this.container.querySelector(".matrix-errors");

      // setting
      let msg = e.message;
      if (errorLog.parentElement.querySelector(".matrix-log").innerHTML !== "")
        msg = " | " + msg;

      errorLog.innerHTML = msg;

      // clearing
      const regexp: RegExp = new RegExp(msg.replace(/\|/g, "\\|")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]"), "g");

      setTimeout(() => {
        errorLog.innerHTML = errorLog.innerHTML.replace(regexp, "").trim();
      }, BASE_TEMP_HIGHLIGHT_TIME);

      if (errorAction)
        errorAction();
    }

    this.buttons.push(newButton);
    MatrixHTML.nextMatrixButtonId++;

    function isHalfButton(maybeHalfButton: MatrixHTMLButtonsEnum): boolean {
      return Leylights.orEquals(maybeHalfButton, [
        MatrixHTMLButtonsEnum.scale,
        MatrixHTMLButtonsEnum.cofactor
      ]);
    }
  }

  getMatrix(this: MatrixHTML, emptyToZero?: boolean): MatrixValues {
    const el: HTMLTableElement = this.element;
    const values: MathNum[][] = [];

    for (let r = 0; r < el.rows.length; r++) {
      values[r] = [];

      for (let c = 0; c < el.rows[r].children.length; c++) {
        const innerText = (el.rows[r].children[c] as HTMLElement).innerText;

        if (emptyToZero && innerText == "") {
          values[r][c] = MathNum.ZERO.clone();
        } else if (innerText == "") {
          throw new Error("empty matrix fields");
        } else {
          values[r][c] = MathNum.createFromStr(innerText);
        }
      }
    }

    return new MatrixValues(values);
  }

  highlightEmptyCells(this: MatrixHTML): void {
    this.highlightGenericCells((el: HTMLTableDataCellElement) => {
      return el.innerHTML === "";
    });
  }

  highlightGenericCells(this: MatrixHTML, highlightCondition?: (cell: HTMLTableCellElement) => boolean, clearHighlights?: boolean): void {
    for (let i = 0; i < this.element.rows.length; i++) {
      for (let j = 0; j < this.element.rows[0].children.length; j++) {
        const cell: HTMLTableCellElement = this.element.rows[i].children[j] as HTMLTableCellElement;
        if (clearHighlights) {
          if (Date.now() - this.cellHighlightTime >= this.cellHighlightLength)
            cell.className = cell.className.replace(/cell-reject/g, "").trim();
        } else {
          if (highlightCondition(cell))
            cell.className += " cell-reject";
        }
      }
    }

    if (!clearHighlights) {
      setTimeout(() => { this.highlightGenericCells(null, true) }, this.cellHighlightLength);
      this.cellHighlightTime = Date.now();
    }
  }

  highlightNaNCells(this: MatrixHTML): void {
    this.highlightGenericCells((el: HTMLTableDataCellElement) => {
      return isNaN(parseInt(el.innerHTML));
    });
  }

  logOutput(this: MatrixHTML, str: string): void {
    (this.container.querySelector(".matrix-log") as HTMLElement).innerText = str;
  }

  revert(this: MatrixHTML): void {
    if (this.lastState === null)
      throw new Error('Nothing to revert to');

    this.setMatrix(this.lastState);
  }

  setMatrix(this: MatrixHTML, values: MatrixValues): void {
    const el: HTMLTableElement = this.element;
    if (this.numRows > 0)
      this.lastState = this.getMatrix(true);

    for (let r = 0; r < el.rows.length; r++) {
      for (let c = 0; c < el.rows[r].children.length; c++) {
        (el.rows[r].children[c] as HTMLElement).innerText = values.rows[r].getValueAt(c).prettyPrint();
      }
    }
  }

  /**
   * Initializes the HTML object
   */
  init(this: MatrixHTML, buttons: string[]) {
    this.element = this.container.querySelector(".matrixTable");
    this.footer = this.container.querySelector(".matrixFooter");
    this.footerButtonContainer = this.footer.querySelector(".matrix-footer-buttons");
    this.footerInput = this.footer.querySelector(".footer-input");

    // buttons
    if (Leylights.orEquals("resize", buttons)) {
      this.generateMatrixButton(MatrixHTMLButtonsEnum.addRow, () => { MatrixDOMListener.addRow(this) });
      this.generateMatrixButton(MatrixHTMLButtonsEnum.addCol, () => { MatrixDOMListener.addCol(this) });
      this.generateMatrixButton(MatrixHTMLButtonsEnum.delRow, () => { MatrixDOMListener.delRow(this) });
      this.generateMatrixButton(MatrixHTMLButtonsEnum.delCol, () => { MatrixDOMListener.delCol(this) });
    }

    buttons.forEach((button: string) => {
      switch (button) {
        case "solve":
          this.generateMatrixButton(
            MatrixHTMLButtonsEnum.solve,
            () => { MatrixDOMListener.solve(this) },
            () => { this.highlightEmptyCells() },
            this.footerButtonContainer
          );
          break;
        case "fill":
          this.generateMatrixButton(
            MatrixHTMLButtonsEnum.fill,
            () => { MatrixDOMListener.fill(this) },
            null,
            this.footerButtonContainer
          );
          break;
        case "clear":
          this.generateMatrixButton(
            MatrixHTMLButtonsEnum.clear,
            () => { MatrixDOMListener.clear(this) },
            null,
            this.footerButtonContainer
          );
          break;
        case "det":
          this.generateMatrixButton(
            MatrixHTMLButtonsEnum.determinant,
            () => { MatrixDOMListener.getDeterminant(this) },
            () => { this.highlightEmptyCells() },
            this.footerButtonContainer
          );
          break;
        case "invert":
          this.generateMatrixButton(
            MatrixHTMLButtonsEnum.invert,
            () => { MatrixDOMListener.invert(this) },
            () => { this.highlightEmptyCells() },
            this.footerButtonContainer
          );
          break;
        case "scale":
          this.generateMatrixButton(
            MatrixHTMLButtonsEnum.scale,
            () => { MatrixDOMListener.scale(this) },
            () => { this.highlightEmptyCells() },
            this.footerButtonContainer
          );
          break;
        case "execute":
          this.generateMatrixButton(
            MatrixHTMLButtonsEnum.clear,
            () => { MatrixDOMListener.execute(this), this.footerButtonContainer });
          break;
        case "cofactor":
          this.generateMatrixButton(
            MatrixHTMLButtonsEnum.cofactor,
            () => { MatrixDOMListener.cofactor(this) },
            () => { this.highlightEmptyCells() },
            this.footerButtonContainer
          );
          break;
        case "adj":
          this.generateMatrixButton(
            MatrixHTMLButtonsEnum.adjunct,
            () => { MatrixDOMListener.adjunct(this) },
            () => { this.highlightEmptyCells() },
            this.footerButtonContainer
          );
          break;
        case "undo":
          this.generateMatrixButton(
            MatrixHTMLButtonsEnum.undo,
            () => { MatrixDOMListener.undo(this) },
          );
          break;
      }
    })

    this.checkDisplay();
  }

  static nextMatrixButtonId: number = 0;
}

/**
 * Handles the matrix
 */
class Matrix {
  HTML: MatrixHTML;

  constructor(HTMLInitData: MatrixHTMLInitializationData) {
    this.HTML = new MatrixHTML(this, HTMLInitData);
  }

  getCofactor(this: Matrix): void {
    const baseMatrix: MatrixValues = this.HTML.getMatrix();

    const rowIndex = parseInt((this.HTML.container.querySelector('.cofactor-input-row') as HTMLInputElement).value);
    const colIndex = parseInt((this.HTML.container.querySelector('.cofactor-input-col') as HTMLInputElement).value);

    if (rowIndex <= 0 || rowIndex > baseMatrix.numRows || isNaN(rowIndex)) {
      throw new Error("Bad row given: row must be within [1, " + (baseMatrix.numRows) + "]");
    } else if (colIndex <= 0 || colIndex > baseMatrix.numCols || isNaN(colIndex)) {
      throw new Error("Bad column given: column must be within [1, " + (baseMatrix.numCols) + "]");
    }

    if (baseMatrix.numCols !== baseMatrix.numRows) {
      throw new Error("cofactor is undefined: matrix is not square");
    }

    // cofactor: (-1)^(i+j) * determinant(M_{ij}(A))

    let sign: MathNum;
    if ((rowIndex + colIndex) % 2 === 0)
      sign = MathNum.ONE;
    else
      sign = MathNum.NEG_ONE;

    const submatrix: MatrixValues = baseMatrix.submatrixByRemoval(rowIndex - 1, colIndex - 1); // internally indexes by zero
    const determinant: MathNum = submatrix.determinant;

    this.HTML.logOutput(MathNum.multiply(sign, determinant).prettyPrint());
  }

  getDeterminant(this: Matrix): void {
    const baseMatrix: MatrixValues = this.HTML.getMatrix();
    this.HTML.logOutput(baseMatrix.determinant.prettyPrint());
  }

  /**
   * Executes MatrixOps functions
   */
  execute(this: Matrix): void {
    this.invert();
  }

  fill(this: Matrix): void {
    while (this.HTML.element.rows.length > 0) {
      this.HTML.delRow();
    }

    for (let i = 0; i < MATRIX_FILL_VALUES.length; i++) {
      this.HTML.addRow();
    }

    for (let i = 0; i < MATRIX_FILL_VALUES[0].length - 1; i++) {
      this.HTML.addCol();
    }

    for (let i = 0; i < MATRIX_FILL_VALUES.length; i++) {
      for (let j = 0; j < MATRIX_FILL_VALUES[i].length; j++) {
        (this.HTML.element.rows[i].children[j] as HTMLElement).innerText = MATRIX_FILL_VALUES[i][j];
      }
    }
  }

  invert(this: Matrix): void {
    const baseMatrix: MatrixValues = this.HTML.getMatrix();
    const baseCols: number = baseMatrix.numCols;

    if (!baseMatrix.isSquare) {
      throw new Error("Matrix must be square");
    }

    // append In
    const matrixWithIdentity = MatrixValues.getMatrixAppendedIdentityN(baseMatrix);
    // solve
    matrixWithIdentity.solve();
    if (matrixWithIdentity.rank != matrixWithIdentity.numRows) {
      throw new Error("Rank of matrix must be " + matrixWithIdentity.numRows + ", is " + matrixWithIdentity.rank);
    }
    // get the inverse (result of operations on In)
    const inverse = matrixWithIdentity.submatrixBetween(0, matrixWithIdentity.numRows, baseCols, matrixWithIdentity.numCols);
    this.HTML.setMatrix(inverse);
  }

  setToAdjunct(this: Matrix): void {
    const baseMatrix: MatrixValues = this.HTML.getMatrix();

    if (baseMatrix.numCols !== baseMatrix.numRows) {
      throw new Error("adjunct is undefined: matrix is not square");
    }

    const determinant = baseMatrix.determinant;

    if (determinant.isEqualTo(MathNum.ZERO)) {
      throw new Error("adjunct not found: determinant is zero");
    }

    baseMatrix.solve();
    baseMatrix.scaleAll(determinant);

    this.HTML.setMatrix(baseMatrix);
  }

  solve(this: Matrix): void {
    const matrix = this.HTML.getMatrix();
    this.HTML.setMatrix(matrix.solve());
  }

  scale(this: Matrix): void {
    const matrix = this.HTML.getMatrix();
    this.HTML.setMatrix(
      matrix.scaleAll(
        MathNum.createFromStr(
          (this.HTML.container.querySelector('.scale-input') as HTMLInputElement)
            .value)));
  }

  static buildMatrix(container: HTMLElement): Matrix {
    function innerHTMLOrNull(querySelectorParam: string, failValue: any) {
      const result = container.querySelector(querySelectorParam);
      if (result)
        return result.innerHTML;
      else
        return failValue;
    }

    const title: string = innerHTMLOrNull("li.matrix-title", "");
    const buttons: string[] = innerHTMLOrNull("li.matrix-buttons", "").split(" ");
    const size: string = innerHTMLOrNull("li.matrix-size", "1 1");
    const isEditable: boolean = Leylights.toBoolPipe.to(innerHTMLOrNull("li.matrix-editable", ""));
    const displayFooterInput: boolean = Leylights.toBoolPipe.to(innerHTMLOrNull("li.matrix-display-footer", ""));
    const hideWhenEmpty: boolean = Leylights.toBoolPipe.to(innerHTMLOrNull("li.matrix-hide-when-empty", "false"));
    let footerInputStyle: string = "";

    if (!displayFooterInput) {
      footerInputStyle = "style = 'display: none'";
    }

    const rows = parseInt(size);
    const cols = parseInt(size.replace(rows + "", "").trim());

    container.innerHTML = MATRIX_INTERIOR
      .replace(/MATRIX_TITLE/g, title)
      .replace(/FOOTER_INPUT_STYLE/g, footerInputStyle || "");

    if (!isEditable) {
      container.innerHTML = container.innerHTML
        .replace(/contenteditable/g, "");
    }

    const HTMLInitData: MatrixHTMLInitializationData = {
      container: container,
      columns: cols,
      rows: rows,
      isEditable: isEditable,
      buttons: buttons,
      hideWhenEmpty: hideWhenEmpty
    }

    return new Matrix(HTMLInitData);
  }

  static getMatrixByName(name: string) {
    for (let i = 0; i < matrices.length; i++) {
      if (matrices[i].HTML.container.querySelector("h1").innerHTML.trim() == name) {
        return matrices[i];
      }
    }

    return null;
  }
}

/**
 * Mulitplies two matrices
 */
class MatrixMultiplication {
  static button: Button;
  static A: Matrix;
  static B: Matrix;
  static solution: Matrix;

  /**
   * Attempts to multiply the two matrices
   */
  static attemptMultiply(): void {
    const reject: boolean = false;

    if (MatrixMultiplication.A.HTML.numCols == MatrixMultiplication.B.HTML.numRows) {
      MatrixMultiplication.multiply();
    } else {
      throw new Error("Number of rows in A does not equal number of columns in B");
    }

    if (reject) {
      MatrixMultiplication.button.reject();

      while (MatrixMultiplication.solution.HTML.numRows > 0)
        MatrixMultiplication.solution.HTML.delRow();
    }
  }

  static getSolutionAt(x: number, y: number): MathNum {
    const sum = MathNum.ZERO.clone();
    const matrixA = MatrixMultiplication.A.HTML.getMatrix();
    const matrixB = MatrixMultiplication.B.HTML.getMatrix();

    for (let i = 0; i < MatrixMultiplication.B.HTML.numRows; i++) {
      sum.add(
        MathNum.multiply(
          matrixA.getValueAt(y, i),
          matrixB.getValueAt(i, x)
        )
      );
    }

    return sum;
  }

  /**
   * Multiplies the two matrices
   * @requires each matrix is full, and the number of rows and columns is satisfactory
   */
  static multiply() {
    // reset the solution
    while (MatrixMultiplication.solution.HTML.numRows > 0) {
      MatrixMultiplication.solution.HTML.delRow();
    }

    // set up solution grid
    const h: number = MatrixMultiplication.A.HTML.numRows;
    const w: number = MatrixMultiplication.B.HTML.numCols;

    for (let y = 0; y < h; y++) {
      MatrixMultiplication.solution.HTML.addRow();
    }
    for (let x = 0; x < w - 1; x++) {
      MatrixMultiplication.solution.HTML.addCol();
    }

    // solve
    const solutionMatrix = MatrixMultiplication.solution.HTML.getMatrix(true);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        solutionMatrix.setValueAt(y, x, MatrixMultiplication.getSolutionAt(x, y));
      }
    }

    MatrixMultiplication.solution.HTML.setMatrix(solutionMatrix);
  }

  static init(): void {
    MatrixMultiplication.button = Button.createByAttachment(document.getElementById("multiply-matrices-button"), MatrixMultiplication.attemptMultiply, "matrixMult");
    MatrixMultiplication.button.errorAction = () => {
      MatrixMultiplication.A.HTML.highlightEmptyCells();
      MatrixMultiplication.B.HTML.highlightEmptyCells();
      MatrixMultiplication.solution.HTML.delAll();
    };

    MatrixMultiplication.A = Matrix.getMatrixByName("Matrix A");
    MatrixMultiplication.B = Matrix.getMatrixByName("Matrix B");
    MatrixMultiplication.solution = Matrix.getMatrixByName("Multiplied Matrices");

    MatrixMultiplication.solution.HTML.hideWhenEmpty = true;
  }
}

function init() {
  ComplexOps.HTML.init();

  // create matrices
  const containers: HTMLCollectionOf<Element> = document.getElementsByClassName("matrixContainer generate");
  for (let i = 0; i < containers.length; i++) {
    matrices.push(Matrix.buildMatrix(containers[i] as HTMLElement));
  }

  // set up multiplication button
  MatrixMultiplication.init();

  // create tabs
  const tabButtons: NodeListOf<HTMLLIElement> = document.getElementById("tabs-bar").querySelectorAll("li");
  const tabBodies: HTMLCollectionOf<Element> = document.getElementsByClassName("tab-body");
  for (let i = 0; i < tabButtons.length; i++) {
    tabButtons[i].addEventListener("click", () => displayTab(tabButtons[i], tabBodies[i] as HTMLElement));
  }

  // show first tab
  displayTab(tabButtons[0], tabBodies[0] as HTMLElement);
}

function displayTab(button: HTMLElement, body: HTMLElement): void {
  const allTabBodies: HTMLCollectionOf<Element> = document.getElementsByClassName("tab-body");
  const allTabButtons: NodeListOf<HTMLLIElement> = document.getElementById("tabs-bar").querySelectorAll("li");
  for (let i = 0; i < allTabBodies.length; i++) {
    allTabButtons[i].className = allTabButtons[i].className.replace(/active-tab/g, "");
    (allTabBodies[i] as HTMLElement).style.display = "none";
  }

  body.style.display = "";
  button.className += " active-tab";
}

init();
