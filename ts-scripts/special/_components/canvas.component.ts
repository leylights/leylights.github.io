import { cws } from "../../cws.js";
import { KeyboardListener } from "../../tools/keyboard-listener.js";

type EventListenerData = {
  type: keyof GlobalEventHandlersEventMap;
  fn: (event: Event) => void;
  id: number;
}

export type CanvasCreationData = {
  parentElement: HTMLElement;

  clearColour?: string | 'fromCSS';
  disableArrowKeyPageMovement?: boolean;
}

export class Canvas {
  element: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  keys: KeyboardListener;

  private eventListeners: EventListenerData[] = [];

  clearColour: string = 'black';

  private animator: number;

  constructor(data: CanvasCreationData) {
    const me = this;
    // create element
    this.rebuildElement(data.parentElement);

    if (data.clearColour) this.clearColour = data.clearColour;
    else {
      if (cws.isDark) {
        window.addEventListener('load', () => {
          setColour();
        });
      } else {
        setColour();
      }
    }

    if (data.disableArrowKeyPageMovement) this.disableArrowKeyPageMovement();

    function setColour(): void {
      me.clearColour = window.getComputedStyle(me.element).backgroundColor ?? 'black';
      me.clear();
    }
  }

  get width(): number {
    return this.element.width;
  }

  get height(): number {
    return this.element.height;
  }

  get outerHeight() {
    return this.element.height;
  }

  /**
   * Adds an event listener to the canvas that will be re-initialized with each canvas rebuild.
   * @returns an ID to identify the event listener.
   */
  addEventListener<K extends keyof GlobalEventHandlersEventMap>(this: Canvas, type: K, listener: (this: HTMLCanvasElement, evt: GlobalEventHandlersEventMap[K]) => void): number {
    this.element.addEventListener(type, listener);
    const nextId = ++Canvas.nextListenerId;
    this.eventListeners.push({
      type: type,
      fn: listener,
      id: nextId,
    });

    return nextId;
  }

  clear(this: Canvas) {
    const me = this;

    function getClearColour() {
      if (me.clearColour) return me.clearColour;

      if (!me.element.parentElement) {
        console.warn('clear() called without discernible background colour');
      }

      return window.getComputedStyle(me.element).backgroundColor;
    }

    this.fillRect(
      0,
      0,
      this.width,
      this.outerHeight,
      getClearColour()
    );
  }

  disableArrowKeyPageMovement(this: Canvas): void {
    this.keys.addEventListener(
      (listener, e) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
          e.preventDefault();
        }

        return false;
      }, () => { null; });
  }

  drawCenteredText(
    this: Canvas,
    text: string | number,
    x: number,
    y: number,
    colour: string,
    size?: number,
    type?: string
  ): void {
    this.context.fillStyle = colour;
    this.setFont(size, type);

    const metrics: TextMetrics = this.context.measureText(text + ''),
      height: number = metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent;

    this.context.textAlign = "center";
    this.context.fillText(text + '', x, y + height / 2);
  }

  private setFont(this: Canvas, size: number, type?: string) {
    const presetSize = this.context.font.search("px");

    if (!type) {
      type = "";
    }

    const family = this.context.font.substring(this.context.font.search("px") + 2);

    if (size) {
      this.context.font = size + "px " + type + family;
    } else {
      if (presetSize === -1) {
        this.context.font = type + family;
      } else {
        this.context.font = presetSize + "px " + type + family;
      }
    }
    if (presetSize !== -1) {
      this.context.font = size + "px " + type + family;
    }
  }

  drawImage(this: Canvas, img: HTMLImageElement, x: number, y: number, w?: number, h?: number): void {
    if (!w || !h) this.context.drawImage(img, x, y);
    else this.context.drawImage(img, x, y, w, h);
  }

  /**
   * Draws a line to the given surface
   * @param {Number} x1 the x coordinate of the start of the line
   * @param {Number} y1 the y coordinate of the start of the line
   * @param {Number} x2 the x coordinate of the end of the line
   * @param {Number} y2 the y coordinate of the end of the line
   * @param {String} colour the colour of the line
   * @param {Number} width the width of the line
   */

  drawLine(this: Canvas, x1: number, y1: number, x2: number, y2: number, colour: string, width: number): void {
    this.strokePattern(() => {
      this.context.strokeStyle = colour;
      this.context.lineWidth = width;
      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
    });
  }

  /**
   * Applies the given function a single time 
   */
  drawOnce(this: Canvas, mainFn: () => void, preservePreviousAnimationCycle?: boolean) {
    if (!preservePreviousAnimationCycle)
      this.stop();
    mainFn();
  }

  drawRect(this: Canvas, x: number, y: number, w: number, h: number, colour: string) {
    this.strokePattern(() => {
      this.context.strokeStyle = colour;
      this.context.rect(x, y, w, h);
    });
  }

  /**
   * Draws text to the canvas
   * @param {String} text The text to be drawn
   * @param {Number} x The x-coordinate
   * @param {Number} y The y-coordinate
   * @param {String} colour The text's colour
   * @param {Boolean} hCentered Whether to center the text upon the x coordinate.  Does not center on the y coordinate
   * @param {Number} size pt of font
   * @param {String} type bold?
   */

  drawText(this: Canvas, text: string | number, x: number, y: number, colour: string, hCentered: boolean, size?: number, type?: string): void {
    this.context.fillStyle = colour;
    this.setFont(size, type);
    if (hCentered) this.context.textAlign = "center";
    else this.context.textAlign = "left";
    this.context.fillText(text + '', x, y);
  }

  /**
     * Draws a circle to the canvas
     * @param {Number} x the x coordinate of the circle
     * @param {Number} y the y coordinate of the circle
     * @param {Number} r the radius of the circle
     * @param {String} colour the colour to fill the circle
     * @param {Boolean} centered True if (x,y) represents the center of the circle, False if it represents the top-left
     */
  fillCircle(this: Canvas, x: number, y: number, r: number, colour: string, centered: boolean): void {
    this.context.beginPath();
    if (centered) {
      this.context.arc(x, y, r, 0, 2 * Math.PI, true);
    } else {
      this.context.arc(x + r, y + r, r, 0, 2 * Math.PI, true);
    }
    this.context.fillStyle = colour;
    this.context.fill();
    this.context.closePath();
  }

  /**
   * Draws a filled rectangle to the canvas
   * @param {String} colour the colour of the rectangle
   * @param {Object} surface The canvas to draw to
   */
  fillRect = function (this: Canvas, x: number, y: number, w: number, h: number, colour: string) {
    this.context.fillStyle = colour;
    this.context.fillRect(x, y, w, h);
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
   */

  fillTriangle(this: Canvas, x: number, y: number, w: number, h: number, colour: string, center: boolean, angle: number, canvas: any) {
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

  private mainLoop(this: Canvas, mainFn: () => void) {
    mainFn();
    requestAnimationFrame(() => { this.mainLoop(mainFn); });
  }

  private strokePattern(contextStrokesFn: () => void) {
    this.context.beginPath();
    contextStrokesFn();
    this.context.closePath();
    this.context.stroke();
  }

  rebuildElement(parentElement?: HTMLElement): HTMLCanvasElement {
    const me = this,
      canvas = cws.createElement({
        type: 'canvas',
      });

    if (this.element)
      this.element.replaceWith(canvas);
    else
      parentElement.appendChild(canvas);

    this.element = canvas;

    const canvasRect: DOMRect = canvas.getBoundingClientRect(),
      canvasStyle: CSSStyleDeclaration = window.getComputedStyle(canvas),
      borderPadding: number = parseInt(canvasStyle.borderLeftWidth) + parseInt(canvasStyle.borderRightWidth);

    this.element.width = canvasRect.width !== 0 ? canvasRect.width - borderPadding : parseInt(canvasStyle.width);
    this.element.height = canvasRect.width !== 0 ? canvasRect.height - borderPadding : parseInt(canvasStyle.height);

    // reset context

    this.context = this.element.getContext("2d", {
      alpha: false
    });
    this.context.font = window.getComputedStyle(canvas).font;

    // LISTENERS

    canvas.addEventListener("resize", function () {
      me.element.width = me.element.getBoundingClientRect().width - 2 * parseInt(window.getComputedStyle(me.element).borderWidth);
      me.element.height = me.element.getBoundingClientRect().height - 2 * parseInt(window.getComputedStyle(me.element).borderWidth);
      me.resize();
    });

    canvas.addEventListener('oncontextmenu', (e) => { e.preventDefault(); return false; });

    // reset key listeners

    const listeners = me.keys ? me.keys.listeners : [];
    delete me.keys;
    me.keys = new KeyboardListener(window);
    listeners.forEach((listener) => {
      me.keys.addKeyboardEventListener(listener);
    });

    canvas.addEventListener("keydown", function (e) {
      me.keys.keyDown(e);
    });

    canvas.addEventListener("keyup", function (e) {
      me.keys.keyUp(e);
    });

    // re-add client-given listeners
    this.eventListeners.forEach((listenerData: EventListenerData) => {
      canvas.addEventListener(listenerData.type, listenerData.fn);
    });

    return this.element;
  }

  /**
   * Removes the Event Listener with the id provided (as produced by Canvas.addEventListener)
   */
  removeEventListener(this: Canvas, listenerId: number): EventListenerData {
    for (let i = 0; i < this.eventListeners.length; i++) {
      if (this.eventListeners[i].id === listenerId) {
        const listener = this.eventListeners[i];
        this.eventListeners.splice(i, 1);
        return listener;
      }
    }

    throw new Error('No listner found with id ' + listenerId);
  }

  resize(this: Canvas) {
    this.rebuildElement();
  }

  start(this: Canvas, mainFn: () => void) {
    const me = this;

    this.stop();
    this.animator = window.requestAnimationFrame(() => {
      me.mainLoop(mainFn);
    });
  }

  stop(this: Canvas) {
    window.cancelAnimationFrame(this.animator);
  }

  private static nextListenerId = 0;
}
