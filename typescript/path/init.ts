/// <reference path="path.ts"/>

const path = new Path(window.location.pathname.split("/").pop() || "0");
const deleter = new PathDeleter(path.id);
const editor = new PathEditor(path);

// edit button click
let editing = false;
editButton.addEventListener("click", () => {
	editing ? cancelEdit() : startEdit();
	path.statsManager.setEditMode(editing);
});

function startEdit() {
	editing = true;
	editButton.innerText = "cancel";
	setVisibility(pathDataElem, true);
}

function cancelEdit() {
	editing = false;
	editButton.innerText = "edit";
	setVisibility(pathDataElem, false);
}
