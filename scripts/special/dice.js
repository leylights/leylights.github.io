// get input
// separate into amount and type
// roll, store results in an array
// display total as well as individual rolls
const MIN_ROLLS = 8;
var inputBox = document.getElementById("diceIn");
var lastRoll = "";
/**
 * Sets up all event listeners
 */
function diceInit() {
    inputBox.addEventListener("keyup", function (evt) {
        evt.preventDefault();
        if (evt.key === "Enter")
            getIn();
    });
    // tools
    document.getElementById("colour-circle").addEventListener("click", () => { openDiceColourSelect(true); });
    document.getElementById("colour-close").addEventListener("click", () => { openDiceColourSelect(false); });
    document.getElementById("percentiles-tooltip").addEventListener("click", showPercentiles);
    document.getElementById("q").addEventListener("click", openHelp);
    document.getElementById("colour-slider").oninput = function () {
        let dice = document.getElementsByClassName("dice");
        let me = document.getElementById("colour-slider");
        for (let i = 0; i < dice.length; i++) {
            dice[i].style.filter = "drop-shadow(0px 2px 6px black) sepia(1) hue-rotate(" + me.value + "deg) saturate(1.25)";
        }
        me.style.filter = "sepia(1) hue-rotate(" + me.value + "deg) saturate(1.25)";
        document.getElementById("colour-circle").style.filter = "sepia(1) hue-rotate(" + me.value + "deg) saturate(1.25)";
    };
    //dice
    let normalTable = document.getElementById("base-dice");
    let diceElements = normalTable.getElementsByTagName("td");
    let valueMap = [4, 6, 8, 10, 12, 20];
    for (let i = 0; i < diceElements.length; i++) {
        diceElements[i].addEventListener("click", () => { rollDie(valueMap[i], diceElements[i]); });
    }
    document.getElementById("percentile-dice-table").addEventListener("click", () => { rollD100(undefined); });
    document.getElementById("submit").addEventListener("click", getIn);
    document.getElementById("repeat").addEventListener("click", () => { roll(lastRoll); });
}
function getIn() {
    roll(inputBox.value);
}
export function roll(input) {
    let amt = parseInt(input);
    let type = parseInt(input.substring((amt + "").length + 1));
    if (isNaN(type)) {
        inputBox.value = "";
        inputBox.placeholder = "1d20";
        return;
    }
    lastRoll = input;
    let rolls = [];
    let sum = 0;
    for (let i = 0; i < amt; i++) {
        rolls[i] = Math.ceil(Math.random() * type);
        sum += rolls[i];
    }
    console.log(rolls);
    let sumT = sum + " [";
    for (let i = 0; i < rolls.length; i++)
        if (i === 0)
            sumT = sumT + rolls[i];
        else
            sumT = sumT + ", " + rolls[i];
    sumT = sumT + "]";
    inputBox.value = "";
    inputBox.placeholder = sumT;
    document.getElementById("repeat").style.display = "";
    document.getElementById("repeat").innerText = "Roll " + input + " again";
    document.getElementById("submit").innerText = "New Roll";
}
function rollDie(type, element, iter) {
    if (typeof iter == "undefined")
        iter = 0;
    setTimeout(function () {
        if (iter > type && iter > MIN_ROLLS || iter > 30)
            return null;
        let r = Math.ceil(Math.random() * type);
        element.children[0].children["d" + type].innerHTML = r;
        rollDie(type, element, iter + 1);
    }, 50);
}
function rollD100(iter) {
    if (typeof iter == "undefined")
        iter = 0;
    setTimeout(function () {
        if (iter > MIN_ROLLS || iter > 30)
            return null;
        let ones = Math.floor(Math.random() * 10);
        let tens = Math.floor(Math.random() * 10);
        document.getElementById("d100-2").innerHTML = ones + "";
        document.getElementById("d100-1").innerHTML = tens + "0";
        rollD100(iter + 1);
    }, 50);
}
function showPercentiles() {
    if (document.getElementById("percentile-dice-table").style.visibility === "hidden") {
        document.getElementById("percentile-dice-table").style.visibility = "visible";
        document.getElementById("percentiles-tooltip").style.backgroundColor = "var(--secondary-accent-color)";
        document.getElementById("percentiles-tooltip").style.color = "var(--text-color)";
    }
    else {
        document.getElementById("percentile-dice-table").style.visibility = "hidden";
        document.getElementById("percentiles-tooltip").style.backgroundColor = "";
        document.getElementById("percentiles-tooltip").style.color = "";
    }
}
function openDiceColourSelect(opening) {
    console.log(opening + " " + new Date().getTime());
    let cstyle = document.getElementById("colour-tooltip").style;
    if (opening) {
        document.getElementById("colour-circle").style.display = "none";
        document.getElementById("after-colour").style.display = "block";
        cstyle.maxHeight = "80%";
        cstyle.maxWidth = "800px";
        cstyle.width = "auto";
        cstyle.height = "auto";
        cstyle.padding = "0.5em 1em";
    }
    else {
        document.getElementById("colour-circle").style.display = "block";
        document.getElementById("after-colour").style.display = "none";
        cstyle.maxHeight = "";
        cstyle.maxWidth = "";
        cstyle.width = "";
        cstyle.height = "";
        cstyle.padding = "";
    }
}
function openHelp() {
    let q = document.getElementById("q");
    let qs = q.style;
    if (document.getElementById("after-q").style.display === "none") {
        document.getElementById("before-q").style.display = "none";
        document.getElementById("after-q").style.display = "block";
        qs.maxHeight = "80%";
        qs.maxWidth = "800px";
        qs.lineHeight = "1.15em";
        qs.width = "auto";
        qs.height = "auto";
        qs.padding = "0 1em";
        qs.fontSize = "1em";
        qs.fontWeight = "400";
        qs.textAlign = "left";
    }
    else {
        document.getElementById("before-q").style.display = "block";
        document.getElementById("after-q").style.display = "none";
        qs.width = "";
        qs.lineHeight = "";
        qs.height = "";
        qs.padding = "";
        qs.backgroundColor = "";
        qs.fontSize = "";
        qs.fontWeight = "";
        qs.textAlign = "";
    }
}
diceInit();
//# sourceMappingURL=dice.js.map