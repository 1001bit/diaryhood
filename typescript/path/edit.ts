/// <reference path="elems.ts"/>

// init
setRemoveStyleOnFocus(pathNameInput);

let pathData = {
	name: "",
	isPublic: false,
};

function setPathData(name: string, isPublic: boolean) {
	pathData.name = name;
	pathData.isPublic = isPublic;

	pathNameInput.value = name;
	pathPublicButton.innerText = isPublic ? "true" : "false";
}

let editing = false;
editButton.addEventListener("click", () => {
	editing ? cancel() : edit();
});

// edit/cancel
function edit() {
	editing = true;
	editButton.innerText = "cancel";
	setVisibility(pathDataElem, true);
	setVisibility(createStatElem, true);
}

function cancel() {
	editing = false;
	editButton.innerText = "edit";
	setVisibility(pathDataElem, false);
	setVisibility(createStatElem, false);

	deleteButton.innerText = "delete";
	askedIfSure = false;
}

// on change
pathPublicButton.addEventListener("click", () => {
	pathPublicButton.innerText =
		pathPublicButton.innerText == "true" ? "false" : "true";
});

pathNameInput.addEventListener("input", () => {
	saveButton.innerText = "save";
});

// save
saveButton.addEventListener("click", save);

function save() {
	const newName = pathNameInput.value;
	const newPublic = pathPublicButton.innerText == "true";

	if (pathData.name == newName && pathData.isPublic == newPublic) {
		cancel();
		return;
	}

	refreshIfNotAuthNd().then((_res) => {
		updatePath(newName, newPublic).then((err) => {
			if (err != "") {
				saveButton.innerText = err;
				setElemColor(pathNameInput, "err");
			}
		});
	});
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
				setPathData(newName, newPublic);
				setPageTitle(newName);
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

// delete
let askedIfSure = false;
deleteButton.addEventListener("click", () => {
	if (!askedIfSure) {
		deleteButton.innerText = "sure?";
		askedIfSure = true;
		return;
	}

	refreshIfNotAuthNd().then((_res) => {
		deletePath().then((err) => {
			if (err != "") {
				deleteButton.innerText = err;
				setElemColor(deleteButton, "err");
				return;
			}

			window.location.replace("/user");
		});
	});
});

async function deletePath(): Promise<string> {
	return fetch(`/api/path/${pathId}`, {
		method: "DELETE",
	}).then((res) => {
		switch (res.status) {
			case 200:
				return "";
			case 401:
				return "unauthorized";
			default:
				return "error";
		}
	});
}
