let isAvoid = false;
let stepsToTile = 4.5;
let stepsInTargetTile = 5;
let partnerStepStat = 50;
let chartConstant = 9;

const enterLowText = "Lowest score to enter the tile";
const enterLowFailText = "Cannot stop before the tile";
const enterHighText = "Highest score to not skip over the tile";
const enterHighFailText = "Will not skip over the tile";
const avoidLowText = "Highest score to stop before the tile";
const avoidLowFailText = "Cannot stop before the tile";
const avoidHighText = "Lowest score to skip over the tile";
const avoidHighFailText = "Cannot skip over the tile";
const zeroPotentialText = "Highest score for 0 chart potential";
const pureMemoryText = "Pure Memory";

// Need to test for return > 2 or < -31.666
function calculateScoreModFromSteps(targetSteps) {
    return ((50 * targetSteps) / partnerStepStat - 2.5) / 2.45 - chartConstant;
}

// Return -1 if computed score < 0, -2 if computed score > 10M
function calculateScoreFromMod(scoreMod) {
    let score = scoreMod < 1.5 ? scoreMod / 300000 + 9500000 : (scoreMod - 1.5) / 50000 + 9950000;

    if (score > 10000000) return -2;
    else if (score < 0) return -1;
    else return score;
}

function calculateChartPotential(scoreMod) {
    return math.max(chartConstant + math.min(scoreMod, 2), 0);
}

// Return 0 = nothing special, -1 = too low, -2 = too high
function writeChartRow(steps, notes) {
    let scoreMod = calculateScoreModFromSteps(steps);
    let score = calculateScoreFromMod(scoreMod);

    if (score < 0) return score;
    if (score === -1) {
        // can't stop before the tile
    } else if (score === -2) {
        // can't reach the tile at all
    }

    let potential = calculateChartPotential(scoreMod);

    chartArray.push(new ChartRow(score, steps, potential, notes))

    return 0;
}

class ChartRow {
    constructor(score, steps, potential, notes = "") {
        this.score = score;
        this.steps = steps;
        this.potential = potential;
        this.notes = notes;
    }
}

function calculateChart(){
    let chartArray = new Array();
    let result;
    let steps, scoreMod, score, potential;
    let canLow = true, canHigh = true;

    if (isAvoid) {

        if ((result = writeChartRow(steps, avoidLowText)) == -1) {
            chartArray.push(new ChartRow("-", "-", "-", "Highest score to avoid the tile"));
        }
        steps = stepsToTile - 0.1
        scoreMod = calculateScoreModFromSteps(steps);
        score = calculateScoreFromMod(scoreMod);

        if (score === -1) {
            // can't stop before the tile
        } else if (score === -2) {
            // can't reach the tile at all
        }

        potential = calculateChartPotential(scoreMod);

        chartArray.push(new ChartRow(score, steps, potential, "Highest score to avoid the tile"))
    }
}