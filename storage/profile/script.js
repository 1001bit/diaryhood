"use strict";
const nameElem = document.getElementById("name");
const changeNameElem = document.getElementById("change-name");
const nameInputElem = document.getElementById("name-input");
let isEditing = false;
function init() {
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
    nameInputElem.addEventListener("focus", () => {
        nameInputElem.removeAttribute("style");
    });
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
function editNameStyle(colorVar) {
    if (!nameInputElem) {
        return;
    }
    nameInputElem.style.border = `2px solid var(--${colorVar})`;
}
function save() {
    if (!(nameInputElem && nameElem && changeNameElem)) {
        return;
    }
    if (nameInputElem.value == "") {
        editNameStyle("err");
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
                editNameStyle("err");
                break;
            case 409:
                changeNameElem.innerText = "name already taken";
                editNameStyle("err");
                break;
            default:
                changeNameElem.innerText = "error";
                editNameStyle("err");
                break;
        }
    });
}
init();
const pathElems = document.getElementsByClassName("path");
const userStepsElem = document.getElementById("user-steps");
let totalSteps = 0;
for (let i = 0; i < pathElems.length; i++) {
    const pathElem = pathElems[i];
    const statsData = JSON.parse(pathElem.getAttribute("stats-data"));
    let steps = 0;
    for (let j = 0; j < statsData.length; j++) {
        const stat = statsData[j];
        steps += Number(stat.Count) * Number(stat.StepEquivalent);
    }
    const pathStepsElem = pathElem.querySelector(".path-steps");
    pathStepsElem.innerText = "steps: " + steps.toString();
    totalSteps += steps;
}
userStepsElem.innerText = "steps: " + totalSteps.toString();
