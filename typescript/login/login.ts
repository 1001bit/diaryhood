// main login div
const loginBox = document.getElementById("login-box") as HTMLDivElement;
// text input
const loginInput = document.getElementById("login-input") as HTMLInputElement;
// enter button
const loginButton = document.getElementById(
	"login-button"
) as HTMLButtonElement;
// additional info
const loginInfo = document.getElementById("login-info") as HTMLParagraphElement;

// is on second stage of authentication
let email = "";

// remove loginInput style on focus
loginInput.addEventListener("focus", () => {
	loginInput.removeAttribute("style");
});

// set loginInput style
function setInputStyle(colorVar: string) {
	loginInput.style.border = `2px solid var(--${colorVar})`;
}

function setInputPlaceholder(text: string) {
	loginInput.value = "";
	loginInput.placeholder = text;
}

// set loginInfo text
function showInfo(text: string) {
	loginInfo.innerHTML = text;
}

// Request an email with OTP
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
				// Success
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

// Send OTP to server to verify
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
				// Success
				location.reload();
				break;
			default:
				// Error
				setInputStyle("err");
				showInfo("wrong one-time password");
				break;
		}
	});
}

// Enter data
function inputLoginData() {
	if (loginInput.value === "") {
		setInputStyle("err");
		return;
	}

	showInfo("...");

	if (email == "") {
		requestEmail();
	} else {
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
