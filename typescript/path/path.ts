/// <reference path="deletor.ts"/>
/// <reference path="editor.ts"/>

interface PathResponse {
	path: Path;
	editRight: boolean;
}

class Path {
	id: string;
	name: string;
	isPublic: boolean;
	stats: Stat[];

	constructor(id: string) {
		this.id = id;
		this.name = "";
		this.isPublic = false;
		this.stats = [];

		this.fetchPath();
	}

	newStatCard(stat: Stat) {
		const newStatElem = sampleStatElem.cloneNode(true) as HTMLDivElement;
		newStatElem.removeAttribute("id");
		setVisibility(newStatElem, true);

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
		statStepEqElem.innerText =
			"= " + stat.stepEquivalent.toString() + " steps";
		statCountElem.value = stat.count.toString();
		return newStatElem;
	}

	renderStats(stats: Stat[]) {
		if (!stats) return;

		for (const stat of stats) {
			const statElem = this.newStatCard(stat);
			statsElem.insertBefore(statElem, statsElem.firstChild);
		}
	}

	handleFetchedData(data: PathResponse) {
		setPageTitle(data.path.name);
		this.renderStats(data.path.stats);

		if (data.editRight) {
			setVisibility(editButton, true);
			this.isPublic = data.path.public;
			this.name = data.path.name;
		}
	}

	fetchPath() {
		refreshIfNotAuthNd().then((_res) => {
			fetch(`/api/path/${pathId}`, {
				method: "GET",
			}).then((res) => {
				switch (res.status) {
					case 200:
						res.json().then((res) => {
							this.handleFetchedData(res);
						});
						break;
					case 404:
						window.location.replace("/404");
						break;
					default:
						break;
				}
			});
		});
	}
}

const pathId = window.location.pathname.split("/").pop();

const path = new Path(pathId || "");
const deletor = new PathDeletor(path);
const editor = new PathEditor(path);
