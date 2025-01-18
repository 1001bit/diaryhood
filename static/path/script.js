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
        editButton.addEventListener("click", () => {
            this.askedIfSure = false;
        });
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
        this.pageStatsEditors = [];
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
                    quota: 1,
                    streak: 0,
                    hoursPassed: 0,
                    hoursLimit: 24,
                },
            };
            const pageStat = this.initStat(stat, true);
            const pageStatEditor = this.initStatEditor(pageStat);
            setVisibility(pageStat.statElems.stat, false);
            setVisibility(pageStatEditor.editStatElems.editStat, true);
        });
    }
    renderPageStat(pageStat) {
        statsElem.insertBefore(pageStat.statElems.stat, statCreateBoxElem);
    }
    renderPageStatEditor(pageStatEditor) {
        statsElem.insertBefore(pageStatEditor.editStatElems.editStat, statCreateBoxElem);
    }
    initStat(stat, editRight) {
        const pageStat = new PageStat(stat, editRight);
        this.pageStats.push(pageStat);
        this.renderPageStat(pageStat);
        pageStat.stepCounter.stepsUpdateCallback = () => {
            this.updatePathSteps();
        };
        if (editRight) {
            this.initStatEditor(pageStat);
        }
        return pageStat;
    }
    initStatEditor(stat) {
        const pageStatEditor = new PageStatEditor(stat, this.pathId);
        pageStatEditor.deleter.setDeleteCallback(() => {
            this.pageStats.splice(this.pageStats.indexOf(stat), 1);
            this.updatePathSteps();
            this.pageStatsEditors.splice(this.pageStatsEditors.indexOf(pageStatEditor), 1);
        });
        this.pageStatsEditors.push(pageStatEditor);
        this.renderPageStatEditor(pageStatEditor);
        return pageStatEditor;
    }
    updateCounts() {
        let counts = [];
        for (const stat of this.pageStats) {
            if (stat.countCounter.presentCount == stat.stat.count) {
                continue;
            }
            counts.push({
                name: stat.stat.name,
                count: stat.countCounter.presentCount,
            });
            stat.stat.quota.countProgress +=
                stat.countCounter.presentCount - stat.stat.count;
            stat.stat.count = stat.countCounter.presentCount;
        }
        if (counts.length == 0) {
            return;
        }
        this.postCounts(counts);
    }
    updatePathSteps() {
        let steps = 0;
        for (const stat of this.pageStats) {
            steps += stat.countCounter.presentCount * stat.stat.stepEquivalent;
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
        }
        for (const statEditor of this.pageStatsEditors) {
            setVisibility(statEditor.editStatElems.editStat, mode);
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
class EditStatElem {
    constructor(stat) {
        this.editStat = sampleEditStatElem.cloneNode(true);
        this.editStat.removeAttribute("id");
        this.deleteButton = this.editStat.getElementsByClassName("delete-stat-button")[0];
        this.saveButton = this.editStat.getElementsByClassName("save-stat-button")[0];
        this.nameInput = this.editStat.getElementsByClassName("stat-name-input")[0];
        removeBorderColorOnFocus(this.nameInput);
        this.stepEqInput = this.editStat.getElementsByClassName("stat-stepeq-input")[0];
        acceptOnlyNumbers(this.stepEqInput);
        this.quotaInput = this.editStat.getElementsByClassName("stat-quota-input")[0];
        acceptOnlyNumbers(this.quotaInput);
        this.quotaTimeInput = this.editStat.getElementsByClassName("stat-quota-time-input")[0];
        acceptOnlyNumbers(this.quotaTimeInput);
        this.nameInput.value = stat.name;
        this.stepEqInput.value = stat.stepEquivalent.toString();
        this.quotaInput.value = stat.quota.quota.toString();
        this.quotaTimeInput.value = stat.quota.hoursLimit.toString();
    }
    saveButtonMode(mode) {
        this.saveButton.innerText = "save";
        this.deleteButton.innerText = "delete";
        setVisibility(this.saveButton, mode);
        setVisibility(this.deleteButton, !mode);
    }
}
class PageStatEditor {
    constructor(stat, pathId) {
        this.stat = stat;
        this.editStatElems = new EditStatElem(stat.stat);
        this.deleter = new StatDeleter(pathId, stat.stat.name);
        this.updater = new StatUpdater(stat.stat.name, pathId);
        this.initEditEvents();
    }
    initEditEvents() {
        if (!this.editStatElems)
            return;
        editButton.addEventListener("click", () => {
            if (!this.editStatElems)
                return;
            this.editStatElems.nameInput.value = this.stat.stat.name;
            this.editStatElems.stepEqInput.value =
                this.stat.stat.stepEquivalent.toString();
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
                this.stat.stat.name = this.editStatElems.nameInput.value;
                this.stat.stat.stepEquivalent = Number(this.editStatElems.stepEqInput.value);
                this.stat.stat.quota.quota = Number(this.editStatElems.quotaInput.value);
                this.stat.stat.quota.hoursLimit = Number(this.editStatElems.quotaTimeInput.value);
                this.stat.updateStatElemsValues();
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
                this.stat.statElems.stat.remove();
                (_a = this.editStatElems) === null || _a === void 0 ? void 0 : _a.editStat.remove();
                return;
            }
            this.editStatElems.deleteButton.innerText = message;
        });
    }
    showSaveButtonIfChanged() {
        if (!this.editStatElems)
            return;
        const changed = !(this.editStatElems.nameInput.value == this.stat.stat.name &&
            Number(this.editStatElems.stepEqInput.value) ==
                this.stat.stat.stepEquivalent &&
            Number(this.editStatElems.quotaInput.value) ==
                this.stat.stat.quota.quota &&
            Number(this.editStatElems.quotaTimeInput.value) ==
                this.stat.stat.quota.hoursLimit);
        this.editStatElems.saveButtonMode(changed);
    }
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
function setColor(elem, colorVar) {
    if (!elem) {
        return;
    }
    elem.style.color = `var(--${colorVar})`;
}
function removeColor(elem) {
    if (!elem) {
        return;
    }
    elem.style.color = "";
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
class StatElem {
    constructor(countEditRight) {
        this.stat = sampleStatElem.cloneNode(true);
        this.name = this.stat.getElementsByClassName("stat-name")[0];
        this.stepEq = this.stat.getElementsByClassName("stat-stepeq")[0];
        this.quota = this.stat.getElementsByClassName("stat-quota")[0];
        this.quotaTime = this.stat.getElementsByClassName("stat-quota-time")[0];
        this.quotaStreak = this.stat.getElementsByClassName("stat-quota-streak")[0];
        this.countInput = new NumberInput(this.stat.getElementsByClassName("stat-count-input")[0]);
        this.stat.removeAttribute("id");
        setVisibility(this.stat, true);
        setVisibility(this.countInput.getElem(), countEditRight);
    }
    setQuotaHighlight(highlight, streak) {
        if (highlight) {
            setColor(this.quota, "acc1");
            setColor(this.quotaStreak, "acc1");
            this.quotaStreak.innerText = `🔥 ${streak + 1}`;
        }
        else {
            removeColor(this.quota);
            removeColor(this.quotaStreak);
            this.quotaStreak.innerText = `🔥 ${streak}`;
        }
    }
    setStepEq(count, stepEq) {
        this.stepEq.innerText = `${count} * ${stepEq} 👣`;
    }
    setQuota(quota, hoursPassed, hoursLimit) {
        if (quota > 0 && hoursLimit > 0) {
            this.quota.innerText = `🚩 ${quota}`;
            this.quotaTime.innerText = `⏳️ ${hoursPassed}/${hoursLimit} hrs`;
        }
        else {
            this.quota.innerText = "";
            this.quotaTime.innerText = "no quota";
            this.quotaStreak.innerText = "";
        }
    }
    setCountValue(count) {
        this.countInput.setValue(count);
    }
}
class StatStepCounter {
    constructor() {
        this.steps = 0;
        this.stepsUpdateCallback = () => { };
    }
    updateSteps(count, stepEq) {
        this.steps = count * stepEq;
        this.stepsUpdateCallback();
    }
}
class StatCountCounter {
    constructor(count) {
        this.presentCount = count;
    }
    updatePresentCount(inputValue, quotaProgress, statCount) {
        if (isNaN(inputValue)) {
            inputValue = 0;
        }
        this.presentCount = inputValue - quotaProgress + statCount;
        return this.presentCount;
    }
    calculatePresentQuotaProgress(quotaProgress, statCount) {
        return quotaProgress + this.presentCount - statCount;
    }
}
class PageStat {
    constructor(stat, countEditRight) {
        this.stat = stat;
        this.countCounter = new StatCountCounter(stat.count);
        this.stepCounter = new StatStepCounter();
        this.statElems = new StatElem(countEditRight);
        this.updateStatElemsValues();
        this.initEvents();
    }
    initEvents() {
        this.statElems.countInput.addInputListener((_num) => {
            this.updateCount();
        });
    }
    updateCount() {
        const presentCount = this.countCounter.updatePresentCount(Number(this.statElems.countInput.getValue()), this.stat.quota.countProgress, this.stat.count);
        this.stepCounter.updateSteps(presentCount, this.stat.stepEquivalent);
        this.statElems.setStepEq(presentCount, this.stat.stepEquivalent);
        this.updateQuotaHighlight();
    }
    updateQuotaHighlight() {
        if (this.stat.quota.quota <= 0 || this.stat.quota.hoursLimit <= 0) {
            return;
        }
        const currentQuotaProgress = this.countCounter.calculatePresentQuotaProgress(this.stat.quota.countProgress, this.stat.count);
        this.statElems.setQuotaHighlight(currentQuotaProgress >= this.stat.quota.quota, this.stat.quota.streak);
    }
    updateStatElemsValues() {
        this.statElems.name.innerText = this.stat.name;
        this.statElems.setStepEq(this.countCounter.presentCount, this.stat.stepEquivalent);
        this.statElems.setQuota(this.stat.quota.quota, this.stat.quota.hoursPassed, this.stat.quota.hoursLimit);
        this.updateQuotaHighlight();
        this.statElems.setCountValue(this.countCounter.calculatePresentQuotaProgress(this.stat.quota.countProgress, this.stat.count));
        this.stepCounter.updateSteps(this.countCounter.presentCount, this.stat.stepEquivalent);
    }
}
