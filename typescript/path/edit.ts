/// <reference path="elems.ts"/>

editElem.addEventListener("click", () => {
	edit();
});

saveElem.addEventListener("click", () => {
	save();
});

cancelElem.addEventListener("click", () => {
	cancel();
});

pathPublicToggleElem.addEventListener("click", () => {
	if (pathPublicToggleElem.innerText == "true") {
		pathPublicToggleElem.innerText = "false";
	} else {
		pathPublicToggleElem.innerText = "true";
	}
});

function edit() {
	createStatElem.removeAttribute("style");

	pathNameElem.setAttribute("style", "display: none");
	pathNameInputElem.removeAttribute("style");
	pathNameInputElem.value = pathNameElem.innerText;

	pathPublicElem.setAttribute("style", "display: none");
	pathPublicToggleElem.removeAttribute("style");
	pathPublicToggleElem.innerText = pathPublicElem.innerText;

	cancelElem.removeAttribute("style");
	saveElem.removeAttribute("style");
	editElem.setAttribute("style", "display: none");
}

function cancel() {
	createStatElem.setAttribute("style", "display: none");

	pathNameElem.removeAttribute("style");
	pathNameInputElem.setAttribute("style", "display: none");

	pathPublicElem.removeAttribute("style");
	pathPublicToggleElem.setAttribute("style", "display: none");

	cancelElem.setAttribute("style", "display: none");
	saveElem.setAttribute("style", "display: none");
	editElem.removeAttribute("style");
}

function save() {
	const oldName = pathNameElem.innerText;
	const oldPublic = pathPublicElem.innerText == "true";

	const newName = pathNameInputElem.value;
	const newPublic = pathPublicToggleElem.innerText == "true";

	if (oldName == newName && oldPublic == newPublic) {
		cancel();
		return;
	}

	console.log(newName, newPublic);
	cancel();
}
