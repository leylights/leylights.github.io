import { Leylights } from "../leylights.js";

/** 
 * Algebra Calculator
 * Start Date: December 20th, 2020
 *
 * Elements of Code:
    * 1) Parsing Algorithm
    * 2) Displaying
    * 3) Calculation Algorithm
    * 
* @author Cole Stanley
*/

/* Appeasing TypeScript: May 2021 */

interface mathFrac {
  numerator: number,
  denominator: number,
  num(): number,
  condense(toNum: Boolean): number | mathFrac,
  add(frac: mathFrac): mathFrac,
  multiply(frac: mathFrac): mathFrac,
  multiplyToNum(n: number): mathFrac,
}

/* OBJECT DEFINITIONS */

/**
 * An object which stores a fraction in exact form
 * @param {Number} numerator 
 * @param {Number} denominator 
 */

function mathFrac(numerator, denominator) {
  this.numerator = numerator;
  this.denominator = denominator;

  this.num = function () {
    return this.numerator / this.denominator;
  }

  /**
   * Condenses the fraction into its smallest form
   * 
   * @param {Boolean} toNum True to allow condense to convert a 1 denominator to a Number (i.e. not a mathFrac), false to always output a mathFrac 
   * @returns {Number|mathFrac}
   */
  this.condense = function (toNum) {
    if ((this.numerator % 1 !== 0 || this.denominator % 1 !== 0) && toNum) { // not integers
      return this.numerator / this.denominator; // returns Number
    } else if (this.numerator % 1 === 0 && this.denominator % 1 === 0) {
      let divisor = gcd(this.numerator, this.denominator);
      this.numerator /= divisor;
      this.denominator /= divisor;
    }

    if (this.denominator < 0) {
      this.numerator *= -1;
      this.denominator *= -1;
    }

    if (this.denominator === 1 && toNum)
      return this.numerator;
    else
      return this;
  }

  /**
   * Adds a given mathFrac to this mathFrac
   * @param {mathFrac} frac
   * 
   * @returns {mathFrac}
   */

  this.add = function (frac) {

    let output = new mathFrac(this.numerator, this.denominator);

    output.numerator *= frac.denominator;
    output.denominator *= frac.denominator;

    output.numerator += frac.numerator * this.denominator;

    return output.condense(false);
  }

  /**
   * Multiplies a given mathFrac with this mathFrac
   * @param {mathFrac} frac
   * 
   * @returns {mathFrac}
   */

  this.multiply = function (frac) {
    return new mathFrac(this.numerator * frac.numerator, this.denominator * frac.denominator).condense(false);
  }

  /**
   * Multiplies a given Number with this mathFrac
   * @param {Number} n
   * 
   * @returns {mathFrac}
   */

  this.multiplyNum = function (n) {
    return new mathFrac(this.numerator * n, this.denominator).condense(false);
  }
}

/**
 * Adds two numeric values 
 * @param {Number|mathFrac} a 
 * @param {Number|mathFrac} b 
 * @param {Boolean} toNum Whether to allow this function to return a Number.
 * @returns {Number|mathFrac}
 */

function addFrac(a: Number | mathFrac, b: number | mathFrac, toNum?: boolean) {
  if (typeof a === "number" && typeof b === "number") {
    return a + b;
  } else if (a instanceof mathFrac && typeof b === "number") {
    return (a as mathFrac).add(new mathFrac(b, 1)).condense(toNum);
  } else if (b instanceof mathFrac && typeof a === "number") {
    return (b as mathFrac).add(new mathFrac(a, 1)).condense(toNum);
  } else if (a instanceof mathFrac && b instanceof mathFrac) {
    return (a as mathFrac).add((b as mathFrac)).condense(toNum);
  } else {
    console.error("addFrac() given invalid input types: ", a, b);
  }
}

/* IMPORTANT FUNCTIONS */

// SOLVING

/**
 * Rearranges a given equation to solve it.
 * @param {String} equation 
 * @param {Boolean} displaySteps true to log each step to the console. 
 * @returns {{lhs: Array, rhs: Array}} The solved equation as two sides
 * @requires All coefficients are before their variables, not after
 */

function solve(equation, displaySteps?) {
  let equalPos = equation.search("=");
  if (equalPos === -1)
    return "invalid equation: missing equality sign";

  let lhs = equation.substring(0, equalPos); // left hand side
  let rhs = equation.substring(equalPos + 1); // right hand side

  if (lhs.search("=") !== -1 || rhs.search("=") !== -1)
    return "invalid equation: too many equality signs";

  lhs = addCoefficients(parse(lhs));
  rhs = addCoefficients(parse(rhs));

  // rearranging the right hand side to 0 before solving
  let rhsClearedEqn;
  let maxRuns = 25;
  // let maxRuns = 1;

  for (let i = 0; i <= maxRuns; i++) {
    if (rhs.length === 0 || (rhs.length === 1 && rhs[0] === 0)) {
      break;
    } else if (i === maxRuns) {
      console.error("Cannot clear the RHS");
      break;
    } else {
      rhsClearedEqn = clearRHS(lhs, rhs);
      lhs = addCoefficients(rhsClearedEqn.lhs);
      rhs = rhsClearedEqn.rhs;

      if (displaySteps)
        console.log("(Cleared RHS): LHS: " + displayNice(lhs) + " RHS: " + displayNice(rhs));
    }
  }

  // multiply out fraction denominators

  let denominators = getDenominators(lhs);

  function getDenominators(side) {
    let result = [];

    for (let i = 0; i < side.length; i++) {
      if (side[i] instanceof mathFrac) {
        result.push(side[i].denominator);
      } else if (Array.isArray(side[i])) {
        result = result.concat(getDenominators(side[i]));
      }
    }

    return result;
  }

  for (let i = 0; i < denominators.length; i++) {
    lhs = multiplySide(lhs, denominators[i]);
  }

  lhs = collect(lhs);

  if (displaySteps)
    console.log("Prepared start: " + displayNice(lhs) + " = 0");

  // determine equation type

  let a, b, c;

  let type = determineEqnType(lhs);
  switch (type) {
    case "linear": // 2x + 1 = 0
    case "exponent": // 1*x^2 + 2 = 0

      // move all pure number values from lhs to rhs

      let terms = getTerms(lhs);
      let pureNumeric = [];

      pureNumeric = terms.filter(x => isNumeric(x[0]) && x.length === 1);

      if (pureNumeric.length > 1) {
        console.error("collect() failed to collect all pure number values as one term");
      }

      if (displaySteps)
        console.log("subtracting " + pureNumeric[0][0] + " from both sides");

      if (pureNumeric.length === 1) {
        rhs = collect(rhs.concat(["+", -1, "*", pureNumeric[0][0]]));
        lhs.splice(lhs.length - 2, 2);
      }

      if (displaySteps)
        console.log(displayNice(lhs) + " = " + displayNice(rhs));

      // divide out any variable coefficients

      if ((type === "linear" && lhs.length !== 3 && lhs.length !== 1)
        || (type === "exponent" && lhs.length !== 5 && lhs.length !== 3)) {
        console.error("unexpected remainder of lhs:", lhs);
      } else if (((type === "linear" && lhs.length === 3)
        || (type === "exponent" && lhs.length === 5))
        && isVariable(lhs[2])) {
        let step = divideSides(lhs, rhs, lhs[0]);
        lhs = removeOneCoefficients(step.lhs);
        rhs = removeOneCoefficients(step.rhs);

        if (displaySteps)
          console.log(displayNice(lhs) + " = " + displayNice(rhs));
      }

      // EXPONENTS ONLY

      function expIsEven(e) {
        if (typeof e === "number") {
          if (e % 2 === 0)
            return true;
        } else if (e instanceof mathFrac) {
          if ((e as mathFrac).numerator % 2 === 0)
            return true;
        }
        return false;
      }

      if (type === "exponent" && lhs.length === 3) {
        if (expIsEven(lhs[2]) && rhs[0] !== 0) { // even roots need +- symbol
          rhs[1] = nthRoot(rhs[0], lhs[2], true);
          rhs[0] = "\u00b1";
        } else {
          rhs[0] = nthRoot(rhs[0], lhs[2], true);
        }

        lhs = [lhs[0]];
      }

      // error checking
      if (lhs.length > 1 || !isVariable(lhs[0]))
        console.error("solve() encountered an error: ", lhs, rhs);
      break;
    case "LDE":
      a = lhs[0];
      b = lhs[4];
      c = -lhs[8]; // negative such that ax + by = c, not ax + by - c = 0

      if (displaySteps)
        console.log("LDE: " + a + lhs[2] + " + " + b + lhs[6] + " = " + c);

      let EEAResult = EEA(Math.abs(a), Math.abs(b));
      let result = { x: EEAResult.x, y: EEAResult.y };

      if (displaySteps)
        console.log("Final row of EEA: x:" + EEAResult.x + ", y: " + EEAResult.y);

      if (a < 0)
        result.x *= -1;
      if (b < 0)
        result.y *= -1;

      if (c % EEAResult.gcd === 0) {
        return lhs[2] + " = " + result.x * (c / EEAResult.gcd) + ", " + lhs[6] + " = " + result.y * (c / EEAResult.gcd) + " (other solutions exist)";
      } else if (isNaN(c)) {
        return lhs[2] + " = 0, " + lhs[6] + " = 0 (other solutions exist)";
      } else return "no solutions";
      break;
    case "quadratic":
      if (lhs.length !== 9 && lhs.length !== 11)
        console.error("solve() encountered an error: ", lhs, rhs);

      // get formula parts

      a = undefined;
      b = undefined;
      c = undefined;

      if (displaySteps) {
        console.log(displayPlainText(lhs));
      }

      for (let i = 0; i < lhs.length; i++) {
        if (isNumeric(lhs[i])) {
          if (a === undefined && lhs[i + 3] == "^")
            a = lhs[i]
          else if (b === undefined && lhs[i - 1] != "^")
            b = lhs[i];
          else if (c === undefined && lhs[i - 1] != "^")
            c = lhs[i];
        } else if (i === lhs.length - 1 && c === undefined) {
          c = 0;
          if (displaySteps) {
            console.log("in absence of given c value, setting c = 0");
          }
        }

        // if (displaySteps) {
        //   console.log("checking lhs element " + i + ", is equal to " + lhs[i]);
        //   console.log("lhs len " + lhs.length);
        // }
      }

      if (c === undefined) {
        c = 0;
        if (displaySteps) {
          console.log("in absence of given c value, setting c = 0");
        }
      }

      if (displaySteps)
        console.log("a: " + a + ", b: " + b + ", c: " + c);

      // solve quadratic formula

      if (typeof a === "number")
        a = new mathFrac(a, 1);
      if (typeof b === "number")
        b = new mathFrac(b, 1);
      if (typeof c === "number")
        c = new mathFrac(c, 1);

      if (displaySteps)
        console.log("(a,b,c): ", a, b, c);

      let radicand = b.multiply(b).add(a.multiply(c).multiplyNum(-4));

      if (radicand.numerator < 0) {
        return "No real roots";
      } else {
        let root = new mathFrac(Math.sqrt(radicand.numerator), Math.sqrt(radicand.denominator));

        let d = a.multiplyNum(2);
        let r = new mathFrac(d.denominator, d.numerator);

        let x1 = b.multiplyNum(-1).add(root).multiply(r);
        let x2 = b.multiplyNum(-1).add(root.multiplyNum(-1)).multiply(r);

        // display solution

        if (x1.num() < x2.num())
          return lhs[2] + " = " + displayNice([limitDecimalsOrExact(x1.condense(true), 10)]) + ", " + displayNice([limitDecimalsOrExact(x2.condense(true), 10)]);
        else
          return lhs[2] + " = " + displayNice([limitDecimalsOrExact(x2.condense(true), 10)]) + ", " + displayNice([limitDecimalsOrExact(x1.condense(true), 10)]);
      }
      break;
    case "incompatible":
      return "formatted equation to " + displayNice(lhs) + " = " + displayNice(rhs) + "; remaining algebra out of scope of the calculator";
      break;
  }

  // else spit out an error
  let outputRhs = displayNice(rhs);

  if (rhs[0] instanceof mathFrac) {
    outputRhs += " \u2245 " + limitDecimals((rhs[0] as mathFrac).numerator / (rhs[0] as mathFrac).denominator, 5);
  }

  return displayNice(lhs) + " = " + outputRhs;
}

// Tests

// Linear Tests
checkExpect(solve("2x+4=-3/2"), "x = -11/4 \u2245 -2.75");
checkExpect(solve("2x+4=0"), "x = -2");
checkExpect(solve("x+1=2"), "x = 1");
checkExpect(solve("-1000/3*x+5.5=4x"), "x = " + (3 / 184));
checkExpect(solve("-1000/3*x+5=4x"), "x = 15/1012 \u2245 0.01482");
checkExpect(solve("14/3*x-5=-1/4x"), "x = 60/59 \u2245 1.01695");
checkExpect(solve("200/3*x-10123/45*x + 123/124=-50x"), "x = 5535/604252 \u2245 0.00916");

// Exponent Tests
checkExpect(solve("x^2=0"), "x = 0");
checkExpect(solve("x^2=1"), "x = \u00b11");
checkExpect(solve("x^2=4"), "x = \u00b12");
checkExpect(solve("2x^2=12"), "x = \u00b12.449489743");
checkExpect(solve("2x^2/3=12"), "x = \u00b114.696938457");
checkExpect(solve("x^2/3=3/4"), "x = \u00b10.649519053");
checkExpect(solve("8/3*x^7/3 - 1/2 = 3/4"), "x = 0.722727924");
checkExpect(solve("-8/3*x^7/3 + 1/2 = -3/4"), "x = 0.722727924");

// LDE Tests
checkExpect(solve("x + 2y = 1", true), "x = 1, y = 0 (other solutions exist)");
checkExpect(solve("3x + 2y = 15"), "x = 15, y = -15 (other solutions exist)");
checkExpect(solve("15a + 10z = 15"), "a = 3, z = -3 (other solutions exist)");
checkExpect(solve("15a - 10z = 15"), "a = 3, z = 3 (other solutions exist)");
checkExpect(solve("-15a = 15 + 10z"), "a = -3, z = 3 (other solutions exist)");
checkExpect(solve("-15a + 10z = 15"), "a = -3, z = -3 (other solutions exist)");
checkExpect(solve("-15a + 10z = -15"), "a = 3, z = 3 (other solutions exist)");
checkExpect(solve("-15a + 10c = 0"), "a = 0, c = 0 (other solutions exist)");

// Quadratic Tests
checkExpect(solve("x^2 + x=0"), "x = -1, 0");
checkExpect(solve("1/3x^2 + x=0"), "x = -3, 0");
checkExpect(solve("1/3x^2 - 2/9x=0"), "x = 0, 2/3");
checkExpect(solve("x^2 -         5x= -6    "), "x = 2, 3");
checkExpect(solve("-5x + x^2= -6    "), "x = 2, 3");
checkExpect(solve("x^2 -5x = 0"), "x = 0, 5");
checkExpect(solve("-5x + x^2= 0"), "x = 0, 5");
checkExpect(solve("2x^2 -         10*x= -12    "), "x = 2, 3");
checkExpect(solve("(x+1)(x+2) = 0"), "x = -2, -1");
checkExpect(solve("(x+1)(x+2) = 2"), "x = -3, 0");
checkExpect(solve("(x+1)(x+3/2) = 0"), "x = -3/2, -1");
checkExpect(solve("(x+4)(x+3/2) = 0"), "x = -4, -3/2");
// x^2 + 5.5x + 6

/**
 * Takes an input field, and solves the equation within it
 * @returns {void}
 */

function solveFromHTML() {
  let input: string = (document.getElementById("calculatorInput") as HTMLInputElement).value;
  console.log(input);

  if (input === "") {
    document.getElementById("calculatorInput").style.border = "3px solid #660000";
    setTimeout(function () {
      document.getElementById("calculatorInput").style.border = "3px solid #0000";
    }, 2000)
  } else
    (document.getElementById("calcOutputField") as HTMLInputElement).value = solve(input);
}

/**
 * Applies the Extended Euclidean Algorithm to Numbers a, b to find their Certificate of Correctness and corresponding GCD
 * @param {Number} a 
 * @param {Number} b 
 * @returns {{x: Number, y: Number, gcd: Number}}
 */

function EEA(a: number, b: number) {
  let large: number, small: number;
  (a > b) ? large = a : large = b;
  (a <= b) ? small = a : small = b;

  let rows = [];

  // EEA setup

  rows[0] = Row(1, 0, large, null);
  rows[1] = Row(0, 1, small, null);

  // get the last row of the EEA

  let max = 25;

  for (let i = 0; i < max; i++) {
    let nextRow = generateRow(rows[rows.length - 1], rows[rows.length - 2]);

    if (nextRow.r === 0)
      break;
    else
      rows[rows.length] = nextRow;

    if (i === max - 1) {
      console.error("EEA(" + a + ", " + b + ") exceeded maximum iterations");
      return;
    }
  }

  // output last row

  if (a > b)
    return { x: rows[rows.length - 1].x, y: rows[rows.length - 1].y, gcd: rows[rows.length - 1].r };
  else
    return { x: rows[rows.length - 1].y, y: rows[rows.length - 1].x, gcd: rows[rows.length - 1].r };

  /**
   * Represents a row of the EEA
   * @param {Number} x 
   * @param {Number} y 
   * @param {Number} r 
   * @param {Number} q 
   */

  interface Row {
    x: number,
    y: number,
    r: number,
    q: number,
    display(): string
  }

  function Row(x: number, y: number, r: number, q: number) {
    let output = {
      x: x, y: y, r: r, q: q, display: function () {
        return this.x + " | " + this.y + " | " + this.r + " | " + this.q;
      }
    };

    return output;
  }

  /**
   * Generates the next row of the EEA
   * @param {Row} last The previous row
   * @param {Row} slast The second-previous row
   * @returns {Row}
   */

  function generateRow(last, slast): Row {
    let q = Math.floor(slast.r / last.r);
    let r = slast.r - q * last.r;
    let x = slast.x - q * last.x;
    let y = slast.y - q * last.y;

    return Row(x, y, r, q);
  }
}

/**
 * Determines the type of equation the LHS of an equation represents, where the RHS is 0
 * @param {Array} eqn The collected, parsed LHS of an equation where the RHS = 0
 * @returns {"linear"|"LDE"|"exponent"|"quadratic"|"incompatible"} 
 * 
 * @requires eqn is collected with added coefficients
 */

function determineEqnType(eqn, hideErrors?) {
  let terms = getTerms(eqn);

  // strip purenum terms from equation

  for (let i = 0; i < terms.length; i++) {
    if (terms[i].length === 1 && (typeof terms[i][0] === "number" || terms[i][0] instanceof mathFrac)) {
      terms.splice(i, 1);
    }
  }

  // look at remaining terms and determine type

  if (terms.length === 0) { // no variable
    if (!hideErrors)
      console.error("incompatible input: ", eqn);
    return "incompatible";
  } else if (terms.length === 1) { // linear or exponent
    if (terms[0].length === 3) { // linear or coefficient-less exponent
      if (isNumeric(terms[0][0]) && terms[0][1] === "*" && isVariable(terms[0][2]))
        return "linear";
      else if (isVariable(terms[0][0]) && terms[0][1] === "^" && isNumeric(terms[0][2])) {
        return "exponent";
      } else {
        console.error("unexpected input (a): ", terms);
        return "incompatible";
      }
    } else if (terms[0].length === 5) {
      if (isNumeric(terms[0][0]) && terms[0][1] === "*" && isVariable(terms[0][2]) && terms[0][3] === "^" && isNumeric(terms[0][4]))
        return "exponent";
      else {
        console.error("unexpected input (b): ", terms);
        return "incompatible";
      }
    } else {
      console.error("unexpected input (c): ", terms);
      return "incompatible";
    }
  } else if (terms.length === 2) { // LDE or quadratic
    if (arrayContains(terms[0], "^") || arrayContains(terms[1], "^")) { // potential quadratic
      if ((determineEqnType(terms[0]) === "exponent" && determineEqnType(terms[1]) === "linear")
        || (determineEqnType(terms[0]) === "linear" && determineEqnType(terms[1]) === "exponent")) {
        let expTerm, linTerm, variable;

        if (determineEqnType(terms[0]) === "exponent" && determineEqnType(terms[1]) === "linear") {
          expTerm = terms[0];
          linTerm = terms[1];
        } else {
          expTerm = terms[1];
          linTerm = terms[0];
        }

        // Finding the single variable necessary for a quadratic
        variable = linTerm[2];
        let validQuad = true;

        for (let i = 0; i < expTerm.length; i++) {
          if (isVariable(expTerm[i])) {
            if (expTerm[i] !== variable)
              validQuad = false;
          }
        }

        if (validQuad)
          return "quadratic";
        else {
          if (!hideErrors)
            console.error("unexpected input (d): ", terms);
          return "incompatible";
        }
      } else {
        if (!hideErrors)
          console.error("incompatible input (e): ", terms);
        return "incompatible";
      }
    } else { // potential LDE
      if (determineEqnType(terms[0]) === "linear" && determineEqnType(terms[1]) === "linear")
        return "LDE";
      else {
        console.error("unexpected input (f): ", terms);
        return "incompatible";
      }
    }
  } else { // incompatible
    if (!hideErrors)
      console.error("incompatible input: ", terms);
    return "incompatible";
  }
}

// Tests

checkExpect(determineEqnType(collect(parse("1x"))), "linear");
checkExpect(determineEqnType(collect(parse("2x + 1"))), "linear");
checkExpect(determineEqnType(collect(parse("2x + 3/4"))), "linear");
checkExpect(determineEqnType(collect(parse("2/1x + 9/2"))), "linear");
checkExpect(determineEqnType(collect(parse("2/6x + 1"))), "linear");
checkExpect(determineEqnType(collect(parse("2^3x + 10^3"))), "linear");

checkExpect(determineEqnType(collect(parse("2x + 10y"))), "LDE");
checkExpect(determineEqnType(collect(parse("2x + 10/2y + 7"))), "LDE");
checkExpect(determineEqnType(collect(parse("2/3x - 10/2y - 7/3"))), "LDE");

checkExpect(determineEqnType(collect(parse("1x^2 - 4"))), "exponent"); // EVEN THOUGH IT IS ALSO QUADRATIC, IT IS BEING CATEGORIZED AS AN EXPONENT
checkExpect(determineEqnType(collect(parse("1x^3 + 7"))), "exponent");
checkExpect(determineEqnType(collect(parse("1x^4 + 19"))), "exponent");

checkExpect(determineEqnType(collect(parse("1x^2"))), "exponent");
checkExpect(determineEqnType(collect(parse("1x + 7"))), "linear");
checkExpect(determineEqnType(collect(parse("1x^2 - 2/3x + 19"))), "quadratic");
checkExpect(determineEqnType(collect(parse("-1000x^2 - 2/3x + 19/20"))), "quadratic");
checkExpect(determineEqnType(collect(parse("1x^2 + 4"))), "exponent");

checkExpect(determineEqnType(collect(parse("2/3x^2 + 5y")), true), "incompatible");
checkExpect(determineEqnType(collect(parse("x^3 + y^2")), true), "incompatible");
checkExpect(determineEqnType(collect(parse("4")), true), "incompatible");

/**
   * Rearranges the given equation such that the right hand side = 0
   * @param {Array} l The left hand side of the equation
   * @param {Array} r The right hand side of the equation
   * @returns {{lhs: Array, rhs: Array}} The rearranged equation
   */

function clearRHS(l, r) {
  // break when the rhs is cleared
  if (r.length === 1 && r[0] === 0)
    return { lhs: l, rhs: r };

  let step = flip(l, r, "rightToLeft");

  return { lhs: step.lhs, rhs: step.rhs };
}

// Tests

// checkExpect(clearRHS(parse("2x + 4"), parse("2")), { lhs: parse("2x+2"), rhs: [] });

/**
 * Flips the first term from one side of the equation to the other
 * @param {Array} l The left hand side of the equation
 * @param {Array} r The right hand side of the equation
 * @param {String} direction The direction to "flip" a term
 * @requires direction is "rightToLeft" or "leftToRight"
 * @requires All coefficients are before their variables, not after
 * @returns {{lhs: Array, rhs: Array}} The rearranged equation
 */

function flip(l, r, direction) {
  let reducingSide, expandingSide;

  if (direction === "rightToLeft") {
    reducingSide = r; // taking a term from the rhs
    expandingSide = l; // moving it to the lhs
  } else if (direction === "leftToRight") {
    reducingSide = l; // taking a term from the lhs
    expandingSide = r; // moving it to the rhs
  } else {
    console.error("invalid direction given to solve().flip()");
    return;
  }

  // finding term that is to be flipped
  let flippedTermStartIndex = -1;
  let flippedTermEndIndex;

  for (let i = 0; i < reducingSide.length; i++) {
    if (!isNaN(reducingSide[i]) && flippedTermStartIndex === -1) {
      flippedTermStartIndex = i;

      if (i === reducingSide.length - 1) // one-element term
        flippedTermEndIndex = i;

    } else if (reducingSide[i] === "+") {
      flippedTermEndIndex = i - 1;
      break;
    } else if (i === reducingSide.length - 1) {
      flippedTermEndIndex = i;
      break;
    }
  }

  if (flippedTermStartIndex === -1) // if no numbers present in the side (i.e. "x"), then startIndex = 0
    flippedTermStartIndex = 0;

  // element 1

  expandingSide[expandingSide.length] = "+";
  if (typeof reducingSide[flippedTermStartIndex] === "number") // nums
    expandingSide[expandingSide.length] = -reducingSide[flippedTermStartIndex];
  else if (reducingSide[flippedTermStartIndex] instanceof mathFrac) { // fracs
    expandingSide[expandingSide.length] = new mathFrac(-reducingSide[flippedTermStartIndex].numerator, reducingSide[flippedTermStartIndex].denominator);
  } else { // others???
    console.error("strange term type passed:")
    console.error(reducingSide[flippedTermStartIndex]);
    expandingSide[expandingSide.length] = -reducingSide[flippedTermStartIndex];
  }

  for (let i = flippedTermStartIndex + 1; i <= flippedTermEndIndex; i++) { // elements 2, 3, 4, ..., n
    expandingSide[expandingSide.length] = reducingSide[i];
  }

  expandingSide = collect(expandingSide);

  let reduceStart = flippedTermStartIndex - 1;
  if (reduceStart < 0)
    reduceStart = 0;

  let reduceEnd = flippedTermEndIndex - reduceStart + 2;

  reducingSide.splice(reduceStart, reduceEnd);

  if (direction === "rightToLeft") {
    return { lhs: expandingSide, rhs: reducingSide };
  } else if (direction === "leftToRight") {
    return { lhs: reducingSide, rhs: expandingSide };
  }
}

/**
 * Multiplies all terms in the given equation side by m
 * @param {Array} eqn 
 * @param {Number} m 
 */

function multiplySide(eqn, m) {
  if (isNaN(m)) { // error checking
    console.error("invalid m value provided: " + m)
    return [];
  }

  let terms = getTerms(addCoefficients(eqn));

  // Multiply

  for (let i = 0; i < terms.length; i++) {
    if (Array.isArray(terms[i][0])) {
      terms[i][0] = multiplySide(terms[i][0], m);
    } else if (terms[i][0] instanceof mathFrac) {
      terms[i][0].numerator *= m;
      terms[i][0] = terms[i][0].condense(true);
    } else if (typeof terms[i][0] === "number") {
      terms[i][0] *= m;
    }
  }

  // Collect into one equation
  let output = [];

  for (let i = 0; i < terms.length; i++) {
    output = output.concat(terms[i]);
    output = output.concat(["+"]);
  }
  output.splice(output.length - 1, 1);

  return output;
}

// Tests

checkExpect(stripMultiplication(displayPlainText(multiplySide(parse("2x + 4"), 3))), "6x+12");
checkExpect(stripMultiplication(displayPlainText(multiplySide(parse("2x^4 + 4y"), 3))), "6x^4+12y");
checkExpect(stripMultiplication(displayPlainText(multiplySide(parse("2x^4 + 4y"), -3))), "-6x^4-12y");

/**
 * Divides both sides of an equation by a given value.
 * 
 * @param {Array} l The LHS
 * @param {Array} r The RHS
 * @param {Number|mathFrac} d The value by which to divide both sides 
 * 
 * @returns {{ lhs : Array, rhs : Array}}
 */

function divideSides(l, r, d) {
  let fracDivisor;
  if (typeof d === "number")
    fracDivisor = new mathFrac(1, d);
  else if (d instanceof mathFrac)
    fracDivisor = new mathFrac((d as mathFrac).denominator, (d as mathFrac).numerator);
  else
    console.error("invalid d value passed to divideSides()");

  let sides = [l, r];

  for (let i = 0; i < sides.length; i++) {
    let terms = getTerms(sides[i]);
    let output = [];

    for (let j = 0; j < terms.length; j++) {
      terms[j][terms[j].length] = "*";
      terms[j][terms[j].length] = fracDivisor;

      output = output.concat(terms[j]);
      output = output.concat("+");
    }

    output.splice(output.length - 1, 1);

    sides[i] = collect(output);
  }

  return { lhs: sides[0], rhs: sides[1] };
}


/**
 * Collects the like terms on one side of an equation
 * @param {Array} ieqn 
 * @requires All coefficients are before their variables, not after
 */

function collect(ieqn) {
  let eqn = ieqn.slice(0);
  let counts = { add: 1, mult: 0, div: 0 };
  let result;

  let terms = getTerms(eqn);

  for (let i = 0; i < eqn.length; i++) {
    switch (eqn[i]) {
      case "+":
        counts.add++;
        break;
      case "*":
        counts.mult++;
        break;
    }

    if (eqn[i] instanceof mathFrac)
      counts.div++;
  }

  // BRACKETS

  // Expand exponential brackets

  for (let i = 0; i < terms.length; i++) {
    for (let j = 0; j < terms[i].length - 2; j++) {
      if (Array.isArray(terms[i][j]) && terms[i][j + 1] === "^" && isNumeric(terms[i][j + 2])) {
        if (typeof terms[i][j + 2] === "number") {
          if (terms[i][j + 2] % 1 === 0)
            terms[i] = expandBracket(terms[i], j, terms[i][j + 2]);
          else
            console.error("cannot yet handle bracket roots");
        } else if (terms[i][j + 2] instanceof mathFrac) {
          if (terms[i][j + 2].num() % 1 === 0)
            terms[i] = expandBracket(terms[i], j, terms[i][j + 2].num());
          else
            console.error("cannot yet handle bracket roots");
        }
      }
    }
  }

  // Handle bracket interiors

  for (let i = 0; i < terms.length; i++) {
    for (let j = 0; j < terms[i].length; j++) {
      if (Array.isArray(terms[i][j])) {
        terms[i][j] = collect(terms[i][j]);

        if (terms[i].length === 1) { // remove unnecessary brackets
          terms = terms.slice(0, i).concat(getTerms(terms[i][j])).concat(terms.slice(i + 1));
        }
      }
    }
  }

  // NUMBER^NUMBER EXPONENTS

  for (let i = 0; i < terms.length; i++) {
    if (terms[i].length >= 3) {
      if (typeof terms[i][0] === "number" && terms[i][1] === "^" && typeof terms[i][2] === "number") {
        terms[i].splice(0, 3, Math.pow(terms[i][0], terms[i][2]));
      }
    }
  }



  // MULTIPLICATION COLLECTION

  // fix any terms that have multiple multiplication signs

  let multResult = [];

  for (let i = 0; i < terms.length; i++) {

    let factors = getTermFactors(terms[i]);
    let hasBracketedTerm = false;

    // collect the factors

    for (let j = 0; j < factors.length; j++) {
      for (let k = 0; k < factors.length; k++) {
        if (j === k)
          continue;
        else if (typeof factors[j][0] === "number" && typeof factors[k][0] === "number") { // multiply purenums or coefficients
          factors[j][0] *= factors[k][0];
          factors.splice(k, 1);
          k--;
        } else if (factors[j][0] instanceof mathFrac && typeof factors[k][0] === "number") { // frac * num
          factors[j][0].numerator *= factors[k][0];
          factors.splice(k, 1);
          k--;
        } else if (typeof factors[j][0] === "number" && factors[k][0] instanceof mathFrac) { // num * frac
          let newFrac = new mathFrac(factors[k][0].numerator * factors[j][0], factors[k][0].denominator);
          factors[j][0] = newFrac.condense(false);
          factors.splice(k, 1);
          k--;
        } else if (factors[j][0] instanceof mathFrac && factors[k][0] instanceof mathFrac) { // frac * frac
          let newFrac = new mathFrac(factors[j][0].numerator * factors[k][0].numerator, factors[j][0].denominator * factors[k][0].denominator);
          factors[j][0] = newFrac.condense(false);
          factors.splice(k, 1);
          k--;
        } else if (isVariable(factors[j][0]) && isVariable(factors[k][0]) && factors[j][0] == factors[k][0]) { // multiply variables 
          if (factors[j].length === 1 && factors[k].length === 1) {
            factors[j] = factors[j].concat(["^", 2]);
            // console.log("squaring");
          } else if (factors[j].length > 1 && factors[k].length === 1) {
            // console.log("add 1 to exp (a)");
            factors[j][2] = factors[j][2] + 1;
          } else if (factors[j].length === 1 && factors[k].length > 1) {
            // console.log("add 1 to exp (b)");
            // console.log(factors[j]);
            factors[j] = factors[j].concat(["^", factors[k][2] + 1]);
          } else if (factors[j].length > 1 && factors[k].length > 1) { // distribute into brackets
            // console.log(factors[j][2], factors[k][2]);
            factors[j][2] += factors[k][2];
          }

          factors.splice(k, 1);
          k--;
        }
      }
    }

    // Determining if brackets present in term

    for (let j = 0; j < factors.length; j++) {
      if (Array.isArray(factors[j][0])) {
        hasBracketedTerm = true;
      }
    }

    // Handling brackets / Formatting output

    if (hasBracketedTerm) {

      multResult = coefficientsFirst(distributeIntoBrackets(toDistributible(factors)));
      multResult.push("+");

      function toDistributible(inFacs) {
        let output = [];

        for (let f = 0; f < inFacs.length; f++) {
          output = output.concat(inFacs[f]);
          output.push("*");
        }

        output.pop();

        return output;
      }

    } else { // no brackets present
      for (let i = 0; i < factors.length; i++) {
        multResult = multResult.concat(factors[i]);
        multResult = multResult.concat(["*"]);
      }
      multResult[multResult.length - 1] = "+";
    }
  }

  multResult.splice(multResult.length - 1, 1);

  result = multResult;



  // ADDITION COLLECTION

  if (counts.add > 1) {
    // find terms: those that are just numbers AND those that include variables

    let addTerms = getTerms(result);

    // sort terms

    let pureNums = [];
    let complicatedTerms = [];

    for (let i = 0; i < addTerms.length; i++) {
      if (addTerms[i].length === 1 && (!isNaN(addTerms[i][0]) || addTerms[i][0] instanceof mathFrac)) { // is a pure number
        pureNums[pureNums.length] = addTerms[i][0];
      } else {
        complicatedTerms[complicatedTerms.length] = addTerms[i];
      }
    }

    let sortedComplicatedTerms = [];

    for (let i = 0; i < complicatedTerms.length; i++) {
      if (sortedComplicatedTerms.length === 0) {
        sortedComplicatedTerms[sortedComplicatedTerms.length] = [complicatedTerms[i]];
        // console.log("adding " + displayPlainText(complicatedTerms[i]) + " as base");
      } else {
        for (let j = 0; j < sortedComplicatedTerms.length; j++) {
          if (arrayEquals(subArray(complicatedTerms[i], 1, complicatedTerms[i].length),
            subArray(sortedComplicatedTerms[j][0], 1, sortedComplicatedTerms[j][0].length))) {

            sortedComplicatedTerms[j][sortedComplicatedTerms[j].length] = complicatedTerms[i];
            // console.log("adding " + displayPlainText(complicatedTerms[i]));
            break;
          } else if (j === sortedComplicatedTerms.length - 1) {
            sortedComplicatedTerms[sortedComplicatedTerms.length] = [complicatedTerms[i]];
            // console.log("adding " + displayPlainText(complicatedTerms[i]) + " as misfit");
            break;
          }
        }
      }
    }

    // add the terms together, where there are more than one of each type

    let pureSum = new mathFrac(0, 1);

    // sum any pure numbers
    for (let i = 0; i < pureNums.length; i++) {
      if (typeof pureNums[i] === "number")
        pureSum.numerator += pureNums[i] * pureSum.denominator;
      else if (pureNums[i] instanceof mathFrac) {
        pureSum = pureSum.add(pureNums[i]);
      }
    }

    let complicatedSums = [];

    // sum any complicatedTerms
    for (let i = 0; i < sortedComplicatedTerms.length; i++) {
      if (sortedComplicatedTerms[i].length > 1) {
        let coefficientSum: number | mathFrac = 0;
        for (let j = 0; j < sortedComplicatedTerms[i].length; j++) {
          let coefficient = sortedComplicatedTerms[i][j][0];

          coefficientSum = addFrac(coefficientSum, coefficient);
        }
        complicatedSums[complicatedSums.length] = [[coefficientSum].concat(subArray(sortedComplicatedTerms[i][0], 1, sortedComplicatedTerms[i][0].length))];
      } else {
        complicatedSums[complicatedSums.length] = sortedComplicatedTerms[i];
      }
    }

    let addResult = [];

    for (let i = 0; i < complicatedSums.length; i++) {
      addResult = addResult.concat(complicatedSums[i][0]);
      addResult = addResult.concat(["+"]);
    }

    addResult = addResult.concat([pureSum.condense(true)]);

    result = addResult;
  }

  // REMOVING ZEROES

  if (displayPlainText(result).search("0") !== -1) {
    let terms = getTerms(result);

    // isolate the factors of each term, clear any with a factor of zero

    let zeroResult = [];

    for (let i = 0; i < terms.length; i++) {

      let factors = [];
      let thisFactor = [];

      // isolate factors

      for (let j = 0; j < terms[i].length; j++) {
        if (terms[i][j] === "*") {
          factors[factors.length] = thisFactor;
          thisFactor = [];
        } else if (j === terms[i].length - 1) { // end of the term
          thisFactor[thisFactor.length] = terms[i][j];
          factors[factors.length] = thisFactor;
          thisFactor = [];
        } else {
          thisFactor[thisFactor.length] = terms[i][j];
        }
      }

      // NEW, NON-STOLEN FROM MULTIPLICATION COLLECTION CODE

      let keepTerm = true;

      for (let j = 0; j < factors.length; j++) {
        if (factors[j][0] === 0 && keepTerm) {
          keepTerm = false;
          break;
        }
      }

      // END NEW CODE

      if (keepTerm) {
        for (let i = 0; i < factors.length; i++) {
          zeroResult = zeroResult.concat(factors[i]);
          zeroResult = zeroResult.concat(["*"]);
        }
      }
      zeroResult[zeroResult.length - 1] = "+";
    }

    zeroResult.splice(zeroResult.length - 1, 1);

    result = zeroResult;
  }

  // CONDENSING FRACTIONS

  /**
   * Condenses all fractions in the given side of an equation
   * @param {Array} e
   * @returns {Array} 
   */

  function condenseFracs(e) {
    for (let i = 0; i < e.length; i++) {
      if (Array.isArray(e[i]))
        e[i] = condenseFracs(e[i]);
      else if (e[i] instanceof mathFrac)
        e[i] = e[i].condense(true);
    }
  }

  condenseFracs(result);

  return result;
}

// Tests

checkExpect(displayNice(collect(parse("x + 3"))), "x + 3");
checkExpect(displayNice(collect(parse("2.2 + 5x + 5.5"))), "5x + 7.7");
checkExpect(displayNice(collect(parse("5x + 5y + 1"))), "5x + 5y + 1");
checkExpect(displayNice(collect(parse("-1000/3*x+5.5-4x"))), "-1012/3x + 5.5");

checkExpect(displayPlainText(collect(parse("2x - 4x + 5y + 3x^2 + 10 - 12"))), "-2*x+5*y+3*x^2-2");
checkExpect(displayPlainText(collect(parse("2x - 2x + 1"))), "1");
checkExpect(displayPlainText(collect(parse("12x - 2x + 1"))), "10*x+1");
checkExpect(displayPlainText(collect(parse("xxxx"))), "x^4");
checkExpect(displayPlainText(collect(parse("xxxxx"))), "x^5");
checkExpect(displayPlainText(collect(parse("xxxxxx"))), "x^6");
checkExpect(displayPlainText(collect(parse("xxxxxxx"))), "x^7");

checkExpect(displayNice(collect(parse("(x+3)"))), "x + 3");
checkExpect(displayNice(collect(parse("(x+3) + 4"))), "x + 7");
checkExpect(displayNice(collect(parse("2(x+3)"))), "2x + 6");
checkExpect(displayNice(collect(parse("x(x+3)"))), "x^2 + 3x");
checkExpect(displayNice(collect(parse("2(x-3)"))), "2x - 6");
checkExpect(displayNice(collect(parse("x^2(x-3)"))), "x^3 - 3x^2");
checkExpect(displayNice(collect(parse("6*2*x*(x-3)"))), "12x^2 - 36x");
checkExpect(displayNice(collect(parse("(x+3)(x-3)"))), "x^2 - 9");
checkExpect(displayNice(collect(parse("(x+3)(x+3)"))), "x^2 + 6x + 9");
checkExpect(displayNice(collect(parse("(x+3)^2"))), "x^2 + 6x + 9");
checkExpect(displayNice(collect(parse("8*2/3"))), "16/3");
checkExpect(displayNice(collect(parse("(8*2/3)"))), "16/3");
checkExpect(displayNice(collect(parse("2/3*8"))), "16/3");
checkExpect(displayNice(collect(parse("(2/3*8)"))), "16/3");

/**
 * Determines the next step that should be taken to solve an equation
 * @param {Array} eqn 
 * @param {Boolean} order The order of order of operations to be used: true if BEDMAS, false if SAMDEB
 */

function getNextStep(eqn, order) {
  let next;
  if (order) {
    next = "sub";

    for (let i = 0; i < eqn.length; i++) {
      let nextChallenger = "sub"; // set to sub so that the next step is unchallenged at base
      if (Array.isArray(eqn[i]))
        nextChallenger = "brackets";
      else if (eqn[i] === "^")
        nextChallenger = "exponents";
      else if (eqn[i] === "*")
        nextChallenger = "mult";
      else if (eqn[i] instanceof mathFrac)
        nextChallenger = "div";
      else if (eqn[i] === "+") {
        if (eqn[i + 1] < 0)
          nextChallenger = "sub";
        else
          nextChallenger = "add";
      }

      next = getMoreImportantOp(next, nextChallenger, order);
    }
  } else {
    next = "brackets";

    for (let i = 0; i < eqn.length; i++) {
      let nextChallenger = "brackets"; // set to brackets so that the next step is unchallenged at base
      if (eqn[i] === "-")
        nextChallenger = "add";
      if (eqn[i] === "+")
        nextChallenger = "sub";
      if (eqn[i] === "*")
        nextChallenger = "div";
      else if (eqn[i] instanceof mathFrac)
        nextChallenger = "mult";
      else if (eqn[i] === "^")
        nextChallenger = "exponents";
      else if (Array.isArray(eqn[i]))
        nextChallenger = "brackets";

      next = getMoreImportantOp(next, nextChallenger, order);
    }
  }

  return next;
}

/**
 * Takes two operations and returns the more important one in BEDMAS order
 * @param {String} a 
 * @param {String} b 
 * @param {Boolean} order The order of order of operations to be used: true if BEDMAS, false if SAMDEB
 * @returns {String} The more important operation
 */

function getMoreImportantOp(a, b, order) {
  let orderOfOps;
  if (order)
    orderOfOps = { brackets: 0, exponents: 1, mult: 2, div: 3, add: 4, sub: 5 };
  else
    orderOfOps = { brackets: 5, exponents: 4, mult: 3, div: 2, add: 1, sub: 0 };

  let ranks = { a: orderOfOps[a], b: orderOfOps[b] };

  if (ranks.a === undefined && ranks.b === undefined) {
    console.error("invalid operations passed to getMoreImportantOp");
    return null;
  } else if (ranks.a === undefined) {
    console.error("invalid first operation passed to getMoreImportantOp");
    return b;
  } else if (ranks.b === undefined) {
    console.error("invalid second operation passed to getMoreImportantOp");
    return a;
  }

  if (ranks.a < ranks.b)
    return a;
  else return b;
}

function expandBracket(term, bracketIndex, exponent) {
  let bracket = term[bracketIndex];

  for (let i = 1; i < exponent; i++) {
    term.splice(bracketIndex, 0, bracket);
  }

  if (exponent > 0)
    term.splice(bracketIndex + exponent, 2);
  else if (exponent === 0)
    term.splice(bracketIndex, 3, 1);

  return term;
}

// Tests
checkExpect(displayNice(expandBracket(parse("(x+3)^2"), 0, 2)), "(x + 3)(x + 3)");
checkExpect(displayNice(expandBracket(parse("(2x-4)^1"), 0, 1)), "(2x - 4)");
checkExpect(displayNice(expandBracket(parse("(2x-4)^0"), 0, 0)), "1");

/**
 * Takes the factors of a term and applies the distributive property
 * @param {Array} factors 
 * @requires The interior of any bracketed term is already collected, and no longer has any bracketed terms
 * @returns {Array}
 */

function distributeIntoBrackets(factors) {
  let brackets = [];
  let distributors = [];
  let distributed = [];

  factors = noTimes(factors.slice(0));

  // isolate the brackets 

  for (let i = 0; i < factors.length; i++) {
    if (Array.isArray(factors[i]))
      brackets[brackets.length] = factors[i];
    else
      distributors[distributors.length] = factors[i];
  }

  // get the terms of each bracket

  for (let i = 0; i < brackets.length; i++) {
    brackets[i] = getTerms(brackets[i]);
  }

  if (distributors.length > 0) { // not multiplying brackets together
    // distributing

    for (let i = 0; i < brackets.length; i++) {
      distributed[i] = [];

      for (let j = 0; j < brackets[i].length; j++) {
        if (i === 0) // only multiply the first bracketed term
          brackets[i][j] = collect(coefficientsFirst(insertTimes(distributors.concat(brackets[i][j]))));

        distributed[i] = distributed[i].concat(brackets[i][j]);
        if (j < brackets[i].length - 1)
          distributed[i] = distributed[i].concat(["+"]);
      }
    }

    if (brackets.length > 1)
      distributed = distributeIntoBrackets(distributed);
    else
      distributed = collect(distributed);

  } else if (brackets.length > 1) { // multiplying brackets together
    let distributor = brackets[0];
    let receptors = brackets.slice(1);
    let outputParts = [];

    // distribution

    for (let i = 0; i < distributor.length; i++) {
      for (let j = 0; j < receptors.length; j++) {
        for (let k = 0; k < receptors[j].length; k++) {
          outputParts[outputParts.length] = insertTimes(receptors[j][k].concat(distributor[i]));
        }
      }
    }

    // collecting output

    for (let i = 0; i < outputParts.length; i++) {

      if (outputParts[i].filter(x => Array.isArray(x)).length > 0)
        console.log("weird:", outputParts[i])
      else {
        let buffer = removeParsePlus(parse(displayPlainText(outputParts[i].slice(0))));

        // remove subtraction formatting from brackets

        function removeParsePlus(arr) {
          for (let j = 0; j < arr.length - 1; j++) {
            if (arr[j] === "+" && isNumeric(arr[j + 1])) {
              if (typeof arr[j + 1] === "number") {
                if (arr[j + 1] < 0)
                  arr.splice(j, 1);
              } else if (arr[j + 1] instanceof mathFrac) {
                if (arr[j + 1].num() < 0)
                  arr.splice(j, 1);
              }
            }
          }
          return arr;
        }

        outputParts[i] = collect(buffer);
      }

      distributed = distributed.concat(outputParts[i], ["+"]);
    }

    distributed.splice(distributed.length - 1, 1);

    if (distributed.filter(x => Array.isArray(x)).length === 0) {
      distributed = collect(coefficientsFirst(distributed.slice(0)).slice(0));
    }
  } else {
    console.log("distributeIntoBrackets(" + displayNice(factors) + ") given inapplicable input");
  }

  // console.log(distributors, brackets, distributed);

  return distributed;
}

checkExpect(displayNice(distributeIntoBrackets(parse("2(x+3)"))), "2x + 6");
checkExpect(displayNice(distributeIntoBrackets(parse("8(2/3)"))), "16/3");
checkExpect(displayNice(distributeIntoBrackets(parse("2(3x+3)"))), "6x + 6"); // its 2*3*x, but displayNice would definitely output 23x
checkExpect(displayNice(distributeIntoBrackets(parse("2(x+y)"))), "2x + 2y");
checkExpect(displayNice(distributeIntoBrackets(parse("2x(x+y)"))), "2x^2 + 2xy");
checkExpect(displayNice(distributeIntoBrackets(parse("2x(1x+1/1y)"))), "2x^2 + 2xy");
checkExpect(displayNice(distributeIntoBrackets(parse("2(x+3/4)"))), "2x + 3/2");
checkExpect(displayNice(distributeIntoBrackets(parse("(x+1)(x+2)"))), "x^2 + 3x + 2");
checkExpect(displayNice(distributeIntoBrackets(parse("2(x+1)(x+2)"))), "2x^2 + 6x + 4");
checkExpect(displayNice(distributeIntoBrackets(parse("-2(x+1)(x-2)"))), "-2x^2 + 2x + 4");
checkExpect(displayNice(distributeIntoBrackets(parse("(-2x-2)(x-2)"))), "-2x^2 + 2x + 4");
checkExpect(displayNice(distributeIntoBrackets(parse("(x+1)(x+2)"))), "x^2 + 3x + 2");
checkExpect(displayNice(distributeIntoBrackets(parse("(2x+1)(x+2)"))), "2x^2 + 5x + 2");
checkExpect(displayNice(distributeIntoBrackets(parse("x^3(x+3)"))), "x^4 + 3x^3");
checkExpect(displayNice(distributeIntoBrackets(parse("x^2(x+1)(x+1)"))), "x^4 + 2x^3 + x^2");
checkExpect(displayNice(distributeIntoBrackets(parse("(x+1)(x+2/3)"))), "x^2 + 5/3x + 2/3");
checkExpect(displayNice(distributeIntoBrackets(parse("(2x+8)(1x+2/3)"))), "2x^2 + 28/3x + 16/3");

// Tests

// DISPLAY

/**
 * Displays an equation as a nicely-formatted string
 * @param {Array} equation 
 */

function displayNice(equation) {
  equation = stripMultiplication(displayPlainText(removeOneCoefficients(equation)));

  // console.log(equation);

  equation = equation.replace(/\+/g, " + ");
  if (equation.search("=") === -1)
    equation = equation.charAt(0) + equation.substring(1).replace(/\-/g, " - ");
  else {
    equation = equation.charAt(0) + equation.substring(1, equation.search("=")).replace(/\-/g, " - ") + " = " + equation.charAt(equation.search("=") + 1) + equation.substring(equation.search("=") + 2).replace(/\-/g, " - ");
  }

  return equation;
}

/**
 * Displays a given equation as a string
 * @param {Array} equation 
 */

function displayPlainText(equation) {
  let output = "";

  for (let i = 0; i < equation.length; i++) {
    if (Array.isArray(equation[i])) {
      output += "(" + displayPlainText(equation[i]) + ")"
    } else if (typeof equation[i] === 'object' && equation[i] !== null) {
      output += equation[i].numerator + "/" + equation[i].denominator
    } else
      output += equation[i];
  }

  // removing +- 

  for (let i = 0; i < output.length; i++) {
    if (output.charAt(i) === "+" && output.charAt(i + 1) === "-")
      output = output.substring(0, i) + output.substring(i + 1);
  }


  return output;
}

// Tests

checkExpect(displayPlainText(parse("2+4")), "2+4");
checkExpect(displayPlainText(parse("x((x)2)")), "x*((x)*2)");
checkExpect(displayPlainText(parse("2x + (3/4x^2-3) + 0/1")), "2*x+(3/4*x^2-3)+0/1");



// PARSING

checkExpect(parse("2+4"), [2, "+", 4]);
checkExpect(parse("22-44"), [22, "+", -44]);

/**
 * parse: Takes a string, and parses it into an Element
 * @param {String} equation 
 */

function parse(equation) {
  return parseToObjects(parseToParts(equation));
}

// Tests

checkExpect(parse("2*4"), [2, "*", 4]);
// checkExpect(parse("2*4x/2"), [2, "*", 4, "*", new mathFrac(1,2), "*", "x"]);
checkExpect(parse("2x"), [2, "*", "x"]);
checkExpect(parse("2(x)"), [2, "*", ["x"]]);
checkExpect(parse("x2"), ["x", "*", 2]);
checkExpect(parse("x((x)2)"), ["x", "*", [["x"], "*", "2"]]);



/**
 * Parses a parseToParts-ed string to objects
 * @param {Array<String>} equation 
 */

function parseToObjects(equation) {
  return positivify(removeVariableFracs(parseFractions(insertMultiply(stringsToNums(equation)))));

  /**
   * Changes any pure numbers in the equation from strings to numbers
   * @param {Array<String>} eqn 
   * @returns {Array}
   */

  function stringsToNums(eqn) {
    let numEqn = [];

    for (let i = 0; i < eqn.length; i++) {
      if (Array.isArray(eqn[i])) {
        numEqn[i] = stringsToNums(eqn[i]);
      } else if (!isNaN(parseFloat(eqn[i]))) {
        numEqn[i] = parseFloat(eqn[i]);
      } else
        numEqn[i] = eqn[i];
    }

    return numEqn;
  }

  /**
   * Inserts multiplication signs between any variables, brackets, etc. where mathematicians would normally skip writing them.
   * @param {Array} eqn 
   * @returns {Array}
   */

  /*
  LOGIC
   - if [n] is a bracketed term, apply insertMultiply to the term
 
   - if [n] is a number and [n+1] is a variable, insert mult
   - if [n] is a number and [n+1] is a bracketed term, insert mult
   - if [n] is a variable and [n+1] is a number, insert mult
   - if [n] is a variable and [n+1] is a bracketed term, insert mult
   - if [n] is a variable and [n+1] is a variable, insert mult
   - if [n] is a bracketed term and [n+1] is a number, insert mult
   - if [n] is a bracketed term and [n+1] is a variable, insert mult
  */

  function insertMultiply(eqn) {
    for (let i = 0; i < eqn.length; i++) {
      if (Array.isArray(eqn[i])) { // nested applications
        eqn[i] = insertMultiply(eqn[i]);
      }

      if (i < eqn.length - 1) { // i is not the last term
        if (!isNaN(eqn[i])) { // [i] is a number
          if (Array.isArray(eqn[i + 1]) || isVariable(eqn[i + 1])) { // [i+1] is bracketed or variable
            eqn.splice(i + 1, 0, "*");
          }
        } else if (isVariable(eqn[i])) { // [i] is a variable
          if (!isNaN(eqn[i + 1]) || Array.isArray(eqn[i + 1]) || isVariable(eqn[i + 1])) { // [i+1] is bracketed or number
            eqn.splice(i + 1, 0, "*");
          }
        } else if (Array.isArray(eqn[i])) {
          if (!isNaN(eqn[i + 1]) || isVariable(eqn[i + 1])) { // [i+1] is variable or number
            eqn.splice(i + 1, 0, "*");
          }
        }
      }
    }

    return eqn;
  }

  /**
   * Parses the equation, taking any instances of "/" and turning the surrounding numbers into a mathFrac
   * @param {Array} eqn 
   */

  function parseFractions(eqn) {
    for (let i = 0; i < eqn.length; i++) {
      if (Array.isArray(eqn[i])) {
        eqn[i] = parseFractions(eqn[i]);
      } else if (eqn[i] === "/") {
        eqn.splice(i - 1, 3, new mathFrac(eqn[i - 1], eqn[i + 1]));
      }
    }

    return eqn;
  }

  /**
   * Parses the equation, taking any instances of "-" and turning them into "+", followed by a negative number
   * @param {Array} eqn 
   */

  function positivify(eqn) {
    for (let i = 0; i < eqn.length; i++) {
      if (Array.isArray(eqn[i])) {
        eqn[i] = positivify(eqn[i]);
      } else if (eqn[i] === "-") {
        if (typeof eqn[i + 1] === "number")
          eqn.splice(i, 2, "+", -eqn[i + 1]);
        else if (isVariable(eqn[i + 1]))
          eqn.splice(i, 2, "+", -1, "*", eqn[i + 1]);
        else if (eqn[i + 1] instanceof mathFrac) {
          let newFrac = new mathFrac(-eqn[i + 1].numerator, eqn[i + 1].denominator);
          if (i > 0)
            eqn.splice(i, 2, "+", newFrac);
          else
            eqn.splice(i, 2, newFrac);
        }
      }
    }

    return eqn;
  }

  /**
   * Takes any variables with fractions as their numerator, and splits them into a fraction coefficient of a variable (e.g. x/2 = 1/2*x)
   * @param {Array} eqn 
   */

  function removeVariableFracs(eqn) {
    for (let i = 0; i < eqn.length; i++) {
      if (Array.isArray(eqn[i])) {
        eqn[i] = removeVariableFracs(eqn[i]);
      } else if (eqn[i] instanceof mathFrac) {
        if (isVariable(eqn[i].numerator)) {
          let oldNu = eqn[i].numerator;
          let oldDe = eqn[i].denominator;
          eqn.splice(i, 1, new mathFrac(1, oldDe), "*", oldNu);
        }
      }
    }

    return eqn;
  }
}

// Tests



/**
 * parseToParts: Parses a given string equation to elements that are digestible by parseToObjects
 * @param {String} equation 
 */

/* 
 
LOGIC:
 
1) Determines type of first character
 1a) if empty, break.
 1b) if Num, first = whole length of num
 1c) if operator, first = the operator
 1d) if bracket, first = the parsed interior of the brackets
 1e) if variable, first = the variable
2) Returns the first character in its form, recurses on the next character
 
*/

function parseToParts(equation) {
  let parsedEqn = [];
  let eqnToParse = equation.replace(/\s/g, "");

  while (true) {
    let thisParse = parseRec(eqnToParse);

    parsedEqn[parsedEqn.length] = thisParse.first;

    if (thisParse.rest === "")
      break;
    else eqnToParse = thisParse.rest;
  }

  return parsedEqn;



  /**
   * Recursively parses the equation
   * @param {String} remEqn The remaining equation to parse
   */

  function parseRec(remEqn) {
    let first = remEqn.charAt(0);
    let rest = "";

    // console.log(first);

    if (first === "") { // empty
      first = "";
      rest = "";
      console.error("parseRec() given empty string");
    } else if (!isNaN(parseFloat(first))) { // number

      for (let i = 1; i < remEqn.length; i++) {
        if (isNaN(parseFloat(remEqn.charAt(i))) && remEqn.substring(i, i + 1) !== ".") {
          first = remEqn.substring(0, i);
          rest = remEqn.substring(i);
          break;
        } else if (i == remEqn.length - 1) { // whole remEqn is a number
          first = remEqn;
          rest = "";
        }
      }
    } else if (isOperator(first)) { // operator
      first = first;
      rest = remEqn.substring(1);
    } else if (isBracket(first)) { // bracket
      let closeIndex, interior;
      // find the closing bracket
      let layer = 0;

      for (let i = 1; i < remEqn.length; i++) {
        if (remEqn.charAt(i) === ")") {
          if (layer == 0) {
            closeIndex = i;
            break;
          } else {
            layer--;
          }
        } else if (remEqn.charAt(i) === "(") {
          layer++;
        } else if (i === remEqn.length - 1) {
          console.error("parseRec() given opening bracket without closing bracket");
          return;
        }
      }

      interior = remEqn.substring(1, closeIndex);

      first = parseToParts(interior);
      rest = remEqn.substring(closeIndex + 1);
    } else if (isVariable(first)) { // variable
      first = first;
      rest = remEqn.substring(1);
    } else {
      console.log("parseRec() confused by " + first);
    }

    return { first: first, rest: rest };
  }
}

/**
 * Puts all coefficicents before their terms in an equation
 * @param {Array} eqn 
 */

function coefficientsFirst(eqn) {
  let terms = getTerms(eqn);
  let output = [];

  for (let t = 0; t < terms.length; t++) {

    let factors = getTermFactors(terms[t]);

    let numbers = [];
    let variables = [];
    let brackets = [];
    let formatted = [];

    // isolating parts

    for (let i = 0; i < factors.length; i++) {
      if (Array.isArray(factors[i][0]))
        brackets.push(factors[i]);
      else if (isVariable(factors[i][0]))
        variables.push(factors[i]);
      else if (isNumeric(factors[i][0]))
        numbers.push(factors[i]);
    }

    // rearrangement

    for (let i = 0; i < numbers.length; i++) {
      formatted = formatted.concat(numbers[i], ["*"]);
    }
    for (let i = 0; i < variables.length; i++) {
      formatted = formatted.concat(variables[i], ["*"]);
    }
    for (let i = 0; i < brackets.length; i++) {
      formatted = formatted.concat(brackets[i], ["*"]);
    }

    formatted.pop();

    output = output.concat(formatted, ["+"]);
  }

  output.pop();

  return output;
}

// Tests

checkExpect(displayNice(coefficientsFirst(parse("x2"))), "2x");
checkExpect(displayNice(coefficientsFirst(parse("x2 + y5"))), "2x + 5y");
checkExpect(displayNice(coefficientsFirst(parse("(x+5)3 + y5"))), "3(x + 5) + 5y");
checkExpect(displayPlainText(coefficientsFirst(parse("(x+5)x3 - y5"))), "3*x*(x+5)-1*5*y");
checkExpect(displayNice(coefficientsFirst(parse("(x+5)x^2"))), "x^2(x + 5)");
checkExpect(displayNice(coefficientsFirst(parse("(x+5)*3/4"))), "3/4(x + 5)");

/* HELPER FUNCTIONS */

/**
 * Calculates the nth-root of x 
 * @param {Number} x The value being root-ed
 * @param {Number} n The degree of the root (mathematical natural number)
 * @param {Boolean} convertFracs True to convert any fractions to their decimal representation;
 * @returns {Number}
 */

function nthRoot(x, n, convertFracs?) {
  if (convertFracs) {
    if (x instanceof mathFrac)
      x = (x as mathFrac).numerator / (x as mathFrac).denominator;
    if (n instanceof mathFrac)
      n = (n as mathFrac).numerator / (n as mathFrac).denominator;
  }

  if (n <= 0 || typeof x !== "number" || typeof n !== "number") {
    console.error("invalid input");
    return undefined;
  }

  let exponent = Math.log(Math.abs(x)) / n;

  if (x < 0)
    return -limitDecimals(Math.pow(Math.E, exponent), 9);
  else
    return limitDecimals(Math.pow(Math.E, exponent), 9);
}

// Tests

checkExpect(nthRoot(4, 2), 2);
checkExpect(nthRoot(9, 2), 3);
checkExpect(nthRoot(-64, 3), -4);
checkExpect(nthRoot(-81, 3), -4.326748711);

/**
 * Determines if a given string is an operator
 * @param {String} str 
*/

checkExpect(isOperator("+"), true);
checkExpect(isOperator("x"), false);

function isOperator(str) {
  return Leylights.orEquals(str, ["+", "-", "*", "/", "^"]);
}

// Tests

checkExpect(isOperator("-"), true);
checkExpect(isOperator("*"), true);
checkExpect(isOperator("/"), true);
checkExpect(isOperator("^"), true);

/**
 * Produces true if a given value n is a number or mathFrac
 * @param {*} n
 * @returns {Boolean} 
 */

function isNumeric(n) {
  if ((typeof n === "number" && !isNaN(n)) || n instanceof mathFrac)
    return true;
  else return false;
}

/**
 * Determines if a given string is a variable
 * @param {String} str 
*/

checkExpect(isVariable("x"), true);
checkExpect(isVariable("+"), false);

function isVariable(s) {
  if (typeof s !== "string") // if s is a number or array
    return false;

  return ((s.charCodeAt(0) >= 65 && s.charCodeAt(0) <= 90) || (s.charCodeAt(0) >= 97 && s.charCodeAt(0) <= 122));
}


/**
 * Determines if a given string is a parenthesis
 * @param {String} str 
 */

function isBracket(str) {
  return Leylights.orEquals(str, ["(", ")"]);
}

/**
 * Multiplies coefficient-less terms by 1
 * @param {Array} eqn 
 */

function addCoefficients(eqn) {
  let terms = getTerms(eqn);

  // isolate the factors of each term, clear any with a factor of zero

  let result = [];

  for (let i = 0; i < terms.length; i++) {

    let factors = getTermFactors(terms[i]);

    // Adding the coefficients to variables

    if (isVariable(factors[0][0]))
      factors = [1].concat(factors);

    // Checking brackets

    for (let j = 0; j < factors.length; j++) {
      for (let k = 0; k < factors[j].length; k++) {
        if (Array.isArray(factors[j][k]))
          factors[j][k] = addCoefficients(factors[j][k]);
      }
    }

    // Putting the factors back together

    for (let i = 0; i < factors.length; i++) {
      result = result.concat(factors[i]);
      result = result.concat(["*"]);
    }

    result[result.length - 1] = "+";
  }

  result.splice(result.length - 1, 1);

  return result;
}

// Tests

checkExpect(displayPlainText(addCoefficients(parse("x"))), "1*x");
checkExpect(displayPlainText(addCoefficients(parse("x^2 + x"))), "1*x^2+1*x");
checkExpect(displayPlainText(addCoefficients(parse("(x+3)(x+3/2)"))), "(1*x+3)(1*x+3/2)");
checkExpect(displayPlainText(addCoefficients(parse("(x+3/2)(x+3)"))), "(1*x+3/2)(1*x+3)");

/**
 * Removes any instances of 1* from a side of an equation
 * @param {Array} side 
 * @returns {Array}
 */

function removeOneCoefficients(side) {
  let output = [];
  let outputIndex = 0;

  for (let sideIndex = 0; sideIndex < side.length; sideIndex++) {
    if (side[sideIndex] === 1 && side[sideIndex + 1] === "*") {
      sideIndex += 2;
    }
    if (sideIndex >= side.length) break;

    output[outputIndex] = side[sideIndex];
    outputIndex++;
  }

  return output;
}

/**
 * Tests a function, determining if it gets the expected value.  
 * 
 * BREAKS WHEN GIVEN OBJECTS
 * @param {*} actual The function call
 * @param {*} expected The expected output
 * @returns {*} undefined
 */

function checkExpect(actual, expected): void {
  if (Array.isArray(actual)) {
    if (!arrayEquals(actual, expected))
      console.error({ msg: "checkExpect actual value is not equal to expected value ", actual: actual, expected: expected });
  } else if (typeof actual === "object" && typeof expected === "object") {
    /**
     * does what Object.Entries does: may 2021 typescript implementation
     */
    function getObjEntries(obj: Object): [string, any][] {
      let result: [string, any][] = [];
      let keys: string[] = Object.keys(obj);

      for (let i = 0; i < keys.length; i++) {
        result[i] = [keys[i], obj[keys[i]]];
      }

      return result;
    }

    let entriesA = getObjEntries(actual);
    let entriesE = getObjEntries(expected);
    let equal = true;

    checkExpect(entriesA, entriesE);
    console.log(entriesA);
    console.log(entriesE);

    if (!equal)
      console.error({ msg: "checkExpect actual value is not equal to expected value ", actual: actual, expected: expected });
  }
  else if (actual != expected) {
    console.error({ msg: "checkExpect actual value is not equal to expected value ", actual: actual, expected: expected });
  }
}

/**
 * Parses a given equation side into its terms
 * @param {Array} eqn 
 * @returns {Array}
 */

function getTerms(eqn) {
  let terms = [];
  let lastTermEnd = -1;

  // find terms: those that are just numbers AND those that include variables

  for (let i = 0; i < eqn.length; i++) {
    if (eqn[i] === "+") {
      if (i != 0)
        terms[terms.length] = subArray(eqn, lastTermEnd + 1, i);
      lastTermEnd = i;
    } else if (i === eqn.length - 1) {
      terms[terms.length] = subArray(eqn, lastTermEnd + 1, i + 1);
    }
  }

  return terms;
}

/**
 * Splits a term into its factors
 * @param {Array} term 
 */

function getTermFactors(term) {
  let factors = [];
  let thisFactor = [];

  // isolate factors

  for (let j = 0; j < term.length; j++) {
    if (term[j] === "*") {
      factors[factors.length] = thisFactor;
      thisFactor = [];
    } else if (j === term.length - 1) { // end of the term
      thisFactor[thisFactor.length] = term[j];
      factors[factors.length] = thisFactor;
      thisFactor = [];
    } else {
      thisFactor[thisFactor.length] = term[j];
    }
  }

  return factors;
}



/**
 * Removes all instances of "*" from the nested array
 * @param {Array} arr
 * @returns {Array} 
 */

function noTimes(arr) {
  let newArr = [];

  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      newArr[newArr.length] = noTimes(arr[i]);
    } else if (arr[i] !== "*")
      newArr.push(arr[i]);
  }

  return newArr;
}



/**
 * Inserts "*" between every element of an array EXCEPT for ^ elements
 * @param {Array} arr
 * @returns {Array} 
 */

function insertTimes(arr) {
  let newArr = [];

  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i]))
      newArr[newArr.length] = insertTimes(arr[i]);
    else if (arr[i] !== "*")
      newArr[newArr.length] = arr[i];

    if (i !== arr.length - 1 && arr[i] !== "^" && arr[i + 1] !== "^")
      newArr[newArr.length] = "*";

  }
  return newArr;
}

/**
 * Removes all instances of "*" from a string
 * @param {String} s 
 */

function stripMultiplication(s) {
  return s.replace(/\*/g, "");
}

/**
 * Gets a subset of a given array
 * @param {Array} array The array to get a subarray from
 * @param {Number} startIndex The index of the first element of the subarray
 * @param {Number} endIndex The index of the last element of the subarray, (EXCLUSIVE)
 * @returns {Array}
 */

function subArray(array, startIndex, endIndex) {
  let subArr = [];
  for (let i = 0; i < endIndex; i++) {
    if (i >= startIndex) {
      subArr[subArr.length] = array[i];
    }
  }

  return subArr;
}

// General

/**
 * Determines if a given array contains an instance of x
 * @param {Array} arr 
 * @param {!Object} x 
 * @returns Boolean
 * @requires x is not an object 
 */

function arrayContains(arr, x) {
  let found = false;

  if (Array.isArray(x)) {
    for (let i = 0; i < arr.length; i++) {
      if (Array.isArray(arr[i])) {
        if (arrayEquals(arr[i], x))
          found = true;
        else
          found = found || arrayContains(arr[i], x);
      } else {
        found = found || (x === arr[i]);
      }
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      if (Array.isArray(arr[i])) {
        found = found || arrayContains(arr[i], x);
      } else {
        found = found || (x === arr[i]);
      }
    }
  }

  return found;
}

/**
 * Determines if the two arrays a and b are equal
 * @param {Array} a 
 * @param {Array} b 
 * @returns {Boolean} true if they are equal
 */
function arrayEquals(a, b) {
  if (!(Array.isArray(a) && Array.isArray(b)))
    return false;
  if (a.length !== b.length)
    return false;

  for (let i = 0; i < a.length; i++) {
    if (Array.isArray(a[i]) && Array.isArray(b[i])) {
      if (!arrayEquals(a[i], b[i]))
        return false;
    } else if (a[i] != b[i])
      return false;
  }

  return true;
}

/**
 * Gets the greatest common denominator of integers a and b
 * @param {Number} a Integer
 * @param {Number} b Integer
 */

function gcd(a, b) {
  if (a % b === 0)
    return b;
  else return gcd(b, a % b);
}

/**
 * Rounds a value to the given number of decimal places
 * @param {Number} value 
 * @param {Number} decimals Integer 
 */

function limitDecimals(value, decimals) {
  if (typeof value !== "number")
    console.error("invalid input at limitDecimals(" + value + " " + decimals + ")");
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}


/**
 * Rounds a value to the given number of decimal places, or returns it as an exact value if it is a fraction
 * @param {Number|mathFrac} value 
 * @param {Number} decimals Integer
 * @returns {Number|mathFrac} 
 */

function limitDecimalsOrExact(value, decimals) {
  if (value instanceof mathFrac)
    return value;
  else return limitDecimals(value, decimals);
}
