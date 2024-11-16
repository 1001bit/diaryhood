const nameElem = document.getElementById("name");
const changeNameElem = document.getElementById("change-name");
const nameInputElem = document.getElementById(
	"name-input"
) as HTMLTextAreaElement | null;

let isEditing = false;

function init() {
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

	// remove loginInput style on focus
	nameInputElem.addEventListener("focus", () => {
		nameInputElem.removeAttribute("style");
	});
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

// set loginInput style
function editNameStyle(colorVar: string) {
	if (!nameInputElem) {
		return;
	}

	nameInputElem.style.border = `2px solid var(--${colorVar})`;
}

// save new name
function save() {
	if (!(nameInputElem && nameElem && changeNameElem)) {
		return;
	}

	if (nameInputElem.value == "") {
		editNameStyle("err");
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
				editNameStyle("err");
				break;
			case 409:
				changeNameElem.innerText = "name already taken";
				editNameStyle("err");
				break;
			default:
				changeNameElem.innerText = "error";
				editNameStyle("err");
				break;
		}
	});
}

init();
