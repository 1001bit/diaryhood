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
const sampleStatElem = document.getElementById("sample-stat");
const samplePathElem = document.getElementById("sample-path");
const pathsElem = document.getElementById("paths");
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
function renderPath(path) {
    const pathElem = samplePathElem.cloneNode(true);
    setVisibility(pathElem, true);
    pathElem.removeAttribute("id");
    const pathNameElem = pathElem.getElementsByClassName("path-name")[0];
    pathNameElem.href = `/path/${path.id}`;
    pathNameElem.innerHTML = `<h3>${path.name}</h3>`;
    const statsElem = pathElem.getElementsByClassName("stats")[0];
    for (const stat of path.stats) {
        const pageStat = new PageStat(stat, true);
        statsElem.appendChild(pageStat.statElems.stat);
    }
    pathsElem.appendChild(pathElem);
}
function renderPaths(paths) {
    if (!paths || paths.length == 0) {
        return;
    }
    for (const path of paths) {
        renderPath(path);
    }
}
renderPaths([
    {
        name: "test",
        id: "0",
        public: false,
        stats: [
            {
                name: "test",
                stepEquivalent: 1,
                quota: {
                    countProgress: 0,
                    quota: 1,
                    hoursPassed: 0,
                    hoursLimit: 24,
                    streak: 0,
                },
                count: 0,
            },
        ],
    },
]);
function fetchAndRenderPaths() {
    fetch(`/api/paths/home`, {
        method: "GET",
    }).then((res) => {
        if (res.status == 401) {
            refresh().then((authd) => {
                if (authd) {
                    return fetchAndRenderPaths();
                }
            });
        }
        else {
            return;
        }
        res.json().then(renderPaths);
    });
}
fetchAndRenderPaths();
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
function setVisibility(elem, visible) {
    if (elem) {
        elem.classList.toggle("hidden", !visible);
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
