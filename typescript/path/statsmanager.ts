class StatsManager {
	pathId: string;
	pageStats: Array<Stat>;

	constructor(pathId: string) {
		this.pathId = pathId;
		this.pageStats = [];
	}

	renderPageStat(pageStat: Stat) {
		if (pageStat.statElem) {
			statsElem.appendChild(pageStat.statElem);
		}

		if (pageStat.editStatElem) {
			statsElem.appendChild(pageStat.editStatElem);
		}
	}

	renderStats() {
		for (const pageStat of this.pageStats) {
			this.renderPageStat(pageStat);
		}
	}

	initStats(stats: StatInterface[], editRight: boolean) {
		if (!stats) {
			return;
		}

		for (const stat of stats) {
			const pageStat = new Stat(stat, editRight, this.pathId);
			pageStat.setDeleteCallback(() => {
				this.pageStats.splice(this.pageStats.indexOf(pageStat), 1);
			});

			this.pageStats.push(pageStat);
		}

		this.renderStats();
	}

	setEditMode(mode: boolean) {
		for (const stat of this.pageStats) {
			setVisibility(stat.statElem, !mode);
			setVisibility(stat.editStatElem, mode);
		}
	}
}
