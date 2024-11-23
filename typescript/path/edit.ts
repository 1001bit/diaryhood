let editMode = false;

const pathEditElem = document.getElementById("path-edit") as HTMLAnchorElement;
pathEditElem.addEventListener("click", () => {
	switch (editMode) {
		case false:
			editModeOn();
			editMode = true;
			break;
		case true:
			editModeOff();
			editMode = false;
			break;
	}
});

const pathNameElem = document.getElementById("path-name") as HTMLDivElement;
const pathNameInputElem = document.getElementById(
	"path-name-input"
) as HTMLInputElement;

const pathPublicElem = document.getElementById("path-public") as HTMLDivElement;
const pathPublicToggleElem = document.getElementById(
	"path-public-toggle"
) as HTMLDivElement;
pathPublicToggleElem.addEventListener("click", () => {
	pathPublicToggleElem.innerText =
		pathPublicToggleElem.innerText == "true" ? "false" : "true";
});

const createStatElem = document.getElementById("create-stat") as HTMLDivElement;

function editModeOn() {
	createStatElem.removeAttribute("style");

	pathNameElem.setAttribute("style", "display: none");
	pathNameInputElem.removeAttribute("style");
	pathNameInputElem.value = pathNameElem.innerText;

	pathPublicElem.setAttribute("style", "display: none");
	pathPublicToggleElem.removeAttribute("style");
	pathPublicToggleElem.innerText = pathPublicElem.innerText;
}

function editModeOff() {
	createStatElem.setAttribute("style", "display: none");

	pathNameElem.removeAttribute("style");
	pathNameInputElem.setAttribute("style", "display: none");

	pathPublicElem.removeAttribute("style");
	pathPublicToggleElem.setAttribute("style", "display: none");
}
