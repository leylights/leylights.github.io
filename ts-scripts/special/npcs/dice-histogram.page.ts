import { cws } from "../../cws.js";
import { Button } from "../../components/button.component.js";
import { InputComponent } from "../../components/input.component.js";
import { LineChartComponent, LineChartPoint } from "../../components/line-chart.component.js";
import { BadInput } from "../errors/bad-input.error.js";
import { NPCsSignedDice } from "./helper-repository/histogram/signed-dice.js";

export class NPCsDiceHistogramPage {
  text = {
    rolling: 'Rolling...',
    roll: 'Roll',
  };

  chart: LineChartComponent = new LineChartComponent({
    title: 'Distribution of dice rolls',
    parentElement: document.getElementById('canvas-container'),
    points: [],
    showGridlines: true,
  });
  diceInput: InputComponent = new InputComponent({ element: document.getElementById('dice-input') as HTMLInputElement });
  countInput: InputComponent = new InputComponent({ element: document.getElementById('count-input') as HTMLInputElement });
  limits = {
    x: {
      min: new InputComponent({ element: document.getElementById('x-min') as HTMLInputElement }),
      max: new InputComponent({ element: document.getElementById('x-max') as HTMLInputElement }),
    },
    y: {
      min: new InputComponent({ element: document.getElementById('y-min') as HTMLInputElement }),
      max: new InputComponent({ element: document.getElementById('y-max') as HTMLInputElement }),
    }
  };
  submit: Button = Button.createByAppending(document.getElementById('roll-container'), async () => {
    // sanitize
    try {
      this.checkInputs();
    } catch (e) {
      if (e instanceof BadInput) {
        this.submit.reject();
        return;
      } else {
        throw e;
      }
    }

    // submit
    this.submit.HTMLText = this.text.rolling;
    await this.rebuildChart();
    this.submit.HTMLText = this.text.roll;
  }, 'Roll', true);

  constructor() {
    // defaults
    this.diceInput.value = '6d20';
    this.countInput.value = '10000';
    this.rebuildChart();
  }

  // Will throw BadInput if the input verification fails.
  private checkInputs(this: NPCsDiceHistogramPage): boolean {
    const me = this;

    function rejectDiceInput() {
      me.diceInput.reject();
      throw new BadInput();
    }
    // diceInput
    const diceMatches = this.getDiceStrings();
    if (diceMatches.length <= 0) {
      rejectDiceInput();
    } else if (cws.orEquals(this.diceInput.value[this.diceInput.value.length - 1], ['+', '-'])) {
      rejectDiceInput();
    } else if (cws.orEquals(this.diceInput.value.split(' ').join('')[0], ['+', '-'])) {
      rejectDiceInput();
    } else if (diceMatches.length >= 1 && diceMatches.join('').split(/[\+\-]/g).join('') != this.diceInput.value.split(/[\+\-\s]/g).join('')) {
      rejectDiceInput();
    }

    // countInput
    const countMatches = this.countInput.value.match(/[0-9]*/g).filter((s: string): boolean => { return s !== '' });
    if (!(countMatches.length === 1 && countMatches[0] == this.countInput.value)) {
      this.countInput.reject();
      throw new BadInput();
    }

    // limits
    function checkLimit(limit: InputComponent): boolean {
      // const result = !limit.value.match(/[^0-9\-\s]/g);
      const result = limit.value.trim() == '' || parseInt(limit.value).toString() == limit.value.trim();
      if (!result) {
        limit.reject();
        throw new BadInput();
      }
      return result;
    }

    function checkRelativeValue(set: { min: InputComponent, max: InputComponent }) {
      if (set.min.value.trim() == '' || set.max.value.trim() == '') return true;
      if (parseInt(set.min.value) >= parseInt(set.max.value)) {
        set.min.reject();
        set.max.reject();
        throw new BadInput();
      }
      return true;
    }

    checkLimit(this.limits.x.min);
    checkLimit(this.limits.x.max);
    checkLimit(this.limits.y.min);
    checkLimit(this.limits.y.max);

    checkRelativeValue(this.limits.x);
    checkRelativeValue(this.limits.y);

    return true;
  }

  private getDiceStrings(this: NPCsDiceHistogramPage): string[] {
    return this.diceInput.value.match(/([+-]?(\s)*([0-9]*d[0-9]*))/g)
      .map((s: string) => { return s.replace(/\s/g, '') })
      .filter((s: string) => { return s !== '' });
  }

  private getRollCounts(this: NPCsDiceHistogramPage): { pos: number[], neg: number[] } {
    const dice: NPCsSignedDice[] = [];
    const strings: string[] = this.getDiceStrings();
    let breakOut = false;

    strings.forEach((s: string) => {
      try {
        if (cws.orEquals(s[0], ['+', '-'])) {
          if (s[0] === '-') {
            dice.push(new NPCsSignedDice(s.substring(1), -1));
          } else {
            dice.push(new NPCsSignedDice(s.substring(1), 1));
          }
        } else {
          dice.push(new NPCsSignedDice(s, 1));
        }
      } catch (e) {
        this.diceInput.reject();
        breakOut = true;
      }
    });

    if (breakOut) return;

    const len = Math.ceil(parseInt(this.countInput.value));
    const rollCounts: number[] = [];
    const negativeRollCounts: number[] = [];
    if (isNaN(len) || len <= 0) {
      this.countInput.reject();
      return;
    }

    for (let i = 0; i < len; i++) {
      let roll = 0;
      dice.forEach((d: NPCsSignedDice) => {
        roll += d.roll() * d.sign;
      });

      if (roll < 0) {
        if (negativeRollCounts[Math.abs(roll)]) negativeRollCounts[Math.abs(roll)]++;
        else negativeRollCounts[Math.abs(roll)] = 1;
      } else {
        if (rollCounts[roll]) rollCounts[roll]++;
        else rollCounts[roll] = 1;
      }
    }

    for (let i = 0; i < rollCounts.length; i++) {
      if (!rollCounts[i]) rollCounts[i] = 0;
    }
    for (let i = 0; i < negativeRollCounts.length; i++) {
      if (!negativeRollCounts[i]) negativeRollCounts[i] = 0;
    }

    return {
      pos: rollCounts,
      neg: negativeRollCounts
    };
  }

  private async rebuildChart(this: NPCsDiceHistogramPage) {
    const rolls: { pos: number[], neg: number[] } = this.getRollCounts();
    const points: LineChartPoint[] = [];

    for (let i = 0; i < rolls.pos.length; i++) {
      if (rolls.pos[i] == 0)
        continue;
      points.push({
        x: i,
        y: rolls.pos[i],
      });
    }
    for (let i = 1; i < rolls.neg.length; i++)
      points.push({
        x: -i,
        y: rolls.neg[i],
      });

    if (this.limits.x.min.value.trim() != '') {
      this.chart.limits.x.min = parseInt(this.limits.x.min.value);
    } else {
      this.chart.limits.x.min = null;
    }
    if (this.limits.x.max.value.trim() != '') {
      this.chart.limits.x.max = parseInt(this.limits.x.max.value);
    } else {
      this.chart.limits.x.max = null;
    }
    if (this.limits.y.min.value.trim() != '') {
      this.chart.limits.y.min = parseInt(this.limits.y.min.value);
    } else {
      this.chart.limits.y.min = null;
    }
    if (this.limits.y.max.value.trim() != '') {
      this.chart.limits.y.max = parseInt(this.limits.y.max.value);
    } else {
      this.chart.limits.y.max = null;
    }

    this.chart.points = points;
  }
}

new NPCsDiceHistogramPage();
