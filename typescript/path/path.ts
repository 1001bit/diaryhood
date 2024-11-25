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
	if (!stats) return;

	for (const stat of stats) {
		const statElem = newStatCard(stat);
		statsElem.insertBefore(statElem, statsElem.firstChild);
	}
}

function handlePathData(data: PathResponse) {
	setPathTitle(data.path.name);
	renderStats(data.path.stats);

	if (data.editRight) {
		editButton.removeAttribute("style");
		setPathData(data.path.name, data.path.public);
	}
}

function renderPath() {
	fetch(`/api/path/${pathId}`, {
		method: "GET",
	}).then((res) => {
		switch (res.status) {
			case 200:
				res.json().then(handlePathData);
				break;
			case 404:
				window.location.replace("/404");
				break;
			default:
				break;
		}
	});
}

refreshIfNotAuthNd().then((_res) => {
	renderPath();
});
