const authBox = document.getElementById("auth-box") as HTMLDivElement;
const loginInput = document.getElementById("login-input") as HTMLInputElement;
const loginButton = document.getElementById(
	"login-button"
) as HTMLButtonElement;

const loginOpen = document.getElementById("login-open") as HTMLElement;

// Open auth box
loginOpen.addEventListener("click", () => {
	authBox.style.display = "flex";
});

// Close auth box
document.addEventListener("click", function (event) {
	const target = event.target as Node;

	if (!authBox.contains(target) && !loginOpen.contains(target)) {
		authBox.style.display = "none";
	}
});

// Enter login
loginButton.addEventListener("click", () => {
	const login = loginInput.value;
	console.log(login);
});
