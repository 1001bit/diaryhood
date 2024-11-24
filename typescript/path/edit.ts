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

pathNameInputElem.addEventListener("input", () => {
	saveElem.innerText = "save";
});

setRemoveStyleOnFocus(pathNameInputElem);

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

async function updatePath(
	newName: string,
	newPublic: boolean
): Promise<string> {
	return fetch(`/api/path/${pathId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: newName,
			public: newPublic,
		}),
	}).then((res) => {
		switch (res.status) {
			case 200:
				pathNameElem.innerText = newName;
				setPathTitle(newName);
				pathPublicElem.innerText = newPublic ? "true" : "false";
				cancel();
				return "";
			case 400:
				return "no special characters";
			case 409:
				return "path already exists";
			case 401:
				return "unauthorized";
			default:
				return "error";
		}
	});
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

	refreshIfNotAuthNd().then((_res) => {
		updatePath(newName, newPublic).then((err) => {
			if (err != "") {
				saveElem.innerText = err;
				setElemColor(pathNameInputElem, "err");
			}
		});
	});
}
