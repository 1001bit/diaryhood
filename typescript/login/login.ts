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
checkAuthAndRefresh().then((resp) => {
	if (resp.authnd) {
		location.replace("/");
	}
});

// email that user entered
let email = "";

// remove loginInput style on focus
removeBorderColorOnFocus(loginInput);

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
				location.replace("/");
				break;
			default:
				// Error
				setBorderColor(loginInput, "err");
				showInfo("wrong one-time password");
				break;
		}
	});
}

// Enter data
function inputLoginData() {
	if (loginInput.value === "") {
		setBorderColor(loginInput, "err");
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
