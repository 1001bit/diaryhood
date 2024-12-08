/// <reference path="elems.ts" />

let isEditing = false;

// trigger on editNameElem change
nameInputElem.addEventListener("input", () => {
	if (nameInputElem.value == nameElem.innerText) {
		changeNameElem.innerText = "cancel";
	} else {
		changeNameElem.innerText = "save";
	}
});

// trigger on changeNameElem click
changeNameElem.addEventListener("click", () => {
	if (!isEditing) {
		startEdit();
	} else {
		if (nameInputElem.value == nameElem.innerText) {
			cancelEdit();
			return;
		}
		save();
	}
});

// remove input style on focus
removeBorderColorOnFocus(nameInputElem);

// start chaning name
function startEdit() {
	isEditing = true;
	setVisibility(nameInputElem, true);
	setVisibility(nameElem, false);
	changeNameElem.innerText = "cancel";
}

// cancel changing name
function cancelEdit() {
	isEditing = false;
	setVisibility(nameElem, true);
	setVisibility(nameInputElem, false);
	changeNameElem.innerText = "change";
}

async function postNewName(name: string): Promise<string> {
	return fetch("/api/change-name", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: name,
		}),
	}).then((res) => {
		switch (res.status) {
			case 200:
				setPageTitle(name);
				nameElem.innerText = name;
				cancelEdit();
				return "";
			case 400:
				return "no special characters";
			case 409:
				return "name already taken";
			case 401:
				return refresh().then((authd) => {
					if (authd) {
						return postNewName(name);
					}
					return "unauthorized";
				});
			default:
				return "error";
		}
	});
}

// save new name
function save() {
	if (nameInputElem.value == "") {
		setBorderColor(nameInputElem, "err");
		return;
	}

	postNewName(nameInputElem.value).then((err) => {
		if (err != "") {
			changeNameElem.innerText = err;
			setBorderColor(nameInputElem, "err");
		}
	});
}
