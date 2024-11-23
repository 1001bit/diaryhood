const pathId = window.location.pathname.split("/").pop();

interface PathResponse {
	path: Path;
	editRight: boolean;
}

function setPathTitle(title: string) {
	titleElem.innerText = title;
	document.title = title;
}

function newStatCard(stat: Stat) {
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
	for (const stat of stats) {
		const statElem = newStatCard(stat);
		statsElem.insertBefore(statElem, statsElem.firstChild);
	}
}

function renderStatsInfo(data: PathResponse) {
	pathNameElem.innerText = data.path.name;
	pathPublicElem.innerText = data.path.public ? "true" : "false";

	if (data.editRight) {
		editElem.removeAttribute("style");
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
		return {
			path: {
				name: "not found",
				public: false,
				stats: [],
			},
			editRight: false,
		};
	})
	.then((data) => {
		handlePathData(data);
	});
