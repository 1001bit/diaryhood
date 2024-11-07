"use strict";
const loginBox = document.getElementById("login-box");
const loginInput = document.getElementById("login-input");
const loginButton = document.getElementById("login-button");
const loginInfo = document.getElementById("login-info");
let email = "";
loginInput.addEventListener("focus", () => {
    loginInput.removeAttribute("style");
});
function setInputStyle(colorVar) {
    loginInput.style.border = `2px solid var(--${colorVar})`;
}
function setInputPlaceholder(text) {
    loginInput.value = "";
    loginInput.placeholder = text;
}
function showInfo(text) {
    loginInfo.innerHTML = text;
}
function requestEmail() {
    fetch("/login/email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            login: loginInput.value,
        }),
    }).then((res) => {
        switch (res.status) {
            case 200:
                email = loginInput.value;
                setInputStyle("acc1");
                setInputPlaceholder("one-time password");
                showInfo("check your email");
                break;
            case 404:
                setInputStyle("err");
                showInfo("user not found");
                break;
            default:
                setInputStyle("err");
                showInfo("something went wrong");
                break;
        }
    });
}
function requestOTP() {
    fetch("/login/otp", {
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
                setInputStyle("err");
                showInfo("wrong one-time password");
                break;
        }
    });
}
function inputLoginData() {
    if (loginInput.value === "") {
        setInputStyle("err");
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
