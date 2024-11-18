// TODO: Render full page, from title to stats
const titleElem = document.getElementById("title") as HTMLDivElement;
const statsElem = document.getElementById("stats") as HTMLDivElement;

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
	for (const stat of stats) {
		const statElem = newStatCard(stat);
		statsElem.appendChild(statElem);
	}
}

function handlePathData(data: PathResponse) {
	setPathTitle(data.path.name);
	renderStats(data.path.stats);
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
