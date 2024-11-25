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
const editSectionElem = document.getElementById("edit-section");
const pathDataElem = document.getElementById("path-data");
const editButton = document.getElementById("edit");
const pathNameInput = document.getElementById("path-name");
const pathPublicButton = document.getElementById("path-public");
const saveButton = document.getElementById("save");
const deleteButton = document.getElementById("delete");
const statsElem = document.getElementById("stats");
const sampleStatElem = document.getElementById("sample-stat");
const createStatElem = document.getElementById("create-stat");
const statNameInputElem = document.getElementById("stat-name-input");
const statStepEqInputElem = document.getElementById("stat-stepeq-input");
const createStatButtonElem = document.getElementById("create-stat-button");
setRemoveStyleOnFocus(pathNameInput);
let pathData = {
    name: "",
    isPublic: false,
};
function setPathData(name, isPublic) {
    pathData.name = name;
    pathData.isPublic = isPublic;
    pathNameInput.value = name;
    pathPublicButton.innerText = isPublic ? "true" : "false";
}
let editing = false;
editButton.addEventListener("click", () => {
    editing ? cancel() : edit();
});
function edit() {
    editing = true;
    editButton.innerText = "cancel";
    pathDataElem.removeAttribute("style");
    createStatElem.removeAttribute("style");
}
function cancel() {
    editing = false;
    editButton.innerText = "edit";
    pathDataElem.setAttribute("style", "display: none");
    createStatElem.setAttribute("style", "display: none");
    deleteButton.innerText = "delete";
    askedIfSure = false;
}
pathPublicButton.addEventListener("click", () => {
    pathPublicButton.innerText =
        pathPublicButton.innerText == "true" ? "false" : "true";
});
pathNameInput.addEventListener("input", () => {
    saveButton.innerText = "save";
});
saveButton.addEventListener("click", save);
function save() {
    const newName = pathNameInput.value;
    const newPublic = pathPublicButton.innerText == "true";
    if (pathData.name == newName && pathData.isPublic == newPublic) {
        cancel();
        return;
    }
    refreshIfNotAuthNd().then((_res) => {
        updatePath(newName, newPublic).then((err) => {
            if (err != "") {
                saveButton.innerText = err;
                setElemColor(pathNameInput, "err");
            }
        });
    });
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
                    setPathData(newName, newPublic);
                    setPathTitle(newName);
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
let askedIfSure = false;
deleteButton.addEventListener("click", () => {
    if (!askedIfSure) {
        deleteButton.innerText = "sure?";
        askedIfSure = true;
        return;
    }
    refreshIfNotAuthNd().then((_res) => {
        deletePath().then((err) => {
            if (err != "") {
                deleteButton.innerText = err;
                setElemColor(deleteButton, "err");
                return;
            }
            window.location.replace("/user");
        });
    });
});
function deletePath() {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch(`/api/path/${pathId}`, {
            method: "DELETE",
        }).then((res) => {
            switch (res.status) {
                case 200:
                    return "";
                case 401:
                    return "unauthorized";
                default:
                    return "error";
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
function handlePathData(data) {
    setPathTitle(data.path.name);
    renderStats(data.path.stats);
    if (data.editRight) {
        editButton.removeAttribute("style");
        setPathData(data.path.name, data.path.public);
    }
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
