let slider = document.querySelector("#potential-slider");
let sliderNum = document.querySelector("#potential-slider-number");
let potentialString = document.querySelector("#potential-string");
let scoreString = document.querySelector("#score-string");

function main() {
    document.querySelector("#button-calculate").onclick = (e) => calculateChart();
    slider.oninput = onSliderInput;
}

function getIsAvoid() {
    let option = document.querySelector("#is-avoid").value;

    if (option == "避開")
        return true;
    else
        return false;
}

function getStepsToTile() {
    return Number.parseFloat(document.querySelector("#steps-to-tile").value);
}

function getStepsInTargetTile() {
    return Number.parseFloat(document.querySelector("#steps-in-target-tile").value);
}

function getPartnerStepStat() {
    return Number.parseFloat(document.querySelector("#partner-step-stat").value);
}

function getChartConstant() {
    return Number.parseFloat(document.querySelector("#chart-constant").value);
}

function getStepsFromPotential(chartPotential) {
    return (2.45 * Math.sqrt(chartPotential) + 2.5) * getPartnerStepStat() / 50;
}

// Return -1 if computed score < 0, -2 if computed score > 10M
function getScoreFromScoreMod(scoreMod) {
    return scoreMod < 1.5 ? scoreMod * 300000 + 9500000 : (scoreMod - 1.5) * 100000 + 9950000;
}

function getScoreModFromScore(score) {
    if (score < 9950000)
        return (score - 9500000) / 300000;
    else if (score < 10000000)
        return (score - 9950000) / 100000 + 1.5;
    else
        return 2;
}

// Need to test for return > 2 or < -31.666
function getScoreModFromSteps(targetSteps, partnerStepStat) {
    if (50 * targetSteps / partnerStepStat < 2.5)
        return null;
    return Math.pow(((50 * targetSteps / partnerStepStat - 2.5) / 2.45), 2) - getChartConstant();
}

function getPotentialFromScoreMod(scoreMod) {
    return Math.max(getChartConstant() + Math.min(scoreMod, 2), 0);
}

function getGradeFromScore(score) {
    if (score < 8600000)
        return "D";
    else if (score < 8900000)
        return "C";
    else if (score < 9200000)
        return "B";
    else if (score < 9500000)
        return "A";
    else if (score < 9800000)
        return "AA";
    else if (score < 10000000)
        return "EX";
    else
        return "PM";
}

function roundToPrecision(num, precision) {
    let mag = Math.pow(10, precision);
    return Math.round(num * mag) / mag;
}

function addCommaSeparator(num) {
    num = num.toString();
    dotIndex = num.indexOf(".");
    for (let i = dotIndex != -1 ? dotIndex : num.length, j = 0; i > 0; i-- , j++) {
        if (j == 3) {
            num = num.substring(0, i) + "," + num.substring(i);
            j = 0;
        }
    }
    return num;
}

function onSliderInput(e) {
    let chartPotential = slider.value;
    let scoreMod = chartPotential - getChartConstant();
    let score = getScoreFromScoreMod(scoreMod);

    potentialString.innerHTML = `P值: ${chartPotential}<br>`;
    scoreString.innerHTML = `<em>分數P值 + ${getChartConstant()} = ${chartPotential} => 分數P值 = ${roundToPrecision(scoreMod, 2)}</em><br>` +
        (score > 10000000 ? "P值設定過高!<br>" : `分數 = ${addCommaSeparator(score)} (${getGradeFromScore(score)})<br>`) +
        `<em>步數 = (2.45 * sqrt(${chartPotential}) + 2.5) * Step倍率` + 
        ` => ${roundToPrecision(2.45 * Math.sqrt(chartPotential) + 2.5, 2)} * ${getPartnerStepStat() / 50}</em><br>` +
        `步數 = ${roundToPrecision(getStepsFromPotential(chartPotential), 2)}`;
}

function calculateChart() {
    let chartArray = new Array();

    function addRowInvalid(notes) {
        chartArray.push(["-", "-", "-", notes]);
    }

    function calculateRow(steps, type, successNotes) {
        // Because Step shown is rounded down apparently
        let scoreMod = getScoreModFromSteps(steps, getPartnerStepStat() + (type == "low" ? 0 : 1));

        if (scoreMod === null || scoreMod < -9500000 / 300000)
            addRowInvalid(type == "low" ? "停不在指定階前" : "停不在指定階內");
        else if (scoreMod > 2)
            addRowInvalid(type == "low" ? "停不在指定階內" : "跳不過指定階");
        else
            chartArray.push([getScoreFromScoreMod(scoreMod), steps, getPotentialFromScoreMod(scoreMod), successNotes]);
    }

    if (getIsAvoid()) {
        calculateRow(getStepsToTile() - 0.1, "low", "保險最高能停在指定階前的分數");
        calculateRow(getStepsToTile() + getStepsInTargetTile(), "high", "保險最低能跳過指定階的分數");
    } else {
        calculateRow(getStepsToTile(), "low", "保險最低能進到指定階的分數");
        calculateRow(getStepsToTile() + getStepsInTargetTile() - 0.1, "high", "保險最高能進到指定階的分數");
    }

    let str = "";

    for (let row of chartArray) {
        str += "<tr>";
        for (let i = 0; i < row.length; i++) {
            if ((typeof row[i]) === "number") {
                if (i == 0) {
                    str += `<td>${addCommaSeparator(roundToPrecision(row[i], 1))}</td>`;
                } else {
                    str += `<td>${addCommaSeparator(roundToPrecision(row[i], 2))}</td>`;
                }
            } else {
                str += `<td>${row[i]}</td>`;
            }
        }
        str += "</tr>";
    }

    document.querySelector("#table-chart").innerHTML = str;
}

main();