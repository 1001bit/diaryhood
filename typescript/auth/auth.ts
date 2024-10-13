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
// button to open main loginBox
const loginOpen = document.getElementById("login-open") as HTMLElement;

// is on second stage of authentication
let login = "";

// Open login box
loginOpen.addEventListener("click", () => {
	loginBox.style.display = "flex";
});

// Close auth box
document.addEventListener("click", function (event) {
	const target = event.target as Node;

	if (!loginBox.contains(target) && !loginOpen.contains(target)) {
		loginBox.style.display = "none";
	}
});

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
				// Success
				login = loginInput.value;
				setInputStyle("acc1");
				setInputPlaceholder("one-time password");
				showInfo("check your email");
				break;
			default:
				// Error
				setInputStyle("err");
				showInfo("user not found");
				break;
		}
	});
}

// Send OTP to server to verify
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
				// Success
				localStorage.setItem("login", login);
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

// Enter login
loginButton.addEventListener("click", () => {
	if (loginInput.value === "") {
		setInputStyle("err");
		return;
	}

	showInfo("...");

	if (login === "") {
		requestEmail();
	} else {
		requestOTP();
	}
});
