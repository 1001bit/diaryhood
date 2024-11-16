"use strict";
const loginBox = document.getElementById("login-box");
const loginInput = document.getElementById("login-input");
const loginButton = document.getElementById("login-button");
const loginInfo = document.getElementById("login-info");
fetch("/auth/refresh", {
    method: "GET",
}).then((res) => {
    if (res.status == 200) {
        location.replace("/");
    }
});
let email = "";
setRemoveStyleOnFocus(loginInput);
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
                setElemColor(loginInput, "err");
                showInfo("user not found");
                break;
            default:
                setElemColor(loginInput, "err");
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
                location.reload();
                break;
            default:
                setElemColor(loginInput, "err");
                showInfo("wrong one-time password");
                break;
        }
    });
}
function inputLoginData() {
    if (loginInput.value === "") {
        setElemColor(loginInput, "err");
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
