"use strict";
const pathElems = document.getElementsByClassName("path");
const userStepsElem = document.getElementById("user-steps");
let totalSteps = 0;
for (let i = 0; i < pathElems.length; i++) {
    const pathElem = pathElems[i];
    const statsData = JSON.parse(pathElem.getAttribute("stats-data"));
    let steps = 0;
    for (let j = 0; j < statsData.length; j++) {
        const stat = statsData[j];
        steps += Number(stat.Count) * Number(stat.StepEquivalent);
    }
    const pathStepsElem = pathElem.querySelector(".path-steps");
    pathStepsElem.innerText = "steps: " + steps.toString();
    totalSteps += steps;
}
userStepsElem.innerText = "steps: " + totalSteps.toString();
