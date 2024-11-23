"use strict";
let editMode = false;
const pathEditElem = document.getElementById("path-edit");
pathEditElem.addEventListener("click", () => {
    switch (editMode) {
        case false:
            editModeOn();
            editMode = true;
            break;
        case true:
            editModeOff();
            editMode = false;
            break;
    }
});
const pathNameElem = document.getElementById("path-name");
const pathNameInputElem = document.getElementById("path-name-input");
const pathPublicElem = document.getElementById("path-public");
const pathPublicToggleElem = document.getElementById("path-public-toggle");
pathPublicToggleElem.addEventListener("click", () => {
    pathPublicToggleElem.innerText =
        pathPublicToggleElem.innerText == "true" ? "false" : "true";
});
const createStatElem = document.getElementById("create-stat");
function editModeOn() {
    createStatElem.removeAttribute("style");
    pathNameElem.setAttribute("style", "display: none");
    pathNameInputElem.removeAttribute("style");
    pathNameInputElem.value = pathNameElem.innerText;
    pathPublicElem.setAttribute("style", "display: none");
    pathPublicToggleElem.removeAttribute("style");
    pathPublicToggleElem.innerText = pathPublicElem.innerText;
}
function editModeOff() {
    createStatElem.setAttribute("style", "display: none");
    pathNameElem.removeAttribute("style");
    pathNameInputElem.setAttribute("style", "display: none");
    pathPublicElem.removeAttribute("style");
    pathPublicToggleElem.setAttribute("style", "display: none");
}
const pathId = window.location.pathname.split("/").pop();
function setPathTitle(title) {
    const titleElem = document.getElementById("title");
    titleElem.innerText = title;
    document.title = title;
}
function newStatCard(stat) {
    const sampleStatElem = document.getElementById("sample-stat");
    const newStatElem = sampleStatElem.cloneNode(true);
    newStatElem.removeAttribute("id");
    newStatElem.removeAttribute("style");
    const statNameElem = newStatElem.getElementsByClassName("stat-name")[0];
    const statStepEqElem = newStatElem.getElementsByClassName("stat-stepeq")[0];
    const statCountElem = newStatElem.getElementsByClassName("stat-count")[0];
    statNameElem.innerText = stat.name;
    statStepEqElem.innerText = "= " + stat.stepEquivalent.toString() + " steps";
    statCountElem.value = stat.count.toString();
    return newStatElem;
}
function renderStats(stats) {
    const statsElem = document.getElementById("stats");
    for (const stat of stats) {
        const statElem = newStatCard(stat);
        statsElem.insertBefore(statElem, statsElem.firstChild);
    }
}
function renderStatsInfo(data) {
    const pathNameElem = document.getElementById("path-name");
    const pathPublicElem = document.getElementById("path-public");
    const pathEditElem = document.getElementById("path-edit");
    pathNameElem.innerText = data.path.name;
    pathPublicElem.innerText = data.path.public ? "true" : "false";
    if (data.editRight) {
        pathEditElem.removeAttribute("style");
    }
}
function handlePathData(data) {
    setPathTitle(data.path.name);
    renderStats(data.path.stats);
    renderStatsInfo(data);
}
fetch(`/api/path/${pathId}`, {
    method: "GET",
})
    .then((res) => {
    if (res.status == 200) {
        return res.json();
    }
    return {
        path: {
            name: "not found",
            public: false,
            stats: [],
        },
        editRight: false,
    };
})
    .then((data) => {
    handlePathData(data);
});
function setElemColor(elem, colorVar) {
    if (!elem) {
        return;
    }
    elem.style.border = `2px solid var(--${colorVar})`;
}
function setRemoveStyleOnFocus(elem) {
    if (!elem) {
        return;
    }
    elem.addEventListener("focus", () => {
        elem.removeAttribute("style");
    });
}
