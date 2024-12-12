/// <reference path="stat.ts" />
/// <reference path="stateditors.ts" />

class StatsManager {
	pathId: string;
	pageStats: Array<Stat>;
	statCreator: StatCreator;

	constructor(pathId: string) {
		this.pathId = pathId;
		this.pageStats = [];
		this.statCreator = new StatCreator(this.pathId);

		this.statCreator.setCreateCallback((name) => {
			const stat = {
				name: name,
				stepEquivalent: 1,
				count: 0,
			};
			const pageStat = new Stat(stat, true, this.pathId);
			pageStat.deletor.setDeleteCallback(() => {
				this.pageStats.splice(this.pageStats.indexOf(pageStat), 1);
			});
			this.pageStats.push(pageStat);
			this.renderPageStat(pageStat);
			setVisibility(pageStat.statElem, false);
			setVisibility(pageStat.editStatElem, true);
		});
	}

	renderPageStat(pageStat: Stat) {
		statsElem.insertBefore(pageStat.statElem, statCreateBoxElem);

		if (pageStat.editStatElem) {
			statsElem.insertBefore(pageStat.editStatElem, statCreateBoxElem);
		}
	}

	initStats(stats: StatInterface[], editRight: boolean) {
		if (!stats) {
			return;
		}

		for (const stat of stats) {
			const pageStat = new Stat(stat, editRight, this.pathId);
			pageStat.deletor.setDeleteCallback(() => {
				this.pageStats.splice(this.pageStats.indexOf(pageStat), 1);
			});

			this.pageStats.push(pageStat);
			this.renderPageStat(pageStat);
		}
	}

	setEditMode(mode: boolean) {
		setVisibility(statCreateBoxElem, mode);

		for (const stat of this.pageStats) {
			setVisibility(stat.statElem, !mode);
			setVisibility(stat.editStatElem, mode);
		}
	}
}
