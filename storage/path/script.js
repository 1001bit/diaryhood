"use strict";
const titleElem = document.getElementById("title");
const statsElem = document.getElementById("stats");
const pathId = window.location.pathname.split("/").pop();
function setPathTitle(title) {
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
    for (const stat of stats) {
        const statElem = newStatCard(stat);
        statsElem.appendChild(statElem);
    }
}
function handlePathData(data) {
    setPathTitle(data.path.name);
    renderStats(data.path.stats);
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
