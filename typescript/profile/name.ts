const nameElem = document.getElementById("name");
const changeNameElem = document.getElementById("change-name");
const nameInputElem = document.getElementById(
	"name-input"
) as HTMLTextAreaElement | null;

let isEditing = false;

function changeNameInit() {
	if (!(nameInputElem && nameElem && changeNameElem)) {
		return;
	}

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
	setRemoveStyleOnFocus(nameInputElem);
}

// start chaning name
function startEdit() {
	if (!(nameInputElem && nameElem && changeNameElem)) {
		return;
	}

	isEditing = true;
	nameInputElem.removeAttribute("style");
	nameElem.style.display = "none";
	changeNameElem.innerText = "cancel";
}

// cancel changing name
function cancelEdit() {
	if (!(nameInputElem && nameElem && changeNameElem)) {
		return;
	}

	isEditing = false;
	nameElem.removeAttribute("style");
	nameInputElem.style.display = "none";
	changeNameElem.innerText = "change";
}

// save new name
function save() {
	if (!(nameInputElem && nameElem && changeNameElem)) {
		return;
	}

	if (nameInputElem.value == "") {
		setElemColor(nameInputElem, "err");
		return;
	}

	fetch("/api/change-name", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: nameInputElem.value,
		}),
	}).then((res) => {
		switch (res.status) {
			case 200:
				nameElem.innerText = nameInputElem.value;
				location.replace(`/user/${nameInputElem.value}`);
				break;
			case 400:
				changeNameElem.innerText = "no special characters";
				setElemColor(nameInputElem, "err");
				break;
			case 409:
				changeNameElem.innerText = "name already taken";
				setElemColor(nameInputElem, "err");
				break;
			default:
				changeNameElem.innerText = "error";
				setElemColor(nameInputElem, "err");
				break;
		}
	});
}

changeNameInit();
