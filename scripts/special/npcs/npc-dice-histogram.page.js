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
        this.submit = Button.createByAppending(document.body.querySelector('.content'), () => __awaiter(this, void 0, void 0, function* () {
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
        // debug
        this.diceInput.value = '2d4-4d6';
        this.countInput.value = '1000000';
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
        else if (diceMatches.length >= 1 && diceMatches.join('') != this.diceInput.value.split(' ').join('')) {
            rejectDiceInput();
        }
        else if (cws.orEquals(this.diceInput.value[this.diceInput.value.length - 1], ['+', '-'])) {
            rejectDiceInput();
        }
        if (diceMatches.length > 1) {
            me.submit.warn();
        }
        // countInput
        const countMatches = this.countInput.value.match(/[0-9]*/g).filter((s) => { return s !== ''; });
        if (!(countMatches.length === 1 && countMatches[0] == this.countInput.value)) {
            this.countInput.reject();
            throw new BadInput();
        }
        return true;
    }
    getDiceStrings() {
        return this.diceInput.value.match(/([+-]?([0-9]*d[0-9]*))/g).filter((s) => { return s !== ''; });
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
            for (let i = 0; i < rolls.pos.length; i++)
                points[i] = {
                    x: i,
                    y: rolls.pos[i],
                };
            for (let i = 1; i < rolls.neg.length; i++)
                points[i + rolls.pos.length - 1] = {
                    x: -i,
                    y: rolls.neg[i],
                };
            this.chart.points = points;
        });
    }
}
new NPCsDiceHistogramPage();
//# sourceMappingURL=npc-dice-histogram.page.js.map