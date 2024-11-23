const pathEditElem = document.getElementById("path-edit") as HTMLAnchorElement;
const pathNameElem = document.getElementById("path-name") as HTMLDivElement;
const pathPublicElem = document.getElementById("path-public") as HTMLDivElement;
const createStatElem = document.getElementById("create-stat") as HTMLDivElement;

pathEditElem.addEventListener("click", toggleEdit);

function toggleEdit() {
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
}

function editModeOn() {
	createStatElem.removeAttribute("style");
}

function editModeOff() {
	createStatElem.setAttribute("style", "display: none");
}
