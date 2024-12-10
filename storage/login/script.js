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
const loginBox = document.getElementById("login-box");
const loginInput = document.getElementById("login-input");
const loginButton = document.getElementById("login-button");
const loginInfo = document.getElementById("login-info");
checkAuthAndRefresh().then((authd) => {
    if (authd) {
        location.replace("/");
    }
});
let email = "";
removeBorderColorOnFocus(loginInput);
function setInputPlaceholder(text) {
    loginInput.value = "";
    loginInput.placeholder = text;
}
function showInfo(text) {
    loginInfo.innerHTML = text;
}
function requestEmail() {
    fetch("/api/login/email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            login: loginInput.value,
        }),
    })
        .then((res) => {
        switch (res.status) {
            case 200:
                setInputPlaceholder("one-time password");
                showInfo("check your email");
                break;
            case 404:
                setBorderColor(loginInput, "err");
                showInfo("user not found");
                break;
            default:
                setBorderColor(loginInput, "err");
                showInfo("something went wrong");
                break;
        }
        return res.json();
    })
        .then((res) => {
        if (res.email) {
            email = res.email;
        }
    });
}
function requestOTP() {
    fetch("/api/login/otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
            otp: loginInput.value,
        }),
    }).then((res) => {
        switch (res.status) {
            case 200:
                location.replace("/");
                break;
            default:
                setBorderColor(loginInput, "err");
                showInfo("wrong one-time password");
                break;
        }
    });
}
function inputLoginData() {
    if (loginInput.value === "") {
        setBorderColor(loginInput, "err");
        return;
    }
    showInfo("...");
    if (email == "") {
        requestEmail();
    }
    else {
        requestOTP();
    }
}
loginInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        inputLoginData();
    }
});
loginButton.addEventListener("click", () => {
    inputLoginData();
});
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
                        return true;
                    }
                    return false;
                });
            }
            return true;
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
