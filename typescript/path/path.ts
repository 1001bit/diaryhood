/// <reference path="deletor.ts"/>
/// <reference path="editor.ts"/>
/// <reference path="statsmanager.ts"/>

interface PathResponse {
	path: Path;
	editRight: boolean;
}

class Path {
	id: string;
	name: string;
	isPublic: boolean;

	statsManager: StatsManager;

	constructor(id: string) {
		this.id = id;
		this.name = "";
		this.isPublic = false;
		this.statsManager = new StatsManager();

		this.fetchPath();
	}

	handleFetchedData(data: PathResponse) {
		setPageTitle(data.path.name);
		this.statsManager.renderStats(data.path.stats, data.editRight);

		if (data.editRight) {
			setVisibility(editButton, true);
			this.isPublic = data.path.public;
			this.name = data.path.name;
		}
	}

	fetchPath() {
		refreshIfNotAuthNd().then((_res) => {
			fetch(`/api/path/${this.id}`, {
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
