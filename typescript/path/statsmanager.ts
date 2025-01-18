/// <reference path="statcreator.ts" />
/// <reference path="statdeleter.ts" />
/// <reference path="statupdater.ts" />

class StatsManager {
	pathId: string;
	pageStats: Array<PageStat>;
	pageStatsEditors: Array<PageStatEditor>;
	statCreator: StatCreator;

	countUpdateTicker: number;

	constructor(pathId: string) {
		this.pathId = pathId;
		this.pageStats = [];
		this.pageStatsEditors = [];
		this.statCreator = new StatCreator(this.pathId);

		this.countUpdateTicker = 0;

		this.initEvents();
	}

	initEvents() {
		this.countUpdateTicker = setInterval(() => {
			this.updateCounts();
		}, 3000);

		window.addEventListener("beforeunload", () => {
			clearInterval(this.countUpdateTicker);
			this.updateCounts();
		});

		this.statCreator.setCreateCallback((name) => {
			const stat = {
				name: name,
				stepEquivalent: 1,
				count: 0,
				quota: {
					countProgress: 0,
					quota: 1,
					streak: 0,
					hoursPassed: 0,
					hoursLimit: 24,
				},
			};

			const pageStat = this.initStat(stat, true);
			const pageStatEditor = this.initStatEditor(pageStat);
			setVisibility(pageStat.statElems.stat, false);
			setVisibility(pageStatEditor.editStatElems.editStat, true);
		});
	}

	renderPageStat(pageStat: PageStat) {
		statsElem.insertBefore(pageStat.statElems.stat, statCreateBoxElem);
	}

	renderPageStatEditor(pageStatEditor: PageStatEditor) {
		statsElem.insertBefore(
			pageStatEditor.editStatElems.editStat,
			statCreateBoxElem
		);
	}

	initStat(stat: StatInterface, editRight: boolean): PageStat {
		const pageStat = new PageStat(stat, editRight);

		this.pageStats.push(pageStat);
		this.renderPageStat(pageStat);

		pageStat.stepCounter.stepsUpdateCallback = () => {
			this.updatePathSteps();
		};

		if (editRight) {
			this.initStatEditor(pageStat);
		}

		return pageStat;
	}

	initStatEditor(stat: PageStat): PageStatEditor {
		const pageStatEditor = new PageStatEditor(stat, this.pathId);
		pageStatEditor.deleter.setDeleteCallback(() => {
			this.pageStats.splice(this.pageStats.indexOf(stat), 1);
			this.updatePathSteps();
			this.pageStatsEditors.splice(
				this.pageStatsEditors.indexOf(pageStatEditor),
				1
			);
		});

		this.pageStatsEditors.push(pageStatEditor);
		this.renderPageStatEditor(pageStatEditor);

		return pageStatEditor;
	}

	updateCounts() {
		let counts = [];

		for (const stat of this.pageStats) {
			if (stat.countCounter.presentCount == stat.stat.count) {
				continue;
			}

			counts.push({
				name: stat.stat.name,
				count: stat.countCounter.presentCount,
			});

			stat.stat.quota.countProgress +=
				stat.countCounter.presentCount - stat.stat.count;
			stat.stat.count = stat.countCounter.presentCount;
		}

		if (counts.length == 0) {
			return;
		}

		this.postCounts(counts);
	}

	updatePathSteps() {
		let steps = 0;
		for (const stat of this.pageStats) {
			steps += stat.countCounter.presentCount * stat.stat.stepEquivalent;
		}
		pathStepsElem.innerText = `steps: ${steps}`;
	}

	postCounts(counts: StatCountInterface[]) {
		fetch(`/api/path/${this.pathId}/stats/counts`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(counts),
			keepalive: true,
		}).then((res) => {
			switch (res.status) {
				case 200:
					break;
				case 401:
					refresh().then((authd) => {
						if (authd) {
							this.postCounts(counts);
						}
					});
					break;
				default:
					console.error("Failed to update counts");
					break;
			}
		});
	}

	setEditMode(mode: boolean) {
		setVisibility(statCreateBoxElem, mode);

		for (const stat of this.pageStats) {
			setVisibility(stat.statElems.stat, !mode);
		}
		for (const statEditor of this.pageStatsEditors) {
			setVisibility(statEditor.editStatElems.editStat, mode);
		}
	}
}
