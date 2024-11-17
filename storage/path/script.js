"use strict";
const titleElem = document.getElementById("title");
const pathId = window.location.pathname.split("/").pop();
function setPathTitle(title) {
    titleElem.innerText = title;
    document.title = title;
}
function handlePathData(data) {
    setPathTitle(data.path.name);
}
fetch(`/api/path/${pathId}`, {
    method: "GET",
})
    .then((res) => {
    if (res.status == 200) {
        return res.json();
    }
    location.replace("/404");
    return [];
})
    .then((data) => {
    console.log(data);
    handlePathData(data);
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
