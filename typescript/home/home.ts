/// <reference path="../pathShared/stat.ts" />
/// <reference path="../misc/numberinput.ts" />

function renderPath(path: HomePathInterface) {
	const pathElem = samplePathElem.cloneNode(true) as HTMLDivElement;
	setVisibility(pathElem, true);
	pathElem.removeAttribute("id");

	const pathNameElem = pathElem.getElementsByClassName(
		"path-name"
	)[0] as HTMLAnchorElement;
	pathNameElem.href = `/path/${path.id}`;
	pathNameElem.innerHTML = `<h3>${path.name}</h3>`;

	const statsElem = pathElem.getElementsByClassName(
		"stats"
	)[0] as HTMLDivElement;

	for (const stat of path.stats) {
		const pageStat = new PageStat(stat, true);

		statsElem.appendChild(pageStat.statElems.stat);
	}

	pathsElem.appendChild(pathElem);
}

function renderPaths(paths: HomePathInterface[]) {
	if (!paths || paths.length == 0) {
		return;
	}

	for (const path of paths) {
		renderPath(path);
	}
}

renderPaths([
	{
		name: "test",
		id: "0",
		public: false,
		stats: [
			{
				name: "test",
				stepEquivalent: 1,
				quota: {
					countProgress: 0,
					quota: 1,
					hoursPassed: 0,
					hoursLimit: 24,
					streak: 0,
				},
				count: 0,
			},
		],
	},
]);

function fetchAndRenderPaths() {
	fetch(`/api/paths/home`, {
		method: "GET",
	}).then((res) => {
		if (res.status == 401) {
			refresh().then((authd) => {
				if (authd) {
					return fetchAndRenderPaths();
				}
			});
		} else {
			return;
		}

		res.json().then(renderPaths);
	});
}

fetchAndRenderPaths();
