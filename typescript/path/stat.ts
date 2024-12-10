interface EditStatElemets {
	nameInput: HTMLInputElement;
	stepEqInput: NumberInput;
	saveButton: HTMLElement;
	deleteButton: HTMLElement;
}

class Stat {
	stat: StatInterface;
	pathId: string;

	statElem: HTMLDivElement;
	editStatElem: HTMLElement | null;

	deleteCallback: () => void;

	constructor(stat: StatInterface, editRight: boolean, pathId: string) {
		this.pathId = pathId;
		this.stat = stat;

		this.statElem = this.newStatElem(this.stat);
		this.editStatElem = editRight ? this.newEditStatElem(stat) : null;

		this.deleteCallback = () => {};
	}

	setDeleteCallback(callback: () => void) {
		this.deleteCallback = callback;
	}

	newStatElem(stat: StatInterface): HTMLDivElement {
		const statElem = sampleStatElem.cloneNode(true) as HTMLDivElement;
		statElem.removeAttribute("id");
		setVisibility(this.statElem, true);

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
			this.delete(elems);
		});

		// save
		elems.saveButton.addEventListener("click", () => {
			this.save(elems);
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

	save(elems: EditStatElemets) {
		const newStat = {
			name: elems.nameInput.value,
			stepEquivalent: elems.stepEqInput.getValue(),
		};

		if (newStat.name == "") {
			setBorderColor(elems.nameInput, "err");
			elems.saveButton.innerText = "no name";
			return;
		}
		if (elems.stepEqInput.getInputElem().value == "") {
			setBorderColor(elems.stepEqInput.getInputElem(), "err");
			elems.saveButton.innerText = "no step eq.";
			return;
		}

		this.postSave(newStat).then((message) => {
			if (message == "") {
				this.stat.name = newStat.name;
				this.stat.stepEquivalent = newStat.stepEquivalent;
				this.showSaveButtonIfChanged(elems);
				return;
			}

			setBorderColor(elems.nameInput, "err");
			elems.saveButton.innerText = message;
		});
	}

	postSave(newStat: CountlessStatInterface): Promise<string> {
		const message = {
			name: this.stat.name,
			stat: newStat,
		};

		return fetch("/api/path/" + this.pathId + "/stat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(message),
		}).then((res) => {
			switch (res.status) {
				case 200:
					return "";
				case 401:
					return refresh().then((authd) => {
						if (authd) {
							return this.postSave(newStat);
						}
						return "unauthorized";
					});
				case 400:
					return "special characters";
				default:
					return "error";
			}
		});
	}

	delete(elems: EditStatElemets) {
		this.postDelete().then((message) => {
			if (message == "" && this.statElem && this.editStatElem) {
				this.statElem.remove();
				this.editStatElem.remove();
				this.deleteCallback();
				return;
			}

			elems.deleteButton.innerText = message;
		});
	}

	postDelete(): Promise<string> {
		const message = {
			name: this.stat.name,
		};

		return fetch("/api/path/" + this.pathId + "/stat", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(message),
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
