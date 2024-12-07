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
class PathDeletor {
    constructor(pathId) {
        this.pathId = pathId;
        this.askedIfSure = false;
        this.initEvents();
    }
    initEvents() {
        deleteButton.addEventListener("click", () => {
            if (!this.askedIfSure) {
                deleteButton.innerText = "sure?";
                this.askedIfSure = true;
                return;
            }
            refreshIfNotAuthNd().then((_res) => {
                this.deletePath().then((err) => {
                    if (err != "") {
                        deleteButton.innerText = err;
                        setBorderColor(deleteButton, "err");
                        return;
                    }
                    window.location.replace("/user");
                });
            });
        });
        editButton.addEventListener("click", () => {
            this.cancelDelete();
        });
        saveButton.addEventListener("click", () => {
            this.cancelDelete();
        });
    }
    cancelDelete() {
        this.askedIfSure = false;
        deleteButton.innerText = "delete";
    }
    deletePath() {
        return __awaiter(this, void 0, void 0, function* () {
            return fetch(`/api/path/${this.pathId}`, {
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
}
const editSectionElem = document.getElementById("edit-section");
const pathDataElem = document.getElementById("path-data");
const editButton = document.getElementById("edit");
const pathNameInput = document.getElementById("path-name");
const pathPublicButton = document.getElementById("path-public");
const saveButton = document.getElementById("save");
const deleteButton = document.getElementById("delete");
const statsElem = document.getElementById("stats");
const sampleStatElem = document.getElementById("sample-stat");
const sampleEditStatElem = document.getElementById("sample-edit-stat");
class PathEditor {
    constructor(path) {
        this.path = path;
        this.newName = "";
        this.newPublic = false;
        this.initEvents();
        removeBorderColorOnFocus(pathNameInput);
    }
    initEvents() {
        editButton.addEventListener("click", () => {
            this.initNewData();
        });
        pathPublicButton.addEventListener("click", () => {
            this.newPublic = !this.newPublic;
            pathPublicButton.innerText = this.newPublic ? "true" : "false";
            this.updateNewData();
        });
        pathNameInput.addEventListener("input", () => {
            this.newName = pathNameInput.value;
            this.updateNewData();
        });
        saveButton.addEventListener("click", () => {
            this.save();
        });
    }
    initNewData() {
        this.newName = this.path.name;
        pathNameInput.value = this.newName;
        this.newPublic = this.path.isPublic;
        pathPublicButton.innerText = this.newPublic ? "true" : "false";
        this.updateNewData();
    }
    updateNewData() {
        saveButton.innerText = "save";
        if (this.newName == this.path.name &&
            this.newPublic == this.path.isPublic) {
            setVisibility(saveButton, false);
        }
        else {
            setVisibility(saveButton, true);
        }
    }
    save() {
        this.newName = pathNameInput.value;
        this.newPublic = pathPublicButton.innerText == "true";
        if (this.newName == "") {
            setBorderColor(pathNameInput, "err");
            saveButton.innerText = "empty name";
            return;
        }
        refreshIfNotAuthNd().then((_res) => {
            this.postNewData().then((err) => {
                if (err != "") {
                    saveButton.innerText = err;
                    setBorderColor(pathNameInput, "err");
                }
                else {
                    this.updateNewData();
                }
            });
        });
    }
    postNewData() {
        return __awaiter(this, void 0, void 0, function* () {
            return fetch(`/api/path/${this.path.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: this.newName,
                    public: this.newPublic,
                }),
            }).then((res) => {
                switch (res.status) {
                    case 200:
                        this.path.name = this.newName;
                        this.path.isPublic = this.newPublic;
                        setPageTitle(this.newName);
                        return "";
                    case 400:
                        return "special characters";
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
}
class PageStat {
    constructor(stat, editRight) {
        this.stat = stat;
        this.statElem = null;
        this.countInput = null;
        this.initStatElem(stat);
        this.editStatElem = null;
        this.stepEqInput = null;
        if (editRight)
            this.initStatEditElem(stat);
    }
    initStatElem(stat) {
        this.statElem = sampleStatElem.cloneNode(true);
        this.statElem.removeAttribute("id");
        setVisibility(this.statElem, true);
        const statNameElem = this.statElem.getElementsByClassName("stat-name")[0];
        const statStepEqElem = this.statElem.getElementsByClassName("stat-stepeq")[0];
        this.countInput = new NumberInput(this.statElem.getElementsByClassName("stat-count-input")[0]);
        statNameElem.innerText = stat.name;
        statStepEqElem.innerText =
            "= " + stat.stepEquivalent.toString() + " steps";
        this.countInput.setValue(stat.count);
    }
    initStatEditElem(stat) {
        this.editStatElem = sampleEditStatElem.cloneNode(true);
        this.editStatElem.removeAttribute("id");
        const deleteButton = this.editStatElem.getElementsByClassName("delete-stat-button")[0];
        setVisibility(deleteButton, true);
        const statNameInput = this.editStatElem.getElementsByClassName("stat-name-input")[0];
        this.stepEqInput = new NumberInput(this.editStatElem.getElementsByClassName("stat-stepeq-input")[0]);
        statNameInput.value = stat.name;
        this.stepEqInput.setValue(stat.stepEquivalent);
    }
    initEvents() {
        if (!this.statElem || !this.editStatElem)
            return;
        const statNameInput = this.editStatElem.getElementsByClassName("stat-name-input")[0];
        const statStepEqInput = this.editStatElem.getElementsByClassName("stat-stepeq-input")[0];
    }
}
class StatsManager {
    constructor() {
        this.stats = [];
    }
    renderStats(stats, editRight) {
        if (!stats)
            return;
        for (const stat of stats) {
            const pageStat = new PageStat(stat, editRight);
            this.stats.push(pageStat);
            if (pageStat.statElem) {
                statsElem.insertBefore(pageStat.statElem, statsElem.firstChild);
            }
            if (pageStat.editStatElem) {
                statsElem.insertBefore(pageStat.editStatElem, statsElem.firstChild);
            }
        }
    }
    setEditMode(mode) {
        for (const stat of this.stats) {
            setVisibility(stat.statElem, !mode);
            setVisibility(stat.editStatElem, mode);
        }
    }
}
class Path {
    constructor(id) {
        this.id = id;
        this.name = "";
        this.isPublic = false;
        this.statsManager = new StatsManager();
        this.fetchPath();
    }
    handleFetchedData(data) {
        setPageTitle(data.path.name);
        this.statsManager.renderStats(data.path.stats, data.editRight);
        if (data.editRight) {
            setVisibility(editButton, true);
            this.isPublic = data.path.public;
            this.name = data.path.name;
        }
    }
    fetchPath() {
        refreshIfNotAuthNd().then((_res) => {
            fetch(`/api/path/${this.id}`, {
                method: "GET",
            }).then((res) => {
                switch (res.status) {
                    case 200:
                        res.json().then((res) => {
                            this.handleFetchedData(res);
                        });
                        break;
                    case 404:
                        window.location.replace("/404");
                        break;
                    default:
                        break;
                }
            });
        });
    }
}
const path = new Path(window.location.pathname.split("/").pop() || "0");
const deletor = new PathDeletor(path.id);
const editor = new PathEditor(path);
let editing = false;
editButton.addEventListener("click", () => {
    editing ? cancelEdit() : startEdit();
    path.statsManager.setEditMode(editing);
});
function startEdit() {
    editing = true;
    editButton.innerText = "cancel";
    setVisibility(pathDataElem, true);
}
function cancelEdit() {
    editing = false;
    editButton.innerText = "edit";
    setVisibility(pathDataElem, false);
}
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
class NumberInput {
    constructor(elem) {
        this.inputElem = elem.getElementsByTagName("input")[0];
        this.plus = elem.getElementsByClassName("plus")[0];
        this.minus = elem.getElementsByClassName("minus")[0];
        this.initEvents();
    }
    initEvents() {
        this.plus.addEventListener("click", () => {
            this.inputElem.value = (Number(this.inputElem.value) + 1).toString();
        });
        this.minus.addEventListener("click", () => {
            this.inputElem.value = (Number(this.inputElem.value) - 1).toString();
        });
        this.inputElem.addEventListener("input", () => {
            this.inputElem.value = this.inputElem.value.replace(/[^0-9]/g, "");
        });
    }
    setValue(value) {
        this.inputElem.value = value.toString();
    }
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
