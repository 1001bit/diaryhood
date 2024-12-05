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
const createStatElem = document.getElementById("create-stat");
const statNameInputElem = document.getElementById("stat-name-input");
const statStepEqInputElem = document.getElementById("stat-stepeq-input");
const createStatButtonElem = document.getElementById("create-stat-button");
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
class Path {
    constructor(id) {
        this.id = id;
        this.name = "";
        this.isPublic = false;
        this.stats = [];
        this.fetchPath();
    }
    newStatCard(stat) {
        const newStatElem = sampleStatElem.cloneNode(true);
        newStatElem.removeAttribute("id");
        setVisibility(newStatElem, true);
        const statNameElem = newStatElem.getElementsByClassName("stat-name")[0];
        const statStepEqElem = newStatElem.getElementsByClassName("stat-stepeq")[0];
        const statCountElem = newStatElem.getElementsByClassName("stat-count")[0];
        statNameElem.innerText = stat.name;
        statStepEqElem.innerText =
            "= " + stat.stepEquivalent.toString() + " steps";
        statCountElem.value = stat.count.toString();
        return newStatElem;
    }
    renderStats(stats) {
        if (!stats)
            return;
        for (const stat of stats) {
            const statElem = this.newStatCard(stat);
            statsElem.insertBefore(statElem, statsElem.firstChild);
        }
    }
    handleFetchedData(data) {
        setPageTitle(data.path.name);
        this.renderStats(data.path.stats);
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
});
function startEdit() {
    editing = true;
    editButton.innerText = "cancel";
    setVisibility(pathDataElem, true);
    setVisibility(createStatElem, true);
}
function cancelEdit() {
    editing = false;
    editButton.innerText = "edit";
    setVisibility(pathDataElem, false);
    setVisibility(createStatElem, false);
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
