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
const mainElem = document.getElementsByTagName("main")[0];
const nameElem = document.getElementById("name");
const changeNameElem = document.getElementById("change-name");
const nameInputElem = document.getElementById("name-input");
const userStepsElem = document.getElementById("user-steps");
const pathsElem = document.getElementById("paths");
const pathCreateBoxElem = document.getElementById("path-create-box");
const createPathButton = document.getElementById("create-path");
const pathNameInputElem = document.getElementById("path-name-input");
const samplePathElem = document.getElementById("sample-path");
const noPathsElem = document.getElementById("no-paths");
let isEditing = false;
nameInputElem.addEventListener("input", () => {
    if (nameInputElem.value == nameElem.innerText) {
        changeNameElem.innerText = "cancel";
    }
    else {
        changeNameElem.innerText = "save";
    }
});
changeNameElem.addEventListener("click", () => {
    if (!isEditing) {
        startEdit();
    }
    else {
        if (nameInputElem.value == nameElem.innerText) {
            cancelEdit();
            return;
        }
        save();
    }
});
setRemoveStyleOnFocus(nameInputElem);
function startEdit() {
    isEditing = true;
    nameInputElem.removeAttribute("style");
    nameElem.style.display = "none";
    changeNameElem.innerText = "cancel";
}
function cancelEdit() {
    isEditing = false;
    nameElem.removeAttribute("style");
    nameInputElem.style.display = "none";
    changeNameElem.innerText = "change";
}
function postNewName(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch("/api/change-name", {
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
                    location.replace(`/user/${name}`);
                    return "";
                case 400:
                    return "no special characters";
                case 409:
                    return "name already taken";
                default:
                    return "error";
            }
        });
    });
}
function save() {
    if (nameInputElem.value == "") {
        setElemColor(nameInputElem, "err");
        return;
    }
    refreshIfNotAuthNd().then((_res) => {
        postNewName(nameInputElem.value).then((err) => {
            if (err != "") {
                changeNameElem.innerText = err;
                setElemColor(nameInputElem, "err");
            }
        });
    });
}
setRemoveStyleOnFocus(pathNameInputElem);
createPathButton.addEventListener("click", () => {
    refreshIfNotAuthNd().then((_res) => {
        createNewPath().then((err) => {
            if (err != "") {
                createPathButton.innerText = err;
                setElemColor(pathNameInputElem, "err");
            }
        });
    });
});
pathNameInputElem.addEventListener("input", () => {
    createPathButton.innerText = "create";
});
function createNewPath() {
    return __awaiter(this, void 0, void 0, function* () {
        const name = pathNameInputElem.value;
        if (name == "") {
            setElemColor(pathNameInputElem, "err");
            return "empty";
        }
        return fetch("/api/path", {
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
                    res.json().then((res) => {
                        location.replace(`/path/${res.id}`);
                    });
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
let userSteps = 0;
const userId = mainElem.getAttribute("data-user-id");
function countSteps(stats) {
    let count = 0;
    if (stats) {
        for (const stat of stats) {
            count += stat.count * stat.stepEquivalent;
        }
    }
    userSteps += count;
    userStepsElem.innerText = `${userSteps} steps`;
    return count;
}
function newPathElem(Path) {
    const pathElem = samplePathElem.cloneNode(true);
    pathElem.removeAttribute("id");
    pathElem.removeAttribute("style");
    const pathNameElem = pathElem.getElementsByClassName("path-name")[0];
    const pathLinkElem = pathElem.getElementsByClassName("path-link")[0];
    const pathStepsElem = pathElem.getElementsByClassName("path-steps")[0];
    pathNameElem.innerText = Path.name;
    pathLinkElem.href = `/path/${Path.id}`;
    pathStepsElem.innerText = `${countSteps(Path.stats)} steps`;
    return pathElem;
}
function renderPaths(paths) {
    if (!paths) {
        noPathsElem.removeAttribute("style");
        return;
    }
    for (const path of paths) {
        const pathElem = newPathElem(path);
        pathsElem.insertBefore(pathElem, pathsElem.firstChild);
    }
}
function fetchAndRenderPaths() {
    fetch(`/api/path/user/${userId}`, {
        method: "GET",
    }).then((res) => {
        if (res.status != 200) {
            return;
        }
        res.json().then(renderPaths);
    });
}
refreshIfNotAuthNd().then((res) => {
    fetchAndRenderPaths();
    if (res) {
        changeNameElem.removeAttribute("style");
        pathCreateBoxElem.removeAttribute("style");
    }
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
