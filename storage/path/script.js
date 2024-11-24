"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function updatePath(newName, newPublic) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch(`/api/path/${pathId}`, {
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
                    return "";
                case 400:
                    return "no special characters";
                case 409:
                    return "path already exists";
                case 401:
                    return "unauthorized";
                default:
                    return "error";
            }
        });
    });
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
    refreshIfNotAuthNd().then((_res) => {
        updatePath(newName, newPublic).then((err) => {
            if (err != "") {
                saveElem.innerText = err;
                setElemColor(pathNameInputElem, "err");
            }
        });
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
    if (!stats)
        return;
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
function renderPath() {
    fetch(`/api/path/${pathId}`, {
        method: "GET",
    }).then((res) => {
        switch (res.status) {
            case 200:
                res.json().then(handlePathData);
                break;
            case 404:
                window.location.replace("/404");
                break;
            default:
                break;
        }
    });
}
refreshIfNotAuthNd().then((_res) => {
    renderPath();
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
function refreshIfNotAuthNd() {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch("/authenticated", {
            method: "GET",
        }).then((res) => {
            if (res.status == 401) {
                return fetch("/auth/refresh", {
                    method: "GET",
                }).then((res) => {
                    if (res.status == 200) {
                        return true;
                    }
                    return false;
                });
            }
            return true;
        });
    });
}
