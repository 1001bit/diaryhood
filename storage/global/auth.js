"use strict";
const loginBox = document.getElementById("login-box");
const loginInput = document.getElementById("login-input");
const loginButton = document.getElementById("login-button");
const loginInfo = document.getElementById("login-info");
const loginOpen = document.getElementById("login-open");
let login = "";
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
function setInputPlaceholder(text) {
    loginInput.value = "";
    loginInput.placeholder = text;
}
function showInfo(text) {
    loginInfo.innerHTML = text;
}
function requestEmail() {
    fetch("/auth/login", {
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
                login = loginInput.value;
                setInputStyle("acc1");
                setInputPlaceholder("one-time password");
                showInfo("check your email");
                break;
            default:
                setInputStyle("err");
                showInfo("user not found");
                break;
        }
    });
}
function requestOTP() {
    fetch("/auth/otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            login: login,
            otp: loginInput.value,
        }),
    }).then((res) => {
        switch (res.status) {
            case 200:
                localStorage.setItem("login", login);
                location.reload();
                break;
            default:
                setInputStyle("err");
                showInfo("wrong one-time password");
                break;
        }
    });
}
loginButton.addEventListener("click", () => {
    if (loginInput.value === "") {
        setInputStyle("err");
        return;
    }
    showInfo("...");
    if (login === "") {
        requestEmail();
    }
    else {
        requestOTP();
    }
});
