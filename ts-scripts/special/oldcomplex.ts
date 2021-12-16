const complexTestData = [new complexNumber(2, 3), new complexNumber(3, 5)];
const complexNumbersRoundingDecimals = 5;

const CANVAS_WIDTH_PERCENTAGE = 0.8;

var animator;
var now = Date.now();
var usePointer = false;

/**
 * Object to store complex numbers.
 * @param {*} irealPt 
 * @param {*} iimaginaryPt 
 */

function complexNumber(irealPt, iimaginaryPt) {
  this.Re = irealPt;
  this.Im = iimaginaryPt;

  this.getRe = function () {
    return this.Re;
  }

  this.getIm = function () {
    return this.Im;
  }

  this.display = function (isShort) {
    let dRe, dIm;

    if (isShort) {
      dRe = Math.round(this.getRe() * Math.pow(10, complexNumbersRoundingDecimals)) / Math.pow(10, complexNumbersRoundingDecimals);
      dIm = Math.round(this.getIm() * Math.pow(10, complexNumbersRoundingDecimals)) / Math.pow(10, complexNumbersRoundingDecimals);
    } else {
      dRe = this.getRe();
      dIm = this.getIm();
    }


    if (this.Im < 0)
      return dRe + " - " + -dIm + "i";
    else
      return dRe + " + " + dIm + "i";
  }

  this.getModulus = function (isShort) {
    if (isShort)
      return Math.round(Math.sqrt(Math.pow(this.getRe(), 2) + Math.pow(this.getIm(), 2)) * Math.pow(10, complexNumbersRoundingDecimals)) / Math.pow(10, complexNumbersRoundingDecimals);
    else
      return Math.sqrt(Math.pow(this.getRe(), 2) + Math.pow(this.getIm(), 2));
  }

  this.getConjugate = function () {
    return new complexNumber(this.getRe(), -this.getIm());
  }

  this.getR = function () {
    return this.getModulus();
  }

  this.getArgument = function () {
    return Math.acos(this.getRe() / this.getModulus());
  }
}

function init() {

};

init();


// .----------------.  .----------------.  .----------------. 
// | .--------------. || .--------------. || .--------------. |
// | |  ________    | || |     ____     | || | ____    ____ | |
// | | |_   ___ `.  | || |   .'    `.   | || ||_   \  /   _|| |
// | |   | |   `. \ | || |  /  .--.  \  | || |  |   \/   |  | |
// | |   | |    | | | || |  | |    | |  | || |  | |\  /| |  | |
// | |  _| |___.' / | || |  \  `--'  /  | || | _| |_\/_| |_ | |
// | | |________.'  | || |   `.____.'   | || ||_____||_____|| |
// | |              | || |              | || |              | |
// | '--------------' || '--------------' || '--------------' |
//  '----------------'  '----------------'  '----------------' 




// DOM INTERACTION

function calculateAll() {

  // Error Check

  if (isNaN(parseInt((document.getElementById("re-w") as HTMLInputElement).value))) {
    document.getElementById("re-w").style.borderColor = "#FF0000";
    setTimeout(function () { document.getElementById("re-w").style.borderColor = ""; }, 1000);
    return;
  } else if (isNaN(parseInt((document.getElementById("im-w") as HTMLInputElement).value))) {
    document.getElementById("im-w").style.borderColor = "#FF0000";
    setTimeout(function () { document.getElementById("im-w").style.borderColor = ""; }, 1000);
    return;
  } else if (isNaN(parseInt((document.getElementById("re-z") as HTMLInputElement).value))) {
    document.getElementById("re-z").style.borderColor = "#FF0000";
    setTimeout(function () { document.getElementById("re-z").style.borderColor = ""; }, 1000);
    return;
  } else if (isNaN(parseInt((document.getElementById("im-z") as HTMLInputElement).value))) {
    document.getElementById("im-z").style.borderColor = "#FF0000";
    setTimeout(function () { document.getElementById("im-z").style.borderColor = ""; }, 1000);
    return;
  }

  let w = new complexNumber(parseInt((document.getElementById("re-w") as HTMLInputElement).value), parseInt((document.getElementById("im-w") as HTMLInputElement).value));
  let z = new complexNumber(parseInt((document.getElementById("re-z") as HTMLInputElement).value), parseInt((document.getElementById("im-z") as HTMLInputElement).value));

  document.getElementById("complexAdd").innerHTML = complexAdd(w, z).display();
  document.getElementById("complexSub").innerHTML = complexSubtract(w, z).display();
  document.getElementById("complexMult").innerHTML = complexMultiply(w, z).display();
  document.getElementById("complexDivide").innerHTML = complexDivide(w, z).display(true);
  document.getElementById("wConj").innerHTML = w.getConjugate().display(true);
  document.getElementById("zConj").innerHTML = z.getConjugate().display(true);
  document.getElementById("wMod").innerHTML = w.getModulus(true);
  document.getElementById("zMod").innerHTML = z.getModulus(true);
}

// .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .-----------------. .----------------. 
// | .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
// | |     ______   | || |      __      | || |   _____      | || |     ______   | || | _____  _____ | || |   _____      | || |      __      | || |  _________   | || |     _____    | || |     ____     | || | ____  _____  | || |    _______   | |
// | |   .' ___  |  | || |     /  \     | || |  |_   _|     | || |   .' ___  |  | || ||_   _||_   _|| || |  |_   _|     | || |     /  \     | || | |  _   _  |  | || |    |_   _|   | || |   .'    `.   | || ||_   \|_   _| | || |   /  ___  |  | |
// | |  / .'   \_|  | || |    / /\ \    | || |    | |       | || |  / .'   \_|  | || |  | |    | |  | || |    | |       | || |    / /\ \    | || | |_/ | | \_|  | || |      | |     | || |  /  .--.  \  | || |  |   \ | |   | || |  |  (__ \_|  | |
// | |  | |         | || |   / ____ \   | || |    | |   _   | || |  | |         | || |  | '    ' |  | || |    | |   _   | || |   / ____ \   | || |     | |      | || |      | |     | || |  | |    | |  | || |  | |\ \| |   | || |   '.___`-.   | |
// | |  \ `.___.'\  | || | _/ /    \ \_ | || |   _| |__/ |  | || |  \ `.___.'\  | || |   \ `--' /   | || |   _| |__/ |  | || | _/ /    \ \_ | || |    _| |_     | || |     _| |_    | || |  \  `--'  /  | || | _| |_\   |_  | || |  |`\____) |  | |
// | |   `._____.'  | || ||____|  |____|| || |  |________|  | || |   `._____.'  | || |    `.__.'    | || |  |________|  | || ||____|  |____|| || |   |_____|    | || |    |_____|   | || |   `.____.'   | || ||_____|\____| | || |  |_______.'  | |
// | |              | || |              | || |              | || |              | || |              | || |              | || |              | || |              | || |              | || |              | || |              | || |              | |
// | '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
//  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------' 

/**
 * Makes a complex number from its polar form
 * @param {Number} r > 0
 * @param {Number} argument in radians
 */

function makeComplexFromPolar(r, argument) {
  return new complexNumber(r * Math.cos(argument), r * Math.sin(argument));
}

/**
 * Makes a complex number from its polar form
 * @param {Number} r > 0
 * @param {Number} argument in radians
 */

function makeComplexFromPolarDegrees(r, argument) {
  return makeComplexFromPolar(r, (argument * Math.PI) / 180);
}

/**
 * Adds the complex numbers a and b
 * @param {complexNumber} a 
 * @param {complexNumber} b 
 */

function complexAdd(a, b) {
  let re = a.getRe() + b.getRe();
  let im = a.getIm() + b.getIm();

  return new complexNumber(re, im);
}

/**
 * Subtracts the complex number b from a
 * @param {complexNumber} a 
 * @param {complexNumber} b 
 */

function complexSubtract(a, b) {
  let re = a.getRe() - b.getRe();
  let im = a.getIm() - b.getIm();

  return new complexNumber(re, im);
}

/**
 * Multiplies the complex numbers a and b
 * @param {complexNumber} a 
 * @param {complexNumber} b 
 */

function complexMultiply(a, b) {
  let re = a.getRe() * b.getRe() - a.getIm() * b.getIm();
  let im = a.getRe() * b.getIm() + a.getIm() * b.getRe();

  return new complexNumber(re, im);
}

/**
 * Divides the complex number a by b
 * @param {complexNumber} a 
 * @param {complexNumber} b 
 */

function complexDivide(a, b) {
  let bconj = b.getConjugate();
  let numerator = complexMultiply(a, bconj);
  let denominator = complexMultiply(b, bconj);

  return new complexNumber(numerator.getRe() / denominator.getRe(), numerator.getIm() / denominator.getRe());
}

// ***********************************************************
// SQUARE AND MULTIPLY ALGORITHM
// ***********************************************************

/**
 * Applies the square and multiply algorithm to find the modulus of a^exp (mod m).
 * 
 * @param {Number} a the base a
 * @param {Number} exp the exponent of a
 * @param {Number} m The modulus
 */

function squareAndMultiplyAlgo(a, exp, m) {
  let expAsTwos = parseTwos(exp).reverse();

  let moduli = getSAMModuli(a, m, expAsTwos[expAsTwos.length - 1].exp);
  let resultSteps = [];
  let result = 1;

  for (let i = 0; i < expAsTwos.length; i++) {
    resultSteps[resultSteps.length] = result + " * " + getModOfPwr(expAsTwos[i].exp, moduli).value
      + " equiv " + ((result * getModOfPwr(expAsTwos[i].exp, moduli).value) % m) + " (mod " + m + ")";
    result = (result * getModOfPwr(expAsTwos[i].exp, moduli).value) % m;
  }

  return {
    reqTwos: expAsTwos,
    moduli: moduli,
    resultSteps: resultSteps,
    result: result
  };

  /*********************** HELPER FUNCTIONS ***********************/


  /**
   * Gets the modulus in the moduli list of   
   * @param {Number} p The power to search for
   * @param {Array[Modulus]} moduli The moduli list
   */
  function getModOfPwr(p, moduli) {
    for (let i = 0; i < moduli.length; i++) {
      if (moduli[i].twoToThe === p)
        return moduli[i];
    }

    console.error("no such modulus found for a power of " + p);
  }

  /**
   * Gets the moduli needed for the SAM algorithm
   * @param {Number} base the base
   * @param {Number} m The modulus
   * @param {Number} largetst the largest power to calculate
   */

  function getSAMModuli(base, m, largest) {
    let moduli = [];

    function Modulus(a, b) {
      this.twoToThe = a;
      this.value = b;
    }

    for (let i = 0; i <= largest; i++) {
      if (moduli.length === 0) {
        moduli[moduli.length] = new Modulus(i, Math.pow(base, 1) % m);
      } else {
        let modcalc = Math.pow(moduli[moduli.length - 1].value, 2) % m;
        moduli[moduli.length] = new Modulus(i, modcalc);
      }
    }

    return moduli;
  }

  /**
   * Gets n as a sum of powers of two. 
   * @param {Number} n 
   */

  function parseTwos(n) {
    let restN = n;
    let pwrs = [];

    function Power(ibase, iexp) {
      this.base = ibase;
      this.exp = iexp;
    }

    // the largest power such that 2^largestPwr < n 
    let maxPwr = 0;
    while (true) {
      if (Math.pow(2, maxPwr + 1) < n)
        maxPwr++;
      else
        break;
    }

    // get powers
    while (restN > 0 && maxPwr >= 0) {
      if (Math.pow(2, maxPwr) <= restN) {
        pwrs[pwrs.length] = new Power(2, maxPwr);
        restN -= Math.pow(2, maxPwr);
        maxPwr--;
      } else {
        maxPwr--;
      }
    }

    return pwrs;
  }
}