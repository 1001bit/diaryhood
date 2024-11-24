"use strict";
const titleElem = document.getElementById("title");
const pathNameElem = document.getElementById("path-name");
const pathPublicElem = document.getElementById("path-public");
const editElem = document.getElementById("edit");
const cancelElem = document.getElementById("cancel");
const saveElem = document.getElementById("save");
const pathNameInputElem = document.getElementById("path-name-input");
const pathPublicToggleElem = document.getElementById("path-public-toggle");
const statsElem = document.getElementById("stats");
const sampleStatElem = document.getElementById("sample-stat");
const createStatElem = document.getElementById("create-stat");
const statNameInputElem = document.getElementById("stat-name-input");
const statStepEqInputElem = document.getElementById("stat-stepeq-input");
const createStatButtonElem = document.getElementById("create-stat-button");
editElem.addEventListener("click", () => {
    edit();
});
saveElem.addEventListener("click", () => {
    save();
});
cancelElem.addEventListener("click", () => {
    cancel();
});
pathPublicToggleElem.addEventListener("click", () => {
    if (pathPublicToggleElem.innerText == "true") {
        pathPublicToggleElem.innerText = "false";
    }
    else {
        pathPublicToggleElem.innerText = "true";
    }
});
pathNameInputElem.addEventListener("input", () => {
    saveElem.innerText = "save";
});
setRemoveStyleOnFocus(pathNameInputElem);
function edit() {
    createStatElem.removeAttribute("style");
    pathNameElem.setAttribute("style", "display: none");
    pathNameInputElem.removeAttribute("style");
    pathNameInputElem.value = pathNameElem.innerText;
    pathPublicElem.setAttribute("style", "display: none");
    pathPublicToggleElem.removeAttribute("style");
    pathPublicToggleElem.innerText = pathPublicElem.innerText;
    cancelElem.removeAttribute("style");
    saveElem.removeAttribute("style");
    editElem.setAttribute("style", "display: none");
}
function cancel() {
    createStatElem.setAttribute("style", "display: none");
    pathNameElem.removeAttribute("style");
    pathNameInputElem.setAttribute("style", "display: none");
    pathPublicElem.removeAttribute("style");
    pathPublicToggleElem.setAttribute("style", "display: none");
    cancelElem.setAttribute("style", "display: none");
    saveElem.setAttribute("style", "display: none");
    editElem.removeAttribute("style");
}
function save() {
    const oldName = pathNameElem.innerText;
    const oldPublic = pathPublicElem.innerText == "true";
    const newName = pathNameInputElem.value;
    const newPublic = pathPublicToggleElem.innerText == "true";
    if (oldName == newName && oldPublic == newPublic) {
        cancel();
        return;
    }
    fetch(`/api/path/${pathId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: newName,
            public: newPublic,
        }),
    }).then((res) => {
        switch (res.status) {
            case 200:
                pathNameElem.innerText = newName;
                setPathTitle(newName);
                pathPublicElem.innerText = newPublic ? "true" : "false";
                cancel();
                break;
            case 400:
                saveElem.innerText = "no special characters";
                setElemColor(pathNameInputElem, "err");
                break;
            case 409:
                saveElem.innerText = "path already exists";
                setElemColor(pathNameInputElem, "err");
                break;
            default:
                saveElem.innerText = "error";
                setElemColor(pathNameInputElem, "err");
                break;
        }
    });
}
createStatButtonElem.addEventListener("click", () => {
    const name = statNameInputElem.value;
    const stepEq = statStepEqInputElem.value;
    console.log(name, stepEq);
});
const pathId = window.location.pathname.split("/").pop();
function setPathTitle(title) {
    titleElem.innerText = title;
    document.title = title;
}
function newStatCard(stat) {
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
        statsElem.insertBefore(statElem, statsElem.firstChild);
    }
}
function renderStatsInfo(data) {
    pathNameElem.innerText = data.path.name;
    pathPublicElem.innerText = data.path.public ? "true" : "false";
    if (data.editRight) {
        editElem.removeAttribute("style");
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
