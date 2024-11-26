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
removeBorderColorOnFocus(pathNameInput);
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
    setVisibility(pathDataElem, true);
    setVisibility(createStatElem, true);
}
function cancel() {
    editing = false;
    editButton.innerText = "edit";
    setVisibility(pathDataElem, false);
    setVisibility(createStatElem, false);
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
                setBorderColor(pathNameInput, "err");
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
                    setPageTitle(newName);
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
                setBorderColor(deleteButton, "err");
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
function postPath(name, stepEq) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(name, stepEq, pathId);
        return fetch(`/api/path/${pathId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name,
                stepEq: stepEq,
            }),
        }).then((res) => {
            switch (res.status) {
                case 200:
                    return "";
                case 400:
                    return "special characters";
                case 409:
                    return "already exists";
                case 401:
                    return "unauthorized";
                default:
                    return "error";
            }
        });
    });
}
function renderNewStat(name, stepEq) {
    const newStatElem = newStatCard({
        name: name,
        count: 0,
        stepEquivalent: stepEq,
    });
    statsElem.insertBefore(newStatElem, statsElem.firstChild);
}
removeBorderColorOnFocus(statNameInputElem);
removeBorderColorOnFocus(statStepEqInputElem);
statNameInputElem.addEventListener("input", () => {
    createStatButtonElem.innerText = "create";
});
statStepEqInputElem.addEventListener("input", () => {
    createStatButtonElem.innerText = "create";
});
createStatButtonElem.addEventListener("click", () => {
    const name = statNameInputElem.value;
    const stepEq = Number(statStepEqInputElem.value);
    if (!stepEq) {
        createStatButtonElem.innerText = "wrong step eq.";
        setBorderColor(statStepEqInputElem, "err");
        return;
    }
    postPath(name, Number(stepEq)).then((res) => {
        if (res == "") {
            statNameInputElem.value = "";
            statStepEqInputElem.value = "";
            renderNewStat(name, stepEq);
        }
        else {
            createStatButtonElem.innerText = res;
            setBorderColor(statNameInputElem, "err");
        }
    });
});
const pathId = window.location.pathname.split("/").pop();
function newStatCard(stat) {
    const newStatElem = sampleStatElem.cloneNode(true);
    newStatElem.removeAttribute("id");
    setVisibility(newStatElem, true);
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
    setPageTitle(data.path.name);
    renderStats(data.path.stats);
    if (data.editRight) {
        setVisibility(editButton, true);
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
function setBorderColor(elem, colorVar) {
    if (!elem) {
        return;
    }
    elem.style.borderColor = `var(--${colorVar})`;
}
function removeBorderColorOnFocus(elem) {
    if (!elem) {
        return;
    }
    elem.addEventListener("focus", () => {
        elem.style.borderColor = "";
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
const titleElem = document.getElementById("title");
function setPageTitle(title) {
    titleElem.innerText = title;
    document.title = title;
}
function setVisibility(elem, visible) {
    if (elem) {
        elem.classList.toggle("hidden", !visible);
    }
}
