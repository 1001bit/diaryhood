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

// move to home page is refresh token is ok
fetch("/auth/refresh", {
	method: "GET",
}).then((res) => {
	if (res.status == 200) {
		location.replace("/");
	}
});

// email that user entered
let email = "";

// remove loginInput style on focus
loginInput.addEventListener("focus", () => {
	loginInput.removeAttribute("style");
});

// set loginInput style
function setInputStyle(colorVar: string) {
	loginInput.style.border = `2px solid var(--${colorVar})`;
}

// set loginInput placeholder
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
					// Success
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
			return res.json();
		})
		.then((res) => {
			if (res.email) {
				email = res.email;
			}
		});
}

// Send OTP to server to verify
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

// Submit
loginInput.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		inputLoginData();
	}
});

loginButton.addEventListener("click", () => {
	inputLoginData();
});
