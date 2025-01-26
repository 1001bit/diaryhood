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
const samplePathElem = document.getElementById("sample-path");
const pathsMetNotElem = document.getElementById("paths-met-not");
const pathsMetElem = document.getElementById("paths-met");
function renderPath(path) {
    const newPathElem = samplePathElem.cloneNode(true);
    newPathElem.removeAttribute("id");
    setVisibility(newPathElem, true);
    const pathNameElem = newPathElem.getElementsByClassName("path-name")[0];
    const pathLinkElem = newPathElem.getElementsByClassName("path-link")[0];
    const pathStepsElem = newPathElem.getElementsByClassName("path-steps")[0];
    pathNameElem.innerText = path.name;
    pathLinkElem.href = `/path/${path.id}`;
    pathStepsElem.innerText = `${path.steps} steps`;
    const pathStatsElem = newPathElem.getElementsByClassName("path-stats")[0];
    if (path.stats && path.stats.length > 0) {
        setVisibility(pathStatsElem, true);
        for (const stat of path.stats) {
            const statElem = document.createElement("p");
            statElem.classList.add("bold");
            statElem.innerText = stat;
            pathStatsElem.appendChild(statElem);
        }
        pathsMetNotElem.appendChild(newPathElem);
    }
    else {
        pathsMetElem.appendChild(newPathElem);
    }
}
function fetchAndRenderPaths() {
    fetch("/api/path/home").then((res) => {
        console.log(res);
        if (res.ok) {
            res.json().then((paths) => {
                for (const path of paths) {
                    renderPath(path);
                }
            });
        }
    });
}
checkAuthAndRefresh().then((res) => {
    if (res.authnd) {
        fetchAndRenderPaths();
    }
});
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
