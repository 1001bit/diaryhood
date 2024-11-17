"use strict";
const nameElem = document.getElementById("name");
const changeNameElem = document.getElementById("change-name");
const nameInputElem = document.getElementById("name-input");
let isEditing = false;
function changeNameInit() {
    if (!(nameInputElem && nameElem && changeNameElem)) {
        return;
    }
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
}
function startEdit() {
    if (!(nameInputElem && nameElem && changeNameElem)) {
        return;
    }
    isEditing = true;
    nameInputElem.removeAttribute("style");
    nameElem.style.display = "none";
    changeNameElem.innerText = "cancel";
}
function cancelEdit() {
    if (!(nameInputElem && nameElem && changeNameElem)) {
        return;
    }
    isEditing = false;
    nameElem.removeAttribute("style");
    nameInputElem.style.display = "none";
    changeNameElem.innerText = "change";
}
function save() {
    if (!(nameInputElem && nameElem && changeNameElem)) {
        return;
    }
    if (nameInputElem.value == "") {
        setElemColor(nameInputElem, "err");
        return;
    }
    fetch("/api/change-name", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: nameInputElem.value,
        }),
    }).then((res) => {
        switch (res.status) {
            case 200:
                nameElem.innerText = nameInputElem.value;
                location.replace(`/user/${nameInputElem.value}`);
                break;
            case 400:
                changeNameElem.innerText = "no special characters";
                setElemColor(nameInputElem, "err");
                break;
            case 409:
                changeNameElem.innerText = "name already taken";
                setElemColor(nameInputElem, "err");
                break;
            default:
                changeNameElem.innerText = "error";
                setElemColor(nameInputElem, "err");
                break;
        }
    });
}
changeNameInit();
const pathNameInputElem = document.getElementById("path-name-input");
const createPathElem = document.getElementById("create-path");
function newPathInit() {
    if (!(pathNameInputElem && createPathElem)) {
        return;
    }
    createPathElem.addEventListener("click", createNewPath);
    setRemoveStyleOnFocus(pathNameInputElem);
}
function createNewPath() {
    if (!(pathNameInputElem && createPathElem)) {
        return;
    }
    const name = pathNameInputElem.value;
    if (name == "") {
        setElemColor(pathNameInputElem, "err");
        return;
    }
    fetch("/api/path", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: name,
        }),
    })
        .then((res) => {
        switch (res.status) {
            case 200:
                break;
            case 400:
                createPathElem.innerText = "no special characters";
                setElemColor(pathNameInputElem, "err");
                break;
            case 409:
                createPathElem.innerText = "path already exists";
                setElemColor(pathNameInputElem, "err");
                break;
            default:
                setElemColor(pathNameInputElem, "err");
                break;
        }
        return res.json();
    })
        .then((res) => {
        if (res && res.id) {
            location.replace(`/path/${res.id}`);
        }
    });
}
newPathInit();
const mainElem = document.getElementsByTagName("main")[0];
const pathsElem = document.getElementById("paths");
const userStepsElem = document.getElementById("user-steps");
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
    const samplePathElem = document.getElementById("sample-path");
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
    for (const path of paths) {
        const pathElem = newPathElem(path);
        pathsElem.insertBefore(pathElem, pathsElem.firstChild);
    }
}
fetch(`/api/path/user/${userId}`, {
    method: "GET",
})
    .then((res) => {
    if (res.status == 200) {
        return res.json();
    }
    else {
        return [];
    }
})
    .then((data) => {
    renderPaths(data);
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
