class EditStatElem {
	editStat: HTMLDivElement;
	nameInput: HTMLInputElement;
	stepEqInput: HTMLInputElement;
	quotaInput: HTMLInputElement;
	quotaTimeInput: HTMLInputElement;
	saveButton: HTMLElement;
	deleteButton: HTMLElement;

	constructor(stat: StatInterface) {
		this.editStat = sampleEditStatElem.cloneNode(true) as HTMLDivElement;
		this.editStat.removeAttribute("id");

		this.deleteButton = this.editStat.getElementsByClassName(
			"delete-stat-button"
		)[0] as HTMLDivElement;

		this.saveButton = this.editStat.getElementsByClassName(
			"save-stat-button"
		)[0] as HTMLDivElement;

		this.nameInput = this.editStat.getElementsByClassName(
			"stat-name-input"
		)[0] as HTMLInputElement;
		removeBorderColorOnFocus(this.nameInput);

		this.stepEqInput = this.editStat.getElementsByClassName(
			"stat-stepeq-input"
		)[0] as HTMLInputElement;
		acceptOnlyNumbers(this.stepEqInput);

		this.quotaInput = this.editStat.getElementsByClassName(
			"stat-quota-input"
		)[0] as HTMLInputElement;
		acceptOnlyNumbers(this.quotaInput);

		this.quotaTimeInput = this.editStat.getElementsByClassName(
			"stat-quota-time-input"
		)[0] as HTMLInputElement;
		acceptOnlyNumbers(this.quotaTimeInput);

		this.nameInput.value = stat.name;
		this.stepEqInput.value = stat.stepEquivalent.toString();

		this.quotaInput.value = stat.quota.quota.toString();
		this.quotaTimeInput.value = stat.quota.hoursLimit.toString();
	}

	saveButtonMode(mode: boolean) {
		this.saveButton.innerText = "save";
		this.deleteButton.innerText = "delete";

		setVisibility(this.saveButton, mode);
		setVisibility(this.deleteButton, !mode);
	}
}

class StatElem {
	stat: HTMLDivElement;
	name: HTMLDivElement;
	stepEq: HTMLDivElement;
	quota: HTMLDivElement;
	quotaTime: HTMLDivElement;
	quotaStreak: HTMLDivElement;
	countInput: NumberInput;

	constructor(editRight: boolean) {
		this.stat = sampleStatElem.cloneNode(true) as HTMLDivElement;
		this.name = this.stat.getElementsByClassName(
			"stat-name"
		)[0] as HTMLDivElement;
		this.stepEq = this.stat.getElementsByClassName(
			"stat-stepeq"
		)[0] as HTMLDivElement;
		this.quota = this.stat.getElementsByClassName(
			"stat-quota"
		)[0] as HTMLDivElement;
		this.quotaTime = this.stat.getElementsByClassName(
			"stat-quota-time"
		)[0] as HTMLDivElement;
		this.quotaStreak = this.stat.getElementsByClassName(
			"stat-quota-streak"
		)[0] as HTMLDivElement;
		this.countInput = new NumberInput(
			this.stat.getElementsByClassName(
				"stat-count-input"
			)[0] as HTMLDivElement
		);

		// stat elem
		this.stat.removeAttribute("id");
		setVisibility(this.stat, true);

		// count
		setVisibility(this.countInput.getElem(), editRight);
	}

	setQuotaHighlight(highlight: boolean, streak: number) {
		if (highlight) {
			setColor(this.quota, "acc1");
			setColor(this.quotaStreak, "acc1");
			this.quotaStreak.innerText = `🔥 ${streak + 1}`;
		} else {
			removeColor(this.quota);
			removeColor(this.quotaStreak);
			this.quotaStreak.innerText = `🔥 ${streak}`;
		}
	}

	setStepEq(count: number, stepEq: number) {
		this.stepEq.innerText = `${count} * ${stepEq} 👣`;
	}

	setQuota(quota: number, hoursPassed: number, hoursLimit: number) {
		// quota
		if (quota > 0 && hoursLimit > 0) {
			this.quota.innerText = `🚩 ${quota}`;
			this.quotaTime.innerText = `⏳️ ${hoursPassed}/${hoursLimit} hrs`;
		} else {
			this.quota.innerText = "";
			this.quotaTime.innerText = "no quota";
			this.quotaStreak.innerText = "";
		}
	}

	setCountValue(count: number) {
		this.countInput.setValue(count);
	}
}

class StatStepCounter {
	steps: number;
	stepsUpdateCallback: () => void;

	constructor() {
		this.steps = 0;
		this.stepsUpdateCallback = () => {};
	}

	updateSteps(count: number, stepEq: number) {
		this.steps = count * stepEq;
		this.stepsUpdateCallback();
	}
}

class StatCountCounter {
	presentCount: number;

	constructor(count: number) {
		this.presentCount = count;
	}

	updatePresentCount(
		inputValue: number,
		quotaProgress: number,
		statCount: number
	): number {
		if (isNaN(inputValue)) {
			inputValue = 0;
		}

		this.presentCount = inputValue - quotaProgress + statCount;
		return this.presentCount;
	}

	calculatePresentQuotaProgress(
		quotaProgress: number,
		statCount: number
	): number {
		return quotaProgress + this.presentCount - statCount;
	}
}

class Stat {
	stat: StatInterface;
	countCounter: StatCountCounter;

	stepCounter: StatStepCounter;

	statElems: StatElem;
	editStatElems: EditStatElem | null;

	deleter: StatDeleter;
	updater: StatUpdater;

	constructor(stat: StatInterface, editRight: boolean, pathId: string) {
		this.stat = stat;
		this.countCounter = new StatCountCounter(stat.count);

		this.stepCounter = new StatStepCounter();

		this.statElems = new StatElem(editRight);
		this.editStatElems = editRight ? new EditStatElem(stat) : null;

		this.updateStatValues(this.stat);
		this.initEvents();
		if (this.editStatElems) {
			this.initEditEvents();
		}

		this.deleter = new StatDeleter(pathId, stat.name);
		this.updater = new StatUpdater(stat.name, pathId);
	}

	initEvents() {
		this.statElems.countInput.addInputListener((_num: number) => {
			this.updateCount();
		});
	}

	initEditEvents() {
		if (!this.editStatElems) return;

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
					this.updateStatValues(this.stat);

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
		const presentCount = this.countCounter.updatePresentCount(
			Number(this.statElems.countInput.getValue()),
			this.stat.quota.countProgress,
			this.stat.count
		);
		this.stepCounter.updateSteps(presentCount, this.stat.stepEquivalent);

		this.statElems.setStepEq(presentCount, this.stat.stepEquivalent);
		this.updateQuotaHighlight();
	}

	updateQuotaHighlight() {
		if (this.stat.quota.quota <= 0 || this.stat.quota.hoursLimit <= 0) {
			return;
		}

		const currentQuotaProgress =
			this.countCounter.calculatePresentQuotaProgress(
				this.stat.quota.countProgress,
				this.stat.count
			);

		this.statElems.setQuotaHighlight(
			currentQuotaProgress >= this.stat.quota.quota,
			this.stat.quota.streak
		);
	}

	updateStatValues(newStat: StatInterface) {
		this.stat = newStat;

		// name
		this.statElems.name.innerText = this.stat.name;
		// stepeq
		this.statElems.setStepEq(
			this.countCounter.presentCount,
			this.stat.stepEquivalent
		);

		// quota
		this.statElems.setQuota(
			this.stat.quota.quota,
			this.stat.quota.hoursPassed,
			this.stat.quota.hoursLimit
		);
		this.updateQuotaHighlight();

		// count
		this.statElems.setCountValue(
			this.countCounter.calculatePresentQuotaProgress(
				this.stat.quota.countProgress,
				this.stat.count
			)
		);

		// steps
		this.stepCounter.updateSteps(
			this.countCounter.presentCount,
			this.stat.stepEquivalent
		);
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

		this.editStatElems.saveButtonMode(changed);
	}
}
