import { cws } from "../cws.js";
import { MathNum } from "../tools/math/number.js";
import { Button } from "./_components/button.component.js";
import { BASE_TEMP_HIGHLIGHT_TIME } from "./_components/general.js";
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
    ["5-i", "-2-2i"]
];
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
var matrices = [];
/**
 * Holds all user-facing operations
 */
class ComplexOps {
    static add(a, b) {
        return MathNum.add(MathNum.createFromStr(a), MathNum.createFromStr(b)).prettyPrint();
    }
    static subtract(a, b) {
        return MathNum.subtract(MathNum.createFromStr(a), MathNum.createFromStr(b)).prettyPrint();
    }
    static multiply(a, b) {
        return MathNum.multiply(MathNum.createFromStr(a), MathNum.createFromStr(b)).prettyPrint();
    }
    static divide(a, b) {
        return MathNum.divide(MathNum.createFromStr(a), MathNum.createFromStr(b)).prettyPrint();
    }
}
ComplexOps.HTML = {
    matrix: null,
    container: null,
    terms: null,
    footer: null,
    footerText: null,
    add: function () {
        ComplexOps.HTML.performCalculation(ComplexOps.add);
    },
    subtract: function () {
        ComplexOps.HTML.performCalculation(ComplexOps.subtract);
    },
    multiply: function () {
        ComplexOps.HTML.performCalculation(ComplexOps.multiply);
    },
    divide: function () {
        ComplexOps.HTML.performCalculation(ComplexOps.divide);
    },
    performCalculation: function (f) {
        ComplexOps.HTML.footerText.innerText = f(ComplexOps.HTML.terms[0].innerText, ComplexOps.HTML.terms[1].innerText) + "";
    },
    /**
     * Initializes the HTML object
     */
    init: function () {
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
};
/**
 * A matrix of complex numbers
 */
class MatrixValues {
    /**
     * @param inValues An array of row value arrays
     */
    constructor(inValues) {
        this.determinantMultipliers = [];
        this.rows = [];
        for (let i = 0; i < inValues.length; i++) {
            this.rows[i] = new MatrixRow(inValues[i], this);
        }
    }
    get isSquare() {
        return this.numCols === this.numRows;
    }
    get numRows() {
        return this.rows.length;
    }
    get numCols() {
        return this.rows[0].values.length;
    }
    get determinant() {
        if (!this.isSquare) {
            throw new Error('Matrix must be square');
        }
        let clone = this.clone();
        clone.solve();
        let baseDeterminant = MathNum.ONE.clone();
        for (let i = 0; i < clone.numRows; i++)
            baseDeterminant.multiplyBy(clone.getValueAt(i, i));
        return baseDeterminant.multiplyBy(clone.determinantChangeProduct);
    }
    get determinantChangeProduct() {
        if (this.determinantMultipliers.length == 0)
            return MathNum.ONE.clone();
        let product = this.determinantMultipliers[0].clone();
        for (let i = 1; i < this.determinantMultipliers.length; i++)
            product.multiplyBy(this.determinantMultipliers[i]);
        return product;
    }
    /**
     * @requires This matrix is solved
     */
    get rank() {
        let rank = this.numRows;
        this.rows.forEach((row) => {
            if (row.isZeroRow)
                rank--;
        });
        return rank;
    }
    clone() {
        let clonedValues = [];
        this.rows.forEach((row) => {
            let rowValues = [];
            row.values.forEach((value) => {
                rowValues.push(value.clone());
            });
            clonedValues.push(rowValues);
        });
        return new MatrixValues(clonedValues);
    }
    getValueAt(r, c) {
        if (r >= this.rows.length || r < 0)
            throw new Error("Bad row: " + r);
        return this.rows[r].getValueAt(c);
    }
    setValueAt(r, c, value) {
        if (r >= this.rows.length || r < 0)
            throw new Error("Bad row: " + r);
        this.rows[r].setValueAt(c, value);
    }
    /**
     * Appends the given colValues to the right side of the matrix
     * @requires colValues.length = rows.length
     */
    appendColumn(colValues) {
        if (colValues.length != this.rows.length)
            throw new Error("number of rows in new column does not equal number of rows in matrix.");
        for (let i = 0; i < this.rows.length; i++) {
            this.rows[i].values.push(colValues[i]);
        }
    }
    /**
     * Executes the Gauss part of the Gauss-Jordan algorithm
     */
    gaussPart() {
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
    jordanPart() {
        for (let i = this.rows.length - 1; i >= 0; i--) {
            this.clearPivotColAbove(i);
            this.log(LOG_AS_LATEX);
        }
    }
    /**
     * Logs the current state of this matrix to the console
     */
    log(asLaTeX) {
        console.log(this.print(asLaTeX || false));
    }
    /**
     * Returns a string representation of the matrix
     */
    print(asLaTeX) {
        let output = '';
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
                output += cws.stringToLength(row.getValueAt(i).prettyPrint(), maxCellLength) + ' ';
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
    scaleAll(scalar) {
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
    scaleRowToUnity(rowIndex) {
        this.rows[rowIndex].scaleToUnity();
        return this;
    }
    /**
     * Swaps rows a and b
     */
    swapRows(a, b) {
        if (a < 0 || a >= this.numRows) {
            throw new Error("bad swapped row: " + a);
        }
        else if (b < 0 || b >= this.numRows) {
            throw new Error("bad swapped row: " + b);
        }
        let tempRow = this.rows[b];
        this.rows[b] = this.rows[a];
        this.rows[a] = tempRow;
        this.determinantMultipliers.push(MathNum.NEG_ONE);
        return this;
    }
    /**
     * Swaps a .solve()d matrix so that its rows are in RREF
     */
    swapToRREF() {
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
    solve() {
        this.gaussPart();
        this.jordanPart();
        this.swapToRREF();
        return this;
    }
    /**
     * Gets the submatrix of rows [startRow, endRow), [startColumn, endColumn)
     */
    submatrixBetween(startRow, endRow, startColumn, endColumn) {
        let submatrixValues = [];
        for (let i = startRow; i < endRow; i++) {
            let nextRow = [];
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
    submatrixByRemoval(removedRow, removedColumn) {
        let submatrixValues = [];
        for (let i = 0; i < this.rows.length; i++) {
            if (i === removedRow)
                continue;
            let nextRow = [];
            for (let j = 0; j < this.rows[0].length; j++) {
                if (j === removedColumn)
                    continue;
                nextRow.push(this.getValueAt(i, j).clone());
            }
            submatrixValues.push(nextRow);
        }
        return new MatrixValues(submatrixValues);
    }
    clearPivotColAbove(rowIndex) {
        let pivotCol = this.rows[rowIndex].pivotCol;
        if (pivotCol == -1) { // skip when there's no pivot
            return this;
        }
        for (let i = rowIndex - 1; i >= 0; i--) {
            this.rows[i].addRow(this.rows[rowIndex].clone().multiplyRowBy(MathNum.multiply(this.rows[i].getValueAt(pivotCol), MathNum.NEG_ONE)));
        }
        return this;
    }
    clearPivotColBelow(rowIndex) {
        let pivotCol = this.rows[rowIndex].pivotCol;
        if (pivotCol == -1) { // skip when there's no pivot
            return this;
        }
        for (let i = rowIndex + 1; i < this.rows.length; i++) {
            this.rows[i].addRow(this.rows[rowIndex].clone().multiplyRowBy(MathNum.multiply(this.rows[i].getValueAt(pivotCol), MathNum.NEG_ONE)));
        }
        return this;
    }
    /**
     * For a matrix A in M nxn, returns (A|In)
     *
     * 1 2      =>     1 2 1 0
     * 3 4             3 4 0 1
     */
    static getMatrixAppendedIdentityN(matrix) {
        let clone = matrix.clone();
        for (let i = 0; i < clone.rows.length; i++) {
            let column = [];
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
    constructor(values, parentMatrix) {
        this.values = [];
        this.parentMatrix = parentMatrix;
        for (let i = 0; i < values.length; i++) {
            this.values[i] = values[i].clone();
        }
    }
    get isZeroRow() {
        for (let i = 0; i < this.values.length; i++) {
            if (!this.values[i].isEqualTo(MathNum.ZERO))
                return false;
        }
        return true;
    }
    get length() {
        return this.values.length;
    }
    get pivotCol() {
        for (let i = 0; i < this.values.length; i++) {
            if (!this.values[i].isEqualTo(MathNum.ZERO)) {
                return i;
            }
        }
        return -1;
    }
    clone() {
        return new MatrixRow(this.values, this.parentMatrix);
    }
    /**
     * Adds the given row to this row.
     *
     * SAFE: NO
     * IDEMPOTENT: NO
     */
    addRow(addedRow) {
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
    multiplyRowBy(multiplier) {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i].multiplyBy(multiplier);
        }
        return this;
    }
    /**
     * Scales this row to unity
     */
    scaleToUnity() {
        let pivot = this.pivotCol;
        if (pivot == -1) {
            return this;
        }
        let multiplier = this.values[this.pivotCol].getMultiplicativeInverse();
        for (let i = 0; i < this.values.length; i++) {
            this.values[i].multiplyBy(multiplier);
        }
        this.parentMatrix.determinantMultipliers.push(multiplier.getMultiplicativeInverse());
        return this;
    }
    getValueAt(index) {
        if (index >= this.values.length || index < 0)
            throw new Error("bad column");
        return this.values[index];
    }
    setValueAt(index, value) {
        if (index >= this.values.length || index < 0)
            throw new Error("bad column");
        this.values[index] = value;
    }
}
/**
 * Static methods to listen to the HTML DOM
 */
class MatrixDOMListener {
    static addRow(service) {
        service.addRow();
    }
    static delRow(service) {
        service.delRow();
    }
    static addCol(service) {
        service.addCol();
    }
    static delCol(service) {
        service.delCol();
    }
    static undo(service) {
        service.revert();
    }
    static clear(service) {
        service.clear();
    }
    static execute(service) {
        service.matrix.execute();
    }
    static fill(service) {
        service.matrix.fill();
    }
    static getMatrix(service) {
        return service.getMatrix();
    }
    static invert(service) {
        service.matrix.invert();
    }
    static scale(service) {
        service.matrix.scale();
    }
    static solve(service) {
        service.matrix.solve();
    }
    static getDeterminant(service) {
        service.matrix.getDeterminant();
    }
    static cofactor(service) {
        service.matrix.getCofactor();
    }
    static adjunct(service) {
        service.matrix.setToAdjunct();
    }
}
/**
 * MatrixHTML
 *
 * Acts as a child of Matrix objects.
 */
class MatrixHTML {
    constructor(data, initializationData) {
        this.cellHighlightTime = -1;
        this.cellHighlightLength = BASE_TEMP_HIGHLIGHT_TIME;
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
        }
        else {
            while (this.numRows > 0)
                this.delRow();
        }
    }
    get numRows() {
        return this.element.rows.length;
    }
    get numCols() {
        if (this.numRows == 0)
            return 0;
        else
            return this.element.rows[0].cells.length;
    }
    addRow() {
        let el = this.element;
        let row = el.insertRow();
        let numCols = el.rows[0].children.length;
        if (numCols === 0)
            numCols = 1;
        for (let i = 0; i < numCols; i++) {
            let cell = row.insertCell();
            if (this.isEditable)
                cell.setAttributeNode(cws.betterCreateAttr('contenteditable', 'true'));
        }
        this.checkDisplay();
    }
    delRow() {
        this.element.deleteRow(this.element.rows.length - 1);
        this.checkDisplay();
    }
    addCol() {
        let el = this.element;
        if (el.rows.length == 0) {
            el.insertRow();
        }
        for (let i = 0; i < el.rows.length; i++) {
            let cell = el.rows[i].insertCell();
            cell.setAttributeNode(cws.betterCreateAttr('contenteditable', 'true'));
        }
        this.checkDisplay();
    }
    delCol() {
        let el = this.element;
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
    delAll() {
        while (this.numRows > 0)
            this.delRow();
    }
    clear() {
        let el = this.element;
        for (let r = 0; r < el.rows.length; r++) {
            for (let c = 0; c < el.rows[r].children.length; c++) {
                el.rows[r].children[c].innerText = "";
            }
        }
    }
    /**
     * Hides the matrix if it should be hidden, shows it if it should be shown
     */
    checkDisplay() {
        if (!this.hideWhenEmpty)
            return;
        if (this.numRows === 0)
            this.container.style.display = 'none';
        else
            this.container.style.display = '';
    }
    generateMatrixButton(content, listenerFn, errorAction, alternateParent) {
        let buttonRow = alternateParent || this.container.querySelector(".matrixButtons");
        let classNames;
        if (alternateParent != this.footerButtonContainer) {
            classNames = ["matrixButton"];
        }
        else {
            classNames = ["matrixButton", "matrix-footer-button"];
            if (isHalfButton(content)) {
                classNames.push("matrix-footer-button-half");
            }
        }
        let newButton = Button.createByAppending(buttonRow, listenerFn, content, false, "matrix-button-" + MatrixHTML.nextMatrixButtonId + "-" + content.toLowerCase().replace(/ /g, "-"), classNames, content);
        if (isHalfButton(content)) {
            switch (content) {
                case "Cofactor" /* cofactor */:
                    newButton.element.insertAdjacentHTML('afterend', MATRIX_PAIR_INPUT.replace(/ADDITIONAL_CLASSES_ONE/g, "cofactor-input-row").replace(/ADDITIONAL_CLASSES_TWO/g, "cofactor-input-col").replace(/FOOTER_INPUT_STYLE/g, ""));
                    break;
                case "Scale" /* scale */:
                default:
                    newButton.element.insertAdjacentHTML('afterend', MATRIX_SCALAR_INPUT.replace(/ADDITIONAL_CLASSES/g, "scale-input").replace(/FOOTER_INPUT_STYLE/g, ""));
                    break;
            }
        }
        newButton.errorAction = (e) => {
            let errorLog = this.container.querySelector(".matrix-errors");
            // setting
            let msg = e.message;
            if (errorLog.parentElement.querySelector(".matrix-log").innerHTML !== "")
                msg = " | " + msg;
            errorLog.innerHTML = msg;
            // clearing
            const regexp = new RegExp(msg.replace(/\|/g, "\\|")
                .replace(/\[/g, "\\[")
                .replace(/\]/g, "\\]"), "g");
            setTimeout(() => {
                errorLog.innerHTML = errorLog.innerHTML.replace(regexp, "").trim();
            }, BASE_TEMP_HIGHLIGHT_TIME);
            if (errorAction)
                errorAction();
        };
        this.buttons.push(newButton);
        MatrixHTML.nextMatrixButtonId++;
        function isHalfButton(maybeHalfButton) {
            return cws.orEquals(maybeHalfButton, [
                "Scale" /* scale */,
                "Cofactor" /* cofactor */
            ]);
        }
    }
    getMatrix(emptyToZero) {
        let el = this.element;
        let values = [];
        for (let r = 0; r < el.rows.length; r++) {
            values[r] = [];
            for (let c = 0; c < el.rows[r].children.length; c++) {
                let innerText = el.rows[r].children[c].innerText;
                if (emptyToZero && innerText == "") {
                    values[r][c] = MathNum.ZERO.clone();
                }
                else if (innerText == "") {
                    throw new Error("empty matrix fields");
                }
                else {
                    values[r][c] = MathNum.createFromStr(innerText);
                }
            }
        }
        return new MatrixValues(values);
    }
    highlightEmptyCells() {
        this.highlightGenericCells((el) => {
            return el.innerHTML === "";
        });
    }
    highlightGenericCells(highlightCondition, clearHighlights) {
        for (let i = 0; i < this.element.rows.length; i++) {
            for (let j = 0; j < this.element.rows[0].children.length; j++) {
                let cell = this.element.rows[i].children[j];
                if (clearHighlights) {
                    if (Date.now() - this.cellHighlightTime >= this.cellHighlightLength)
                        cell.className = cell.className.replace(/cell-reject/g, "").trim();
                }
                else {
                    if (highlightCondition(cell))
                        cell.className += " cell-reject";
                }
            }
        }
        if (!clearHighlights) {
            setTimeout(() => { this.highlightGenericCells(null, true); }, this.cellHighlightLength);
            this.cellHighlightTime = Date.now();
        }
    }
    highlightNaNCells() {
        this.highlightGenericCells((el) => {
            return isNaN(parseInt(el.innerHTML));
        });
    }
    logOutput(str) {
        this.container.querySelector(".matrix-log").innerText = str;
    }
    revert() {
        if (this.lastState === null)
            throw new Error('Nothing to revert to');
        this.setMatrix(this.lastState);
    }
    setMatrix(values) {
        let el = this.element;
        if (this.numRows > 0)
            this.lastState = this.getMatrix(true);
        for (let r = 0; r < el.rows.length; r++) {
            for (let c = 0; c < el.rows[r].children.length; c++) {
                el.rows[r].children[c].innerText = values.rows[r].getValueAt(c).prettyPrint();
            }
        }
    }
    /**
     * Initializes the HTML object
     */
    init(buttons) {
        this.element = this.container.querySelector(".matrixTable");
        this.footer = this.container.querySelector(".matrixFooter");
        this.footerButtonContainer = this.footer.querySelector(".matrix-footer-buttons");
        this.footerInput = this.footer.querySelector(".footer-input");
        // buttons
        if (cws.orEquals("resize", buttons)) {
            this.generateMatrixButton("R+" /* addRow */, () => { MatrixDOMListener.addRow(this); });
            this.generateMatrixButton("C+" /* addCol */, () => { MatrixDOMListener.addCol(this); });
            this.generateMatrixButton("R-" /* delRow */, () => { MatrixDOMListener.delRow(this); });
            this.generateMatrixButton("C-" /* delCol */, () => { MatrixDOMListener.delCol(this); });
        }
        buttons.forEach((button) => {
            switch (button) {
                case "solve":
                    this.generateMatrixButton("Solve" /* solve */, () => { MatrixDOMListener.solve(this); }, () => { this.highlightEmptyCells(); }, this.footerButtonContainer);
                    break;
                case "fill":
                    this.generateMatrixButton("Fill" /* fill */, () => { MatrixDOMListener.fill(this); }, null, this.footerButtonContainer);
                    break;
                case "clear":
                    this.generateMatrixButton("Clear" /* clear */, () => { MatrixDOMListener.clear(this); }, null, this.footerButtonContainer);
                    break;
                case "det":
                    this.generateMatrixButton("Determinant" /* determinant */, () => { MatrixDOMListener.getDeterminant(this); }, () => { this.highlightEmptyCells(); }, this.footerButtonContainer);
                    break;
                case "invert":
                    this.generateMatrixButton("Invert" /* invert */, () => { MatrixDOMListener.invert(this); }, () => { this.highlightEmptyCells(); }, this.footerButtonContainer);
                    break;
                case "scale":
                    this.generateMatrixButton("Scale" /* scale */, () => { MatrixDOMListener.scale(this); }, () => { this.highlightEmptyCells(); }, this.footerButtonContainer);
                    break;
                case "execute":
                    this.generateMatrixButton("Clear" /* clear */, () => { MatrixDOMListener.execute(this), this.footerButtonContainer; });
                    break;
                case "cofactor":
                    this.generateMatrixButton("Cofactor" /* cofactor */, () => { MatrixDOMListener.cofactor(this); }, () => { this.highlightEmptyCells(); }, this.footerButtonContainer);
                    break;
                case "adj":
                    this.generateMatrixButton("Adjunct" /* adjunct */, () => { MatrixDOMListener.adjunct(this); }, () => { this.highlightEmptyCells(); }, this.footerButtonContainer);
                    break;
                case "undo":
                    this.generateMatrixButton("<-" /* undo */, () => { MatrixDOMListener.undo(this); });
                    break;
            }
        });
        this.checkDisplay();
    }
}
MatrixHTML.nextMatrixButtonId = 0;
/**
 * Handles the matrix
 */
class Matrix {
    constructor(HTMLInitData) {
        this.HTML = new MatrixHTML(this, HTMLInitData);
    }
    getCofactor() {
        const baseMatrix = this.HTML.getMatrix();
        const rowIndex = parseInt(this.HTML.container.querySelector('.cofactor-input-row').value);
        const colIndex = parseInt(this.HTML.container.querySelector('.cofactor-input-col').value);
        if (rowIndex <= 0 || rowIndex > baseMatrix.numRows || isNaN(rowIndex)) {
            throw new Error("Bad row given: row must be within [1, " + (baseMatrix.numRows) + "]");
        }
        else if (colIndex <= 0 || colIndex > baseMatrix.numCols || isNaN(colIndex)) {
            throw new Error("Bad column given: column must be within [1, " + (baseMatrix.numCols) + "]");
        }
        if (baseMatrix.numCols !== baseMatrix.numRows) {
            throw new Error("cofactor is undefined: matrix is not square");
        }
        // cofactor: (-1)^(i+j) * determinant(M_{ij}(A))
        let sign;
        if ((rowIndex + colIndex) % 2 === 0)
            sign = MathNum.ONE;
        else
            sign = MathNum.NEG_ONE;
        const submatrix = baseMatrix.submatrixByRemoval(rowIndex - 1, colIndex - 1); // internally indexes by zero
        const determinant = submatrix.determinant;
        this.HTML.logOutput(MathNum.multiply(sign, determinant).prettyPrint());
    }
    getDeterminant() {
        const baseMatrix = this.HTML.getMatrix();
        this.HTML.logOutput(baseMatrix.determinant.prettyPrint());
    }
    /**
     * Executes MatrixOps functions
     */
    execute() {
        this.invert();
    }
    fill() {
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
                this.HTML.element.rows[i].children[j].innerText = MATRIX_FILL_VALUES[i][j];
            }
        }
    }
    invert() {
        const baseMatrix = this.HTML.getMatrix();
        const baseCols = baseMatrix.numCols;
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
    setToAdjunct() {
        const baseMatrix = this.HTML.getMatrix();
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
    solve() {
        let matrix = this.HTML.getMatrix();
        this.HTML.setMatrix(matrix.solve());
    }
    scale() {
        let matrix = this.HTML.getMatrix();
        this.HTML.setMatrix(matrix.scaleAll(MathNum.createFromStr(this.HTML.container.querySelector('.scale-input')
            .value)));
    }
    static buildMatrix(container) {
        function innerHTMLOrNull(querySelectorParam, failValue) {
            let result = container.querySelector(querySelectorParam);
            if (result)
                return result.innerHTML;
            else
                return failValue;
        }
        let title = innerHTMLOrNull("li.matrix-title", "");
        let buttons = innerHTMLOrNull("li.matrix-buttons", "").split(" ");
        let size = innerHTMLOrNull("li.matrix-size", "1 1");
        let isEditable = cws.toBoolPipe.to(innerHTMLOrNull("li.matrix-editable", ""));
        let displayFooterInput = cws.toBoolPipe.to(innerHTMLOrNull("li.matrix-display-footer", ""));
        let hideWhenEmpty = cws.toBoolPipe.to(innerHTMLOrNull("li.matrix-hide-when-empty", "false"));
        let footerInputStyle = "";
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
        const HTMLInitData = {
            container: container,
            columns: cols,
            rows: rows,
            isEditable: isEditable,
            buttons: buttons,
            hideWhenEmpty: hideWhenEmpty
        };
        return new Matrix(HTMLInitData);
    }
    static getMatrixByName(name) {
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
    /**
     * Attempts to multiply the two matrices
     */
    static attemptMultiply() {
        let reject = false;
        if (MatrixMultiplication.A.HTML.numCols == MatrixMultiplication.B.HTML.numRows) {
            MatrixMultiplication.multiply();
        }
        else {
            throw new Error("Number of rows in A does not equal number of columns in B");
        }
        if (reject) {
            MatrixMultiplication.button.reject();
            while (MatrixMultiplication.solution.HTML.numRows > 0)
                MatrixMultiplication.solution.HTML.delRow();
        }
    }
    static getSolutionAt(x, y) {
        let sum = MathNum.ZERO.clone();
        let matrixA = MatrixMultiplication.A.HTML.getMatrix();
        let matrixB = MatrixMultiplication.B.HTML.getMatrix();
        for (let i = 0; i < MatrixMultiplication.B.HTML.numRows; i++) {
            sum.add(MathNum.multiply(matrixA.getValueAt(y, i), matrixB.getValueAt(i, x)));
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
        let h = MatrixMultiplication.A.HTML.numRows;
        let w = MatrixMultiplication.B.HTML.numCols;
        for (let y = 0; y < h; y++) {
            MatrixMultiplication.solution.HTML.addRow();
        }
        for (let x = 0; x < w - 1; x++) {
            MatrixMultiplication.solution.HTML.addCol();
        }
        // solve
        let solutionMatrix = MatrixMultiplication.solution.HTML.getMatrix(true);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                solutionMatrix.setValueAt(y, x, MatrixMultiplication.getSolutionAt(x, y));
            }
        }
        MatrixMultiplication.solution.HTML.setMatrix(solutionMatrix);
    }
    static init() {
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
    let containers = document.getElementsByClassName("matrixContainer generate");
    for (let i = 0; i < containers.length; i++) {
        matrices.push(Matrix.buildMatrix(containers[i]));
    }
    // set up multiplication button
    MatrixMultiplication.init();
    // create tabs
    let tabButtons = document.getElementById("tabs-bar").querySelectorAll("li");
    let tabBodies = document.getElementsByClassName("tab-body");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].addEventListener("click", () => displayTab(tabButtons[i], tabBodies[i]));
    }
    // show first tab
    displayTab(tabButtons[0], tabBodies[0]);
}
function displayTab(button, body) {
    let allTabBodies = document.getElementsByClassName("tab-body");
    let allTabButtons = document.getElementById("tabs-bar").querySelectorAll("li");
    for (let i = 0; i < allTabBodies.length; i++) {
        allTabButtons[i].className = allTabButtons[i].className.replace(/active-tab/g, "");
        allTabBodies[i].style.display = "none";
    }
    body.style.display = "";
    button.className += " active-tab";
}
init();
//# sourceMappingURL=matrices.js.map