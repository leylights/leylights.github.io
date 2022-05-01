/**
 * General functions to be used anywhere
 * @author Cole Stanley
*/

/**
 * Determines whether an element is present in an array
 * @param {Any} arr The array
 * @param {*} el The element
 */

interface ListenerCreationData<K extends keyof HTMLElementEventMap> {
  type: K,
  fn: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => void
}

interface ElementCreationData<ElementsType> {
  type: ElementsType,
  id?: string,
  classList?: string[] | string,
  style?: string,
  innerHTML?: string,
  innerText?: string,
  children?: HTMLElement[],
  listeners?: ListenerCreationData<keyof HTMLElementEventMap>[],
  otherNodes?: { type: string, value: string }[] | Record<string, string>
}

interface CreateTableCreationData {
  head?: HTMLElement[][],
  body: HTMLElement[][],
  classList?: string[],
  id?: string;
  style?: string;
  otherNodes?: { type: string, value: string }[];
}

type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class cws {
  /**
   * Determines if any left element is equal to any right element
   * Time: O(n*m)
   */
  static anyEqual<T = any>(lefts: T[], rights: T[]): boolean {
    for (let i = 0; i < lefts.length; i++) {
      for (let j = 0; j < rights.length; j++) {
        if (lefts[i] == rights[j]) return true;
      }
    }
    return false;
  }

  static Array = {
    contains: function <T, U>(arr: T[], el: U, comparatorFn?: (a: T, b: U) => boolean): boolean {
      if (!comparatorFn)
        comparatorFn = (a: any, b: any) => { return a === b };

      for (let i = 0; i < arr.length; i++) {
        if (comparatorFn(arr[i], el))
          return true;
      }

      return false;
    },

    distinct: function <T>(arr: T[], comparatorFn?: (a: T, b: T) => boolean): T[] {
      const result: T[] = [];

      arr.forEach((value: T) => {
        if (!cws.Array.includes(result, value, comparatorFn))
          result.push(value);
      });

      return result;
    },

    get: {
      /**
        * Returns a random element of the given array
        * @requires randomSkewFunction returns values between 0 and 1
        */

      randomElement: function <T>(array: T[], randomSkewFunction?: (n: number) => number): T {
        if (array.length < 1)
          return undefined;

        if (typeof randomSkewFunction !== 'undefined' && randomSkewFunction) {
          if ((randomSkewFunction(0) < 0) || (randomSkewFunction(1) > 1)) {
            throw new Error('bad random function');
          }
        }

        let randomizedValue: number = Math.random();

        if (randomSkewFunction)
          randomizedValue = randomSkewFunction(randomizedValue);

        return array[Math.floor(randomizedValue * array.length)];
      },

      /**
       * Gets the sum of a number array
       */
      sum: function (arr: number[], start?: number, length?: number): number {
        let total = 0;
        if (!start)
          start = 0;
        if (!length)
          length = arr.length - start;

        for (let i = start; i < start + length; i++)
          total += arr[i];

        return total;
      }
    },

    from: {
      any: function (collection: any, length: number): any[] {
        const output: Element[] = [];
        for (let i = 0; i < length; i++)
          output.push(collection[i]);
        return output;
      },

      NodeListOf: function <T extends Node>(nodeList: NodeListOf<T>): T[] {
        return cws.Array.from.any(nodeList, nodeList.length)
      },

      HTMLCollection: function (collection: HTMLCollection): Element[] {
        return cws.Array.from.any(collection, collection.length)
      }
    },

    includes: function <T, U>(arr: T[], el: U, comparatorFn?: (a: T, b: U) => boolean): boolean {
      return cws.Array.contains(arr, el, comparatorFn);
    },

    /**
     * Generates a number array of n elements
     * @example arrayToN(5) => [1,2,3,4,5]
     */
    toN: function (n: number): number[] {
      const output: number[] = [];
      for (let i = 0; i < n; i++)
        output.push(i);
      return output;
    }
  }

  static betterCreateAttr = function (type: string, value: string): Attr {
    const attr: Attr = document.createAttribute(type);
    attr.value = value;
    return attr;
  }

  /**
   * Produces an element with the given data
   * @param {String} type The type of element being created
   * @param {Array<Array<String>>} attributes The attributes of the element, formatted [[type1, value1], [type2, value2]]
   * @returns {HTMLElement} The completed element
   */

  static buildElement<ElementsType extends keyof HTMLElementTagNameMap>(type: ElementsType, attributes: string[][]): HTMLElementTagNameMap[ElementsType] {
    const el = document.createElement(type);

    for (let i = 0; i < attributes.length; i++) {
      if (attributes[i].length !== 2)
        console.error("invalid attributes list provided - list is wrong size:", attributes[i]);
      else if (typeof attributes[i][0] !== "string" || typeof attributes[i][1] !== "string")
        console.error("invalid attributes provided - not strings:", attributes[i]);
      else
        el.setAttributeNode(cws.betterCreateAttr(attributes[i][0], attributes[i][1]));
    }

    return el;
  }

  /**
   * Applies a caesar cipher to the string.
   * 
   * Note: SHOULD NOT BE APPLIED TO ANYTHING THAT ACTUALLY NEEDS TO BE HIDDEN.
   */
  static caesarCipher(str: string, shift: number): string {
    return str
      .split('')
      .map((c: string) => {
        return String.fromCharCode(c.charCodeAt(0) + shift);
      })
      .join('');
  }

  static createElement<ElementsType extends keyof HTMLElementTagNameMap>(data: ElementCreationData<ElementsType>): HTMLElementTagNameMap[ElementsType] {
    const element = document.createElement(data.type);

    if (data.id) element.id = data.id;
    if (data.classList) {
      if (typeof data.classList === 'string' && data.classList.includes(' '))
        data.classList = data.classList.split(' ');
      else if (!Array.isArray(data.classList))
        data.classList = [data.classList];

      data.classList.forEach((className: string) => {
        element.classList.add(className);
      });
    }
    if (data.style) element.setAttributeNode(cws.betterCreateAttr('style', data.style));
    if (data.innerHTML) element.innerHTML = data.innerHTML;
    if (data.innerText) element.innerText = data.innerText;
    if (data.listeners)
      data.listeners.forEach((listener: ListenerCreationData<keyof HTMLElementEventMap>) => {
        element.addEventListener(listener.type, listener.fn);
      });
    if (data.children)
      data.children.forEach((childEl: HTMLElement) => {
        element.appendChild(childEl);
      });
    if (data.otherNodes) {
      if (Array.isArray(data.otherNodes)) {
        data.otherNodes
          .filter((node) => node) // filter out nulls
          .forEach((nodeData) => {
            if (nodeData.type && nodeData.value !== undefined)
              element.setAttribute(nodeData.type, nodeData.value);
          });
      } else {
        cws.Object.entries(data.otherNodes)
          .forEach((nodeData) => {
            if (nodeData[0] && nodeData[1] !== undefined)
              element.setAttribute(nodeData[0], nodeData[1]);
          });
      }
    }

    return element;
  }

  /**
   * Creates a link element.
   */
  static createLinkElement(href: string, rel: string): HTMLLinkElement {
    return cws.createElement({
      type: 'link',
      otherNodes: [
        {
          type: 'rel',
          value: rel
        },
        {
          type: 'href',
          value: href
        }
      ]
    });
  }

  /**
   * Creates a stylesheet element.
   */
  static createStylesheetElement(href: string): HTMLLinkElement {
    return cws.createElement({
      type: 'link',
      otherNodes: {
        rel: 'stylesheet',
        href: href,
      }
    });
  }

  static createTable(data: CreateTableCreationData): HTMLTableElement {
    const contents: HTMLElement[] = [];

    // conditionally create head and body
    if (data.head) contents.push(cws.createElement({
      type: 'thead',
      children: getRows(data.head, 'th')
    }));
    if (data.body) contents.push(cws.createElement({
      type: 'tbody',
      children: getRows(data.body, 'td')
    }));

    // create table
    const table = cws.createElement({
      type: 'table',
      id: data.id,
      classList: data.classList,
      style: data.style,
      otherNodes: data.otherNodes,

      children: contents,
    });

    return table;

    function getRows(rowsData: HTMLElement[][], cellType: 'th' | 'td'): HTMLTableRowElement[] {
      const rows: HTMLTableRowElement[] = [];

      rowsData.forEach((rowData: HTMLElement[]) => {
        if (rowData) {
          const newRow = cws.createElement({ type: 'tr' });
          rowData.forEach((element: HTMLElement) => {
            newRow.appendChild(cws.createElement({
              type: cellType,
              children: element ? [element] : [],
            }));
          });
          rows.push(newRow);
        }
      });

      return rows;
    }
  }

  // Returns the number of days between two dates
  static daysBetween(a: Date, b: Date): number {
    return Math.abs(a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000)
  }

  /**
     * 
     * @deprecated use Canvas object instead 
   */
  static drawImg = function (img: HTMLImageElement, x: number, y: number, w: number, h: number, surface: CanvasRenderingContext2D): void {
    if (h === undefined || h === null) surface.drawImage(img, x, y);
    else surface.drawImage(img, x, y, w, h);
  }

  /**
   * Draws a line to the given surface
   * @param {Number} x1 the x coordinate of the start of the line
   * @param {Number} y1 the y coordinate of the start of the line
   * @param {Number} x2 the x coordinate of the end of the line
   * @param {Number} y2 the y coordinate of the end of the line
   * @param {String} colour the colour of the line
   * @param {Number} width the width of the line
   * @param {Object} surface The canvas to draw to
   * 
   * @deprecated use Canvas object instead
   */

  static drawLine = function (x1: number, y1: number, x2: number, y2: number, colour: string, width: number, surface: CanvasRenderingContext2D): void {
    surface.beginPath();
    surface.strokeStyle = colour;
    surface.lineWidth = width;
    surface.moveTo(x1, y1);
    surface.lineTo(x2, y2);
    surface.stroke();
    surface.closePath();
  }

  /**
   * Draws text to the canvas
   * @param {String} text The text to be drawn
   * @param {Number} x The x-coordinate
   * @param {Number} y The y-coordinate
   * @param {String} colour The text's colour
   * @param {Boolean} centered Whether to center the text upon the x coordinate.  Does not center on the y coordinate
   * @param {Number} size pt of font
   * @param {String} type bold?
   * @param {Object} surface Object containing a drawable context
   * 
   * @deprecated use Canvas object instead
   */

  static drawText = function (text: string, x: number, y: number, colour: string, centered: boolean, size: number | null, type: string | null, surface: CanvasRenderingContext2D): void {
    surface.fillStyle = colour;
    if (size !== null) {
      const search = surface.font.search("px");

      if (type == undefined || type == null) {
        type = "";
      }

      if (search == -1) {
        surface.font = size + "px " + type;
      } else {
        const family = surface.font.substring(surface.font.search("px") + 2);
        surface.font = size + "px " + type + family;
      }
    }
    if (centered) surface.textAlign = "center";
    else surface.textAlign = "left";
    surface.fillText(text, x, y);
  }

  /**
   * Draws a filled circle to the canvas
   * @param {Number} x the x coordinate of the circle
   * @param {Number} y the y coordinate of the circle
   * @param {Number} r the radius of the circle
   * @param {String} colour the colour to fill the circle
   * @param {Boolean} centered True if (x,y) represents the center of the circle, False if it represents the top-left
   * @param {Object} surface The canvas to draw to
   * 
   * @deprecated use Canvas object instead
   */

  static fillCircle = function (x: number, y: number, r: number, colour: string, centered: boolean, surface: CanvasRenderingContext2D): void {
    surface.beginPath();
    if (centered) {
      surface.arc(x, y, r, 0, 2 * Math.PI, true);
    } else {
      surface.arc(x + r, y + r, r, 0, 2 * Math.PI, true);
    }
    surface.fillStyle = colour;
    surface.fill();
    surface.closePath();
  }

  /**
   * Draws an isoceles triangle to the canvas
   * @param {*} x 
   * @param {*} y 
   * @param {*} w 
   * @param {*} h
   * @param {*} center Centers the triangle around (x, y)
   * @param {*} angle The angle from vertical at which to draw the triangle.  Only works correctly if center == true.  DEGREES.
   * @param {Object} canvas Object containing a drawable context
   * 
   * @deprecated use Canvas object instead
   */

  static fillTriangle = function (x: number, y: number, w: number, h: number, colour: string, center: boolean, angle: number, canvas: any) {
    const ctx = canvas;
    angle = angle / 180 * Math.PI;

    ctx.beginPath();
    ctx.fillStyle = colour;
    ctx.strokeStyle = colour;

    if (center) {
      const a = { x: x - w / 2, y: y + h / 2 };
      const b = { x: x, y: y - h / 2 };
      const c = { x: x + w / 2, y: y + h / 2 };

      if (!isNaN(angle) && angle !== 0) {
        ctx.translate(x, y);
        ctx.rotate(
          angle
        );

        ctx.moveTo(a.x - x, a.y - y);
        ctx.lineTo(b.x - x, b.y - y);
        ctx.lineTo(c.x - x, c.y - y);
        ctx.lineTo(a.x - x, a.y - y);

        ctx.rotate(
          -angle
        );
        ctx.translate(-x, -y);
      } else {
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(a.x, a.y);
      }
      ctx.fill();
    } else { // x,y = top left of the triangle
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w / 2, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.fill();
    }
  }

  /**
   * Finds a parent element of child
   * @param child 
   * @param className 
   */
  static findParentElementByClassName(child: HTMLElement, className: string): HTMLElement {
    if (child.parentElement.classList.contains(className))
      return child.parentElement;
    else if (document.body.isSameNode(child.parentElement))
      return undefined;
    else
      return cws.findParentElementByClassName(child.parentElement, className);
  }

  /**
   * Applies the EEA to get the gcd of a and b
   */
  static gcd(a: number, b: number): number {
    if (a % b === 0)
      return b;
    else if (isNaN(a % b)) {
      throw ("bad gcd input");
    }

    else return cws.gcd(b, a % b);
  }

  /**
   * @example parseFirstFloat('my favourite number is 3.14') => 3.14
   */
  static parseFirstFloat(s: string): number {
    const firstNumberIndex: number = s.match(/[0-9]/).index,
      value: number = parseFloat(s.substr(firstNumberIndex));

    return value;
  }

  /**
   * @example '../siteimages/logo.svg' => 'colestanley.ca/siteimages/logo.svg' 
   */
  static getFullUrlPath(url: string): string {
    const locationParts = window.location.href.split('/'),
      urlParts = url.split('/');

    for (let i = 0; i < urlParts.length; i++) {
      if (urlParts[i] === '..') {
        locationParts.pop();
        locationParts.pop();
        urlParts.splice(0, 1);
        i--;
      } else if (urlParts[i] === '.') {
        locationParts.pop();
        urlParts.splice(0, 1);
        i--;
      }
    }

    return locationParts.join('/') + '/' + urlParts.join('/');
  }

  static async getJSONFile(absPath: string): Promise<any> {
    const promise = new Promise<string>((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.onload = () => {
        if (req.status === 200) {
          resolve(req.responseText);
        } else {
          reject();
        }
      };
      req.open('GET', absPath);
      req.send();
    });

    await promise;
    const result = JSON.parse(await promise);

    return result;
  }

  /**
   * @requires The sought-after input element is, in fact, an input element 
   */
  static getInputElementById = function (id: string): HTMLInputElement {
    const el = document.getElementById(id);
    if (el instanceof HTMLInputElement) {
      return (el as HTMLInputElement);
    } else {
      return undefined;
    }
  }

  /**
   * @requires url is relative to the root folder
   * @example 'siteimages/logo.svg' => '../../siteimages/logo.svg' 
   */
  static getRelativeUrlPath(url: string): string {
    const pagePath = window.location.href.replace(window.location.origin, ''),
      slashCount = pagePath.match(/\//g).length;

    let windowRelativePath = url.replace(window.location.origin, '');

    for (let i = 0; i < slashCount - 1; i++)
      windowRelativePath = '../' + windowRelativePath;

    return windowRelativePath;
  }

  /**
   * Gets the superscript ordinal of n
   * 
   * @example getSuperscriptOrdinal(1) => st
   * @example getSuperscriptOrdinal(2) => nd
   * @example getSuperscriptOrdinal(12) => th
   * @example getSuperscriptOrdinal(-3) => rd
   * @example getSuperscriptOrdinal(404) => th
   */
  static getSuperscriptOrdinal(n: number) {
    n = Math.abs(n); // negativity unimportant

    const s: string = n + '';
    const lastNum = parseInt(s.charAt(s.length - 1));

    // special cases
    switch (n) {
      case 11:
      case 12:
      case 13:
        return 'th';
    }

    // generic cases
    switch (lastNum) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  /**
   * Returns whether this value is an integer
   */
  static isInteger(n: number): boolean {
    return Math.round(n) == n;
  }

  static Object = {
    get: {
      /**
       * Returns a random attribute of the given object
       */
      randomAttribute: function <T>(obj: Record<any, T>): T {
        return cws.Array.get.randomElement(cws.Object.values(obj));
      }
    },
    /**
     * Replaces Object.entries
     */

    entries: function <K extends string | number | symbol, T>(obj: Record<K, T>): ([K, T])[] {
      const keys = Object.keys(obj);
      const values = [];

      for (let i = 0; i < keys.length; i++) {
        values.push([keys[i], obj[keys[i]]]);
      }

      return values;
    },

    keys: function (obj: object): string[] {
      return Object.keys(obj);
    },

    /**
     * Replaces Object.values
     */

    values: function <T>(obj: Record<string | number | symbol, T>): T[] {
      const keys = Object.keys(obj);
      const values = [];

      for (let i = 0; i < keys.length; i++) {
        values.push(obj[keys[i]]);
      }

      return values;
    }
  }

  static nestedFilter<T>(array: (
    | T
    | T[]
  )[], filterFn: (item: T) => boolean): (
    | T
    | T[]
  )[] {
    return array.filter((item: T | T[]) => {
      if (Array.isArray(item))
        item = item.filter((subItem: T) => {
          return filterFn(subItem);
        }) as T[];
      else
        return filterFn(item);
    })
  }

  static nthRoot(x: number, n: number) {
    if (n <= 0) {
      throw new Error("invalid input: " + n);
    }

    const exponent = Math.log(Math.abs(x)) / n;

    if (x < 0)
      return -cws.roundToDecimalPlaces(Math.pow(Math.E, exponent), 9);
    else
      return cws.roundToDecimalPlaces(Math.pow(Math.E, exponent), 9);
  }

  /**
   * Determines if a equals any element of b
   * @returns 
   */
  static orEquals<T = any>(a: T, b: T[]): boolean {
    return cws.anyEqual([a], b);
  }

  /**
   * Draws a filled rectangle to the canvas
   * @param {String} colour the colour of the rectangle
   * @param {Object} surface The canvas to draw to
   * 
   * @deprecated use Canvas object instead
   */

  static fillRect(x: number, y: number, w: number, h: number, colour: string, surface: CanvasRenderingContext2D) {
    surface.fillStyle = colour;
    surface.fillRect(x, y, w, h);
  }

  /**
   * A function used with Array.sort to randomly sort the array
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static jumbleSort(a: any, b: any): number {
    return Math.random() < 0.5 ? -1 : 1;
  }

  /**
   * @example 1 => 'one'
   * @example 11 => 'eleven'
   * @example 1001 => 'one thousand one'
   */

  static numberToString(n: number): string {
    if (n === 0)
      return "zero";

    if (n < 0)
      return "negative " + cws.numberToString(-n);

    // n > 0, then

    const blockNames = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion'];

    let result = "";
    let partIndex = 0;

    while (partIndex < blockNames.length) {
      if (n === 0)
        return result.trim();

      const thisPart = n % 1000;
      result += absThousandToString(thisPart) + ' ' + blockNames[partIndex];
      n -= thisPart;
      n /= 1000;

      partIndex++;
    }

    throw new Error("Number too large: try expanding the blockNames array of the numberToString function"); // if escaped the while loop

    function absThousandToString(m: number): string {
      if (n <= 0)
        throw new Error("bad input");

      switch (m) {
        case 1:
          return "one";
        case 2:
          return "two";
        case 3:
          return "three";
        case 4:
          return "four";
        case 5:
          return "five";
        case 6:
          return "six";
        case 7:
          return "seven";
        case 8:
          return "eight";
        case 9:
          return "nine";
        case 10:
          return "ten";
        case 11:
          return "eleven";
        case 12:
          return "twelve";
        case 13:
          return "thirteen";
        case 14:
          return "fourteen";
        case 15:
          return "fifteen";
        case 16:
          return "sixteen";
        case 17:
          return "seventeen";
        case 18:
          return "eighteen";
        case 19:
          return "nineteen";
        case 20:
          return "twenty";
        case 30:
          return "thirty";
        case 40:
          return "forty";
        case 50:
          return "fifty";
        case 60:
          return "sixty";
        case 70:
          return "seventy";
        case 80:
          return "eighty";
        case 90:
          return "ninety";
        default: {
          const onesDigit = m % 10;
          const tensDigit = ((m - onesDigit) % 100) / 10;
          const hundredsDigit = (m - tensDigit) / 100;

          let hundredsText = '';
          if (hundredsDigit !== 0)
            hundredsText = absThousandToString(hundredsDigit) + ' hundred ';

          return hundredsText + absThousandToString(tensDigit * 10) + " " + absThousandToString(onesDigit);
        }
      }
    }
  }

  /**
   * @example 1 => 1
   * @example 1234 => 1 234
   * @example 123456 => 123 456
   */
  static numberToPrettyNumber(label: number): string {
    if (cws.isInteger(label)) {
      return (label < 0 ? '-' : '') +
        Math.abs(label)
          .toString()
          .split('')
          .reverse()
          .join('') // reverse order to split number correctly
          .match(/.?.?.?/g)
          .join(' ')
          .split('')
          .reverse()
          .join('')
          .trim();
    } else return label + '';
  }

  /**
   * Calculates the value of a missing side or angle
   */

  static pythagorean(a: number | null, b: number | null, c: number | null): number {
    if (a == null)
      return Math.sqrt(Math.pow(c, 2) - Math.pow(b, 2));
    else if (b == null)
      return Math.sqrt(Math.pow(c, 2) - Math.pow(a, 2));
    else if (c == null)
      return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    else
      throw new Error("no null given to pythagorean");
  }

  static rectanglesCollide<K1 extends Rectangle, K2 extends Rectangle>(a: K1, b: K2): boolean {
    return a.x <= b.x + b.width
      && a.x + a.width >= b.x
      && a.y <= b.y + b.height
      && a.y + a.height >= b.y;

    // thisLeft <= thatRight &&
    // thisRight >= thatLeft &&
    // thisTop <= thatBottom &&
    // thisBottom >= thatTop
  }

  /**
   * @requires decimalPlaces is an integer
   */
  static roundToDecimalPlaces(value: number, decimalPlaces: number): number {
    if (Math.round(decimalPlaces) != decimalPlaces) {
      throw new Error("Not an integer: " + decimalPlaces);
    }
    return Math.round(value * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
  }

  /**
   * Rounds n to the nth digit
   * @example roundToNthDigit(12345.67, 2) => 12300
   * @example roundToNthDigit(12345.67, 0) => 12345
   * @example roundToNthDigit(12345.67, -1) => 12345.6
   * @requires n is an integer
   */
  static roundToNthDigit(value: number, n: number): number {
    if (Math.round(n) != n) {
      throw new Error("Not an integer: " + n);
    }

    if (n < 0) {
      return cws.roundToDecimalPlaces(value, -n);
    } else if (n > 0) {
      return Math.round(value / Math.pow(10, n)) * Math.pow(10, n);
    } else {
      return Math.round(value);
    }
  }

  /**
   * Rounds n to significantFigures significant figures
   * @example roundToSignificantFigures(12345, 2) => 12000
   * @requires n is an integer
   * @requires significantFigures is an integer
   */
  static roundToSignificantFigures(n: number, significantFigures: number): number {
    if (Math.round(n) != n) {
      throw new Error("Not an integer: " + n);
    }

    return cws.roundToDecimalPlaces(n, -(n.toString().length - significantFigures));
  }

  /**
   * @example stringToLength('apple', 10) => 'apple     '  
   * @example stringToLength('apple', 3) => 'app'
   */
  static stringToLength(str: string, length: number): string {
    if (length < 0) {
      throw new Error(`Invalid string length: ${length}`);
    } else if (length < str.length) {
      return str.substr(0, length);
    } else {
      let stringCopy = str.substr(0);
      for (let i = str.length; i < length; i++) {
        stringCopy += ' ';
      }
      return stringCopy;
    }
  }

  static toBoolPipe = {
    falseValues: [
      "false",
      "f",
      0,
      null,
      undefined
    ],

    to: function (input: any): boolean {
      if (cws.orEquals(input, cws.toBoolPipe.falseValues)) {
        return false;
      } else {
        return true;
      }
    }
  }

  /**
   * Converts a string to camel case
   * @example 'Sleight of hand' => 'sleightOfHand'
   */
  static toCamelCase = function (str: string) {
    let finalStr: string = str.substr(0).trim().toLowerCase();

    for (let i = 0; i < finalStr.length; i++) {
      if (finalStr.charAt(i) === ' ') {
        finalStr = finalStr.substring(0, i) + finalStr.charAt(i + 1).toUpperCase() + finalStr.substring(i + 2);
      }
    }

    return finalStr;
  }

  /**
   * Capitalizes the first letter of each word.  Does not change previously existing capitals.
   * @example A BIG cat jumped over the 12Ath fence => A BIG Cat Jumped Over The 12Ath Fence
   */
  static toCapitalized = function (str: string): string {
    let finalStr: string = str.substr(0);

    for (let i = 0; i < finalStr.length; i++) {
      if (finalStr.charAt(i) === ' ') {
        finalStr = finalStr.substring(0, i + 1) + finalStr.charAt(i + 1).toUpperCase() + finalStr.substring(i + 2);
      }
    }

    finalStr = finalStr.charAt(0).toUpperCase() + finalStr.substring(1);

    return finalStr;
  }

  /**
   * Converts an angle from degrees to radians
   * @param {*} degreeValue The angle in degrees
   */

  static toRadians = function (degreeValue: number): number {
    return degreeValue * (Math.PI / 180);
  }

  static toTitleCase = function (str: string): string {
    return cws.toCapitalized(str.substr(0).toLowerCase());
  }
}

console.assert(cws.roundToDecimalPlaces(99.999, 2) === 100);
console.assert(cws.roundToDecimalPlaces(99.874, 2) === 99.87);
console.assert(cws.roundToDecimalPlaces(99.87394385, 2) === 99.87);
