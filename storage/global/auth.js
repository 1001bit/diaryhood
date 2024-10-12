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
    console.log(login);
});
