"use strict";
const changeNameElem = document.getElementById("change-name");
const nameBoxElem = document.getElementById("name-box");
const nameElem = document.getElementById("name");
const editNameElem = document.getElementById("edit-name");
let isEditing = false;
function init() {
    if (!(editNameElem && nameElem && changeNameElem)) {
        return;
    }
    editNameElem.addEventListener("input", () => {
        if (editNameElem.value == nameElem.innerText) {
            changeNameElem.innerText = "cancel";
        }
        else {
            changeNameElem.innerText = "save";
        }
    });
    changeNameElem.addEventListener("click", () => {
        if (!isEditing) {
            isEditing = true;
            editNameElem.removeAttribute("style");
            nameElem.style.display = "none";
            changeNameElem.innerText = "cancel";
        }
        else {
            save();
        }
    });
    editNameElem.addEventListener("focus", () => {
        editNameElem.removeAttribute("style");
    });
}
function cancel() {
    if (!(editNameElem && nameElem && changeNameElem)) {
        return;
    }
    isEditing = false;
    nameElem.removeAttribute("style");
    editNameElem.style.display = "none";
    changeNameElem.innerText = "change";
}
function save() {
    if (!(editNameElem && nameElem && changeNameElem)) {
        return;
    }
    if (editNameElem.value == nameElem.innerText) {
        cancel();
        return;
    }
    if (editNameElem.value == "") {
        editNameStyle("err");
        return;
    }
    fetch("/api/change-name", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: editNameElem.value,
        }),
    }).then((res) => {
        switch (res.status) {
            case 200:
                nameElem.innerText = editNameElem.value;
                location.replace(`/user/${editNameElem.value}`);
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
function editNameStyle(colorVar) {
    if (!editNameElem) {
        return;
    }
    editNameElem.style.border = `2px solid var(--${colorVar})`;
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
