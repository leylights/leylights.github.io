var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cws } from "../../cws.js";
import { Button } from "../components/button.component.js";
import { InputComponent } from "../components/input.component.js";
import { LineChartComponent } from "../components/line-chart.component.js";
import { BadInput } from "../errors/bad-input.error.js";
import { NPCsSignedDice } from "./helper-repository/histogram/signed-dice.js";
export class NPCsDiceHistogramPage {
    constructor() {
        this.text = {
            rolling: 'Rolling...',
            roll: 'Roll',
        };
        this.chart = new LineChartComponent({
            title: 'Distribution of dice rolls',
            parentElement: document.getElementById('canvas-container'),
            points: [],
            showGridlines: true,
        });
        this.diceInput = new InputComponent({ element: document.getElementById('dice-input') });
        this.countInput = new InputComponent({ element: document.getElementById('count-input') });
        this.limits = {
            x: {
                min: new InputComponent({ element: document.getElementById('x-min') }),
                max: new InputComponent({ element: document.getElementById('x-max') }),
            },
            y: {
                min: new InputComponent({ element: document.getElementById('y-min') }),
                max: new InputComponent({ element: document.getElementById('y-max') }),
            }
        };
        this.submit = Button.createByAppending(document.getElementById('roll-container'), () => __awaiter(this, void 0, void 0, function* () {
            // sanitize
            try {
                this.checkInputs();
            }
            catch (e) {
                if (e instanceof BadInput) {
                    this.submit.reject();
                    return;
                }
                else {
                    throw e;
                }
            }
            // submit
            this.submit.HTMLText = this.text.rolling;
            yield this.rebuildChart();
            this.submit.HTMLText = this.text.roll;
        }), 'Roll', true);
        // defaults
        this.diceInput.value = '6d20';
        this.countInput.value = '10000';
        this.rebuildChart();
    }
    // Will throw BadInput if the input verification fails.
    checkInputs() {
        const me = this;
        function rejectDiceInput() {
            me.diceInput.reject();
            throw new BadInput();
        }
        // diceInput
        const diceMatches = this.getDiceStrings();
        if (diceMatches.length <= 0) {
            rejectDiceInput();
        }
        else if (cws.orEquals(this.diceInput.value[this.diceInput.value.length - 1], ['+', '-'])) {
            rejectDiceInput();
        }
        else if (cws.orEquals(this.diceInput.value.split(' ').join('')[0], ['+', '-'])) {
            rejectDiceInput();
        }
        else if (diceMatches.length >= 1 && diceMatches.join('').split(/[\+\-]/g).join('') != this.diceInput.value.split(/[\+\-\s]/g).join('')) {
            rejectDiceInput();
        }
        // countInput
        const countMatches = this.countInput.value.match(/[0-9]*/g).filter((s) => { return s !== ''; });
        if (!(countMatches.length === 1 && countMatches[0] == this.countInput.value)) {
            this.countInput.reject();
            throw new BadInput();
        }
        // limits
        function checkLimit(limit) {
            // const result = !limit.value.match(/[^0-9\-\s]/g);
            const result = limit.value.trim() == '' || parseInt(limit.value).toString() == limit.value.trim();
            if (!result) {
                limit.reject();
                throw new BadInput();
            }
            return result;
        }
        function checkRelativeValue(set) {
            if (set.min.value.trim() == '' || set.max.value.trim() == '')
                return true;
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
    getDiceStrings() {
        return this.diceInput.value.match(/([+-]?(\s)*([0-9]*d[0-9]*))/g)
            .map((s) => { return s.replace(/\s/g, ''); })
            .filter((s) => { return s !== ''; });
    }
    getRollCounts() {
        const dice = [];
        const strings = this.getDiceStrings();
        let breakOut = false;
        strings.forEach((s) => {
            try {
                if (cws.orEquals(s[0], ['+', '-'])) {
                    if (s[0] === '-') {
                        dice.push(new NPCsSignedDice(s.substring(1), -1));
                    }
                    else {
                        dice.push(new NPCsSignedDice(s.substring(1), 1));
                    }
                }
                else {
                    dice.push(new NPCsSignedDice(s, 1));
                }
            }
            catch (e) {
                this.diceInput.reject();
                breakOut = true;
            }
        });
        if (breakOut)
            return;
        const len = Math.ceil(parseInt(this.countInput.value));
        const rollCounts = [];
        const negativeRollCounts = [];
        if (isNaN(len) || len <= 0) {
            this.countInput.reject();
            return;
        }
        for (let i = 0; i < len; i++) {
            let roll = 0;
            dice.forEach((d) => {
                roll += d.roll() * d.sign;
            });
            if (roll < 0) {
                if (negativeRollCounts[Math.abs(roll)])
                    negativeRollCounts[Math.abs(roll)]++;
                else
                    negativeRollCounts[Math.abs(roll)] = 1;
            }
            else {
                if (rollCounts[roll])
                    rollCounts[roll]++;
                else
                    rollCounts[roll] = 1;
            }
        }
        for (let i = 0; i < rollCounts.length; i++) {
            if (!rollCounts[i])
                rollCounts[i] = 0;
        }
        for (let i = 0; i < negativeRollCounts.length; i++) {
            if (!negativeRollCounts[i])
                negativeRollCounts[i] = 0;
        }
        return {
            pos: rollCounts,
            neg: negativeRollCounts
        };
    }
    rebuildChart() {
        return __awaiter(this, void 0, void 0, function* () {
            const rolls = this.getRollCounts();
            const points = [];
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
            }
            else {
                this.chart.limits.x.min = null;
            }
            if (this.limits.x.max.value.trim() != '') {
                this.chart.limits.x.max = parseInt(this.limits.x.max.value);
            }
            else {
                this.chart.limits.x.max = null;
            }
            if (this.limits.y.min.value.trim() != '') {
                this.chart.limits.y.min = parseInt(this.limits.y.min.value);
            }
            else {
                this.chart.limits.y.min = null;
            }
            if (this.limits.y.max.value.trim() != '') {
                this.chart.limits.y.max = parseInt(this.limits.y.max.value);
            }
            else {
                this.chart.limits.y.max = null;
            }
            this.chart.points = points;
        });
    }
}
new NPCsDiceHistogramPage();
//# sourceMappingURL=dice-histogram.page.js.map