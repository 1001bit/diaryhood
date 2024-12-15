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
const pathSaveButton = document.getElementById("save") as HTMLDivElement;
const pathDeleteButton = document.getElementById("delete") as HTMLDivElement;

// stats
const statsElem = document.getElementById("stats") as HTMLDivElement;
const sampleStatElem = document.getElementById("sample-stat") as HTMLDivElement;
// edit stat
const sampleEditStatElem = document.getElementById(
	"sample-edit-stat"
) as HTMLDivElement;
// create stat
const statCreateBoxElem = document.getElementById("stat-create");
const createStatNameInput = document.getElementById(
	"create-stat-name"
) as HTMLInputElement;
const createStatButton = document.getElementById(
	"create-stat-button"
) as HTMLDivElement;

// path total steps
const pathStepsElem = document.getElementById("path-steps") as HTMLDivElement;

// owner
const ownerElem = document.getElementById("path-owner") as HTMLAnchorElement;
