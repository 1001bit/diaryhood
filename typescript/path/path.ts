const pathId = window.location.pathname.split("/").pop();
let editMode = false;

interface PathResponse {
	path: Path;
	editRight: boolean;
}

function setPathTitle(title: string) {
	const titleElem = document.getElementById("title") as HTMLDivElement;

	titleElem.innerText = title;
	document.title = title;
}

function newStatCard(stat: Stat) {
	const sampleStatElem = document.getElementById(
		"sample-stat"
	) as HTMLDivElement;

	const newStatElem = sampleStatElem.cloneNode(true) as HTMLDivElement;
	newStatElem.removeAttribute("id");
	newStatElem.removeAttribute("style");

	const statNameElem = newStatElem.getElementsByClassName(
		"stat-name"
	)[0] as HTMLDivElement;

	const statStepEqElem = newStatElem.getElementsByClassName(
		"stat-stepeq"
	)[0] as HTMLDivElement;

	const statCountElem = newStatElem.getElementsByClassName(
		"stat-count"
	)[0] as HTMLInputElement;

	statNameElem.innerText = stat.name;
	statStepEqElem.innerText = "= " + stat.stepEquivalent.toString() + " steps";
	statCountElem.value = stat.count.toString();
	return newStatElem;
}

function renderStats(stats: Stat[]) {
	const statsElem = document.getElementById("stats") as HTMLDivElement;

	for (const stat of stats) {
		const statElem = newStatCard(stat);
		statsElem.insertBefore(statElem, statsElem.firstChild);
	}
}

function editModeOn() {
	const pathNameElem = document.getElementById("path-name") as HTMLDivElement;
	const pathPublicElem = document.getElementById(
		"path-public"
	) as HTMLDivElement;
	const createStatElem = document.getElementById(
		"create-stat"
	) as HTMLDivElement;

	createStatElem.removeAttribute("style");

	console.log("edit on");
}

function editModeOff() {
	const pathNameElem = document.getElementById("path-name") as HTMLDivElement;
	const pathPublicElem = document.getElementById(
		"path-public"
	) as HTMLDivElement;
	const createStatElem = document.getElementById(
		"create-stat"
	) as HTMLDivElement;

	createStatElem.setAttribute("style", "display: none");

	console.log("edit off");
}

function toggleEdit() {
	switch (editMode) {
		case false:
			editModeOn();
			editMode = true;
			break;
		case true:
			editModeOff();
			editMode = false;
			break;
	}
}

function renderStatsInfo(data: PathResponse) {
	const pathNameElem = document.getElementById("path-name") as HTMLDivElement;
	const pathPublicElem = document.getElementById(
		"path-public"
	) as HTMLDivElement;
	const pathEditElem = document.getElementById(
		"path-edit"
	) as HTMLAnchorElement;

	pathNameElem.innerText = data.path.name;
	pathPublicElem.innerText = data.path.public ? "true" : "false";

	if (data.editRight) {
		pathEditElem.removeAttribute("style");
		pathEditElem.addEventListener("click", toggleEdit);
	}
}

function handlePathData(data: PathResponse) {
	setPathTitle(data.path.name);
	renderStats(data.path.stats);
	renderStatsInfo(data);
}

fetch(`/api/path/${pathId}`, {
	method: "GET",
})
	.then((res) => {
		if (res.status == 200) {
			return res.json();
		}
		location.replace("/404");
		return [];
	})
	.then((data) => {
		handlePathData(data);
	});
