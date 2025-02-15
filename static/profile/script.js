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
const changeAvatarElem = document.getElementById("change-avatar");
const avatarElem = document.getElementById("avatar");
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
const avatarInput = document.createElement("input");
avatarInput.type = "file";
avatarInput.accept = "image/*";
setVisibility(avatarInput, false);
changeAvatarElem.addEventListener("click", () => {
    avatarInput.click();
});
avatarInput.addEventListener("change", () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const file = (_a = avatarInput.files) === null || _a === void 0 ? void 0 : _a.item(0);
    if (!file) {
        return;
    }
    const formData = new FormData();
    formData.append("avatar", file);
    try {
        fetch("/dynamic/avatar", {
            method: "POST",
            body: formData,
        }).then((res) => {
            if (!res.ok) {
                changeAvatarElem.innerHTML = "error";
                return;
            }
            avatarElem.src = avatarElem.src.split("?")[0] + "?" + Date.now();
        });
    }
    catch (e) {
        changeAvatarElem.innerHTML = "error";
    }
}));
function renderOwnerElements() {
    setVisibility(changeAvatarElem, true);
    setVisibility(changeNameElem, true);
    setVisibility(noPathsElem, false);
    setVisibility(pathCreateBoxElem, true);
}
checkAuthAndRefresh().then((res) => {
    if (res.authnd) {
        renderOwnerElements();
    }
    fetchAndRenderPaths();
});
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
removeBorderColorOnFocus(nameInputElem);
function startEdit() {
    isEditing = true;
    setVisibility(nameInputElem, true);
    setVisibility(nameElem, false);
    changeNameElem.innerText = "cancel";
}
function cancelEdit() {
    isEditing = false;
    setVisibility(nameElem, true);
    setVisibility(nameInputElem, false);
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
                    setPageTitle(name);
                    nameElem.innerText = name;
                    cancelEdit();
                    return "";
                case 400:
                    return "no special characters";
                case 409:
                    return "name already taken";
                case 401:
                    return refresh().then((authd) => {
                        if (authd) {
                            return postNewName(name);
                        }
                        return "unauthorized";
                    });
                default:
                    return "error";
            }
        });
    });
}
function save() {
    if (nameInputElem.value == "") {
        setBorderColor(nameInputElem, "err");
        return;
    }
    postNewName(nameInputElem.value).then((err) => {
        if (err != "") {
            changeNameElem.innerText = err;
            setBorderColor(nameInputElem, "err");
        }
    });
}
removeBorderColorOnFocus(pathNameInputElem);
createPathButton.addEventListener("click", () => {
    createNewPath().then((err) => {
        if (err != "") {
            createPathButton.innerText = err;
            setBorderColor(pathNameInputElem, "err");
        }
    });
});
pathNameInputElem.addEventListener("input", () => {
    createPathButton.innerText = "create";
});
function createNewPath() {
    return __awaiter(this, void 0, void 0, function* () {
        const name = pathNameInputElem.value;
        if (name == "") {
            setBorderColor(pathNameInputElem, "err");
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
                    return refresh().then((authd) => {
                        if (authd) {
                            return createNewPath();
                        }
                        return "unauthorized";
                    });
                default:
                    return "error";
            }
        });
    });
}
let userSteps = 0;
const userId = window.location.pathname.split("/").pop();
function newPathElem(path) {
    const pathElem = samplePathElem.cloneNode(true);
    pathElem.removeAttribute("id");
    setVisibility(pathElem, true);
    const pathNameElem = pathElem.getElementsByClassName("path-name")[0];
    const pathLinkElem = pathElem.getElementsByClassName("path-link")[0];
    const pathStepsElem = pathElem.getElementsByClassName("path-steps")[0];
    pathNameElem.innerText = path.name;
    pathLinkElem.href = `/path/${path.id}`;
    pathStepsElem.innerText = `${path.steps} steps`;
    userSteps += path.steps;
    userStepsElem.innerText = `${userSteps} steps`;
    return pathElem;
}
function renderPaths(paths) {
    if (!paths || paths.length == 0) {
        return;
    }
    setVisibility(noPathsElem, false);
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
function setVisibility(elem, visible) {
    if (elem) {
        elem.classList.toggle("hidden", !visible);
    }
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
const titleElem = document.getElementById("title");
function setPageTitle(title) {
    titleElem.innerText = title;
    document.title = title;
}
