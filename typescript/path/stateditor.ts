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

class PageStatEditor {
	stat: PageStat;

	editStatElems: EditStatElem;
	deleter: StatDeleter;
	updater: StatUpdater;

	constructor(stat: PageStat, pathId: string) {
		this.stat = stat;
		this.editStatElems = new EditStatElem(stat.stat);

		this.deleter = new StatDeleter(pathId, stat.stat.name);
		this.updater = new StatUpdater(stat.stat.name, pathId);

		this.initEditEvents();
	}

	initEditEvents() {
		if (!this.editStatElems) return;

		// edit button click
		editButton.addEventListener("click", () => {
			if (!this.editStatElems) return;
			this.editStatElems.nameInput.value = this.stat.stat.name;
			this.editStatElems.stepEqInput.value =
				this.stat.stat.stepEquivalent.toString();

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
					this.stat.stat.name = this.editStatElems.nameInput.value;
					this.stat.stat.stepEquivalent = Number(
						this.editStatElems.stepEqInput.value
					);
					this.stat.stat.quota.quota = Number(
						this.editStatElems.quotaInput.value
					);
					this.stat.stat.quota.hoursLimit = Number(
						this.editStatElems.quotaTimeInput.value
					);
					this.stat.updateStatElemsValues();

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
				this.stat.statElems.stat.remove();
				this.editStatElems?.editStat.remove();
				return;
			}
			this.editStatElems.deleteButton.innerText = message;
		});
	}

	showSaveButtonIfChanged() {
		if (!this.editStatElems) return;

		const changed = !(
			this.editStatElems.nameInput.value == this.stat.stat.name &&
			Number(this.editStatElems.stepEqInput.value) ==
				this.stat.stat.stepEquivalent &&
			Number(this.editStatElems.quotaInput.value) ==
				this.stat.stat.quota.quota &&
			Number(this.editStatElems.quotaTimeInput.value) ==
				this.stat.stat.quota.hoursLimit
		);

		this.editStatElems.saveButtonMode(changed);
	}
}
