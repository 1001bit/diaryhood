interface EditStatElemets {
	nameInput: HTMLInputElement;
	stepEqInput: NumberInput;
	saveButton: HTMLElement;
	deleteButton: HTMLElement;
}

class PageStat {
	stat: Stat;

	statElem: HTMLElement | null;
	editStatElem: HTMLElement | null;

	constructor(stat: Stat, editRight: boolean) {
		this.stat = stat;

		this.statElem = null;
		this.initStatElem(stat);

		this.editStatElem = null;
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

		const countInput = new NumberInput(
			this.statElem.getElementsByClassName(
				"stat-count-input"
			)[0] as HTMLDivElement
		);

		statNameElem.innerText = stat.name;
		statStepEqElem.innerText =
			"= " + stat.stepEquivalent.toString() + " steps";
		countInput.setValue(stat.count);
	}

	initStatEditElem(stat: Stat) {
		this.editStatElem = sampleEditStatElem.cloneNode(
			true
		) as HTMLDivElement;
		this.editStatElem.removeAttribute("id");

		const deleteButton = this.editStatElem.getElementsByClassName(
			"delete-stat-button"
		)[0] as HTMLDivElement;

		const saveButton = this.editStatElem.getElementsByClassName(
			"save-stat-button"
		)[0] as HTMLDivElement;

		const nameInput = this.editStatElem.getElementsByClassName(
			"stat-name-input"
		)[0] as HTMLInputElement;

		const stepEqInput = new NumberInput(
			this.editStatElem.getElementsByClassName(
				"stat-stepeq-input"
			)[0] as HTMLDivElement
		);

		nameInput.value = stat.name;
		stepEqInput.setValue(stat.stepEquivalent);

		const elems = {
			deleteButton,
			saveButton,
			nameInput,
			stepEqInput,
		};

		this.showSaveButtonIfChanged(elems);
		this.initEditEvents(elems);
	}

	initEditEvents(elems: EditStatElemets) {
		// edit button click
		editButton.addEventListener("click", () => {
			elems.nameInput.value = this.stat.name;
			elems.stepEqInput.setValue(this.stat.stepEquivalent);

			this.showSaveButtonIfChanged(elems);
		});

		// delete
		elems.deleteButton.addEventListener("click", () => {
			const message = {
				name: this.stat.name,
			};
			console.log("delete", message);
		});

		// save
		elems.saveButton.addEventListener("click", () => {
			const message = {
				name: this.stat.name,
				stat: {
					name: elems.nameInput.value,
					stepEquivalent: elems.stepEqInput.getValue(),
				} as CountlessStat,
			};
			console.log("save", message);
		});

		// name edit
		elems.nameInput.addEventListener("input", () => {
			this.showSaveButtonIfChanged(elems);
		});

		// stepEq edit
		elems.stepEqInput.addInputListener(() => {
			this.showSaveButtonIfChanged(elems);
		});
	}

	showSaveButtonIfChanged(elems: EditStatElemets) {
		const changed =
			!(
				elems.nameInput.value == this.stat.name &&
				elems.stepEqInput.getValue() == this.stat.stepEquivalent
			) || this.stat.name == "";

		setVisibility(elems.saveButton, changed);
		setVisibility(elems.deleteButton, !changed);
	}
}

class StatsManager {
	stats: PageStat[];
	newStat: PageStat | null;

	constructor() {
		this.stats = [];
		this.newStat = null;
	}

	renderPageStat(pageStat: PageStat) {
		if (pageStat.statElem) {
			statsElem.insertBefore(pageStat.statElem, statsElem.firstChild);
		}

		if (pageStat.editStatElem) {
			statsElem.insertBefore(pageStat.editStatElem, statsElem.firstChild);
		}
	}

	renderStats(stats: Stat[], editRight: boolean) {
		if (editRight) {
			const stat = { name: "", count: 0, stepEquivalent: 0 } as Stat;

			this.newStat = new PageStat(stat, editRight);
			this.renderPageStat(this.newStat);

			setVisibility(this.newStat.statElem, false);
		}

		if (!stats) return;
		for (const stat of stats) {
			const pageStat = new PageStat(stat, editRight);
			this.stats.push(pageStat);
			this.renderPageStat(pageStat);
		}
	}

	setEditMode(mode: boolean) {
		if (this.newStat) {
			setVisibility(this.newStat.editStatElem, mode);
		}

		for (const stat of this.stats) {
			setVisibility(stat.statElem, !mode);
			setVisibility(stat.editStatElem, mode);
		}
	}
}
