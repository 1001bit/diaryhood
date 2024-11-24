/// <reference path="elems.ts" />

let userSteps = 0;
const userId = mainElem.getAttribute("data-user-id");

function countSteps(stats: Stat[]) {
	let count = 0;

	if (stats) {
		for (const stat of stats) {
			count += stat.count * stat.stepEquivalent;
		}
	}

	userSteps += count;
	userStepsElem.innerText = `${userSteps} steps`;

	return count;
}

function newPathElem(Path: Path) {
	const pathElem = samplePathElem.cloneNode(true) as HTMLDivElement;
	pathElem.removeAttribute("id");
	pathElem.removeAttribute("style");

	const pathNameElem = pathElem.getElementsByClassName(
		"path-name"
	)[0] as HTMLDivElement;

	const pathLinkElem = pathElem.getElementsByClassName(
		"path-link"
	)[0] as HTMLAnchorElement;

	const pathStepsElem = pathElem.getElementsByClassName(
		"path-steps"
	)[0] as HTMLDivElement;

	pathNameElem.innerText = Path.name;
	pathLinkElem.href = `/path/${Path.id}`;
	pathStepsElem.innerText = `${countSteps(Path.stats)} steps`;
	return pathElem;
}

function renderPaths(paths: Path[]) {
	if (!paths) {
		noPathsElem.removeAttribute("style");
		return;
	}

	for (const path of paths) {
		const pathElem = newPathElem(path);
		pathsElem.insertBefore(pathElem, pathsElem.firstChild);
	}
}

function fetchAndRenderPaths() {
	fetch(`/api/path/user/${userId}`, {
		method: "GET",
	}).then((res) => {
		if (res.status != 200) {
			return;
		}

		res.json().then(renderPaths);
	});
}

refreshIfNotAuthNd().then((res) => {
	fetchAndRenderPaths();

	if (res) {
		changeNameElem.removeAttribute("style");
		pathCreateBoxElem.removeAttribute("style");
	}
});
