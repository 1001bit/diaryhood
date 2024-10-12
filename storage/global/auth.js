"use strict";
const authBox = document.getElementById("auth-box");
const loginInput = document.getElementById("login-input");
const loginButton = document.getElementById("login-button");
const loginOpen = document.getElementById("login-open");
loginOpen.addEventListener("click", () => {
    authBox.style.display = "flex";
});
document.addEventListener("click", function (event) {
    const target = event.target;
    if (!authBox.contains(target) && !loginOpen.contains(target)) {
        authBox.style.display = "none";
    }
});
loginButton.addEventListener("click", () => {
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
                break;
            default:
                loginButton.value = "user with such username/email not found";
                break;
        }
    });
});
