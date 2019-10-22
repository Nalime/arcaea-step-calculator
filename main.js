function main() {
    document.querySelector("#button-calculate").onclick = (e) => calculateChart();
}

function getIsAvoid() {
    let option = document.querySelector("#is-avoid").value;

    if (option == "Avoid")
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
    return scoreMod < 1.5 ? scoreMod * 300000 + 9500000 : (scoreMod - 1.5) * 50000 + 9950000;
}

function getScoreModFromScore(score) {
    if (score < 9950000)
        return (score - 9500000) / 300000;
    else if (score < 10000000)
        return (score - 9950000) / 50000 + 1.5;
    else
        return 2;
}

// Need to test for return > 2 or < -31.666
function getScoreModFromSteps(targetSteps) {
    if (50 * targetSteps / getPartnerStepStat() < 2.5)
        return null;
    return Math.pow(((50 * targetSteps / getPartnerStepStat() - 2.5) / 2.45), 2) - getChartConstant();
}

function getPotentialFromScoreMod(scoreMod) {
    return Math.max(getChartConstant() + Math.min(scoreMod, 2), 0);
}

function calculateChart() {
    let chartArray = new Array();

    function addRowInvalid(notes) {
        chartArray.push(["-", "-", "-", notes]);
    }

    function calculateRow(steps, lowNotes, highNotes, successNotes) {
        let scoreMod = getScoreModFromSteps(steps);

        if (scoreMod === null || scoreMod < -9500000/300000)
            addRowInvalid(lowNotes);
        else if (scoreMod > 2)
            addRowInvalid(highNotes);
        else
            chartArray.push([getScoreFromScoreMod(scoreMod), steps, getPotentialFromScoreMod(scoreMod), successNotes]);
    }

    if (getIsAvoid()) {
        calculateRow(getStepsToTile() - 0.1, 
            "Cannot stop before the tile", "Cannot reach the tile", "Highest score to stop before the tile");
        calculateRow(getStepsToTile() + getStepsInTargetTile(), 
            "Cannot stop in the tile", "Cannot skip over the tile", "Lowest score to stop before the tile");
    } else {
        calculateRow(getStepsToTile(), 
            "Cannot stop before the tile", "Cannot reach the tile", "Lowest score to enter the tile");
        calculateRow(getStepsToTile() + getStepsInTargetTile() - 0.1, 
            "Cannot stop in the tile", "Cannot skip over the tile", "Highest score to enter the tile");
    }

    // score = getScoreFromScoreMod(-getChartConstant());

    // chartArray.push([score, getPartnerStepStat() / 20, 0, "Highest score to have zero chart potential"])

    // let scoreStep = 100000;
    // for (score += score % scoreStep == 0 ? scoreStep : -score % scoreStep; score <= 10000000; score += 100000) {
    //     scoreMod = getScoreModFromScore(score);
    //     potential = getPotentialFromScoreMod(scoreMod);
    //     chartArray.push([score == 10000000 ? "10000000+" : score, 
    //         getStepsFromPotential(potential), potential, score == 10000000 ? "Pure Memory" : ""]);
    // }

    let str = "";

    for (let row of chartArray) {
        console.log(row);
        str += "<tr>";
        for (let cnt of row) {
            str += `<td>${(typeof cnt) === "number" ? Math.round(cnt * 100) / 100 : cnt}</td>`;
        }
        str += "</tr>";
    }

    document.querySelector("#table-chart").innerHTML = str;
}

main();