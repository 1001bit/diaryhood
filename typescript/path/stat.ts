interface EditStatElemets {
	nameInput: HTMLInputElement;
	stepEqInput: NumberInput;
	quotaInput: NumberInput;
	saveButton: HTMLElement;
	deleteButton: HTMLElement;
}

class Stat {
	stat: StatInterface;
	newCount: number;

	steps: number;
	stepsUpdateCallback: () => void;

	statElem: HTMLDivElement;
	editStatElem: HTMLDivElement | null;

	deleter: StatDeleter;
	updater: StatUpdater;

	constructor(stat: StatInterface, editRight: boolean, pathId: string) {
		this.stat = stat;
		this.newCount = stat.count;

		this.steps = 0;
		this.stepsUpdateCallback = () => {};

		this.statElem = this.newStatElem(this.stat, editRight);
		this.updateStat(stat);
		this.editStatElem = editRight ? this.newEditStatElem(stat) : null;

		this.deleter = new StatDeleter(pathId, stat.name);
		this.updater = new StatUpdater(stat.name, pathId);
	}

	newStatElem(stat: StatInterface, editRight: boolean): HTMLDivElement {
		const statElem = sampleStatElem.cloneNode(true) as HTMLDivElement;
		statElem.removeAttribute("id");
		setVisibility(statElem, true);

		if (editRight) {
			const statCountInputElem = statElem.getElementsByClassName(
				"stat-count-input"
			)[0] as HTMLDivElement;
			setVisibility(statCountInputElem, true);

			const countInput = new NumberInput(statCountInputElem);
			countInput.setValue(stat.count);

			this.initEvents(countInput);
		} else {
			const countElem = statElem.getElementsByClassName(
				"stat-count"
			)[0] as HTMLDivElement;
			setVisibility(countElem, true);

			countElem.innerText = stat.count.toString();
		}

		return statElem;
	}

	initEvents(countInput: NumberInput) {
		countInput.addInputListener((num: number) => {
			this.newCount = num;
			this.steps = this.newCount * this.stat.stepEquivalent;
			this.stepsUpdateCallback();
		});
	}

	newEditStatElem(stat: StatInterface): HTMLDivElement {
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

		const stepEqInput = new NumberInput(
			editStatElem.getElementsByClassName(
				"stat-stepeq-input"
			)[0] as HTMLDivElement
		);

		const quotaInput = new NumberInput(
			editStatElem.getElementsByClassName(
				"stat-quota-input"
			)[0] as HTMLDivElement
		);

		nameInput.value = stat.name;
		stepEqInput.setValue(stat.stepEquivalent);

		const elems = {
			deleteButton,
			saveButton,
			nameInput,
			stepEqInput,
			quotaInput,
		};

		this.initEditEvents(elems);

		return editStatElem;
	}

	initEditEvents(elems: EditStatElemets) {
		removeBorderColorOnFocus(elems.nameInput);

		// edit button click
		editButton.addEventListener("click", () => {
			elems.nameInput.value = this.stat.name;
			elems.stepEqInput.setValue(this.stat.stepEquivalent);

			this.showSaveButtonIfChanged(elems);
		});

		// delete
		elems.deleteButton.addEventListener("click", () => {
			this.deleter.delete().then((message) => {
				if (message == "") {
					this.statElem.remove();
					this.editStatElem?.remove();
					return;
				}
				elems.deleteButton.innerText = message;
			});
		});

		// save
		elems.saveButton.addEventListener("click", () => {
			this.updater
				.save({
					name: elems.nameInput.value,
					stepEquivalent: elems.stepEqInput.getValue(),
					quota: elems.quotaInput.getValue(),
				})
				.then((message) => {
					if (message == "") {
						this.stat.name = elems.nameInput.value;
						this.stat.stepEquivalent = elems.stepEqInput.getValue();
						this.stat.quota = elems.quotaInput.getValue();
						this.updateStat(this.stat);

						this.showSaveButtonIfChanged(elems);
						return;
					}
					elems.saveButton.innerText = message;
					setBorderColor(elems.nameInput, "err");
				});
		});

		// name edit
		elems.nameInput.addEventListener("input", () => {
			this.showSaveButtonIfChanged(elems);
		});

		// stepEq edit
		elems.stepEqInput.addInputListener(() => {
			this.showSaveButtonIfChanged(elems);
		});

		// quota edit
		elems.quotaInput.addInputListener(() => {
			this.showSaveButtonIfChanged(elems);
		});

		this.showSaveButtonIfChanged(elems);
	}

	updateStat(newStat: StatInterface) {
		this.stat = newStat;

		const statNameElem = this.statElem.getElementsByClassName(
			"stat-name"
		)[0] as HTMLDivElement;
		const statStepEqElem = this.statElem.getElementsByClassName(
			"stat-stepeq"
		)[0] as HTMLDivElement;

		statNameElem.innerText = this.stat.name;
		statStepEqElem.innerText = `= ${this.stat.stepEquivalent} steps`;

		this.steps = this.newCount * this.stat.stepEquivalent;
		this.stepsUpdateCallback();
	}

	showSaveButtonIfChanged(elems: EditStatElemets) {
		const changed = !(
			elems.nameInput.value == this.stat.name &&
			elems.stepEqInput.getValue() == this.stat.stepEquivalent &&
			elems.quotaInput.getValue() == this.stat.quota
		);

		elems.saveButton.innerText = "save";
		elems.deleteButton.innerText = "delete";

		setVisibility(elems.saveButton, changed);
		setVisibility(elems.deleteButton, !changed);
	}
}
