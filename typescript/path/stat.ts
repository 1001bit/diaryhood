interface EditStatElements {
	editStat: HTMLDivElement;
	nameInput: HTMLInputElement;
	stepEqInput: HTMLInputElement;
	quotaInput: HTMLInputElement;
	quotaTimeInput: HTMLInputElement;
	saveButton: HTMLElement;
	deleteButton: HTMLElement;
}

interface StatElements {
	stat: HTMLDivElement;
	name: HTMLDivElement;
	stepEq: HTMLDivElement;
	quota: HTMLDivElement;
	quotaTime: HTMLDivElement;
	quotaStreak: HTMLDivElement;
	countInput: NumberInput;
	count: HTMLDivElement;
}

class Stat {
	stat: StatInterface;
	newCount: number;

	steps: number;
	stepsUpdateCallback: () => void;

	statElems: StatElements;
	editStatElems: EditStatElements | null;

	deleter: StatDeleter;
	updater: StatUpdater;

	constructor(stat: StatInterface, editRight: boolean, pathId: string) {
		this.stat = stat;
		this.newCount = stat.count;

		this.steps = 0;
		this.stepsUpdateCallback = () => {};

		this.statElems = this.newStatElems(this.stat, editRight);
		this.editStatElems = editRight ? this.newEditStatElems(stat) : null;

		this.updateStatElems(this.stat);
		this.initEvents();
		if (this.editStatElems) {
			this.initEditEvents();
		}

		this.deleter = new StatDeleter(pathId, stat.name);
		this.updater = new StatUpdater(stat.name, pathId);
	}

	newStatElems(stat: StatInterface, editRight: boolean): StatElements {
		const statElem = sampleStatElem.cloneNode(true) as HTMLDivElement;
		const nameElem = statElem.getElementsByClassName(
			"stat-name"
		)[0] as HTMLDivElement;
		const stepEqElem = statElem.getElementsByClassName(
			"stat-stepeq"
		)[0] as HTMLDivElement;
		const quotaElem = statElem.getElementsByClassName(
			"stat-quota"
		)[0] as HTMLDivElement;
		const quotaTimeElem = statElem.getElementsByClassName(
			"stat-quota-time"
		)[0] as HTMLDivElement;
		const quotaStreakElem = statElem.getElementsByClassName(
			"stat-quota-streak"
		)[0] as HTMLDivElement;
		const countElem = statElem.getElementsByClassName(
			"stat-count"
		)[0] as HTMLDivElement;
		const countInputElem = new NumberInput(
			statElem.getElementsByClassName(
				"stat-count-input"
			)[0] as HTMLDivElement
		);

		const statElems = {
			stat: statElem,
			name: nameElem,
			stepEq: stepEqElem,
			quota: quotaElem,
			quotaTime: quotaTimeElem,
			quotaStreak: quotaStreakElem,
			count: countElem,
			countInput: countInputElem,
		} as StatElements;

		// stat elem
		statElems.stat.removeAttribute("id");
		setVisibility(statElems.stat, true);

		// count
		setVisibility(statElems.count, !editRight);
		statElems.count.innerText = stat.count.toString();

		setVisibility(statElems.countInput.getElem(), editRight);
		statElems.countInput.setValue(stat.count);

		return statElems;
	}

	initEvents() {
		this.statElems.countInput.addInputListener((_num: number) => {
			this.updateCount();
		});
	}

	newEditStatElems(stat: StatInterface): EditStatElements {
		const editStatElem = sampleEditStatElem.cloneNode(
			true
		) as HTMLDivElement;
		editStatElem.removeAttribute("id");

		const deleteButton = editStatElem.getElementsByClassName(
			"delete-stat-button"
		)[0] as HTMLDivElement;

		const saveButton = editStatElem.getElementsByClassName(
			"save-stat-button"
		)[0] as HTMLDivElement;

		const nameInput = editStatElem.getElementsByClassName(
			"stat-name-input"
		)[0] as HTMLInputElement;

		const stepEqInput = editStatElem.getElementsByClassName(
			"stat-stepeq-input"
		)[0] as HTMLInputElement;
		acceptOnlyNumbers(stepEqInput);

		const quotaInput = editStatElem.getElementsByClassName(
			"stat-quota-input"
		)[0] as HTMLInputElement;
		acceptOnlyNumbers(quotaInput);

		const quotaTimeInput = editStatElem.getElementsByClassName(
			"stat-quota-time-input"
		)[0] as HTMLInputElement;
		acceptOnlyNumbers(quotaTimeInput);

		const elems = {
			editStat: editStatElem,
			nameInput: nameInput,
			stepEqInput: stepEqInput,
			quotaInput: quotaInput,
			quotaTimeInput: quotaTimeInput,
			saveButton: saveButton,
			deleteButton: deleteButton,
		} as EditStatElements;

		elems.nameInput.value = stat.name;
		elems.stepEqInput.value = stat.stepEquivalent.toString();

		elems.quotaInput.value = stat.quota.quota.toString();
		elems.quotaTimeInput.value = stat.quota.hoursLimit.toString();

		return elems;
	}

	initEditEvents() {
		if (!this.editStatElems) return;

		removeBorderColorOnFocus(this.editStatElems.nameInput);

		// edit button click
		editButton.addEventListener("click", () => {
			if (!this.editStatElems) return;
			this.editStatElems.nameInput.value = this.stat.name;
			this.editStatElems.stepEqInput.value =
				this.stat.stepEquivalent.toString();

			this.showSaveButtonIfChanged();
		});

		// delete
		this.editStatElems.deleteButton.addEventListener("click", () => {
			this.delete();
		});

		// save
		this.editStatElems.saveButton.addEventListener("click", () => {
			this.save();
		});

		// name edit
		this.editStatElems.nameInput.addEventListener("input", () => {
			this.showSaveButtonIfChanged();
		});

		// stepEq edit
		this.editStatElems.stepEqInput.addEventListener("input", () => {
			this.showSaveButtonIfChanged();
		});

		// quota edit
		this.editStatElems.quotaInput.addEventListener("input", () => {
			this.showSaveButtonIfChanged();
		});

		// quotaTime edit
		this.editStatElems.quotaTimeInput.addEventListener("input", () => {
			this.showSaveButtonIfChanged();
		});

		this.showSaveButtonIfChanged();
	}

	save() {
		if (!this.editStatElems) return;

		if (isNaN(Number(this.editStatElems.stepEqInput.value))) {
			this.editStatElems.stepEqInput.value = "0";
		}
		if (isNaN(Number(this.editStatElems.quotaInput.value))) {
			this.editStatElems.quotaInput.value = "0";
		}
		if (isNaN(Number(this.editStatElems.quotaTimeInput.value))) {
			this.editStatElems.quotaTimeInput.value = "0";
		}

		this.updater
			.save({
				name: this.editStatElems.nameInput.value,
				stepEquivalent: Number(this.editStatElems.stepEqInput.value),
				quota: {
					quota: Number(this.editStatElems.quotaInput.value),
					hoursLimit: Number(this.editStatElems.quotaTimeInput.value),
				},
			})
			.then((message) => {
				if (!this.editStatElems) return;

				if (message == "") {
					this.stat.name = this.editStatElems.nameInput.value;
					this.stat.stepEquivalent = Number(
						this.editStatElems.stepEqInput.value
					);
					this.stat.quota.quota = Number(
						this.editStatElems.quotaInput.value
					);
					this.stat.quota.hoursLimit = Number(
						this.editStatElems.quotaTimeInput.value
					);
					this.updateStatElems(this.stat);

					this.showSaveButtonIfChanged();
					return;
				}
				this.editStatElems.saveButton.innerText = message;
				setBorderColor(this.editStatElems.nameInput, "err");
			});
	}

	delete() {
		this.deleter.delete().then((message) => {
			if (!this.editStatElems) return;

			if (message == "") {
				this.statElems.stat.remove();
				this.editStatElems?.editStat.remove();
				return;
			}
			this.editStatElems.deleteButton.innerText = message;
		});
	}

	updateCount() {
		this.newCount = this.statElems.countInput.getValue();
		this.steps = this.newCount * this.stat.stepEquivalent;
		this.stepsUpdateCallback();
		this.statElems.quota.innerText = `${
			this.stat.quota.countProgress + this.newCount - this.stat.count
		}/${this.stat.quota.quota}`;

		this.updateQuotaHighlight();
	}

	updateQuotaHighlight() {
		if (
			this.stat.quota.countProgress + this.newCount - this.stat.count >=
			this.stat.quota.quota
		) {
			setColor(this.statElems.quota, "acc1");
			setColor(this.statElems.quotaStreak, "acc1");
			this.statElems.quotaStreak.innerText = `🔥 ${
				this.stat.quota.streak + 1
			}`;
		} else {
			removeColor(this.statElems.quota);
			removeColor(this.statElems.quotaStreak);
			this.statElems.quotaStreak.innerText = `🔥 ${this.stat.quota.streak}`;
		}
	}

	updateStatElems(newStat: StatInterface) {
		this.stat = newStat;

		this.statElems.name.innerText = this.stat.name;
		this.statElems.stepEq.innerText = `= ${this.stat.stepEquivalent} steps`;

		if (newStat.quota.quota > 0 && newStat.quota.hoursLimit > 0) {
			this.statElems.quota.innerText = `${
				this.stat.quota.countProgress + this.newCount - this.stat.count
			}/${this.stat.quota.quota}`;
			this.statElems.quotaTime.innerText = `${this.stat.quota.hoursPassed}/${this.stat.quota.hoursLimit} hrs`;
			this.updateQuotaHighlight();
		} else {
			this.statElems.quota.innerText = "";
			this.statElems.quotaTime.innerText = "no quota";
			this.statElems.quotaStreak.innerText = "";
		}

		this.steps = this.newCount * this.stat.stepEquivalent;
		this.stepsUpdateCallback();
	}

	showSaveButtonIfChanged() {
		if (!this.editStatElems) return;

		const changed = !(
			this.editStatElems.nameInput.value == this.stat.name &&
			Number(this.editStatElems.stepEqInput.value) ==
				this.stat.stepEquivalent &&
			Number(this.editStatElems.quotaInput.value) ==
				this.stat.quota.quota &&
			Number(this.editStatElems.quotaTimeInput.value) ==
				this.stat.quota.hoursLimit
		);

		this.editStatElems.saveButton.innerText = "save";
		this.editStatElems.deleteButton.innerText = "delete";

		setVisibility(this.editStatElems.saveButton, changed);
		setVisibility(this.editStatElems.deleteButton, !changed);
	}
}
