"use strict";
const pathId = window.location.pathname.split("/").pop();
let editMode = false;
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
function editModeOn() {
    const pathNameElem = document.getElementById("path-name");
    const pathPublicElem = document.getElementById("path-public");
    const createStatElem = document.getElementById("create-stat");
    createStatElem.removeAttribute("style");
    console.log("edit on");
}
function editModeOff() {
    const pathNameElem = document.getElementById("path-name");
    const pathPublicElem = document.getElementById("path-public");
    const createStatElem = document.getElementById("create-stat");
    createStatElem.setAttribute("style", "display: none");
    console.log("edit off");
}
function toggleEdit() {
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
}
function renderStatsInfo(data) {
    const pathNameElem = document.getElementById("path-name");
    const pathPublicElem = document.getElementById("path-public");
    const pathEditElem = document.getElementById("path-edit");
    pathNameElem.innerText = data.path.name;
    pathPublicElem.innerText = data.path.public ? "true" : "false";
    if (data.editRight) {
        pathEditElem.removeAttribute("style");
        pathEditElem.addEventListener("click", toggleEdit);
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
    location.replace("/404");
    return [];
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
