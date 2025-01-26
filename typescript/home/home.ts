/// <reference path="../pathShared/interfaces.ts" />

function renderPath(path: HomePathInterface) {
	const newPathElem = samplePathElem.cloneNode(true) as HTMLDivElement;
	newPathElem.removeAttribute("id");
	setVisibility(newPathElem, true);
	const pathNameElem = newPathElem.getElementsByClassName(
		"path-name"
	)[0] as HTMLDivElement;
	const pathLinkElem = newPathElem.getElementsByClassName(
		"path-link"
	)[0] as HTMLAnchorElement;
	const pathStepsElem = newPathElem.getElementsByClassName(
		"path-steps"
	)[0] as HTMLDivElement;
	pathNameElem.innerText = path.name;
	pathLinkElem.href = `/path/${path.id}`;
	pathStepsElem.innerText = `${path.steps} steps`;

	const pathStatsElem = newPathElem.getElementsByClassName(
		"path-stats"
	)[0] as HTMLDivElement;
	if (path.stats && path.stats.length > 0) {
		setVisibility(pathStatsElem, true);
		for (const stat of path.stats) {
			const statElem = document.createElement("p");
			statElem.classList.add("bold");
			statElem.innerText = stat;
			pathStatsElem.appendChild(statElem);
		}
		pathsMetNotElem.appendChild(newPathElem);
	} else {
		pathsMetElem.appendChild(newPathElem);
	}
}

renderPath({
	public: true,
	id: "0",
	name: "donePath",
	steps: 25,
	stats: [],
});

renderPath({
	public: true,
	id: "2",
	name: "undonePath",
	steps: 10,
	stats: ["stat1", "stat2"],
});
