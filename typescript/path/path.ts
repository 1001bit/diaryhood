/// <reference path="pathdeleter.ts"/>
/// <reference path="patheditor.ts"/>
/// <reference path="statsmanager.ts"/>

interface PathResponse {
	path: FullPathInterface;
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
		this.statsManager = new StatsManager(id);

		this.fetchPath();
	}

	handleFetchedData(data: PathResponse) {
		ownerElem.href = `/user/${data.path.ownerId}`;

		setPageTitle(data.path.name);
		if (data.path.stats) {
			for (const stat of data.path.stats) {
				this.statsManager.initStat(stat, data.editRight);
			}
			this.statsManager.updatePathSteps();
		}

		if (data.editRight) {
			setVisibility(editButton, true);
			this.isPublic = data.path.public;
			this.name = data.path.name;
		}
	}

	fetchPath() {
		checkAuthAndRefresh().then((_res) => {
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
