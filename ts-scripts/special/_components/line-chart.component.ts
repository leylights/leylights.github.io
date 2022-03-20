import { cws } from "../../cws.js";
import { PageBuilder } from "../_services/page-builder.service.js";
import { Canvas, CanvasCreationData } from "./canvas.component.js";

export interface LineChartPoint {
  x: number;
  y: number;
  label?: string;
}

type LineChartXYLimits = {
  x: {
    min: number,
    max: number,
  },
  y: {
    min: number,
    max: number,
  }
}

type LineChartAxisData = {
  limits: LineChartXYLimits,
  title: string,
  divisions: LineChartAxisDivision[]
}

type LineChartAxisDivision = {
  label: string,
  value: number,
}

interface LineChartConfig extends CanvasCreationData {
  title?: string;
  xAxis?: string;
  yAxis?: string;

  // Digit rounding:
  // -2 => 123.45
  // 0 => 123
  // 2 => 100
  yDigitRoundedTo?: number;
  showGridlines?: boolean;
  colour?: string;
  points: LineChartPoint[];
  limits?: {
    x?: {
      min: number,
      max: number,
    },
    y?: {
      min: number,
      max: number,
    }
  }
}

const MAX_UNIQUE_X_VALUES = 24;
const MAX_UNIQUE_Y_VALUES = 12;

export class LineChartComponent {
  parentElement: HTMLElement;
  container: HTMLElement;
  canvas: Canvas;

  private _points: LineChartPoint[];

  canvasConfig: CanvasCreationData;

  title: string;
  xAxisTitle: string;
  yAxisTitle: string;

  colours: {
    line: string;
    gridlines: string;
    background: string;
  } = {
      line: null,
      gridlines: null,
      background: null,
    };

  yDigitRoundedTo: number = 2;

  limits: { x: { min: number, max: number }, y: { min: number, max: number } } = {
    x: {
      min: null,
      max: null,
    },
    y: {
      min: null,
      max: null,
    }
  };

  autoRoundYAxis: boolean = false;

  showGridlines: boolean = true;
  majorGridlineThickness: number = 3;

  xAxisHeight: number = 40;
  yAxisWidth: number = 60;

  private _isInitialized = false;

  private static readonly DIVISION_CLASS_NAMES = {
    x: 'line-chart-x-axis-division',
    y: 'line-chart-y-axis-division',
  }

  constructor(data: LineChartConfig) {
    const me = this;

    this.parentElement = data.parentElement;
    this._points = data.points.sort((a, b) => {
      return a.x - b.x;
    });

    this.title = data.title;
    this.xAxisTitle = data.xAxis;
    this.yAxisTitle = data.yAxis;
    this.colours.line = data.colour;

    this.yDigitRoundedTo = data.yDigitRoundedTo ?? this.yDigitRoundedTo;
    this.showGridlines = data.showGridlines !== undefined ? data.showGridlines : this.showGridlines;

    this.canvasConfig = data;

    this.limits.x.min = data.limits?.x ? data.limits.x.min : null;
    this.limits.x.max = data.limits?.x ? data.limits.x.max : null;
    this.limits.y.min = data.limits?.y ? data.limits.x.min : null;
    this.limits.y.max = data.limits?.y ? data.limits.x.max : null;

    PageBuilder.addDarkModeListener({
      config: {
        notifyOnDebugToggle: true
      },
      listener: (isDark: boolean, styleSheet: CSSStyleSheet) => {
        me.resetColours(styleSheet);
        if (me.container) me.redraw();
      }
    });

    this.rebuild();
    this._isInitialized = true;
  }

  private get innerRect(): DOMRect {
    return new DOMRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  getPoints(this: LineChartComponent): LineChartPoint[] {
    return this._points.map((pt) => {
      return {
        x: pt.x,
        y: pt.y,
        label: pt.label,
      };
    });
  }

  set points(pts: LineChartPoint[]) {
    this._points = pts.sort((a, b) => {
      return b.x - a.x;
    });

    pts.forEach((pt) => {
      if (isNaN(pt.x) || isNaN(pt.y)) {
        throw new Error(`Bad point: (${pt.x}, ${pt.y})`);
      }
    })

    this.rebuild();
  }

  get titleSizePx(): number {
    const measurements: TextMetrics = this.canvas.context.measureText(this.title);
    return measurements.actualBoundingBoxAscent - measurements.actualBoundingBoxDescent;
  }

  private generateXAxisData(this: LineChartComponent, divisionsLimit?: number): LineChartAxisData {
    const limit = divisionsLimit !== undefined ? divisionsLimit : MAX_UNIQUE_X_VALUES;
    return this.generateGenericAxisData('x', limit, this.xAxisTitle);
  }

  private generateYAxisData(this: LineChartComponent): LineChartAxisData {
    const me = this,
      result = this.generateGenericAxisData('y', MAX_UNIQUE_Y_VALUES, this.yAxisTitle);
    result.divisions = result.divisions.sort((a, b) => { return a.value - b.value });

    result.divisions = result.divisions.map((a: LineChartAxisDivision) => {
      if (me.autoRoundYAxis) {
        const result: LineChartAxisDivision = {
          label: cws.roundToNthDigit(a.value, me.yDigitRoundedTo) + '',
          value: cws.roundToNthDigit(a.value, me.yDigitRoundedTo),
        }
        return result;
      } else
        return a;
    });
    return result;
  }

  private generateGenericAxisData(
    this: LineChartComponent,
    pointAttribute: ('x' | 'y'),
    maximumPoints: number,
    axisTitle: string
  ): LineChartAxisData {
    const me = this,
      allLimits = this.getLimits(),
      trueLimits = this.getTrueLimits();

    let uniqueValues: LineChartPoint[];

    let shouldGenerateDivisions: boolean = false;

    if (pointAttribute == 'x' && (trueLimits.x.min > allLimits.x.min || trueLimits.x.max < allLimits.x.max)) {
      shouldGenerateDivisions = true;
    }

    if (!shouldGenerateDivisions)
      uniqueValues = me.axisDataGeneratorHelpers.getUniqueValues(me, pointAttribute, maximumPoints);
    if (!uniqueValues) shouldGenerateDivisions = true;

    let divisions: LineChartAxisDivision[];
    if (this._points.length == 0) {
      divisions = [];
    } else if (pointAttribute == 'x') {
      if (shouldGenerateDivisions)
        divisions = me.axisDataGeneratorHelpers.generateNewDivisions(me, allLimits.x.min, allLimits.x.max, [10, 11, 12, 13, 14], true, pointAttribute);
      else {
        divisions = me.axisDataGeneratorHelpers.generateFewXDivisions(uniqueValues, allLimits);
      }
    } else { // y axis
      divisions = me.axisDataGeneratorHelpers.generateNewDivisions(me, allLimits.y.min, allLimits.y.max, [8, 9, 10, 11, 12], false, pointAttribute);
    }

    return {
      limits: allLimits,
      title: axisTitle,
      divisions: divisions,
    }
  }

  private axisDataGeneratorHelpers = {
    areAllValuesIntegers(values: any[]) {
      for (let i = 0; i < values.length; i++) {
        if (!cws.isInteger(values[i])) return false;
      }
      return true;
    },

    generateNewDivisions(
      me: LineChartComponent,
      min: number,
      max: number,
      divisors: number[],
      labelDivisions: boolean,
      pointAttribute: string,
    ): LineChartAxisDivision[] {
      const initialMax = max;
      let space = -1;

      // find an integer spacing that creates a reasonable number of divisors
      if (me.axisDataGeneratorHelpers.areAllValuesIntegers(me._points.map(p => p[pointAttribute]))) {
        let success = false;
        while (!success) {
          for (let i = 0; i < divisors.length; i++) {
            if (cws.isInteger((max - min) / divisors[i])) {
              space = (max - min) / divisors[i];
              success = true;
              break;
            }
          }
          max++;
        }
      } else {
        space = (max - min) / divisors[Math.floor(divisors.length / 2)];
      }

      const values: number[] = [];

      // generate divisors
      for (let x = min; x <= initialMax; x += space) {
        values.push(x);
        if (space === 0) break;
      }

      // round divisors
      const roundingDigit = values.length > 0 ? Math.round(values[values.length - 1]).toString().length - 3 : 0;
      const output: LineChartAxisDivision[] = [];

      values.forEach((n) => {
        n = cws.roundToNthDigit(n, roundingDigit);
        output.push({
          label: labelDivisions
            ? me.axisDataGeneratorHelpers.findLabelFor(me, n, pointAttribute)
            : cws.numberToPrettyNumber(n),
          value: n,
        });
      });

      return output;
    },

    findLabelFor(me: LineChartComponent, value: number, pointAttribute: string): string {
      for (let i = 0; i < me._points.length; i++) {
        if (me._points[i][pointAttribute] == value) {
          if (me._points[i].label) {
            return me._points[i].label;
          } else {
            return cws.numberToPrettyNumber(value);
          }
        }
      }

      return value + '';
    },

    getUniqueValues(
      me: LineChartComponent,
      pointAttribute: 'x' | 'y',
      maximumPoints: number,
    ): LineChartPoint[] | null {
      const uniqueValues: LineChartPoint[] = [];
      let fail = false;

      me._points.forEach((point: LineChartPoint) => {
        if (!cws.Array.contains(uniqueValues, point, (a: LineChartPoint, b: LineChartPoint) => {
          return a[pointAttribute] === b[pointAttribute];
        })) {
          if (uniqueValues.length >= maximumPoints) {
            fail = true;
          } else if (uniqueValues.length < maximumPoints)
            uniqueValues.push(point);
        }
      });

      return !fail ? uniqueValues : null;
    },

    generateFewXDivisions(
      values: LineChartPoint[],
      limits,
    ) {
      return values.filter((value: LineChartPoint) => {
        return limits.x.min <= value.x && value.x <= limits.x.max;
      }).map((value: LineChartPoint) => {
        const output: LineChartAxisDivision = {
          label: value.label,
          value: value.x,
        }
        return output;
      }).sort((a: LineChartAxisDivision, b: LineChartAxisDivision) => {
        return a.value - b.value;
      });
    }
  }

  private getLimits(this: LineChartComponent): LineChartXYLimits {
    if (!this._points[0]) throw new Error("No points");

    const output = this.getTrueLimits();

    output.x.min = this.limits.x.min ?? output.x.min;
    output.x.max = this.limits.x.max ?? output.x.max;
    output.y.min = this.limits.y.min ?? output.y.min;
    output.y.max = this.limits.y.max ?? output.y.max;

    return output;
  }

  // Returns the true limits of the dataset; not considering client-defined limits
  private getTrueLimits(this: LineChartComponent): LineChartXYLimits {
    if (!this._points[0]) throw new Error("No points");

    const output = {
      x: {
        min: this._points[0].x,
        max: this._points[0].x,
      },
      y: {
        min: this._points[0].y,
        max: this._points[0].y
      }
    }

    this._points.forEach((point) => {
      output.x.min = Math.min(point.x, output.x.min);
      output.x.max = Math.max(point.x, output.x.max);

      output.y.min = Math.min(point.y, output.y.min);
      output.y.max = Math.max(point.y, output.y.max);
    });

    return output;
  }

  main(this: LineChartComponent) {
    this.redraw();
  }

  rebuild(this: LineChartComponent) {
    const me = this,
      container = cws.createElement({
        type: 'div',
        classList: 'line-chart-container',
      }),
      firstTime: boolean = !this.canvas;

    if (!firstTime) this.canvas.stop();

    // develop HTML
    const titleContainer = cws.createElement({
      type: 'div',
      classList: 'line-chart-title-container',
      children: [cws.createElement({
        type: 'h2',
        classList: 'line-chart-title',
        innerText: this.title,
      })]
    }), xAxis = cws.createElement({
      type: 'div',
      classList: ['line-chart-axis', 'line-chart-x-axis'],
      style: `min-height: ${this.xAxisHeight}`,
    }), yAxis = cws.createElement({
      type: 'div',
      classList: ['line-chart-axis', 'line-chart-y-axis'],
      style: `min-width: ${this.yAxisWidth}`,
    });

    if (this._points.length > 0) {
      this.rebuildHelpers.generateXAxis(me, MAX_UNIQUE_X_VALUES, xAxis);
      const yAxisData: LineChartAxisData = this.generateYAxisData();

      yAxisData.divisions.forEach((division) => {
        const next = cws.createElement({
          type: 'div',
          classList: LineChartComponent.DIVISION_CLASS_NAMES.y,
          children: [cws.createElement({
            type: 'span',
            innerText: division.label
          })],
          style: `bottom: ${((division.value - yAxisData.limits.y.min) / (yAxisData.limits.y.max - yAxisData.limits.y.min)) * 100}%`
        });
        yAxis.appendChild(next);
      });
    }

    container.appendChild(titleContainer);

    container.appendChild(xAxis);
    container.appendChild(yAxis);

    if (firstTime) {
      this.parentElement.appendChild(container);
    } else {
      this.container.replaceWith(container)
    }
    this.container = container;

    this.canvasConfig.parentElement = this.container;
    this.canvasConfig.clearColour = 'fromCSS';
    this.canvas = new Canvas(this.canvasConfig);

    // remove overlapping y axis dividers
    Array.from(yAxis.querySelectorAll(`.${LineChartComponent.DIVISION_CLASS_NAMES.y}`)).forEach((a) => {
      Array.from(yAxis.querySelectorAll(`.${LineChartComponent.DIVISION_CLASS_NAMES.y}`)).forEach((b) => {
        if (!a.isEqualNode(b) && cws.rectanglesCollide(a.getBoundingClientRect(), b.getBoundingClientRect()))
          b.remove();
      });
    });

    // set y axis width
    let maxYAxisLabelWidth: number = -1;
    Array.from(yAxis.querySelectorAll(`.${LineChartComponent.DIVISION_CLASS_NAMES.y}`)).forEach((divider) => {
      maxYAxisLabelWidth = Math.max(maxYAxisLabelWidth, divider.getBoundingClientRect().width);
    });
    yAxis.style.width = Math.max(maxYAxisLabelWidth + 5, this.yAxisWidth) + 'px';

    // rebuild x axis until values fit
    attemptRotateXAxis();

    // set x axis height
    let maxXAxisLabelHeight: number = -1;
    Array.from(xAxis.querySelectorAll(`.${LineChartComponent.DIVISION_CLASS_NAMES.x}`)).forEach((divider) => {
      maxXAxisLabelHeight = Math.max(maxXAxisLabelHeight, divider.getBoundingClientRect().height);
    });
    xAxis.style.height = Math.max(maxXAxisLabelHeight + 5, this.xAxisHeight) + 'px';

    this.canvas.drawOnce(() => { me.main(); });

    // Rotates x axis labels when necessary
    function attemptRotateXAxis(): boolean {
      let lastDivision: HTMLDivElement = null;
      let needsRotation: boolean = false;

      // Determine if the rotation is necessary
      const results = Array.from(xAxis.querySelectorAll(`.${LineChartComponent.DIVISION_CLASS_NAMES.x}`)).sort((a: HTMLElement, b: HTMLElement) => {
        return a.getBoundingClientRect().x - b.getBoundingClientRect().x;
      }) as HTMLDivElement[];

      for (let i = 0; i < results.length; i++) {
        if (results[i].getBoundingClientRect().x === 0)
          break;
        if (!lastDivision)
          lastDivision = results[i];
        else if (lastDivision.getBoundingClientRect().right > results[i].getBoundingClientRect().x) {
          needsRotation = true;
          break;
        } else
          lastDivision = results[i];
      }

      if (results.length > 0 && results[results.length - 1].getBoundingClientRect().right > me.container.getBoundingClientRect().right)
        needsRotation = true;

      // If rotation is necessary, rotate using css
      if (needsRotation) {
        results.forEach((divider) => {
          divider.style.writingMode = 'vertical-rl';
        });
      }
      else
        results.forEach((divider) => {
          divider.style.writingMode = '';
        });

      return needsRotation;
    }
  }

  private rebuildHelpers = {
    generateXAxis(me: LineChartComponent, limit: number, xAxis: HTMLElement) {
      const xAxisData: LineChartAxisData = me.generateXAxisData(limit);
      xAxis.innerHTML = '';

      xAxisData.divisions.forEach((division) => {
        const next = cws.createElement({
          type: 'div',
          classList: LineChartComponent.DIVISION_CLASS_NAMES.x,
          children: [cws.createElement({
            type: 'span',
            innerText: division.label
          })],
          style: `left: ${((division.value - xAxisData.limits.x.min) / (xAxisData.limits.x.max - xAxisData.limits.x.min)) * 100}%`
        });

        xAxis.appendChild(next);
      });
    }
  }

  redraw(this: LineChartComponent) {
    const me = this,
      area = this.innerRect;

    this.resetColours();

    this.canvas.clearColour = this.colours.background;
    this.canvas.clear();

    if (this._points.length > 0) {
      const limits = this.getLimits();

      if (this.showGridlines)
        drawGridlines();

      for (let i = 1; i < this._points.length; i++) {
        const start = convertPoint(this._points[i - 1], limits),
          end = convertPoint(this._points[i], limits);
        this.canvas.drawLine(start.x, start.y, end.x, end.y, this.colours.line, 2);
      }
    }

    function convertPoint(pt: LineChartPoint, limits): LineChartPoint {
      const output: LineChartPoint = {
        x: limits.x.max - limits.x.min != 0 ? area.x + (pt.x - limits.x.min) * (area.width / (limits.x.max - limits.x.min)) : area.x + area.width / 2,
        y: limits.y.max - limits.y.min != 0 ? area.bottom - ((pt.y - limits.y.min) * (area.height / (limits.y.max - limits.y.min))) : area.top + area.height / 2,
        label: pt.label,
      };
      return output;
    }

    function drawGridlines() {
      const xData = me.generateXAxisData(),
        yData = me.generateYAxisData();

      let currentX: number = 0;
      for (let i = 1; i < xData.divisions.length; i++) {
        const x = me.canvas.width * ((xData.divisions[i].value - xData.limits.x.min) / (xData.limits.x.max - xData.limits.x.min));
        const thickness = xData.divisions[i].label === '0' ? me.majorGridlineThickness : 1;
        if (x < 0) continue;
        if (currentX > x || x === me.canvas.width) break; // prevent x from going backwards
        currentX = x;
        me.canvas.drawLine(
          x,
          0,
          x,
          me.canvas.height,
          me.colours.gridlines,
          thickness);
      }

      let currentY: number = 0;
      for (let i = 1; i < yData.divisions.length; i++) {
        const h = me.canvas.height * ((yData.divisions[i].value - yData.limits.y.min) / (yData.limits.y.max - yData.limits.y.min));
        const thickness = yData.divisions[i].value == 0 ? me.majorGridlineThickness : 1;
        if (currentY > h || h === me.canvas.height || h === 0) break; // prevent y from going back down
        if (h - currentY < 20) continue; // skip heavy overlaps
        currentY = h;

        const top = me.canvas.height - h;

        me.canvas.drawLine(
          0,
          top,
          me.canvas.width,
          top,
          me.colours.gridlines,
          thickness);
      }
    }
  }

  resetColours(this: LineChartComponent, styleSheet?: CSSStyleSheet) {
    const style = window.getComputedStyle(document.body);

    this.colours.line = getColourOrError('--accent-color');
    this.colours.gridlines = getColourOrError('--accent-bg-color');
    this.colours.background = getColourOrError('--secondary-bg-color');

    function getColourOrError(name: string): string {
      if (!styleSheet) return window.getComputedStyle(document.body).getPropertyValue(name);

      const root: CSSStyleRule = Array.from(styleSheet.cssRules).filter((rule: CSSStyleRule) => {
        return rule.selectorText == ':root';
      })[0] as CSSStyleRule;
      // debugger;
      if (root) {
        const definedRules = root.style.cssText.split(';');
        for (let i = 0; i < definedRules.length; i++) {
          const split = definedRules[i].split(':');
          if (split[0].trim() == name) {
            return split[1].trim();
          }
        }
      }

      const result = style.getPropertyValue(name);
      if (result === '')
        throw new Error('Bad CSS variable name: ' + name);

      return result;
    }
  }
}
