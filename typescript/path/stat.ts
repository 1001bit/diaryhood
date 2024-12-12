interface EditStatElemets {
	nameInput: HTMLInputElement;
	stepEqInput: NumberInput;
	saveButton: HTMLElement;
	deleteButton: HTMLElement;
}

class Stat {
	stat: StatInterface;

	statElem: HTMLDivElement;
	editStatElem: HTMLDivElement | null;

	deletor: StatDeletor;
	updater: StatUpdater;

	constructor(stat: StatInterface, editRight: boolean, pathId: string) {
		this.stat = stat;

		this.statElem = this.newStatElem(this.stat);
		this.editStatElem = editRight ? this.newEditStatElem(stat) : null;

		this.deletor = new StatDeletor(pathId, stat.name);
		this.updater = new StatUpdater(stat.name, pathId);
	}

	newStatElem(stat: StatInterface): HTMLDivElement {
		const statElem = sampleStatElem.cloneNode(true) as HTMLDivElement;
		statElem.removeAttribute("id");
		setVisibility(statElem, true);

		const statNameElem = statElem.getElementsByClassName(
			"stat-name"
		)[0] as HTMLDivElement;

		const statStepEqElem = statElem.getElementsByClassName(
			"stat-stepeq"
		)[0] as HTMLDivElement;

		const countInput = new NumberInput(
			statElem.getElementsByClassName(
				"stat-count-input"
			)[0] as HTMLDivElement
		);

		statNameElem.innerText = stat.name;
		statStepEqElem.innerText =
			"= " + stat.stepEquivalent.toString() + " steps";
		countInput.setValue(stat.count);

		return statElem;
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

		nameInput.value = stat.name;
		stepEqInput.setValue(stat.stepEquivalent);

		const elems = {
			deleteButton,
			saveButton,
			nameInput,
			stepEqInput,
		};

		this.initEditEvents(elems);

		return editStatElem;
	}

	initEditEvents(elems: EditStatElemets) {
		removeBorderColorOnFocus(elems.nameInput);
		removeBorderColorOnFocus(elems.stepEqInput.getInputElem());

		// edit button click
		editButton.addEventListener("click", () => {
			elems.nameInput.value = this.stat.name;
			elems.stepEqInput.setValue(this.stat.stepEquivalent);

			this.showSaveButtonIfChanged(elems);
		});

		// delete
		elems.deleteButton.addEventListener("click", () => {
			this.deletor.delete().then((message) => {
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
				.save(elems.nameInput.value, elems.stepEqInput.getValue())
				.then((message) => {
					if (message == "") {
						this.stat.name = elems.nameInput.value;
						this.stat.stepEquivalent = elems.stepEqInput.getValue();
						this.updateStat(this.stat);

						this.showSaveButtonIfChanged(elems);
					}
				});
		});

		// name edit
		elems.nameInput.addEventListener("input", () => {
			this.showSaveButtonIfChanged(elems);
		});

		// stepEq edit
		elems.stepEqInput.addInputListener(() => {
			this.showSaveButtonIfChanged(elems);
			removeBorderColor(elems.stepEqInput.getInputElem());
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
		statStepEqElem.innerText = `= ${this.stat.stepEquivalent.toString()} steps`;
	}

	showSaveButtonIfChanged(elems: EditStatElemets) {
		const changed = !(
			elems.nameInput.value == this.stat.name &&
			elems.stepEqInput.getValue() == this.stat.stepEquivalent
		);

		elems.saveButton.innerText = "save";
		elems.deleteButton.innerText = "delete";

		setVisibility(elems.saveButton, changed);
		setVisibility(elems.deleteButton, !changed);
	}
}
