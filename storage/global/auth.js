"use strict";
const loginBox = document.getElementById("login-box");
const loginInput = document.getElementById("login-input");
const loginButton = document.getElementById("login-button");
const loginInfo = document.getElementById("login-info");
const loginOpen = document.getElementById("login-open");
let doSendOTP = false;
loginOpen.addEventListener("click", () => {
    loginBox.style.display = "flex";
});
document.addEventListener("click", function (event) {
    const target = event.target;
    if (!loginBox.contains(target) && !loginOpen.contains(target)) {
        loginBox.style.display = "none";
    }
});
loginInput.addEventListener("focus", () => {
    loginInput.removeAttribute("style");
});
function setInputStyle(colorVar) {
    loginInput.style.border = `2px solid var(--${colorVar})`;
}
function requestEmail() {
    const login = loginInput.value;
    fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            login: login,
        }),
    }).then((res) => {
        switch (res.status) {
            case 200:
                doSendOTP = true;
                setInputStyle("acc1");
                loginInput.value = "";
                loginInput.placeholder = "one-time password";
                loginInfo.innerHTML = "check your email";
                break;
            default:
                setInputStyle("err");
                loginInfo.innerHTML = "user not found";
                break;
        }
    });
}
function requestOTP() { }
loginButton.addEventListener("click", () => {
    if (loginInput.value === "") {
        setInputStyle("err");
        return;
    }
    if (!doSendOTP) {
        requestEmail();
    }
    else {
        requestOTP();
    }
});
