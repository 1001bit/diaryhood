interface EditStatElemets {
	nameInput: HTMLInputElement;
	stepEqInput: NumberInput;
	saveButton: HTMLElement;
	deleteButton: HTMLElement;
}

class StatDeletor {
	askedIfSure: boolean;

	deleteCallback: () => void;

	pathId: string;
	name: string;

	constructor(pathId: string, name: string) {
		this.deleteCallback = () => {};

		this.pathId = pathId;
		this.name = name;

		this.askedIfSure = false;
	}

	setDeleteCallback(callback: () => void) {
		this.deleteCallback = callback;
	}

	delete(): Promise<string> {
		if (!this.askedIfSure) {
			this.askedIfSure = true;
			return Promise.resolve("sure?");
		}

		return this.postDelete().then((message) => {
			if (message == "") {
				this.deleteCallback();
			}

			return message;
		});
	}

	postDelete(): Promise<string> {
		return fetch(`/api/path/${this.pathId}/stat/${this.name}`, {
			method: "DELETE",
		}).then((res) => {
			switch (res.status) {
				case 200:
					return "";
				case 401:
					return refresh().then((authd) => {
						if (authd) {
							return this.postDelete();
						}
						return "unauthorized";
					});
				default:
					return "error";
			}
		});
	}
}

class StatUpdater {
	name: string;
	pathId: string;

	constructor(name: string, pathId: string) {
		this.name = name;
		this.pathId = pathId;
	}

	save(newName: string, newStepEq: number): Promise<string> {
		if (newName == "") {
			return Promise.resolve("no name");
		}
		if (Number.isNaN(newStepEq)) {
			return Promise.resolve("no step eq.");
		}

		return this.postSave({
			name: newName,
			stepEquivalent: newStepEq,
		}).then((message) => {
			if (message == "") {
				this.name = newName;
			}
			return message;
		});
	}

	postSave(newStat: CountlessStatInterface): Promise<string> {
		return fetch(`/api/path/${this.pathId}/stat/${this.name}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(newStat),
		}).then((res) => {
			switch (res.status) {
				case 200:
					return "";
				case 400:
					return "special characters";
				case 409:
					return "already exists";
				case 401:
					return refresh().then((authd) => {
						if (authd) {
							return this.postSave(newStat);
						}
						return "unauthorized";
					});
				default:
					return "error";
			}
		});
	}
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
