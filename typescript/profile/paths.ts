/// <reference path="elems.ts" />

let userSteps = 0;
const userId = window.location.pathname.split("/").pop();

function countSteps(stats: StatInterface[]) {
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

function newPathElem(path: PathInterface) {
	const pathElem = samplePathElem.cloneNode(true) as HTMLDivElement;
	pathElem.removeAttribute("id");
	setVisibility(pathElem, true);

	const pathNameElem = pathElem.getElementsByClassName(
		"path-name"
	)[0] as HTMLDivElement;

	const pathLinkElem = pathElem.getElementsByClassName(
		"path-link"
	)[0] as HTMLAnchorElement;

	const pathStepsElem = pathElem.getElementsByClassName(
		"path-steps"
	)[0] as HTMLDivElement;

	pathNameElem.innerText = path.name;
	pathLinkElem.href = `/path/${path.id}`;
	pathStepsElem.innerText = `${countSteps(path.stats)} steps`;
	return pathElem;
}

function renderPaths(paths: PathInterface[]) {
	if (!paths) {
		return;
	}

	setVisibility(noPathsElem, false);

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
