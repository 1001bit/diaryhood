// edit
const editSectionElem = document.getElementById(
	"edit-section"
) as HTMLDivElement;
const pathDataElem = document.getElementById("path-data") as HTMLDivElement;
const editButton = document.getElementById("edit") as HTMLDivElement;
const pathNameInput = document.getElementById("path-name") as HTMLInputElement;
const pathPublicButton = document.getElementById(
	"path-public"
) as HTMLDivElement;
const saveButton = document.getElementById("save") as HTMLDivElement;
const deleteButton = document.getElementById("delete") as HTMLDivElement;

// stats
const statsElem = document.getElementById("stats") as HTMLDivElement;
const sampleStatElem = document.getElementById("sample-stat") as HTMLDivElement;
// create stat
const createStatElem = document.getElementById("create-stat") as HTMLDivElement;
const statNameInputElem = document.getElementById(
	"stat-name-input"
) as HTMLInputElement;
const statStepEqInputElem = document.getElementById(
	"stat-stepeq-input"
) as HTMLInputElement;
const createStatButtonElem = document.getElementById(
	"create-stat-button"
) as HTMLDivElement;

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
