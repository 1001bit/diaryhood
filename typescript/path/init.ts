/// <reference path="path.ts"/>

const path = new Path(window.location.pathname.split("/").pop() || "0");
const deletor = new PathDeletor(path.id);
const editor = new PathEditor(path);

// edit button click
let editing = false;
editButton.addEventListener("click", () => {
	editing ? cancelEdit() : startEdit();
});

function startEdit() {
	editing = true;
	editButton.innerText = "cancel";
	setVisibility(pathDataElem, true);
	setVisibility(createStatElem, true);
}

function cancelEdit() {
	editing = false;
	editButton.innerText = "edit";
	setVisibility(pathDataElem, false);
	setVisibility(createStatElem, false);
}
