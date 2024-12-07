class PageStat {
	stat: Stat;

	statElem: HTMLElement | null;
	countInput: NumberInput | null;

	editStatElem: HTMLElement | null;
	stepEqInput: NumberInput | null;
	nameInput: HTMLInputElement | null;

	constructor(stat: Stat, editRight: boolean) {
		this.stat = stat;

		this.statElem = null;
		this.countInput = null;
		this.initStatElem(stat);

		this.editStatElem = null;
		this.stepEqInput = null;
		this.nameInput = null;
		if (editRight) this.initStatEditElem(stat);
	}

	initStatElem(stat: Stat) {
		this.statElem = sampleStatElem.cloneNode(true) as HTMLDivElement;
		this.statElem.removeAttribute("id");
		setVisibility(this.statElem, true);

		const statNameElem = this.statElem.getElementsByClassName(
			"stat-name"
		)[0] as HTMLDivElement;

		const statStepEqElem = this.statElem.getElementsByClassName(
			"stat-stepeq"
		)[0] as HTMLDivElement;

		this.countInput = new NumberInput(
			this.statElem.getElementsByClassName(
				"stat-count-input"
			)[0] as HTMLDivElement
		);

		statNameElem.innerText = stat.name;
		statStepEqElem.innerText =
			"= " + stat.stepEquivalent.toString() + " steps";
		this.countInput.setValue(stat.count);
	}

	initStatEditElem(stat: Stat) {
		this.editStatElem = sampleEditStatElem.cloneNode(
			true
		) as HTMLDivElement;
		this.editStatElem.removeAttribute("id");

		const deleteButton = this.editStatElem.getElementsByClassName(
			"delete-stat-button"
		)[0] as HTMLDivElement;
		setVisibility(deleteButton, true);

		this.nameInput = this.editStatElem.getElementsByClassName(
			"stat-name-input"
		)[0] as HTMLInputElement;

		this.stepEqInput = new NumberInput(
			this.editStatElem.getElementsByClassName(
				"stat-stepeq-input"
			)[0] as HTMLDivElement
		);

		this.nameInput.value = stat.name;
		this.stepEqInput.setValue(stat.stepEquivalent);
	}

	initEvents() {
		if (!this.statElem || !this.editStatElem) return;

		// TODO: this
	}
}

class StatsManager {
	stats: PageStat[];

	constructor() {
		this.stats = [];
	}

	renderStats(stats: Stat[], editRight: boolean) {
		if (!stats) return;

		for (const stat of stats) {
			const pageStat = new PageStat(stat, editRight);
			this.stats.push(pageStat);

			if (pageStat.statElem) {
				statsElem.insertBefore(pageStat.statElem, statsElem.firstChild);
			}

			if (pageStat.editStatElem) {
				statsElem.insertBefore(
					pageStat.editStatElem,
					statsElem.firstChild
				);
			}
		}
	}

	setEditMode(mode: boolean) {
		for (const stat of this.stats) {
			setVisibility(stat.statElem, !mode);
			setVisibility(stat.editStatElem, mode);
		}
	}
}
