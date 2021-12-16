import { MathFrac } from "./fraction.js";

export class MathNum {
  realPart: MathFrac;
  imaginaryPart: MathFrac;

  constructor(real: MathFrac, imag: MathFrac) {
    this.realPart = real;
    this.imaginaryPart = imag;
  }

  get Re() {
    return this.realPart;
  }

  get Im() {
    return this.imaginaryPart;
  }

  add = function (this: MathNum, z: MathNum): MathNum {
    this.realPart.add(z.realPart);
    this.imaginaryPart.add(z.imaginaryPart);

    return this;
  }

  subtract = function (this: MathNum, z: MathNum): MathNum {
    this.realPart.subtract(z.realPart);
    this.imaginaryPart.subtract(z.imaginaryPart);

    return this;
  }

  /**
   * SAFE?: NO
   * 
   * IDEMPOTENT?: NO
   */
  multiplyBy = function (this: MathNum, zInput: MathNum): MathNum {
    let terms: MathFrac[] = [];
    let z = zInput.clone();

    terms[0] = MathFrac.multiply(this.realPart, z.realPart);
    terms[1] = MathFrac.multiply(this.realPart, z.imaginaryPart);
    terms[2] = MathFrac.multiply(this.imaginaryPart, z.realPart);
    terms[3] = MathFrac.multiply(this.imaginaryPart, z.imaginaryPart).multiplyBy(MathFrac.createFromInt(-1));

    this.realPart = terms[0].add(terms[3]);
    this.imaginaryPart = terms[1].add(terms[2]);

    z = null;
    return this;
  }

  divideBy = function (this: MathNum, z: MathNum): MathNum {
    let zc: MathNum = z.clone()
    let inverseDenominator: MathNum = zc.clone().getMultiplicativeInverse();

    this.multiplyBy(inverseDenominator);

    inverseDenominator = null;
    zc = null;
    return this;
  }

  toPower = function (this: MathNum, exp: number): MathNum {
    if (exp % 1 !== 0 || exp < 0)
      throw new Error("Unhandled value: " + exp);
    else
      for (let i = 1; i < exp; i++)
        this.multiplyBy(this);

    return this;
  }

  toRealNumber(this: MathNum): MathFrac {
    if (!this.Im.isEqualTo(MathFrac.ZERO))
      throw new Error(`${this.prettyPrint()} cannot be converted to a real number`);
    else return this.Re;
  }

  /**
   * Returns the multiplicative inverse of this

   */
  getMultiplicativeInverse = function (this: MathNum): MathNum {
    let denominator: MathFrac = MathFrac.add(MathFrac.multiply(this.realPart, this.realPart), MathFrac.multiply(this.imaginaryPart, this.imaginaryPart));
    let re = MathFrac.divide(this.realPart, denominator);
    let im = MathFrac.divide(MathFrac.multiply(this.imaginaryPart, MathFrac.createFromInt(-1)), denominator);

    let output = new MathNum(re, im);
    return output;
  }

  clone = function (this: MathNum): MathNum {
    return new MathNum(this.Re.clone(), this.Im.clone());
  }

  isEqualTo = function (this: MathNum, other: MathNum): boolean {
    return (this.realPart.isEqualTo(other.realPart) && this.imaginaryPart.isEqualTo(other.imaginaryPart));
  }

  getConjugate = function (this: MathNum,): MathNum {
    return new MathNum(this.Re, MathFrac.multiply(this.Im, MathFrac.createFromInt(-1)));
  }

  prettyPrint = function (this: MathNum,): string {
    if (this.imaginaryPart.isEqualTo(MathFrac.ZERO)) {
      return this.realPart.prettyPrint();
    } else if (this.imaginaryPart.isNegative()) {
      let absoluteValued: string = this.imaginaryPart.clone().multiplyBy(MathFrac.createFromInt(-1)).prettyPrint();
      let output: string;

      if (absoluteValued === "1") {
        output = this.realPart.prettyPrint() + " - i";
      } else {
        output = this.realPart.prettyPrint() + " - " + absoluteValued + "i";
      }

      absoluteValued = null;
      return output;
    } else {
      let iPrint = this.imaginaryPart.prettyPrint();
      if (iPrint === "1") {
        return this.realPart.prettyPrint() + " + i";
      } else {
        return this.realPart.prettyPrint() + " + " + iPrint + "i";
      }
    }
  }

  /**
   * Returns the sum of two MathFracs
   * SAFE?: yes
   * IDEMPOTENT?: yes
   */
  static add(a: MathNum, b: MathNum): MathNum {
    let ac: MathNum = a.clone();
    let bc: MathNum = b.clone();

    ac.add(bc);
    bc = null;
    return ac;
  }

  /**
   * Returns the difference two MathNums
   * SAFE?: yes
   * IDEMPOTENT?: yes
   */
  static subtract(a: MathNum, b: MathNum): MathNum {
    let ac: MathNum = a.clone();
    let bc: MathNum = b.clone();

    ac.subtract(bc);
    bc = null;
    return ac;
  }

  /**
   * Returns the product of two MathNums
   * SAFE?: yes
   * IDEMPOTENT?: yes
   */
  static multiply(a: MathNum, b: MathNum): MathNum {
    let ac: MathNum = a.clone();
    let bc: MathNum = b.clone();

    ac.multiplyBy(bc);
    bc = null;
    return ac;
  }

  /**
   * Returns the quotient of two MathNums
   * SAFE?: yes
   * IDEMPOTENT?: yes
   */
  static divide(a: MathNum, b: MathNum): MathNum {
    let ac: MathNum = a.clone();
    let bc: MathNum = b.clone();

    ac.divideBy(bc);
    bc = null;
    return ac;
  }

  static get ZERO(): MathNum {
    return new MathNum(MathFrac.ZERO.clone(), MathFrac.ZERO.clone());
  }

  static get ONE(): MathNum {
    return new MathNum(MathFrac.createFromInt(1), MathFrac.ZERO.clone());
  }

  static get NEG_ONE(): MathNum {
    return new MathNum(MathFrac.createFromInt(-1), MathFrac.ZERO.clone());
  }

  static createFromStrParts(real: string, imag: string): MathNum {
    return new MathNum(MathFrac.createFromStr(real), MathFrac.createFromStr(imag));
  }

  static NaNToOnePipe(s: string) {
    if (isNaN(parseInt(s))) {
      return "1";
    } else {
      return s
    }
  }

  static NaNToNegOnePipe(s: string) {
    if (isNaN(parseInt(s))) {
      return "-1";
    } else {
      return s
    }
  }

  static createFromStr(s: string): MathNum {
    s = s.replace(/ /g, "");
    // CORNER CASES:

    // 0 + i
    // i
    // 1
    // -i
    // 1/2 + 1/2i

    if (s.search(/i/g) === -1) { // real only
      // console.log("real");
      return MathNum.createFromStrParts(s, "0");
    } else if (s.search(/\+/g) === -1 && s.search(/-/g) === -1) { // positive imaginary only
      // console.log("positive imaginary");
      return MathNum.createFromStrParts("0", MathNum.NaNToOnePipe(s));
    } else {
      let parts: string[] = s.split(/[+|-]/g).filter((s) => { return s != "" });

      if (parts.length == 0) {
        throw new Error("Not a number");
      } else if (parts.length == 1) { // negative imaginary
        // console.log("negative imaginary");
        return MathNum.createFromStrParts("0", MathNum.NaNToNegOnePipe(s));
      } else {
        let real: string = (s.substring(0, s.search(parts[0])) + parts[0]);
        s = s.replace(real, "");

        let imaginary: string = s;

        // console.log("normal");
        if (s.search(/-/g) === -1) {
          return MathNum.createFromStrParts(real, MathNum.NaNToOnePipe(imaginary));
        } else {
          return MathNum.createFromStrParts(real, MathNum.NaNToNegOnePipe(imaginary));
        }
      }
    }
  }
}