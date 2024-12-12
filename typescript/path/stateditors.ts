class StatCreator {
	createCallback: (name: string) => void;
	pathId: string;

	constructor(pathId: string) {
		this.pathId = pathId;
		this.createCallback = (_name: string) => {};
		this.initEvents();
	}

	initEvents() {
		createStatButton.addEventListener("click", () => {
			this.create();
		});

		removeBorderColorOnFocus(createStatNameInput);
		createStatNameInput.addEventListener("input", () => {
			createStatButton.innerText = "create";
		});
	}

	setCreateCallback(callback: (name: string) => void) {
		this.createCallback = callback;
	}

	create() {
		const name = createStatNameInput.value;

		this.postCreate(name).then((message) => {
			if (message == "") {
				this.createCallback(name);
				createStatNameInput.value = "";
			} else {
				setBorderColor(createStatNameInput, "err");
				createStatButton.innerText = message;
			}
		});
	}

	postCreate(name: string): Promise<string> {
		return fetch(`/api/path/${this.pathId}/stat`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: name,
			}),
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
							return this.postCreate(name);
						}
						return "unauthorized";
					});
				default:
					return "error";
			}
		});
	}
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
