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
const pathSaveButton = document.getElementById("save");
const pathDeleteButton = document.getElementById("delete");
const statsElem = document.getElementById("stats");
const sampleStatElem = document.getElementById("sample-stat");
const sampleEditStatElem = document.getElementById("sample-edit-stat");
const statCreateBoxElem = document.getElementById("stat-create");
const createStatNameInput = document.getElementById("create-stat-name");
const createStatButton = document.getElementById("create-stat-button");
const pathStepsElem = document.getElementById("path-steps");
const ownerElem = document.getElementById("path-owner");
class PathDeleter {
    constructor(pathId) {
        this.pathId = pathId;
        this.askedIfSure = false;
        this.initEvents();
    }
    initEvents() {
        pathDeleteButton.addEventListener("click", () => {
            if (!this.askedIfSure) {
                pathDeleteButton.innerText = "sure?";
                this.askedIfSure = true;
                return;
            }
            this.deletePath().then((err) => {
                if (err != "") {
                    pathDeleteButton.innerText = err;
                    setBorderColor(pathDeleteButton, "err");
                    return;
                }
                window.location.replace("/user");
            });
        });
        editButton.addEventListener("click", () => {
            this.cancelDelete();
        });
        pathSaveButton.addEventListener("click", () => {
            this.cancelDelete();
        });
    }
    cancelDelete() {
        this.askedIfSure = false;
        pathDeleteButton.innerText = "delete";
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
                        return refresh().then((authd) => {
                            if (authd) {
                                return this.deletePath();
                            }
                            return "unauthorized";
                        });
                    default:
                        return "error";
                }
            });
        });
    }
}
class PathEditor {
    constructor(path) {
        this.path = path;
        this.initEvents();
        removeBorderColorOnFocus(pathNameInput);
    }
    initEvents() {
        editButton.addEventListener("click", () => {
            pathNameInput.value = this.path.name;
            pathPublicButton.innerText = this.path.isPublic ? "true" : "false";
            this.showSaveButtonIfChanged();
        });
        pathPublicButton.addEventListener("click", () => {
            const newPublic = pathPublicButton.innerText != "true";
            pathPublicButton.innerText = newPublic ? "true" : "false";
            this.showSaveButtonIfChanged();
        });
        pathNameInput.addEventListener("input", () => {
            this.showSaveButtonIfChanged();
        });
        pathSaveButton.addEventListener("click", () => {
            this.save();
        });
    }
    showSaveButtonIfChanged() {
        pathSaveButton.innerText = "save";
        const newName = pathNameInput.value;
        const newPublic = pathPublicButton.innerText == "true";
        if (newName == this.path.name && newPublic == this.path.isPublic) {
            setVisibility(pathSaveButton, false);
        }
        else {
            setVisibility(pathSaveButton, true);
        }
    }
    save() {
        if (pathNameInput.value == "") {
            setBorderColor(pathNameInput, "err");
            pathSaveButton.innerText = "empty name";
            return;
        }
        this.postNewData().then((err) => {
            if (err != "") {
                pathSaveButton.innerText = err;
                setBorderColor(pathNameInput, "err");
                return;
            }
            this.showSaveButtonIfChanged();
        });
    }
    postNewData() {
        return __awaiter(this, void 0, void 0, function* () {
            const newName = pathNameInput.value;
            const newPublic = pathPublicButton.innerText == "true";
            return fetch(`/api/path/${this.path.id}`, {
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
                        this.path.name = newName;
                        this.path.isPublic = newPublic;
                        setPageTitle(newName);
                        return "";
                    case 400:
                        return "special characters";
                    case 409:
                        return "path already exists";
                    case 401:
                        return refresh().then((authd) => {
                            if (authd) {
                                return this.postNewData();
                            }
                            return "unauthorized";
                        });
                    default:
                        return "error";
                }
            });
        });
    }
}
class Stat {
    constructor(stat, editRight, pathId) {
        this.stat = stat;
        this.newCount = stat.count;
        this.steps = 0;
        this.stepsUpdateCallback = () => { };
        this.statElems = this.newStatElems(this.stat, editRight);
        this.editStatElems = editRight ? this.newEditStatElems(stat) : null;
        this.updateStatElems(this.stat);
        this.initEvents();
        if (this.editStatElems) {
            this.initEditEvents();
        }
        this.deleter = new StatDeleter(pathId, stat.name);
        this.updater = new StatUpdater(stat.name, pathId);
    }
    newStatElems(stat, editRight) {
        const statElem = sampleStatElem.cloneNode(true);
        const nameElem = statElem.getElementsByClassName("stat-name")[0];
        const stepEqElem = statElem.getElementsByClassName("stat-stepeq")[0];
        const quotaElem = statElem.getElementsByClassName("stat-quota")[0];
        const quotaTimeElem = statElem.getElementsByClassName("stat-quota-time")[0];
        const countElem = statElem.getElementsByClassName("stat-count")[0];
        const countInputElem = new NumberInput(statElem.getElementsByClassName("stat-count-input")[0]);
        const statElems = {
            stat: statElem,
            name: nameElem,
            stepEq: stepEqElem,
            quota: quotaElem,
            quotaTime: quotaTimeElem,
            count: countElem,
            countInput: countInputElem,
        };
        statElems.stat.removeAttribute("id");
        setVisibility(statElems.stat, true);
        setVisibility(statElems.count, !editRight);
        statElems.count.innerText = stat.count.toString();
        setVisibility(statElems.countInput.getElem(), editRight);
        statElems.countInput.setValue(stat.count);
        return statElems;
    }
    initEvents() {
        this.statElems.countInput.addInputListener((_num) => {
            this.updateCount();
        });
    }
    newEditStatElems(stat) {
        const editStatElem = sampleEditStatElem.cloneNode(true);
        editStatElem.removeAttribute("id");
        const deleteButton = editStatElem.getElementsByClassName("delete-stat-button")[0];
        const saveButton = editStatElem.getElementsByClassName("save-stat-button")[0];
        const nameInput = editStatElem.getElementsByClassName("stat-name-input")[0];
        const stepEqInput = editStatElem.getElementsByClassName("stat-stepeq-input")[0];
        acceptOnlyNumbers(stepEqInput);
        const quotaInput = editStatElem.getElementsByClassName("stat-quota-input")[0];
        acceptOnlyNumbers(quotaInput);
        const quotaTimeInput = editStatElem.getElementsByClassName("stat-quota-time-input")[0];
        acceptOnlyNumbers(quotaTimeInput);
        const elems = {
            editStat: editStatElem,
            nameInput: nameInput,
            stepEqInput: stepEqInput,
            quotaInput: quotaInput,
            quotaTimeInput: quotaTimeInput,
            saveButton: saveButton,
            deleteButton: deleteButton,
        };
        elems.nameInput.value = stat.name;
        elems.stepEqInput.value = stat.stepEquivalent.toString();
        elems.quotaInput.value = stat.quota.quota.toString();
        elems.quotaTimeInput.value = stat.quota.hoursLimit.toString();
        return elems;
    }
    initEditEvents() {
        if (!this.editStatElems)
            return;
        removeBorderColorOnFocus(this.editStatElems.nameInput);
        editButton.addEventListener("click", () => {
            if (!this.editStatElems)
                return;
            this.editStatElems.nameInput.value = this.stat.name;
            this.editStatElems.stepEqInput.value =
                this.stat.stepEquivalent.toString();
            this.showSaveButtonIfChanged();
        });
        this.editStatElems.deleteButton.addEventListener("click", () => {
            this.delete();
        });
        this.editStatElems.saveButton.addEventListener("click", () => {
            this.save();
        });
        this.editStatElems.nameInput.addEventListener("input", () => {
            this.showSaveButtonIfChanged();
        });
        this.editStatElems.stepEqInput.addEventListener("input", () => {
            this.showSaveButtonIfChanged();
        });
        this.editStatElems.quotaInput.addEventListener("input", () => {
            this.showSaveButtonIfChanged();
        });
        this.editStatElems.quotaTimeInput.addEventListener("input", () => {
            this.showSaveButtonIfChanged();
        });
        this.showSaveButtonIfChanged();
    }
    save() {
        if (!this.editStatElems)
            return;
        if (isNaN(Number(this.editStatElems.stepEqInput.value))) {
            this.editStatElems.stepEqInput.value = "0";
        }
        if (isNaN(Number(this.editStatElems.quotaInput.value))) {
            this.editStatElems.quotaInput.value = "0";
        }
        if (isNaN(Number(this.editStatElems.quotaTimeInput.value))) {
            this.editStatElems.quotaTimeInput.value = "0";
        }
        this.updater
            .save({
            name: this.editStatElems.nameInput.value,
            stepEquivalent: Number(this.editStatElems.stepEqInput.value),
            quota: {
                quota: Number(this.editStatElems.quotaInput.value),
                hoursLimit: Number(this.editStatElems.quotaTimeInput.value),
            },
        })
            .then((message) => {
            if (!this.editStatElems)
                return;
            if (message == "") {
                this.stat.name = this.editStatElems.nameInput.value;
                this.stat.stepEquivalent = Number(this.editStatElems.stepEqInput.value);
                this.updateStatElems(this.stat);
                this.showSaveButtonIfChanged();
                return;
            }
            this.editStatElems.saveButton.innerText = message;
            setBorderColor(this.editStatElems.nameInput, "err");
        });
    }
    delete() {
        this.deleter.delete().then((message) => {
            var _a;
            if (!this.editStatElems)
                return;
            if (message == "") {
                this.statElems.stat.remove();
                (_a = this.editStatElems) === null || _a === void 0 ? void 0 : _a.editStat.remove();
                return;
            }
            this.editStatElems.deleteButton.innerText = message;
        });
    }
    updateCount() {
        this.newCount = this.statElems.countInput.getValue();
        this.steps = this.newCount * this.stat.stepEquivalent;
        this.stepsUpdateCallback();
        this.statElems.quota.innerText = `${this.stat.quota.countProgress + this.newCount - this.stat.count}/${this.stat.quota.quota}`;
    }
    updateStatElems(newStat) {
        this.stat = newStat;
        this.statElems.name.innerText = this.stat.name;
        this.statElems.stepEq.innerText = `= ${this.stat.stepEquivalent} steps`;
        this.statElems.quota.innerText = `${this.stat.quota.countProgress}/${this.stat.quota.quota}`;
        this.statElems.quotaTime.innerText = `${this.stat.quota.hoursPassed}/${this.stat.quota.hoursLimit} hrs`;
        this.steps = this.newCount * this.stat.stepEquivalent;
        this.stepsUpdateCallback();
    }
    showSaveButtonIfChanged() {
        if (!this.editStatElems)
            return;
        const changed = !(this.editStatElems.nameInput.value == this.stat.name &&
            Number(this.editStatElems.stepEqInput.value) ==
                this.stat.stepEquivalent &&
            Number(this.editStatElems.quotaInput.value) ==
                this.stat.quota.quota &&
            Number(this.editStatElems.quotaTimeInput.value) ==
                this.stat.quota.hoursLimit);
        this.editStatElems.saveButton.innerText = "save";
        this.editStatElems.deleteButton.innerText = "delete";
        setVisibility(this.editStatElems.saveButton, changed);
        setVisibility(this.editStatElems.deleteButton, !changed);
    }
}
class StatCreator {
    constructor(pathId) {
        this.pathId = pathId;
        this.createCallback = (_name) => { };
        this.initEvents();
    }
    initEvents() {
        createStatButton.addEventListener("click", () => {
            this.create();
        });
        removeBorderColorOnFocus(createStatNameInput);
        createStatNameInput.addEventListener("input", () => {
            createStatButton.innerText = "create";
        });
    }
    setCreateCallback(callback) {
        this.createCallback = callback;
    }
    create() {
        const name = createStatNameInput.value;
        if (name == "") {
            setBorderColor(createStatNameInput, "err");
            createStatButton.innerText = "no name";
            return;
        }
        this.postCreate(name).then((message) => {
            if (message == "") {
                this.createCallback(name);
                createStatNameInput.value = "";
            }
            else {
                setBorderColor(createStatNameInput, "err");
                createStatButton.innerText = message;
            }
        });
    }
    postCreate(name) {
        return fetch(`/api/path/${this.pathId}/stat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name,
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
                    return refresh().then((authd) => {
                        if (authd) {
                            return this.postCreate(name);
                        }
                        return "unauthorized";
                    });
                default:
                    return "error";
            }
        });
    }
}
class StatDeleter {
    constructor(pathId, name) {
        this.deleteCallback = () => { };
        this.pathId = pathId;
        this.name = name;
        this.askedIfSure = false;
    }
    setDeleteCallback(callback) {
        this.deleteCallback = callback;
    }
    delete() {
        if (!this.askedIfSure) {
            this.askedIfSure = true;
            return Promise.resolve("sure?");
        }
        return this.postDelete().then((message) => {
            if (message == "") {
                this.deleteCallback();
            }
            return message;
        });
    }
    postDelete() {
        return fetch(`/api/path/${this.pathId}/stat/${this.name}`, {
            method: "DELETE",
        }).then((res) => {
            switch (res.status) {
                case 200:
                    return "";
                case 401:
                    return refresh().then((authd) => {
                        if (authd) {
                            return this.postDelete();
                        }
                        return "unauthorized";
                    });
                default:
                    return "error";
            }
        });
    }
}
class StatUpdater {
    constructor(name, pathId) {
        this.name = name;
        this.pathId = pathId;
    }
    save(newStat) {
        if (newStat.name == "") {
            return Promise.resolve("no name");
        }
        return this.postSave(newStat).then((message) => {
            if (message == "") {
                this.name = newStat.name;
            }
            return message;
        });
    }
    postSave(newStat) {
        return fetch(`/api/path/${this.pathId}/stat/${this.name}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newStat),
        }).then((res) => {
            switch (res.status) {
                case 200:
                    return "";
                case 400:
                    return "special characters";
                case 409:
                    return "already exists";
                case 401:
                    return refresh().then((authd) => {
                        if (authd) {
                            return this.postSave(newStat);
                        }
                        return "unauthorized";
                    });
                default:
                    return "error";
            }
        });
    }
}
class StatsManager {
    constructor(pathId) {
        this.pathId = pathId;
        this.pageStats = [];
        this.statCreator = new StatCreator(this.pathId);
        this.countUpdateTicker = 0;
        this.initEvents();
    }
    initEvents() {
        this.countUpdateTicker = setInterval(() => {
            this.updateCounts();
        }, 3000);
        window.addEventListener("beforeunload", () => {
            clearInterval(this.countUpdateTicker);
            this.updateCounts();
        });
        this.statCreator.setCreateCallback((name) => {
            const stat = {
                name: name,
                stepEquivalent: 1,
                count: 0,
                quota: {
                    countProgress: 0,
                    quota: 0,
                    streak: 0,
                    hoursPassed: 0,
                    hoursLimit: 24,
                },
            };
            const pageStat = this.initStat(stat, true);
            setVisibility(pageStat.statElems.stat, false);
            if (pageStat.editStatElems) {
                setVisibility(pageStat.editStatElems.editStat, true);
            }
        });
    }
    renderPageStat(pageStat) {
        statsElem.insertBefore(pageStat.statElems.stat, statCreateBoxElem);
        if (pageStat.editStatElems) {
            statsElem.insertBefore(pageStat.editStatElems.editStat, statCreateBoxElem);
        }
    }
    initStat(stat, editRight) {
        const pageStat = new Stat(stat, editRight, this.pathId);
        pageStat.deleter.setDeleteCallback(() => {
            this.pageStats.splice(this.pageStats.indexOf(pageStat), 1);
            this.updatePathSteps();
        });
        this.pageStats.push(pageStat);
        this.renderPageStat(pageStat);
        pageStat.stepsUpdateCallback = () => {
            this.updatePathSteps();
        };
        return pageStat;
    }
    updateCounts() {
        let counts = [];
        for (const stat of this.pageStats) {
            if (stat.newCount == stat.stat.count) {
                continue;
            }
            counts.push({
                name: stat.stat.name,
                count: stat.newCount,
            });
            stat.stat.quota.countProgress += stat.newCount - stat.stat.count;
            stat.stat.count = stat.newCount;
        }
        if (counts.length == 0) {
            return;
        }
        this.postCounts(counts);
    }
    updatePathSteps() {
        let steps = 0;
        for (const stat of this.pageStats) {
            steps += stat.newCount * stat.stat.stepEquivalent;
        }
        pathStepsElem.innerText = `steps: ${steps}`;
    }
    postCounts(counts) {
        fetch(`/api/path/${this.pathId}/stats/counts`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(counts),
            keepalive: true,
        }).then((res) => {
            switch (res.status) {
                case 200:
                    break;
                case 401:
                    refresh().then((authd) => {
                        if (authd) {
                            this.postCounts(counts);
                        }
                    });
                    break;
                default:
                    console.error("Failed to update counts");
                    break;
            }
        });
    }
    setEditMode(mode) {
        setVisibility(statCreateBoxElem, mode);
        for (const stat of this.pageStats) {
            setVisibility(stat.statElems.stat, !mode);
            if (stat.editStatElems) {
                setVisibility(stat.editStatElems.editStat, mode);
            }
        }
    }
}
class Path {
    constructor(id) {
        this.id = id;
        this.name = "";
        this.isPublic = false;
        this.statsManager = new StatsManager(id);
        this.fetchPath();
    }
    handleFetchedData(data) {
        ownerElem.href = `/user/${data.path.ownerId}`;
        setPageTitle(data.path.name);
        if (data.path.stats) {
            for (const stat of data.path.stats) {
                this.statsManager.initStat(stat, data.editRight);
            }
            this.statsManager.updatePathSteps();
        }
        if (data.editRight) {
            setVisibility(editButton, true);
            this.isPublic = data.path.public;
            this.name = data.path.name;
        }
    }
    fetchPath() {
        checkAuthAndRefresh().then((_res) => {
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
const deleter = new PathDeleter(path.id);
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
function removeBorderColor(elem) {
    if (!elem) {
        return;
    }
    elem.style.borderColor = "";
}
class NumberInput {
    constructor(elem) {
        this.elem = elem;
        this.inputElem = elem.getElementsByTagName("input")[0];
        this.plus = elem.getElementsByClassName("plus")[0];
        this.minus = elem.getElementsByClassName("minus")[0];
        this.callback = (_num) => { };
        this.initEvents();
    }
    initEvents() {
        this.plus.addEventListener("click", () => {
            this.inputElem.value = (Number(this.inputElem.value) + 1).toString();
            this.callback(Number(this.inputElem.value));
        });
        this.minus.addEventListener("click", () => {
            this.inputElem.value = (Number(this.inputElem.value) - 1).toString();
            this.callback(Number(this.inputElem.value));
        });
        this.inputElem.addEventListener("input", () => {
            this.inputElem.value = this.inputElem.value.replace(/[^0-9-]/g, "");
            this.callback(Number(this.inputElem.value));
        });
    }
    setValue(value) {
        this.inputElem.value = value.toString();
    }
    getValue() {
        return Number(this.inputElem.value);
    }
    getElem() {
        return this.elem;
    }
    getInputElem() {
        return this.inputElem;
    }
    addInputListener(callback) {
        this.callback = callback;
    }
}
function acceptOnlyNumbers(elem) {
    elem.addEventListener("input", () => {
        elem.value = elem.value.replace(/[^0-9-]/g, "");
    });
}
function checkAuthAndRefresh() {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch("/authenticated", {
            method: "GET",
        }).then((res) => {
            if (res.status == 401) {
                return fetch("/auth/refresh", {
                    method: "GET",
                }).then((res) => {
                    if (res.status == 200) {
                        return {
                            authnd: true,
                            refreshed: true,
                        };
                    }
                    return {
                        authnd: false,
                        refreshed: false,
                    };
                });
            }
            return {
                authnd: true,
                refreshed: false,
            };
        });
    });
}
function refresh() {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch("/auth/refresh", {
            method: "GET",
        }).then((res) => {
            if (res.status == 200) {
                return true;
            }
            return false;
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
